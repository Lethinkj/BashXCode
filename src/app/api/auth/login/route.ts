import { NextRequest, NextResponse } from 'next/server';
import sql, { queryWithRetry } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user with retry logic
    const result = await queryWithRetry(async (db) => await db`
      SELECT id, email, password_hash, full_name, is_active, must_change_password FROM users WHERE email = ${email.toLowerCase()}
    `);
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = result[0];
    
    // Check if account is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if user must change password
    if (user.must_change_password) {
      return NextResponse.json({
        success: true,
        mustChangePassword: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
        },
      });
    }
    
    // Update last login
    await sql`
      UPDATE users SET last_login = NOW() WHERE id = ${user.id}
    `;
    
    // Return user data (without password hash)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
