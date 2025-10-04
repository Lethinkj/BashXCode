/**
 * Admin Users Table Migration
 * Creates admin_users table and sets up initial super admin
 */

import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,
});

async function migrate() {
  try {
    console.log('🚀 Starting admin users migration...\n');

    // Drop existing table
    console.log('1. Dropping existing admin_users table (if exists)...');
    await sql`DROP TABLE IF EXISTS admin_users CASCADE`;
    console.log('   ✓ Table dropped\n');

    // Create admin_users table
    console.log('2. Creating admin_users table...');
    await sql`
      CREATE TABLE admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        is_super_admin BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        last_login TIMESTAMP,
        password_reset_token TEXT,
        password_reset_expires TIMESTAMP
      )
    `;
    console.log('   ✓ Table created\n');

    // Create indexes
    console.log('3. Creating indexes...');
    await sql`CREATE INDEX idx_admin_email ON admin_users(email)`;
    await sql`CREATE INDEX idx_admin_active ON admin_users(is_active)`;
    console.log('   ✓ Indexes created\n');

    // Hash the password for super admin
    console.log('4. Creating super admin account...');
    const email = 'kjlethin24@gmail.com';
    const password = '909254';
    const fullName = 'Super Admin';
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    await sql`
      INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, is_active)
      VALUES (${email}, ${fullName}, ${passwordHash}, TRUE, TRUE)
    `;
    
    console.log('   ✓ Super admin created');
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    console.log(`   👑 Role: Super Admin\n`);

    // Verify the admin was created
    console.log('5. Verifying admin creation...');
    const result = await sql`
      SELECT id, email, full_name, is_super_admin, is_active, created_at
      FROM admin_users
      WHERE email = ${email}
    `;
    
    if (result.length > 0) {
      console.log('   ✓ Admin verified in database');
      console.log('   Details:', {
        id: result[0].id,
        email: result[0].email,
        full_name: result[0].full_name,
        is_super_admin: result[0].is_super_admin,
        is_active: result[0].is_active,
      });
    }

    console.log('\n✅ Admin users migration completed successfully!\n');
    console.log('📝 Summary:');
    console.log('   - admin_users table created');
    console.log('   - Super admin account created');
    console.log('   - Email: kjlethin24@gmail.com');
    console.log('   - Password: 909254');
    console.log('   - Super admins can add new admins and reset passwords\n');

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

migrate();
