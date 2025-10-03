# Deployment Guide - Vercel & GitHub

## 🚀 Quick Start

**GitHub Repository**: https://github.com/Lethinkj/aura-contests.git

---

## Step 1: Push to GitHub

### First Time Setup:

```powershell
# Navigate to project directory
cd D:\clan

# Initialize git (if not already done)
git init

# Add the remote repository
git remote add origin https://github.com/Lethinkj/aura-contests.git

# Add all files
git add .

# Commit
git commit -m "Complete contest platform with Judge0 and PostgreSQL"

# Push to main branch
git branch -M main
git push -u origin main
```

**Note**: If you already have files on GitHub, you may need to pull first:
```powershell
git pull origin main --rebase
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Visit**: https://vercel.com

2. **Sign in** with your GitHub account

3. **Import Project**:
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose `Lethinkj/aura-contests`
   - Click "Import"

4. **Configure Project**:
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Add Environment Variables**:

   Click "Environment Variables" and add these THREE variables:

   **Variable 1:**
   ```
   Name: DATABASE_URL
   Value: postgresql://postgres.aomjtfhjwsewrgubouma:aura%4012345@aws-1-us-east-2.pooler.supabase.com:5432/postgres
   ```

   **Variable 2:**
   ```
   Name: RAPIDAPI_KEY
   Value: b96540280fmsh2b47fea933472eep1dd1afjsn1e64991d0c47
   ```

   **Variable 3:**
   ```
   Name: RAPIDAPI_HOST
   Value: judge0-ce.p.rapidapi.com
   ```

   ⚠️ **Important**: Add to ALL environments (Production, Preview, Development)

6. **Deploy**: Click "Deploy" and wait 2-3 minutes

---

### Option B: Via Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL production
# Paste: postgresql://postgres.aomjtfhjwsewrgubouma:aura%4012345@aws-1-us-east-2.pooler.supabase.com:5432/postgres

vercel env add RAPIDAPI_KEY production
# Paste: b96540280fmsh2b47fea933472eep1dd1afjsn1e64991d0c47

vercel env add RAPIDAPI_HOST production
# Paste: judge0-ce.p.rapidapi.com

# Deploy to production
vercel --prod
```

---

## Step 3: Verify Deployment

### Test Your Live Site:

1. **Homepage**: `https://aura-contests.vercel.app`
   - Enter name and browse contests

2. **Admin Panel**: `https://aura-contests.vercel.app/admin`
   - Create a test contest
   - Add 2-3 problems with test cases

3. **Contest**: Join and test
   - Submit code in different languages
   - Verify Judge0 executes code
   - Check leaderboard updates

4. **Database**: Refresh page
   - Data should persist (not reset)
   - Submissions should be saved

---

## Environment Variables Reference

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.aomjtfhjwsewrgubouma:aura%4012345@aws-1-us-east-2.pooler.supabase.com:5432/postgres` |
| `RAPIDAPI_KEY` | `b96540280fmsh2b47fea933472eep1dd1afjsn1e64991d0c47` |
| `RAPIDAPI_HOST` | `judge0-ce.p.rapidapi.com` |

---

## Post-Deployment

### Your Live URLs:

- **Production Site**: `https://aura-contests.vercel.app`
- **Admin Panel**: `https://aura-contests.vercel.app/admin`
- **GitHub Repo**: https://github.com/Lethinkj/aura-contests
- **Vercel Dashboard**: https://vercel.com/dashboard

### Features Live:
- ✅ Real code execution (Judge0 API)
- ✅ PostgreSQL database (Supabase)
- ✅ Up to 10 problems per contest
- ✅ 5 programming languages
- ✅ Real-time leaderboard
- ✅ Hidden test cases
- ✅ All-or-nothing scoring
3. **Authentication**: Simple name-based system. Add proper auth for production.

## Recommended Next Steps:

1. **Add Database**:
   - Use Vercel Postgres, MongoDB, or Supabase
   - Update `src/lib/storage.ts` with database queries

2. **Integrate Code Execution**:
   - Sign up for Judge0 or Piston API
   - Add API keys to Vercel environment variables
   - Update `src/lib/codeExecution.ts`

3. **Add Authentication**:
   - Implement NextAuth.js
   - Add login/signup pages
   - Protect admin routes

## Testing Deployment

1. Visit your deployed URL
2. Create a contest in the admin panel (`/admin`)
3. Copy contest URL
4. Open in incognito mode
5. Join contest and test problem solving
6. Check leaderboard

## Troubleshooting

- **Build Errors**: Check build logs in Vercel dashboard
- **API Issues**: Verify API routes are deployed correctly
- **Styling Issues**: Ensure Tailwind CSS is configured properly

## Support

For issues or questions:
- Check the README.md
- Review Next.js documentation
- Check Vercel deployment logs
