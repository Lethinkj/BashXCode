import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { contestId, userId, userEmail, userName, timestamp } = await request.json();

    if (!contestId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to insert, but don't fail if table doesn't exist
    try {
      await sql`
        INSERT INTO screenshots (contest_id, user_id, user_email, user_name, timestamp) 
        VALUES (${contestId}, ${userId}, ${userEmail}, ${userName || userEmail}, ${timestamp || new Date().toISOString()})
      `;
      
      return NextResponse.json({ success: true });
    } catch (insertError: any) {
      // If table doesn't exist, just log and return success
      // This allows the app to work without the migration
      if (insertError?.code === '42P01' || insertError?.message?.includes('does not exist')) {
        console.warn('Screenshots table does not exist. Screenshot not logged.');
        return NextResponse.json({ success: true });
      }
      throw insertError;
    }
  } catch (error: any) {
    console.error('Error logging screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to log screenshot' },
      { status: 500 }
    );
  }
}
