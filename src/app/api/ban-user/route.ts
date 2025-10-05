import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

// Ban a user from a contest
export async function POST(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { contestId, userId, reason } = await request.json();

    if (!contestId || !userId) {
      return NextResponse.json(
        { error: 'Contest ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify admin
    const admin = await sql`
      SELECT id, is_super_admin FROM admin_users 
      WHERE id = ${adminId} AND is_active = true
    `;

    if (admin.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ban the user
    await sql`
      UPDATE contest_participants 
      SET 
        is_banned = true,
        ban_reason = ${reason || 'No reason provided'},
        banned_at = NOW(),
        banned_by = ${adminId}
      WHERE contest_id = ${contestId} AND user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'User banned successfully'
    });

  } catch (error: any) {
    console.error('Ban user error:', error);
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    );
  }
}

// Unban a user from a contest
export async function DELETE(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');
    const userId = searchParams.get('userId');

    if (!contestId || !userId) {
      return NextResponse.json(
        { error: 'Contest ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify admin
    const admin = await sql`
      SELECT id FROM admin_users 
      WHERE id = ${adminId} AND is_active = true
    `;

    if (admin.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Unban the user
    await sql`
      UPDATE contest_participants 
      SET 
        is_banned = false,
        ban_reason = NULL,
        banned_at = NULL,
        banned_by = NULL
      WHERE contest_id = ${contestId} AND user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'User unbanned successfully'
    });

  } catch (error: any) {
    console.error('Unban user error:', error);
    return NextResponse.json(
      { error: 'Failed to unban user' },
      { status: 500 }
    );
  }
}
