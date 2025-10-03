# Database Connection Troubleshooting

## ❌ Current Issue: Connection Timeout

The database connection is timing out. Here are the possible causes and solutions:

### 1. Check Supabase Project Status

1. Go to https://supabase.com/dashboard
2. Check if your project is **Active** (not paused)
3. If paused, click "Resume Project"

### 2. Verify Connection String

Your current connection details:
- Host: `db.aomjtfhjwsewrgubouma.supabase.co`
- Port: `5432`
- Database: `postgres`
- Username: `postgres`
- Password: `aura@12345`

**To get the correct connection string:**

1. Go to Supabase Dashboard → Project Settings
2. Click "Database" in the left sidebar
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the connection string

It should look like:
```
postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Important Notes:**
- Supabase might use a **pooler** connection (port 6543) instead of direct (port 5432)
- The host might be different: `aws-0-[region].pooler.supabase.com`

### 3. Update .env.local

Once you have the correct connection string, update `d:\clan\.env.local`:

```bash
# If password has special characters like @, encode them:
# @ becomes %40
# ! becomes %21
# # becomes %23
# $ becomes %24

DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

### 4. Alternative: Use Supabase JS Client

If direct PostgreSQL connection doesn't work, we can use Supabase's JS client instead:

```bash
npm install @supabase/supabase-js
```

Then use their REST API which works through HTTPS (no connection issues).

### 5. Check Firewall/Network

-Windows Firewall might be blocking PostgreSQL connections
- Try disabling firewall temporarily to test
- Or add an exception for Node.js

### 6. Quick Test Connection

Go to Supabase Dashboard →  SQL Editor and run:

```sql
SELECT NOW() as test;
```

If this works, the database is fine and it's just a connection issue.

---

## 🔧 What to Do Next:

**Option A: Get Correct Connection String (RECOMMENDED)**
1. Go to Supabase Dashboard → Settings → Database
2. Copy the "Connection string" (URI format)
3. Replace the DATABASE_URL in `.env.local`
4. Restart dev server

**Option B: Use Supabase REST API**
- I can convert the app to use Supabase's JS client
- This works through HTTPS (port 443) - no connection issues
- Takes 5 minutes to implement

**Option C: Use Supabase Connection Pooler**
- Use the pooler URL (port 6543 instead of 5432)
- More reliable for serverless deployments

---

## 📝 Please Provide:

1. Is your Supabase project active/running?
2. Can you copy-paste the exact connection string from:
   Supabase Dashboard → Settings → Database → Connection string (URI)?

I'll update the code once I have the correct connection details!
