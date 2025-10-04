-- Admin Management System Schema
-- Version 1.0 - Admin Users Table

-- Drop existing table if exists
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES admin_users(id),
  last_login TIMESTAMP,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_admin_email ON admin_users(email);
CREATE INDEX idx_admin_active ON admin_users(is_active);

-- Insert default super admin (kjlethin24@gmail.com)
-- Password: 909254
-- Hash generated with bcrypt salt rounds 10
INSERT INTO admin_users (email, full_name, password_hash, is_super_admin, is_active) 
VALUES (
  'kjlethin24@gmail.com',
  'Super Admin',
  '$2a$10$YourHashHere', -- This will be replaced by the migration script
  TRUE,
  TRUE
);

COMMENT ON TABLE admin_users IS 'Stores admin user accounts with authentication and management capabilities';
COMMENT ON COLUMN admin_users.email IS 'Admin email address, used for login';
COMMENT ON COLUMN admin_users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN admin_users.is_super_admin IS 'Super admins can add/remove other admins';
COMMENT ON COLUMN admin_users.is_active IS 'Inactive admins cannot log in';
COMMENT ON COLUMN admin_users.created_by IS 'Admin who created this account';
COMMENT ON COLUMN admin_users.password_reset_token IS 'Token for password reset';
COMMENT ON COLUMN admin_users.password_reset_expires IS 'Expiry time for reset token';
