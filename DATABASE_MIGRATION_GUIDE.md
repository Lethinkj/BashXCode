# Database Migration Guide - Phase 3

## ⚠️ IMPORTANT: Breaking Changes

This migration will **DROP and recreate** the following tables:
- `contests`
- `submissions`
- `contest_participants` (NEW)
- `users` (NEW)

**All existing data will be lost!** If you have production data, back it up first.

## Prerequisites

- Supabase project with PostgreSQL database
- Connection string from Supabase dashboard
- `psql` command-line tool installed

## Migration Steps

### 1. Get Supabase Connection String

1. Go to your Supabase project dashboard
2. Click on "Project Settings" → "Database"
3. Copy the "Connection string" (direct connection)
4. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   ```

### 2. Connect to Database

```bash
# Windows PowerShell
psql "postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"

# Or if psql is not in PATH, use full path
# Example: C:\Program Files\PostgreSQL\15\bin\psql.exe "connection-string"
```

### 3. Run Migration Script

Once connected to the database:

```sql
-- Option A: Run file directly
\i database-schema.sql

-- Option B: Copy/paste the SQL from database-schema.sql
-- Then execute in psql
```

### 4. Verify Migration

Check that all tables were created:

```sql
-- List all tables
\dt

-- Should see:
-- users
-- contests
-- contest_participants  
-- submissions

-- Check users table structure
\d users

-- Check contests table for new columns
\d contests

-- Verify contest_code constraint
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'contests' AND constraint_type = 'UNIQUE';
```

### 5. Test with Sample Data

```sql
-- Create a test user
INSERT INTO users (email, password_hash, full_name) 
VALUES ('test@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Test User');

-- Create a test contest
INSERT INTO contests (title, description, start_time, end_time, contest_code, problems)
VALUES (
  'Test Contest',
  'Sample contest for testing',
  NOW(),
  NOW() + INTERVAL '1 hour',
  'TEST01',
  '[]'::jsonb
);

-- Join contest
INSERT INTO contest_participants (contest_id, user_id)
SELECT c.id, u.id 
FROM contests c, users u 
WHERE c.contest_code = 'TEST01' AND u.email = 'test@example.com';

-- Query joined contests
SELECT c.title, c.contest_code, u.email, u.full_name
FROM contests c
JOIN contest_participants cp ON c.id = cp.contest_id
JOIN users u ON cp.user_id = u.id;

-- Clean up test data
DELETE FROM contest_participants;
DELETE FROM submissions;
DELETE FROM contests;
DELETE FROM users;
```

## Post-Migration Checklist

### Database Verification
- [ ] All 4 tables exist (users, contests, contest_participants, submissions)
- [ ] `users` table has email unique constraint
- [ ] `contests` table has contest_code column and unique constraint
- [ ] `submissions` table uses user_id (UUID) instead of user_name (TEXT)
- [ ] Foreign key relationships working (contest_participants → users/contests)

### Application Testing
- [ ] Can register new user via /register
- [ ] Can login with registered user via /login
- [ ] User session persists (localStorage authUser)
- [ ] Can join contest by code via /join
- [ ] Joined contests appear in /join page
- [ ] Can enter contest and see problems
- [ ] Can submit solutions (creates submission with user_id)
- [ ] Leaderboard shows user full names and emails
- [ ] Admin can create contests (auto-generates contest code)
- [ ] Admin can delete contests
- [ ] Admin panel shows contest codes

### Contest Flow Testing
- [ ] Create contest as admin with future start time
- [ ] Contest shows as "upcoming" in join page
- [ ] Cannot submit before contest starts
- [ ] Contest becomes "active" when start time reached
- [ ] Can submit during active period
- [ ] Time remaining displays correctly
- [ ] Contest becomes "ended" after end time
- [ ] Cannot submit after contest ends

## Common Issues & Solutions

### Issue: "psql: command not found"
**Solution**: Install PostgreSQL client or use Supabase SQL Editor in dashboard

### Issue: "permission denied"
**Solution**: Make sure you're using the correct connection string with password

### Issue: "table does not exist"
**Solution**: Run the migration script again. Tables are created with IF NOT EXISTS

### Issue: "duplicate key violation"
**Solution**: Clean up test data before running multiple tests:
```sql
TRUNCATE contest_participants, submissions, contests, users CASCADE;
```

### Issue: "foreign key constraint violation"
**Solution**: Delete records in correct order:
```sql
DELETE FROM contest_participants;
DELETE FROM submissions;
DELETE FROM contests;
DELETE FROM users;
```

## Rollback Plan

If you need to revert to the old schema:

```sql
-- Drop new tables
DROP TABLE IF EXISTS contest_participants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Restore old contests and submissions structure
-- (You'll need a backup to restore data)
CREATE TABLE contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  problems JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  user_name TEXT NOT NULL,  -- old field
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL,
  passed_test_cases INTEGER DEFAULT 0,
  total_test_cases INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Environment Variables

Make sure your `.env.local` has:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres

# Piston API (for code execution)
PISTON_API_URL=https://emkc.org/api/v2/piston
```

## Next Steps After Migration

1. **Test thoroughly** with multiple users
2. **Create sample contests** for demonstration
3. **Test contest timing** (create contests that start in 1 minute, etc.)
4. **Test all languages** (Python, JavaScript, Java, C++, C)
5. **Test leaderboard** with multiple submissions
6. **Test admin delete** functionality
7. **Commit changes** to Git
8. **Deploy to Vercel/Production**

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Check Network tab for failed API calls
4. Review the error messages in this document
5. Check database tables with `\dt` and `SELECT * FROM table_name`

## Summary

✅ **Schema File**: `database-schema.sql` (ready to run)  
✅ **Frontend Code**: Fully updated for new schema  
✅ **API Routes**: Updated for userId and new tables  
✅ **Authentication**: Complete with bcrypt and session management  

**Ready to migrate!** Follow the steps above carefully.
