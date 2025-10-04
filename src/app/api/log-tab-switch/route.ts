import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contestId, userId, userEmail, userName, timestamp, switchCount } = body;

    if (!contestId || !userId) {
      return NextResponse.json(
        { error: 'Contest ID and User ID are required' },
        { status: 400 }
      );
    }

    // Log the tab switch to database for admin monitoring
    await sql`
      INSERT INTO tab_switches (contest_id, user_id, user_email, user_name, timestamp, switch_count)
      VALUES (${contestId}, ${userId}, ${userEmail}, ${userName || userEmail}, ${timestamp}, ${switchCount})
      ON CONFLICT (contest_id, user_id) 
      DO UPDATE SET 
        switch_count = ${switchCount},
        last_switch_time = ${timestamp},
        user_name = ${userName || userEmail}
    `;

    return NextResponse.json({ 
      success: true,
      message: 'Tab switch logged successfully'
    });
  } catch (error: any) {
    console.error('Failed to log tab switch:', error);
    return NextResponse.json(
      { error: 'Failed to log tab switch' },
      { status: 500 }
    );
  }
}
