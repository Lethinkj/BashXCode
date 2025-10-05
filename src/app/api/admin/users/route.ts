import { NextRequest, NextResponse } from 'next/server';
import sql, { queryWithRetry } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

/**
 * Admin Management API
 * GET /api/admin/users - List all admins (super admin only)
 * POST /api/admin/users - Create new admin (super admin only)
 */

// Get all admin users
export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify requester is super admin
    const requester = await queryWithRetry(async (db) => await db`
      SELECT is_super_admin, is_active FROM admin_users WHERE id = ${adminId}
    `);
    
    if (requester.length === 0 || !requester[0].is_active || !requester[0].is_super_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }
    
    // Get all admin users
    const admins = await queryWithRetry(async (db) => await db`
      SELECT id, email, full_name, is_super_admin, is_active, created_at, last_login
      FROM admin_users
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({
      success: true,
      admins: admins.map((admin: any) => ({
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        isSuperAdmin: admin.is_super_admin,
        isActive: admin.is_active,
        createdAt: admin.created_at,
        lastLogin: admin.last_login,
      }))
    });
    
  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new admin
export async function POST(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    const body = await request.json();
    const { email, password, fullName, isSuperAdmin } = body;
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }
    
    // Verify requester is super admin
    const requester = await queryWithRetry(async (db) => await db`
      SELECT is_super_admin, is_active FROM admin_users WHERE id = ${adminId}
    `);
    
    if (requester.length === 0 || !requester[0].is_active || !requester[0].is_super_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }
    
    // Check if email already exists
    const existing = await queryWithRetry(async (db) => await db`
      SELECT id FROM admin_users WHERE email = ${email.toLowerCase()}
    `);
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create new admin
    const result = await queryWithRetry(async (db) => await db`
      INSERT INTO admin_users (email, password_hash, full_name, is_super_admin, created_by)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName}, ${isSuperAdmin || false}, ${adminId})
      RETURNING id, email, full_name, is_super_admin, is_active, created_at
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: result[0].id,
        email: result[0].email,
        fullName: result[0].full_name,
        isSuperAdmin: result[0].is_super_admin,
        isActive: result[0].is_active,
        createdAt: result[0].created_at,
      }
    });
    
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete admin
export async function DELETE(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id');
    const body = await request.json();
    const { adminIdToDelete } = body;
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!adminIdToDelete) {
      return NextResponse.json(
        { error: 'Admin ID to delete is required' },
        { status: 400 }
      );
    }
    
    // Prevent self-deletion
    if (adminId === adminIdToDelete) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }
    
    // Verify requester is super admin
    const requester = await queryWithRetry(async (db) => await db`
      SELECT is_super_admin, is_active FROM admin_users WHERE id = ${adminId}
    `);
    
    if (requester.length === 0 || !requester[0].is_active || !requester[0].is_super_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }
    
    // Check if admin to delete exists
    const adminToDelete = await queryWithRetry(async (db) => await db`
      SELECT id, email FROM admin_users WHERE id = ${adminIdToDelete}
    `);
    
    if (adminToDelete.length === 0) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }
    
    // Delete the admin
    await queryWithRetry(async (db) => await db`
      DELETE FROM admin_users WHERE id = ${adminIdToDelete}
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully',
      deletedEmail: adminToDelete[0].email
    });
    
  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
