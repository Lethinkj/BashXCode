import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Update user profile (name and/or password)
export async function PUT(request: NextRequest) {
  try {
    const { userId, fullName, currentPassword, newPassword } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await sql`
      SELECT id, password_hash FROM users WHERE id = ${userId}
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    // Update full name if provided
    if (fullName && fullName.trim()) {
      updates.fullName = fullName.trim();
    }

    // Update password if both current and new are provided
    if (currentPassword && newPassword) {
      // Verify current password
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(currentPassword, user[0].password_hash);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      updates.passwordHash = await hashPassword(newPassword);
      updates.mustChangePassword = false; // Clear the flag after successful password change
    }

    // If nothing to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No changes provided' },
        { status: 400 }
      );
    }

    // Build dynamic update query
    if (updates.fullName && updates.passwordHash) {
      await sql`
        UPDATE users 
        SET full_name = ${updates.fullName}, 
            password_hash = ${updates.passwordHash},
            must_change_password = false
        WHERE id = ${userId}
      `;
    } else if (updates.fullName) {
      await sql`
        UPDATE users 
        SET full_name = ${updates.fullName}
        WHERE id = ${userId}
      `;
    } else if (updates.passwordHash) {
      await sql`
        UPDATE users 
        SET password_hash = ${updates.passwordHash},
            must_change_password = false
        WHERE id = ${userId}
      `;
    }

    // Get updated user info
    const updatedUser = await sql`
      SELECT id, full_name, email, must_change_password 
      FROM users 
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser[0].id,
        fullName: updatedUser[0].full_name,
        email: updatedUser[0].email,
        mustChangePassword: updatedUser[0].must_change_password
      }
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
