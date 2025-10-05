import { NextRequest, NextResponse } from 'next/server';
import { submissionStorage, contestStorage } from '@/lib/storage';
import { Submission } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { executeCodeWithTestCases } from '@/lib/codeExecution';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contestId, problemId, userId, code, language } = body;
    
    // Check if user is banned from this contest
    const sql = (await import('@/lib/db')).default;
    const banCheck = await sql`
      SELECT is_banned 
      FROM contest_participants 
      WHERE contest_id = ${contestId} AND user_id = ${userId}
    `;
    
    if (banCheck.length > 0 && banCheck[0].is_banned) {
      return NextResponse.json({ error: 'Admin has banned you from this contest for violating rules.' }, { status: 403 });
    }
    
    // Get contest and problem
    const contest = await contestStorage.getById(contestId);
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }
    
    const problem = contest.problems.find(p => p.id === problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    
    // Create submission
    const submission: Submission = {
      id: uuidv4(),
      contestId,
      problemId,
      userId,
      code,
      language,
      status: 'running',
      passedTestCases: 0,
      totalTestCases: problem.testCases.length,
      points: 0,
      submittedAt: new Date().toISOString()
    };
    
    const created = await submissionStorage.create(submission);
    
    // Execute code with test cases (in background)
    executeCodeWithTestCases(
      code,
      language,
      problem.testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }))
    ).then(async (result) => {
      // Award points ONLY if ALL test cases pass
      const allPassed = result.passed === result.total;
      const earnedPoints = allPassed ? problem.points : 0;
      
      // Determine status with proper typing
      let status: 'accepted' | 'wrong_answer' | 'compilation_error' | 'runtime_error' = 'wrong_answer';
      if (allPassed) {
        status = 'accepted';
      } else if (result.results.some(r => r.error)) {
        const firstError = result.results.find(r => r.error)?.error || '';
        status = firstError.includes('Compilation') ? 'compilation_error' : 'runtime_error';
      }
      
      // Update submission
      await submissionStorage.update(created.id, {
        status,
        passedTestCases: result.passed,
        points: earnedPoints,
        details: JSON.stringify(result.results) // Store detailed results
      });
    }).catch(error => {
      console.error('Background execution error:', error);
      submissionStorage.update(created.id, {
        status: 'runtime_error',
        passedTestCases: 0,
        points: 0
      });
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create submission' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');
    const userId = searchParams.get('userId');
    
    if (contestId && userId) {
      const submissions = await submissionStorage.getByUserAndContest(userId, contestId);
      return NextResponse.json(submissions);
    } else if (contestId) {
      const submissions = await submissionStorage.getByContestId(contestId);
      return NextResponse.json(submissions);
    }
    
    const submissions = await submissionStorage.getAll();
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
