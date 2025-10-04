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
    // If table doesn't exist, return empty array instead of crashing
    try {
      const tabSwitches = await sql`
        SELECT 
          user_id as "userId",
          user_email as "userEmail",
          COALESCE(user_name, user_email) as "userName",
          switch_count as "switchCount",
          last_switch_time as "lastSwitchTime"
        FROM tab_switches
        WHERE contest_id = ${contestId}
        ORDER BY switch_count DESC
      `;

      return NextResponse.json(tabSwitches);
    } catch (dbError: any) {
      // If table doesn't exist (relation does not exist error), return empty array
      if (dbError.message && dbError.message.includes('does not exist')) {
        console.log('tab_switches table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      // If it's another error, throw it
      throw dbError;
    }
  } catch (error: any) {
    console.error('Failed to fetch tab switches:', error);
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json([]);
  }
}
