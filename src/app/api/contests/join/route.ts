import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contestCode, userId } = body;
    
    if (!contestCode || !userId) {
      return NextResponse.json(
        { error: 'Contest code and user ID are required' },
        { status: 400 }
      );
    }
    
    // Find contest by code
    const contestResult = await sql`
      SELECT id, title, start_time, end_time, status FROM contests WHERE contest_code = ${contestCode.toUpperCase()}
    `;
    
    if (contestResult.length === 0) {
      return NextResponse.json(
        { error: 'Invalid contest code' },
        { status: 404 }
      );
    }
    
    const contest = contestResult[0];
    
    // Check if already joined
    const participantCheck = await sql`
      SELECT id FROM contest_participants WHERE contest_id = ${contest.id} AND user_id = ${userId}
    `;
    
    if (participantCheck.length > 0) {
      // Already joined, return contest
      return NextResponse.json({
        success: true,
        contest: {
          id: contest.id,
          title: contest.title,
          startTime: contest.start_time,
          endTime: contest.end_time,
          status: contest.status,
        },
        alreadyJoined: true,
      });
    }
    
    // Add participant
    await sql`
      INSERT INTO contest_participants (contest_id, user_id, joined_at) VALUES (${contest.id}, ${userId}, NOW())
    `;
    
    return NextResponse.json({
      success: true,
      contest: {
        id: contest.id,
        title: contest.title,
        startTime: contest.start_time,
        endTime: contest.end_time,
        status: contest.status,
      },
      alreadyJoined: false,
    });
  } catch (error: any) {
    console.error('Join contest error:', error);
    return NextResponse.json(
      { error: 'Failed to join contest' },
      { status: 500 }
    );
  }
}
