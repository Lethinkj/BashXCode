# Database Setup Instructions

## Step 1: Go to Supabase SQL Editor

1. Visit https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

## Step 2: Run the Schema

Copy the contents of `database-schema.sql` and paste it into the SQL Editor, then click "Run".

This will create:
- ✅ `contests` table
- ✅ `submissions` table  
- ✅ Indexes for performance
- ✅ Leaderboard view

## Step 3: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- contests
- submissions

## Step 4: Test the Connection

Your connection string is already set in `.env.local`:
```
DATABASE_URL=postgresql://postgres:aura@12345@db.aomjtfhjwsewrgubouma.supabase.co:5432/postgres
```

## Step 5: Restart Development Server

```bash
# Stop the current server (Ctrl+C in terminal)
npm run dev
```

## Verification

Once the server restarts:
1. Go to http://localhost:3000/admin
2. Create a test contest
3. Check Supabase dashboard → Table Editor → contests table
4. You should see your contest data!

## Troubleshooting

**Error: "relation contests does not exist"**
- Solution: Run the database-schema.sql file in Supabase SQL Editor

**Error: "Database connection failed"**
- Solution: Check your DATABASE_URL in .env.local
- Make sure password is correct: aura@12345

**Error: "password authentication failed"**
- Solution: Go to Supabase → Settings → Database → Reset Database Password
- Update .env.local with new password

## Next Steps

After verifying the database works:
1. ✅ Database is connected
2. ⏭️ Add Judge0 for code execution
3. ⏭️ Deploy to Vercel with environment variables
