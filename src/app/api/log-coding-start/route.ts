import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contestId, userId, problemId, startTime } = body;

    if (!contestId || !userId || !problemId || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store or update coding start time
    await sql`
      INSERT INTO coding_times (contest_id, user_id, problem_id, start_time)
      VALUES (${contestId}, ${userId}, ${problemId}, ${startTime})
      ON CONFLICT (contest_id, user_id, problem_id)
      DO UPDATE SET start_time = ${startTime}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error logging coding start:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log coding start' },
      { status: 500 }
    );
  }
}
