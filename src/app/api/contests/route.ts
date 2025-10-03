import { NextRequest, NextResponse } from 'next/server';
import { contestStorage } from '@/lib/storage';
import { Contest } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    console.log('Fetching contests from database...');
    const contests = await contestStorage.getAll();
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
    
    const contest: Contest = {
      id: uuidv4(),
      title: body.title,
      description: body.description,
      startTime: body.startTime,
      endTime: body.endTime,
      problems: body.problems.map((p: any) => ({
        ...p,
        id: p.id || uuidv4(),
        testCases: p.testCases.map((tc: any) => ({
          ...tc,
          id: tc.id || uuidv4()
        }))
      })),
      createdAt: new Date().toISOString()
    };
    
    const created = contestStorage.create(contest);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contest' }, { status: 500 });
  }
}
