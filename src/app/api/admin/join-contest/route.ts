import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { contestId, adminEmail } = await request.json();
    
    if (!contestId || !adminEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify this is an admin user
    const adminCheck = await sql`
      SELECT id, email, full_name FROM admin_users 
      WHERE email = ${adminEmail} AND is_active = true
    `;
    
    if (adminCheck.length === 0) {
      return NextResponse.json({ error: 'Not an admin user' }, { status: 403 });
    }
    
    // Check if admin already has a regular user account with same email
    const regularUser = await sql`
      SELECT id FROM users WHERE email = ${adminEmail}
    `;
    
    let userId: string;
    
    if (regularUser.length > 0) {
      // Use existing user account
      userId = regularUser[0].id;
    } else {
      // Create a shadow user account for the admin (for contest participation)
      const newUser = await sql`
        INSERT INTO users (email, password_hash, full_name)
        VALUES (
          ${adminEmail},
          'ADMIN_ACCOUNT_NO_PASSWORD',
          ${adminCheck[0].full_name}
        )
        RETURNING id
      `;
      userId = newUser[0].id;
    }
    
    // Check if already joined
    const existing = await sql`
      SELECT id FROM contest_participants 
      WHERE contest_id = ${contestId} AND user_id = ${userId}
    `;
    
    if (existing.length === 0) {
      // Join the contest
      await sql`
        INSERT INTO contest_participants (contest_id, user_id)
        VALUES (${contestId}, ${userId})
      `;
    }
    
    // Return the user info for authentication
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: adminEmail,
        fullName: adminCheck[0].full_name
      }
    });
    
  } catch (error: any) {
    console.error('Admin join contest error:', error);
    return NextResponse.json({ error: error.message || 'Failed to join contest' }, { status: 500 });
  }
}
