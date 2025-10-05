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

    // Try to fetch screenshots, but return empty array if table doesn't exist
    try {
      const result = await sql`
        SELECT * FROM screenshots 
        WHERE contest_id = ${contestId}
        ORDER BY timestamp DESC
      `;

      return NextResponse.json(result || []);
    } catch (fetchError: any) {
      // If table doesn't exist, return empty array
      if (fetchError?.code === '42P01' || fetchError?.message?.includes('does not exist')) {
        console.warn('Screenshots table does not exist. Returning empty array.');
        return NextResponse.json([]);
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error fetching screenshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screenshots' },
      { status: 500 }
    );
  }
}
