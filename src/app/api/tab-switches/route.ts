import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');

    if (!contestId) {
      return NextResponse.json(
        { error: 'Contest ID is required' },
        { status: 400 }
      );
    }

    // Fetch all tab switches for the contest
    const tabSwitches = await sql`
      SELECT 
        user_id as "userId",
        user_email as "userEmail",
        switch_count as "switchCount",
        last_switch_time as "lastSwitchTime"
      FROM tab_switches
      WHERE contest_id = ${contestId}
      ORDER BY switch_count DESC
    `;

    return NextResponse.json(tabSwitches);
  } catch (error: any) {
    console.error('Failed to fetch tab switches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tab switches' },
      { status: 500 }
    );
  }
}
