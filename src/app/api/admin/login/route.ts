import { NextRequest, NextResponse } from 'next/server';
import sql, { queryWithRetry } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

/**
 * Admin Login API
 * POST /api/admin/login
 */
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
    
    // Find admin user
    const result = await queryWithRetry(async (db) => await db`
      SELECT id, email, password_hash, full_name, is_super_admin, is_active 
      FROM admin_users 
      WHERE email = ${email.toLowerCase()}
    `);
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const admin = result[0];
    
    // Check if account is active
    if (!admin.is_active) {
      return NextResponse.json(
        { error: 'Admin account is disabled' },
        { status: 403 }
      );
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, admin.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Update last login time
    await queryWithRetry(async (db) => await db`
      UPDATE admin_users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = ${admin.id}
    `);
    
    // Return admin data (without password hash)
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        isSuperAdmin: admin.is_super_admin,
        isActive: admin.is_active,
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
