import { NextRequest, NextResponse } from 'next/server';
import sql, { queryWithRetry } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

/**
 * Password Reset API
 * POST /api/admin/reset-password - Request password reset
 * PUT /api/admin/reset-password - Complete password reset with token
 */

// Request password reset (generates token)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find admin
    const result = await queryWithRetry(async (db) => await db`
      SELECT id, email, is_active FROM admin_users WHERE email = ${email.toLowerCase()}
    `);
    
    if (result.length === 0) {
      // Don't reveal if email exists or not (security)
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a reset token has been generated. Please contact super admin.'
      });
    }
    
    const admin = result[0];
    
    if (!admin.is_active) {
      return NextResponse.json(
        { error: 'Admin account is disabled' },
        { status: 403 }
      );
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store token in database
    await queryWithRetry(async (db) => await db`
      UPDATE admin_users
      SET password_reset_token = ${resetToken},
          password_reset_expires = ${resetExpires.toISOString()}
      WHERE id = ${admin.id}
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Password reset token generated',
      resetToken, // In production, send this via email instead
      expiresAt: resetExpires.toISOString()
    });
    
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Complete password reset (with token)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // Find admin by token
    const result = await queryWithRetry(async (db) => await db`
      SELECT id, email, password_reset_expires, is_active
      FROM admin_users
      WHERE password_reset_token = ${token}
    `);
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    const admin = result[0];
    
    // Check if token expired
    if (new Date(admin.password_reset_expires) < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }
    
    if (!admin.is_active) {
      return NextResponse.json(
        { error: 'Admin account is disabled' },
        { status: 403 }
      );
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    
    // Update password and clear reset token
    await queryWithRetry(async (db) => await db`
      UPDATE admin_users
      SET password_hash = ${passwordHash},
          password_reset_token = NULL,
          password_reset_expires = NULL
      WHERE id = ${admin.id}
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      email: admin.email
    });
    
  } catch (error) {
    console.error('Password reset completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
