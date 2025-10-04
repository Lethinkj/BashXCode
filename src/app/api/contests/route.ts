import { NextRequest, NextResponse } from 'next/server';
import { contestStorage } from '@/lib/storage';
import { Contest } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { generateContestCode, getContestStatus } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    console.log('Fetching contests from database...');
    let contests = await contestStorage.getAll();
    
    // Update contest statuses based on current time
    contests = contests.map(contest => ({
      ...contest,
      status: getContestStatus(contest.startTime, contest.endTime)
    }));
    
    // If userId provided, filter to contests user has joined
    if (userId) {
      const joinedContests = await contestStorage.getUserContests(userId);
      const joinedIds = new Set(joinedContests.map((c: Contest) => c.id));
      contests = contests.filter(c => joinedIds.has(c.id));
    }
    
    console.log('Contests fetched:', contests.length);
    return NextResponse.json(contests);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch contests', 
      message: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate contest code from title
    const contestCode = generateContestCode(body.title);
    
    const contest: Contest = {
      id: uuidv4(),
      title: body.title,
      description: body.description,
      contestCode,
      startTime: body.startTime,
      endTime: body.endTime,
      status: getContestStatus(body.startTime, body.endTime),
      problems: body.problems.map((p: any) => ({
        ...p,
        id: p.id || uuidv4(),
        testCases: p.testCases.map((tc: any) => ({
          ...tc,
          id: tc.id || uuidv4()
        }))
      })),
      createdBy: body.createdBy || 'admin',
      createdAt: new Date().toISOString()
    };
    
    const created = await contestStorage.create(contest);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Create contest error:', error);
    return NextResponse.json({ error: 'Failed to create contest' }, { status: 500 });
  }
}
