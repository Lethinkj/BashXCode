# Quick Setup Guide - Copy-Paste Prevention & Username Tab Switch Monitoring

## What Was Added

### 🔒 Security Features
1. **Copy-Paste Prevention** - Users cannot copy/paste code in the editor
2. **Username Display** - Tab switch warnings show participant names
3. **Admin Presentation** - Live display of offenders during contests

---

## Setup Instructions

### Step 1: Database Migration

You need to update your Supabase database to add the `user_name` column.

#### Option A: Fresh Installation (No existing table)

Run this in Supabase SQL Editor:

```sql
-- Copy the contents of: tab-switches-migration.sql
-- This creates the table with all columns including user_name
```

#### Option B: Update Existing Table

Run this in Supabase SQL Editor:

```sql
-- Copy the contents of: add-username-to-tab-switches.sql
-- This adds user_name column to your existing table
```

### Step 2: Test the Features

#### Test Copy-Paste Prevention

1. Join a contest
2. Open the code editor
3. Try to copy code (Ctrl+C) - Should be blocked ❌
4. Try to paste code (Ctrl+V) - Should be blocked ❌
5. Try right-click menu - Should be disabled ❌
6. Type code normally - Should work ✅

#### Test Tab Switch Warning

1. Join a contest as a participant
2. Switch to another browser tab
3. Switch back - You should see a red warning with YOUR NAME
4. Warning should show: "[Your Name] - Switching tabs is being monitored"
5. Switch count should increment

#### Test Admin View

1. Login as admin (`/admin`)
2. Click "📊 Admin Leaderboard" for a contest
3. Look for "⚠️ Tab Switch Alerts" section
4. You should see **usernames** (not just emails) of people who switched tabs

#### Test Presentation Mode

1. In admin leaderboard, click "📊 Presentation Mode"
2. Browser enters fullscreen
3. Look for red banner at the top
4. Banner should show:
   - "⚠️ TAB SWITCH ALERTS"
   - Top 3 offenders with their **names**
   - Switch counts for each
5. Click "Exit Presentation" to leave

---

## How It Works

### For Participants

When you join a contest:
- ❌ Cannot copy code from editor
- ❌ Cannot paste code into editor
- ❌ Cannot use right-click menu
- ✅ Can type all code normally
- ⚠️ Tab switches show YOUR NAME in warning

### For Admins

Regular view:
- See all participants who switched tabs
- View their **full names** (not just emails)
- See how many times they switched
- See timestamp of last switch

Presentation mode (fullscreen):
- Large display for projector/screen
- Red banner at top shows top 3 offenders
- Updates every 3 seconds
- Shows names prominently
- Perfect for live monitoring during contest

---

## Files Changed

### Frontend
- `src/app/contest/[id]/page.tsx` - Editor and participant view
- `src/app/admin/contest/[id]/leaderboard/page.tsx` - Admin view

### Backend
- `src/app/api/log-tab-switch/route.ts` - Logs tab switches with names

### Database
- `tab-switches-migration.sql` - Create new table
- `add-username-to-tab-switches.sql` - Update existing table

### Documentation
- `COPY_PASTE_PREVENTION.md` - Complete documentation

---

## Common Issues

### "Username shows as email"

**Fix**: Run the database migration script `add-username-to-tab-switches.sql`

### "Copy-paste still works"

**Fix**: 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors

### "Presentation banner not showing"

**Fix**:
1. Make sure users have actually switched tabs
2. Enter presentation mode (fullscreen button)
3. Look at top-left of screen

---

## Next Steps

✅ **Done**:
- Copy-paste prevention implemented
- Tab switch monitoring with usernames
- Admin presentation mode with alerts
- All code committed and pushed to GitHub

📋 **To Do**:
1. Run database migration (choose Option A or B above)
2. Test all features (checklist above)
3. Deploy to production (Vercel auto-deploys)
4. Monitor during first live contest

---

## Support

If you encounter any issues:
1. Check browser console (F12) for errors
2. Verify database migration ran successfully
3. Check that users are logged in properly
4. Review `COPY_PASTE_PREVENTION.md` for detailed troubleshooting

---

**Deployment**: Automatic via GitHub → Vercel
**Status**: ✅ Committed & Pushed (Commit: 5f2a22f)
**Next**: Run database migration in Supabase
