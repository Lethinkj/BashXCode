# Quick Setup Guide - Apply Recent Updates

## ⚡ Quick Start (5 Minutes)

### Step 1: Apply Database Migration (CRITICAL)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire content from `add-coding-time-tracking.sql`
6. Paste into SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Verify success message

**Expected Output:**
```
CREATE TABLE
CREATE INDEX  
ALTER TABLE
CREATE INDEX
```

### Step 2: Clear Cache & Rebuild

**Windows PowerShell:**
```powershell
# Clear Next.js cache
Remove-Item -Path ".next" -Recurse -Force

# Rebuild project
npm run build
```

**Or use the batch file:**
```bash
.\fix-cache-errors.bat
```

### Step 3: Start Development Server

```bash
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

### Step 4: Quick Test

1. **Open:** http://localhost:3000
2. **Login/Register** a test user
3. **Join** an active contest
4. **Verify:**
   - ✅ Logo shows "Bash **X** Code"
   - ✅ Tagline "Code and Conquer"
   - ✅ Auto full-screen entry
5. **Select a problem**
6. **Start typing code** (not template)
7. **Submit solution**
8. **Check leaderboard:**
   - ✅ "Solve Time" column visible
   - ✅ Time displayed (e.g., "5m 30s")

---

## 🔍 Verification Checklist

### Database:
- [ ] `coding_times` table created
- [ ] `solve_time_seconds` column in `submissions`
- [ ] Indexes created successfully

### Branding:
- [ ] Logo shows "Bash X Code" with styled X
- [ ] "Code and Conquer" tagline on login/register
- [ ] Admin pages updated branding

### Features:
- [ ] Auto full-screen on contest entry
- [ ] Full-screen exit tracked as tab switch
- [ ] Coding start time logged on first edit
- [ ] Problem switching resets state
- [ ] Solve time calculated on submission
- [ ] Leaderboard shows solve time
- [ ] Leaderboard sorts by solve time

---

## 🐛 Troubleshooting

### Issue: "coding_times table does not exist"

**Solution:**
1. Re-run `add-coding-time-tracking.sql` in Supabase
2. Check for SQL errors in console
3. Verify Supabase connection

### Issue: Solve time not showing

**Check:**
1. Database migration applied? 
2. User modified template code?
3. Submission was successful?
4. Browser console for errors?

**Debug Query:**
```sql
-- Check if coding_times has entries
SELECT * FROM coding_times LIMIT 10;

-- Check if submissions have solve_time_seconds
SELECT id, status, solve_time_seconds 
FROM submissions 
WHERE solve_time_seconds IS NOT NULL 
LIMIT 10;
```

### Issue: Leaderboard not sorting correctly

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear Next.js cache: `Remove-Item -Path ".next" -Recurse -Force`
3. Rebuild: `npm run build`
4. Restart dev server: `npm run dev`

### Issue: TypeScript errors

**Solution:**
```bash
# Clear cache
Remove-Item -Path ".next" -Recurse -Force

# Reinstall dependencies
Remove-Item -Path "node_modules" -Recurse -Force
npm install

# Rebuild
npm run build
```

---

## 📊 Test Data Setup

### Create Test Contest:

1. **Login as admin:** 
   - URL: http://localhost:3000/admin
   - Username: `admin`
   - Password: `admin123`

2. **Create contest:**
   - Title: "Test Solve Time Contest"
   - Start: Current time
   - End: 2 hours from now

3. **Add problem:**
   - Title: "Sum of Two Numbers"
   - Difficulty: Easy
   - Points: 10
   - **Test Case 1:**
     - Input: `5 3`
     - Output: `8`
   - **Test Case 2:**
     - Input: `10 20`
     - Output: `30`

4. **Sample solution (Python):**
```python
a, b = map(int, input().split())
print(a + b)
```

### Test Workflow:

1. **User A:** Join contest at 10:00:00
   - Select problem at 10:00:05
   - Start coding at 10:00:10
   - Submit at 10:02:30
   - **Solve Time: 2m 20s**

2. **User B:** Join contest at 10:00:00
   - Select problem at 10:00:05
   - Start coding at 10:00:15
   - Submit at 10:01:45
   - **Solve Time: 1m 30s**

3. **Leaderboard:**
   - Both have 10 points
   - User B ranks higher (faster solve time)

---

## 🚀 Production Deployment

### Pre-Deploy Checklist:

- [ ] Database migration applied in production database
- [ ] Environment variables configured
- [ ] JUDGE0_API_URL set correctly
- [ ] JUDGE0_API_KEY set correctly
- [ ] Build successful locally
- [ ] All tests passing

### Vercel Deployment:

```bash
# Push to GitHub
git add .
git commit -m "feat: Add solve time tracking and rebrand to Bash X Code"
git push origin main

# Vercel will auto-deploy
# Or manually trigger:
vercel --prod
```

### Post-Deploy Verification:

1. **Check Vercel logs** for build errors
2. **Open production URL**
3. **Test branding** visible
4. **Create test contest**
5. **Test solve time** functionality
6. **Check leaderboard** sorting

---

## 📖 Documentation Files

- `RECENT_UPDATES_SUMMARY.md` - Complete overview of all changes
- `SOLVE_TIME_TRACKING.md` - Detailed solve time implementation
- `add-coding-time-tracking.sql` - Database migration script
- `README.md` - Main project documentation

---

## 🎯 Success Criteria

### ✅ You're ready when:

1. Database migration applied successfully
2. Server starts without errors
3. Logo shows "Bash X Code" with styled X
4. Contest auto-enters full-screen
5. Solve time appears in leaderboard
6. Leaderboard sorts correctly by time
7. Problem switching resets state
8. No TypeScript/runtime errors

### ⚠️ If any fail:

1. Check troubleshooting section
2. Review error messages
3. Verify database connection
4. Clear all caches
5. Restart development server

---

## 💡 Pro Tips

1. **Keep migration script** - You'll need it for production
2. **Test with multiple users** - Create 2-3 test accounts
3. **Check admin leaderboard** - Shows more details
4. **Monitor tab switches** - Verify anti-cheat working
5. **Test problem switching** - Ensure state resets

---

## 🆘 Need Help?

### Check Logs:

**Browser Console:** F12 → Console tab
**Server Logs:** Terminal where `npm run dev` is running
**Supabase Logs:** Dashboard → Logs

### Common Errors:

- **"Cannot read property of undefined"** → Database migration not applied
- **"solve_time_seconds does not exist"** → Database migration failed
- **"coding_times table not found"** → Run migration script again
- **Leaderboard empty** → No submissions yet or database connection issue

---

## ✨ What's Next?

After successful setup:

1. **Create your first real contest**
2. **Invite users to test**
3. **Monitor leaderboard** for accuracy
4. **Collect feedback** from users
5. **Plan next features** (split-screen detection, etc.)

---

**Time Required:** ~5 minutes
**Difficulty:** Easy
**Prerequisites:** Database access, Node.js running

**Ready? Start with Step 1! 🚀**
