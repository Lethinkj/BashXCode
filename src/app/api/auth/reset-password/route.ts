import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Reset password to 123456 and force password change
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await sql`
      SELECT id, email FROM users 
      WHERE email = ${email.toLowerCase()}
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Reset password to 123456
    const defaultPassword = '123456';
    const hashedPassword = await hashPassword(defaultPassword);

    await sql`
      UPDATE users 
      SET 
        password_hash = ${hashedPassword},
        must_change_password = true
      WHERE id = ${user[0].id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      temporaryPassword: defaultPassword
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
