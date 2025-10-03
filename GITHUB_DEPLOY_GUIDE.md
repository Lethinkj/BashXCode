# 🚀 GitHub Push & Vercel Deploy - Complete Guide

## Step-by-Step Instructions

---

## Part 1: Push to GitHub

### Step 1.1: Open PowerShell in Your Project

```powershell
# Navigate to your project
cd D:\clan
```

### Step 1.2: Initialize Git (if needed)

```powershell
# Check if git is initialized
git status

# If you see "not a git repository", initialize it:
git init
```

### Step 1.3: Add Remote Repository

```powershell
# Add your GitHub repository as remote
git remote add origin https://github.com/Lethinkj/aura-contests.git

# Verify it was added
git remote -v
```

**Expected Output:**
```
origin  https://github.com/Lethinkj/aura-contests.git (fetch)
origin  https://github.com/Lethinkj/aura-contests.git (push)
```

### Step 1.4: Add All Files

```powershell
# Add all files to staging
git add .

# Check what will be committed
git status
```

### Step 1.5: Commit Your Code

```powershell
# Create a commit with a message
git commit -m "Complete contest platform: Judge0 API + PostgreSQL + 10 problems + All features"
```

### Step 1.6: Push to GitHub

```powershell
# Set main as default branch and push
git branch -M main
git push -u origin main
```

**If you get authentication error:**

You'll need to use a Personal Access Token (PAT):

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Give it `repo` permissions
4. Copy the token
5. When pushing, use:
   ```powershell
   git push -u origin main
   # Username: Lethinkj
   # Password: [paste your token]
   ```

**If repository already has files:**

```powershell
# Pull existing files first
git pull origin main --rebase

# Then push
git push -u origin main
```

---

## Part 2: Deploy to Vercel

### Step 2.1: Sign Up/Login to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### Step 2.2: Import Project

1. Click **"Add New..."** button (top right)
2. Select **"Project"**
3. Find **"Lethinkj/aura-contests"** in the list
4. Click **"Import"**

### Step 2.3: Configure Build Settings

Vercel should auto-detect these (no changes needed):

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 2.4: Add Environment Variables

**CRITICAL STEP** - Click "Environment Variables" dropdown:

#### Variable 1: DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres.aomjtfhjwsewrgubouma:aura%4012345@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```
✅ Check: Production
✅ Check: Preview  
✅ Check: Development

#### Variable 2: RAPIDAPI_KEY
```
Name: RAPIDAPI_KEY
Value: b96540280fmsh2b47fea933472eep1dd1afjsn1e64991d0c47
```
✅ Check: Production
✅ Check: Preview  
✅ Check: Development

#### Variable 3: RAPIDAPI_HOST
```
Name: RAPIDAPI_HOST
Value: judge0-ce.p.rapidapi.com
```
✅ Check: Production
✅ Check: Preview  
✅ Check: Development

### Step 2.5: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build
3. You'll see:
   - Building... ⏳
   - Running Build Command... 🔨
   - Collecting Page Data... 📄
   - Generating Static Pages... 📦
   - Finalizing... ✅
   - Success! 🎉

### Step 2.6: Get Your Live URL

After successful deployment, you'll see:
```
🎉 Congratulations! Your project is live at:
https://aura-contests.vercel.app
```

---

## Part 3: Test Your Deployment

### Test 1: Homepage
1. Visit: `https://aura-contests.vercel.app`
2. Should see the homepage with login
3. Enter a test name and browse contests

### Test 2: Admin Panel
1. Visit: `https://aura-contests.vercel.app/admin`
2. Create a new contest
3. Add 2-3 problems
4. Should save to database

### Test 3: Code Execution
1. Join a contest
2. Submit Python code:
   ```python
   a = int(input())
   b = int(input())
   print(a + b)
   ```
3. Should execute with Judge0 and show results

### Test 4: Database Persistence
1. Create a contest
2. Close browser
3. Reopen site
4. Contest should still be there

### Test 5: Leaderboard
1. Submit solutions as different users
2. Check leaderboard
3. Should show real-time rankings

---

## Troubleshooting

### Problem: Git push fails with authentication error

**Solution:**
```powershell
# Use GitHub CLI or Personal Access Token
# Generate token at: https://github.com/settings/tokens
# Use token as password when pushing
```

### Problem: Build fails on Vercel

**Check:**
1. Build logs in Vercel dashboard
2. Ensure all dependencies in package.json
3. Run `npm run build` locally to test

**Solution:**
```powershell
# Locally test build
npm run build

# If works locally, redeploy on Vercel
```

### Problem: "Database connection failed"

**Check:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure `DATABASE_URL` is exactly:
   ```
   postgresql://postgres.aomjtfhjwsewrgubouma:aura%4012345@aws-1-us-east-2.pooler.supabase.com:5432/postgres
   ```
3. Note: `@` must be `%40` in the password

**Solution:**
```powershell
# Verify in Vercel dashboard
# Redeploy after fixing
```

### Problem: "Judge0 API not configured"

**Check:**
1. Ensure `RAPIDAPI_KEY` is added in Vercel
2. Ensure `RAPIDAPI_HOST` is added in Vercel

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Add missing variables
3. Redeploy

---

## Future Updates

### To Update Your Deployed Site:

```powershell
# 1. Make changes to your code
# 2. Commit changes
git add .
git commit -m "Description of changes"

# 3. Push to GitHub
git push

# 4. Vercel automatically deploys! ✨
# No need to manually redeploy
```

---

## Commands Summary

```powershell
# Initial Setup
cd D:\clan
git init
git remote add origin https://github.com/Lethinkj/aura-contests.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main

# Future Updates
git add .
git commit -m "Update message"
git push

# Check Status
git status
git log --oneline

# View Remote
git remote -v
```

---

## Important Files Created

✅ `.gitignore` - Excludes node_modules, .env, .next, etc.
✅ `vercel.json` - Vercel configuration
✅ `DEPLOYMENT.md` - This guide
✅ All source code in `src/`
✅ Database schema in `database-schema.sql`
✅ Environment example in `.env.local.example`

---

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `RAPIDAPI_KEY` - Judge0 API key from RapidAPI
- [ ] `RAPIDAPI_HOST` - judge0-ce.p.rapidapi.com

These are in your `.env.local` locally but need to be added manually in Vercel dashboard.

---

## What Gets Deployed

✅ Next.js application (production build)
✅ All API routes for contests, submissions, execution
✅ Admin panel for contest management
✅ Contest interface with Monaco code editor
✅ Leaderboard with real-time updates
✅ Judge0 integration for code execution
✅ PostgreSQL database connection
✅ Responsive UI with Tailwind CSS

---

## Post-Deployment URLs

- **Live Site**: https://aura-contests.vercel.app
- **Admin**: https://aura-contests.vercel.app/admin
- **GitHub**: https://github.com/Lethinkj/aura-contests
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## Success Checklist

After following this guide, you should have:

- [x] Code pushed to GitHub
- [x] Project deployed on Vercel
- [x] Environment variables configured
- [x] Database connected and working
- [x] Judge0 API executing code
- [x] Live site accessible worldwide
- [x] Admin panel functional
- [x] Contests can be created and joined
- [x] Code submissions working
- [x] Leaderboard updating

---

## 🎉 You're Live!

Your competitive programming contest platform is now:
- ✅ Hosted on Vercel
- ✅ Code on GitHub
- ✅ Database on Supabase
- ✅ Code execution via Judge0
- ✅ Accessible worldwide
- ✅ Auto-deploys on git push

**Ready to host coding contests!** 🚀

Share your site: `https://aura-contests.vercel.app`
