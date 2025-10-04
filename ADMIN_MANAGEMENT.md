# Admin Management System

## Overview
Complete admin management system with database-backed authentication, allowing multiple admins with role-based permissions and password reset functionality.

## Features
✅ **Database-Backed Admin Accounts** - No more hardcoded credentials
✅ **Super Admin Role** - Can add/remove other admins  
✅ **Password Reset** - Forgot password recovery system
✅ **Multi-Admin Support** - Multiple admins can manage contests
✅ **Activity Tracking** - Last login tracking
✅ **Account Management** - Enable/disable admin accounts

## Database Schema

### Admin Users Table (`admin_users`)
```sql
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
```

### Fields Explanation:
- **`id`**: Unique identifier for admin
- **`email`**: Admin email (used for login)
- **`password_hash`**: Bcrypt hashed password
- **`full_name`**: Admin's full name
- **`is_super_admin`**: Can add new admins (TRUE/FALSE)
- **`is_active`**: Account status (disabled admins can't login)
- **`created_at`**: Account creation timestamp
- **`created_by`**: ID of admin who created this account
- **`last_login`**: Last successful login time
- **`password_reset_token`**: Token for password reset
- **`password_reset_expires`**: Token expiration time

## Default Super Admin

### Credentials
- **Email**: `kjlethin24@gmail.com`
- **Password**: `909254`
- **Role**: Super Admin
- **Permissions**: Can add new admins, reset passwords, manage contests

## Setup Instructions

### 1. Run Migration
```bash
node create-admin-table.mjs
```

This will:
- Create `admin_users` table
- Create indexes for performance
- Insert super admin account
- Verify setup

### 2. Login as Super Admin
1. Go to `http://localhost:3000/admin`
2. Enter email: `kjlethin24@gmail.com`
3. Enter password: `909254`
4. Click "Login"

## API Endpoints

### 1. Admin Login
**POST** `/api/admin/login`

**Request:**
```json
{
  "email": "kjlethin24@gmail.com",
  "password": "909254"
}
```

**Response (Success):**
```json
{
  "success": true,
  "admin": {
    "id": "uuid",
    "email": "kjlethin24@gmail.com",
    "fullName": "Super Admin",
    "isSuperAdmin": true,
    "isActive": true
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid email or password"
}
```

### 2. List All Admins (Super Admin Only)
**GET** `/api/admin/users`

**Headers:**
```
x-admin-id: <super-admin-uuid>
```

**Response:**
```json
{
  "success": true,
  "admins": [
    {
      "id": "uuid",
      "email": "kjlethin24@gmail.com",
      "fullName": "Super Admin",
      "isSuperAdmin": true,
      "isActive": true,
      "createdAt": "2025-10-04T10:00:00Z",
      "lastLogin": "2025-10-04T12:30:00Z"
    }
  ]
}
```

### 3. Create New Admin (Super Admin Only)
**POST** `/api/admin/users`

**Headers:**
```
x-admin-id: <super-admin-uuid>
```

**Request:**
```json
{
  "email": "newadmin@example.com",
  "password": "securepassword123",
  "fullName": "New Admin",
  "isSuperAdmin": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "admin": {
    "id": "new-uuid",
    "email": "newadmin@example.com",
    "fullName": "New Admin",
    "isSuperAdmin": false,
    "isActive": true,
    "createdAt": "2025-10-04T12:45:00Z"
  }
}
```

### 4. Request Password Reset
**POST** `/api/admin/reset-password`

**Request:**
```json
{
  "email": "kjlethin24@gmail.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset token generated",
  "resetToken": "abc123...xyz",
  "expiresAt": "2025-10-04T13:45:00Z"
}
```

### 5. Complete Password Reset
**PUT** `/api/admin/reset-password`

**Request:**
```json
{
  "token": "abc123...xyz",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "email": "kjlethin24@gmail.com"
}
```

## Usage Workflows

### Adding a New Admin

1. **Login as Super Admin**
   ```
   Email: kjlethin24@gmail.com
   Password: 909254
   ```

2. **Call Create Admin API**
   ```bash
   curl -X POST http://localhost:3000/api/admin/users \
     -H "Content-Type: application/json" \
     -H "x-admin-id: <your-super-admin-id>" \
     -d '{
       "email": "newadmin@example.com",
       "password": "password123",
       "fullName": "John Doe",
       "isSuperAdmin": false
     }'
   ```

3. **New Admin Can Login**
   - Email: `newadmin@example.com`
   - Password: `password123`

### Resetting Your Password

1. **Request Reset Token**
   ```bash
   curl -X POST http://localhost:3000/api/admin/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email": "kjlethin24@gmail.com"}'
   ```

2. **Use Token to Set New Password**
   ```bash
   curl -X PUT http://localhost:3000/api/admin/reset-password \
     -H "Content-Type: application/json" \
     -d '{
       "token": "your-reset-token",
       "newPassword": "newpassword123"
     }'
   ```

3. **Login with New Password**

### Disabling an Admin Account

```sql
-- Run in database
UPDATE admin_users 
SET is_active = FALSE 
WHERE email = 'admin-to-disable@example.com';
```

### Promoting Admin to Super Admin

```sql
-- Run in database
UPDATE admin_users 
SET is_super_admin = TRUE 
WHERE email = 'admin@example.com';
```

## Security Features

### Password Hashing
- Uses bcrypt with 10 salt rounds
- Passwords never stored in plain text
- Secure against rainbow table attacks

### Password Reset
- Tokens are 32-byte random hex strings
- Tokens expire after 1 hour
- Tokens are single-use (cleared after reset)

### Account Protection
- Inactive accounts cannot login
- Last login tracking for audit
- Created_by tracking for accountability

### API Security
- Super admin actions require `x-admin-id` header
- Email existence not revealed in reset requests
- Invalid credentials don't reveal which field is wrong

## Testing

### Test Super Admin Login
```bash
# Should succeed
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kjlethin24@gmail.com",
    "password": "909254"
  }'
```

### Test Invalid Login
```bash
# Should fail
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kjlethin24@gmail.com",
    "password": "wrongpassword"
  }'
```

### Test Creating Admin Without Super Admin
```bash
# Should return 403 Forbidden
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "x-admin-id: invalid-id" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

## Database Queries

### List All Admins
```sql
SELECT id, email, full_name, is_super_admin, is_active, created_at, last_login
FROM admin_users
ORDER BY created_at DESC;
```

### Find Admin by Email
```sql
SELECT * FROM admin_users WHERE email = 'kjlethin24@gmail.com';
```

### Count Total Admins
```sql
SELECT COUNT(*) as total_admins FROM admin_users WHERE is_active = TRUE;
```

### Count Super Admins
```sql
SELECT COUNT(*) as super_admins FROM admin_users 
WHERE is_super_admin = TRUE AND is_active = TRUE;
```

### Recent Logins
```sql
SELECT email, full_name, last_login
FROM admin_users
WHERE last_login IS NOT NULL
ORDER BY last_login DESC
LIMIT 10;
```

## Migration History

### Version 1.0 - Initial Setup
- Created `admin_users` table
- Added super admin account (kjlethin24@gmail.com)
- Setup password reset system
- Created API endpoints

## Files Created/Modified

### New Files
- ✅ `create-admin-table.mjs` - Migration script
- ✅ `admin-schema.sql` - Database schema
- ✅ `src/app/api/admin/login/route.ts` - Admin login API
- ✅ `src/app/api/admin/users/route.ts` - Admin management API
- ✅ `src/app/api/admin/reset-password/route.ts` - Password reset API
- ✅ `ADMIN_MANAGEMENT.md` - This documentation

### Modified Files
- ✅ `src/types/index.ts` - Added admin types
- ✅ `src/app/admin/page.tsx` - Updated login to use database

## Next Steps

### Recommended Features
1. **Admin UI for User Management** - Add UI to manage admins
2. **Email Integration** - Send reset tokens via email
3. **Audit Logging** - Track all admin actions
4. **2FA Support** - Add two-factor authentication
5. **Session Management** - Implement JWT tokens
6. **Password Policies** - Enforce strong passwords
7. **Admin Permissions** - Granular role-based permissions

### Production Considerations
1. Add rate limiting to login endpoint
2. Implement CAPTCHA for password reset
3. Send reset tokens via email (not in response)
4. Add session timeout
5. Implement IP whitelisting
6. Add admin activity logs
7. Setup monitoring and alerts

## Support

For issues or questions about the admin system:
1. Check database connection: `node test-db.mjs`
2. Verify admin exists: Query `admin_users` table
3. Check API logs for errors
4. Verify `.env.local` has correct DATABASE_URL

## Summary

✅ **Migration Complete** - Admin table created
✅ **Super Admin Ready** - kjlethin24@gmail.com / 909254
✅ **APIs Available** - Login, create admin, reset password
✅ **Secure** - Bcrypt hashing, token-based reset
✅ **Scalable** - Support multiple admins with roles
