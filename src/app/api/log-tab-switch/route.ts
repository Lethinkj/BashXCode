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
    // If table doesn't exist, silently succeed (table will be created later)
    try {
      await sql`
        INSERT INTO tab_switches (contest_id, user_id, user_email, user_name, last_switch_time, switch_count)
        VALUES (${contestId}, ${userId}, ${userEmail}, ${userName || userEmail}, ${timestamp}, ${switchCount})
        ON CONFLICT (contest_id, user_id) 
        DO UPDATE SET 
          switch_count = ${switchCount},
          last_switch_time = ${timestamp},
          user_name = ${userName || userEmail}
      `;
    } catch (dbError: any) {
      // If table doesn't exist, log warning but don't fail the request
      if (dbError.message && dbError.message.includes('does not exist')) {
        console.log('tab_switches table does not exist yet - skipping tab switch logging');
        return NextResponse.json({ 
          success: true,
          message: 'Tab switch tracking not enabled (table not created)'
        });
      }
      // If it's another error, throw it
      throw dbError;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Tab switch logged successfully'
    });
  } catch (error: any) {
    console.error('Failed to log tab switch:', error);
    // Don't fail the request - just log and return success
    // This prevents tab switches from breaking the contest experience
    return NextResponse.json({ 
      success: true,
      message: 'Tab switch tracking temporarily unavailable'
    });
  }
}
