# Admin System Setup - Quick Start Guide

## ✅ What Was Done

### 1. Database Setup
- Created `admin_users` table in Supabase
- Added indexes for performance
- Inserted super admin account

### 2. Super Admin Created
- **Email**: `kjlethin24@gmail.com`
- **Password**: `909254`
- **Role**: Super Admin (can add other admins)
- **Status**: Active

### 3. API Endpoints Created
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - List all admins (super admin only)
- `POST /api/admin/users` - Create new admin (super admin only)
- `POST /api/admin/reset-password` - Request password reset
- `PUT /api/admin/reset-password` - Complete password reset

### 4. Admin Page Updated
- Now uses database authentication
- Login with email instead of username
- Stores admin session in localStorage

## 🚀 How to Use

### Step 1: Start the Dev Server
```bash
npm run dev
```

### Step 2: Login as Super Admin
1. Go to `http://localhost:3000/admin`
2. Enter email: `kjlethin24@gmail.com`
3. Enter password: `909254`
4. Click "Login"

### Step 3: Test the Contest Features
- Click "🔧 Test Contest" to test problems
- Create new contests
- View leaderboards
- All features work as before

## 🔑 Key Features

### For Super Admin (kjlethin24@gmail.com)
✅ **Login to Admin Panel** - Database-backed authentication
✅ **Create Contests** - Add problems, set timing
✅ **Test Contests** - Admin test mode (no DB saves)
✅ **View Leaderboards** - See contest results
✅ **Add New Admins** - Create additional admin accounts (via API)
✅ **Reset Passwords** - Help admins who forgot password

### For New Admins (to be created)
✅ **Login to Admin Panel** - Same interface
✅ **Manage Contests** - Full contest management
✅ **Test Problems** - Verify questions work
✅ **Cannot Add Admins** - Only super admins can (unless promoted)

## 📋 Adding a New Admin

### Option 1: Using API (Recommended)
```bash
# Get your super admin ID after login
# Then make API call:

POST http://localhost:3000/api/admin/users
Headers:
  Content-Type: application/json
  x-admin-id: <your-super-admin-id>
Body:
{
  "email": "newadmin@example.com",
  "password": "securepassword",
  "fullName": "New Admin Name",
  "isSuperAdmin": false
}
```

### Option 2: Using Database
```sql
-- Connect to Supabase and run:
INSERT INTO admin_users (email, password_hash, full_name, is_super_admin)
VALUES (
  'newadmin@example.com',
  '$2a$10$hash_here', -- Hash the password first using bcrypt
  'New Admin Name',
  FALSE
);
```

### Option 3: Using Node Script (Easiest)
Create a file `add-admin.mjs`:
```javascript
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

const email = 'newadmin@example.com';
const password = 'password123';
const fullName = 'New Admin';
const passwordHash = await bcrypt.hash(password, 10);

await sql`
  INSERT INTO admin_users (email, password_hash, full_name, is_super_admin)
  VALUES (${email}, ${passwordHash}, ${fullName}, FALSE)
`;

console.log('Admin created!');
await sql.end();
```

Run: `node add-admin.mjs`

## 🔐 Password Reset Flow

### If You Forget Password:

1. **Request Reset Token**
   ```bash
   POST /api/admin/reset-password
   Body: { "email": "kjlethin24@gmail.com" }
   ```
   Response includes `resetToken`

2. **Use Token to Reset**
   ```bash
   PUT /api/admin/reset-password
   Body: { 
     "token": "token-from-step-1", 
     "newPassword": "newpassword123" 
   }
   ```

3. **Login with New Password**

**Note**: In production, the token should be sent via email, not in the response.

## 🗂️ Database Structure

### admin_users Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique admin ID |
| email | VARCHAR | Login email (unique) |
| password_hash | TEXT | Bcrypt hash |
| full_name | VARCHAR | Admin name |
| is_super_admin | BOOLEAN | Can add admins |
| is_active | BOOLEAN | Account enabled |
| created_at | TIMESTAMP | Creation time |
| created_by | UUID | Creator admin ID |
| last_login | TIMESTAMP | Last login |
| password_reset_token | TEXT | Reset token |
| password_reset_expires | TIMESTAMP | Token expiry |

## 🧪 Testing

### Test Login
1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000/admin`
3. Login with: `kjlethin24@gmail.com` / `909254`
4. Should see admin dashboard

### Test Admin Test Mode
1. After login, click "🔧 Test Contest"
2. Should see orange "ADMIN TEST MODE" badge
3. Submit code - won't save to database
4. Perfect for testing problems

### Test Old Admin Login (Should Fail)
1. Try login with: `admin` / `admin123`
2. Should fail - old hardcoded credentials removed
3. Must use database accounts now

## 📁 Files Reference

### New Files
- `create-admin-table.mjs` - Migration script (run once)
- `admin-schema.sql` - SQL schema reference
- `src/app/api/admin/login/route.ts` - Login API
- `src/app/api/admin/users/route.ts` - Admin management
- `src/app/api/admin/reset-password/route.ts` - Password reset
- `ADMIN_MANAGEMENT.md` - Full documentation
- `ADMIN_SETUP.md` - This quick start

### Modified Files
- `src/app/admin/page.tsx` - Uses database login
- `src/types/index.ts` - Added admin types

## ⚠️ Important Notes

1. **Old Admin Credentials Don't Work**
   - `admin` / `admin123` is removed
   - Use: `kjlethin24@gmail.com` / `909254`

2. **Super Admin Special**
   - Only super admins can add new admins
   - `kjlethin24@gmail.com` is the super admin
   - Can promote regular admins to super admin via database

3. **Password Security**
   - All passwords hashed with bcrypt
   - Never stored in plain text
   - Reset tokens expire after 1 hour

4. **Migration Already Run**
   - Don't run `create-admin-table.mjs` again
   - It will drop and recreate the table
   - Use API or SQL to add more admins

## 🎯 Next Steps

1. **Test the login** with new credentials
2. **Create contests** and verify everything works
3. **Add more admins** if needed (via API)
4. **Set up password reset** workflow for production

## 🆘 Troubleshooting

### Can't Login
- Check email is correct: `kjlethin24@gmail.com`
- Check password is correct: `909254`
- Verify database connection: `node test-db.mjs`
- Check admin exists: Query `admin_users` table

### Admin Test Mode Not Working
- Ensure you logged in via `/admin` page
- Check `adminAuthenticated` in localStorage
- Refresh the contest page

### Can't Add New Admin
- Verify you're super admin
- Check `x-admin-id` header is set
- Verify `is_super_admin` is TRUE in database

## 📞 Support

If issues persist:
1. Check console for errors
2. Verify `.env.local` has DATABASE_URL
3. Check Supabase database connection
4. Review API logs in terminal

---

**Ready to go!** 🚀

Your admin system is fully set up and ready to use. Login with `kjlethin24@gmail.com` / `909254` and start managing contests!
