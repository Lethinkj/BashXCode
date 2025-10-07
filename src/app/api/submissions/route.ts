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
      // Award points based on test cases passed
      const allPassed = result.passed === result.total;
      const partialPassed = result.passed >= 2 && result.passed < result.total;
      
      // Calculate points:
      // - All tests pass: 100% points
      // - ≥2 tests pass: 50% points (partial credit)
      // - <2 tests pass: 0 points
      let earnedPoints = 0;
      if (allPassed) {
        earnedPoints = problem.points;
      } else if (partialPassed) {
        earnedPoints = Math.floor(problem.points * 0.5); // 50% partial credit
      }
      
      // Check if user already has a submission for this problem
      // If previous submission was partial and this is full, update points
      try {
        const previousSubmissions = await submissionStorage.getByUserAndContest(userId, contestId);
        const previousForProblem = previousSubmissions.filter(s => s.problemId === problemId && s.id !== created.id);
        
        // If user had partial credit before and now has full pass, they get full points
        if (allPassed && previousForProblem.some(s => s.points > 0 && s.points < problem.points)) {
          console.log(`User ${userId} upgraded from partial to full solution for problem ${problemId}`);
        }
      } catch (err) {
        console.error('Error checking previous submissions:', err);
      }
      
      // Determine status with proper typing
      let status: 'accepted' | 'partial' | 'wrong_answer' | 'compilation_error' | 'runtime_error' = 'wrong_answer';
      if (allPassed) {
        status = 'accepted';
      } else if (partialPassed) {
        status = 'partial'; // New status for partial credit
      } else if (result.results.some(r => r.error)) {
        const firstError = result.results.find(r => r.error)?.error || '';
        status = firstError.includes('Compilation') ? 'compilation_error' : 'runtime_error';
      }
      
      // Calculate solve time if successful
      let solveTimeSeconds = null;
      if (allPassed) {
        try {
          const codingTimeResult = await sql`
            SELECT start_time FROM coding_times 
            WHERE contest_id = ${contestId} 
            AND user_id = ${userId} 
            AND problem_id = ${problemId}
            LIMIT 1
          `;
          if (codingTimeResult.length > 0) {
            const startTime = new Date(codingTimeResult[0].start_time);
            const endTime = new Date();
            solveTimeSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
          }
        } catch (err) {
          console.error('Error calculating solve time:', err);
        }
      }
      
      // Update submission
      await submissionStorage.update(created.id, {
        status,
        passedTestCases: result.passed,
        points: earnedPoints,
        solveTimeSeconds: solveTimeSeconds ?? undefined,
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
