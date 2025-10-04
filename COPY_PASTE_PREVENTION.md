# Copy-Paste Prevention & Enhanced Tab Switch Monitoring

## Overview
This document details the security enhancements made to prevent code copying/pasting and improved tab switch monitoring with username display.

## Features Implemented

### 1. Copy-Paste Prevention

#### What It Does
- **Disables Copy (Ctrl+C / Cmd+C)**: Prevents copying code from the editor
- **Disables Cut (Ctrl+X / Cmd+X)**: Prevents cutting code from the editor
- **Disables Paste (Ctrl+V / Cmd+V)**: Prevents pasting code into the editor
- **Disables Context Menu**: Right-click menu is disabled in the editor
- **Disables Auto-Suggestions**: Code suggestions are turned off

#### Implementation Details

**File**: `src/app/contest/[id]/page.tsx`

```typescript
<Editor
  height="60%"
  language={language === 'cpp' ? 'cpp' : language}
  value={code}
  onChange={(value) => setCode(value || '')}
  theme="vs-dark"
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    // Disable copy-paste to prevent cheating
    contextmenu: false,
    quickSuggestions: false,
    wordBasedSuggestions: 'off',
  }}
  onMount={(editor) => {
    // Prevent copy, cut, and paste
    editor.onKeyDown((e) => {
      const isCopy = (e.ctrlKey || e.metaKey) && e.code === 'KeyC';
      const isCut = (e.ctrlKey || e.metaKey) && e.code === 'KeyX';
      const isPaste = (e.ctrlKey || e.metaKey) && e.code === 'KeyV';
      
      if (isCopy || isCut || isPaste) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }}
/>
```

#### Security Benefits
- **Prevents Cheating**: Users cannot copy code from external sources
- **Fair Competition**: All participants must write code manually
- **Contest Integrity**: Maintains the authenticity of submissions

---

### 2. Enhanced Tab Switch Monitoring with Username Display

#### What It Does
- **Participant View**: Shows participant's name when they switch tabs
- **Admin View**: Displays usernames prominently in tab switch alerts
- **Presentation Mode**: Shows top offenders with usernames in real-time banner

#### Implementation Details

##### A. Participant Warning (Contest Page)

**File**: `src/app/contest/[id]/page.tsx`

```typescript
// State for username
const [userName, setUserName] = useState('');

// Set username from AuthUser
const user = getAuthToken();
setUserName(user.fullName);

// Display warning with username
{showTabWarning && (
  <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-up">
    <div className="flex items-center gap-3">
      <span className="text-2xl">⚠️</span>
      <div>
        <p className="font-bold">Tab Switch Detected!</p>
        <p className="text-sm">{userName} - Switching tabs is being monitored</p>
        <p className="text-xs mt-1">Total switches: {tabSwitchCount}</p>
      </div>
    </div>
  </div>
)}
```

##### B. Database Schema Update

**File**: `tab-switches-migration.sql`

```sql
CREATE TABLE IF NOT EXISTS tab_switches (
  id SERIAL PRIMARY KEY,
  contest_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,  -- NEW FIELD
  switch_count INTEGER DEFAULT 1,
  last_switch_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contest_id, user_id)
);
```

##### C. API Update

**File**: `src/app/api/log-tab-switch/route.ts`

```typescript
const { contestId, userId, userEmail, userName, timestamp, switchCount } = body;

await sql`
  INSERT INTO tab_switches (contest_id, user_id, user_email, user_name, timestamp, switch_count)
  VALUES (${contestId}, ${userId}, ${userEmail}, ${userName || userEmail}, ${timestamp}, ${switchCount})
  ON CONFLICT (contest_id, user_id) 
  DO UPDATE SET 
    switch_count = ${switchCount},
    last_switch_time = ${timestamp},
    user_name = ${userName || userEmail}
`;
```

##### D. Admin Leaderboard - Regular View

**File**: `src/app/admin/contest/[id]/leaderboard/page.tsx`

```typescript
interface TabSwitchLog {
  userId: string;
  userEmail: string;
  userName: string;  // NEW FIELD
  switchCount: number;
  lastSwitchTime: string;
}

// Display in Tab Switch Alerts section
<div className="flex justify-between items-center bg-white p-3 rounded border border-red-300">
  <div>
    <span className="font-bold text-red-900 text-lg">{ts.userName}</span>
    <span className="text-sm text-gray-600 ml-2">({ts.userEmail})</span>
    <span className="text-sm text-gray-500 ml-3">
      Last switch: {formatTime(ts.lastSwitchTime)}
    </span>
  </div>
  <span className="text-red-600 font-bold text-lg">
    {ts.switchCount} switches
  </span>
</div>
```

##### E. Admin Leaderboard - Presentation Mode

Shows a prominent banner at the top with top 3 offenders:

```typescript
{presentationMode && tabSwitches.filter(ts => ts.switchCount > 0).length > 0 && (
  <div className="fixed top-4 left-4 right-24 z-40 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl border-4 border-red-600">
    <h3 className="text-2xl font-bold mb-2">⚠️ TAB SWITCH ALERTS</h3>
    <div className="space-y-2">
      {tabSwitches
        .filter(ts => ts.switchCount > 0)
        .sort((a, b) => b.switchCount - a.switchCount)
        .slice(0, 3)
        .map((ts) => (
          <div key={ts.userId} className="flex justify-between items-center bg-white/20 px-4 py-2 rounded">
            <span className="text-xl font-bold">{ts.userName}</span>
            <span className="text-xl font-bold">{ts.switchCount} switches</span>
          </div>
        ))}
    </div>
  </div>
)}
```

---

## User Experience

### For Participants

1. **Code Editor**:
   - Cannot copy code (Ctrl+C blocked)
   - Cannot paste code (Ctrl+V blocked)
   - Cannot use context menu
   - Must type all code manually

2. **Tab Switch Warning**:
   - Shows their name prominently
   - Displays current switch count
   - Auto-hides after 5 seconds
   - Persists across refreshes

### For Admins

1. **Regular View**:
   - See username with email in alerts
   - View last switch timestamp
   - Sort by switch count
   - All data persisted in database

2. **Presentation Mode**:
   - Fullscreen display
   - Top 3 offenders shown in red banner
   - Large text for easy viewing
   - Usernames prominently displayed
   - Real-time updates every 3 seconds

---

## Database Migration

### Required Migration

Run this SQL on your Supabase database:

```sql
-- Add user_name column to existing tab_switches table
ALTER TABLE tab_switches ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Update existing records to use email as name if null
UPDATE tab_switches SET user_name = user_email WHERE user_name IS NULL;

-- Make user_name NOT NULL
ALTER TABLE tab_switches ALTER COLUMN user_name SET NOT NULL;
```

### Fresh Installation

If creating the table from scratch, run:

```bash
# Execute the migration script
psql -f tab-switches-migration.sql
```

---

## Testing Checklist

### Copy-Paste Prevention

- [ ] Try copying code with Ctrl+C - should be blocked
- [ ] Try cutting code with Ctrl+X - should be blocked
- [ ] Try pasting code with Ctrl+V - should be blocked
- [ ] Try right-click context menu - should be disabled
- [ ] Verify typing still works normally

### Tab Switch with Username

#### Participant View
- [ ] Join a contest
- [ ] Switch to another tab
- [ ] Return to contest - see warning with your name
- [ ] Verify switch count increments
- [ ] Warning auto-hides after 5 seconds

#### Admin Regular View
- [ ] Login as admin
- [ ] View contest leaderboard
- [ ] Check "Tab Switch Alerts" section
- [ ] Verify usernames are displayed (not just emails)
- [ ] Verify switch counts are accurate
- [ ] Verify timestamp is correct

#### Admin Presentation Mode
- [ ] Enter presentation mode
- [ ] Verify fullscreen display
- [ ] Check red banner at top shows tab switchers
- [ ] Verify top 3 offenders are shown
- [ ] Verify usernames are prominently displayed
- [ ] Verify real-time updates (3s refresh)
- [ ] Exit presentation mode successfully

---

## Security Considerations

### Copy-Paste Prevention

**Limitations**:
- Browser dev tools can still access editor content
- Users could type from another screen
- Screen sharing could be used to copy code

**Best Used With**:
- Tab switch monitoring
- Video proctoring
- Time limits on submissions
- Multiple test cases to prevent simple copying

### Tab Switch Monitoring

**Privacy**:
- Only tracks tab switches, not content
- Usernames are from user's own registration
- Data stored securely in database
- Only visible to admins

**Transparency**:
- Users are warned they will be monitored
- Warning shows their name (so they know it's tracked)
- Real-time feedback on switch count
- Clear visibility during presentation

---

## Configuration

### Disable Copy-Paste Prevention

If you need to allow copying (e.g., for practice mode):

```typescript
// In src/app/contest/[id]/page.tsx
options={{
  minimap: { enabled: false },
  fontSize: 14,
  // contextmenu: false,  // Comment out these lines
  // quickSuggestions: false,
  // wordBasedSuggestions: 'off',
}}
// onMount={(editor) => { ... }}  // Comment out onMount handler
```

### Adjust Tab Switch Refresh Rate

```typescript
// Admin view: src/app/admin/contest/[id]/leaderboard/page.tsx
const interval = setInterval(fetchData, 3000); // Change 3000 to desired ms

// Participant view: src/app/contest/[id]/leaderboard/page.tsx
const interval = setInterval(fetchLeaderboard, 5000); // Change 5000 to desired ms
```

---

## Troubleshooting

### Copy-Paste Still Works

**Problem**: Users can still copy/paste code

**Solutions**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify Monaco Editor loaded correctly

### Username Shows as Email

**Problem**: Admin sees email instead of username

**Solutions**:
1. Run database migration to add `user_name` column
2. Verify `userName` is being sent from frontend
3. Check API logs for userName field
4. Update existing records with SQL UPDATE

### Presentation Banner Not Showing

**Problem**: Tab switch banner doesn't appear in presentation mode

**Solutions**:
1. Verify users have actually switched tabs
2. Check `tabSwitches` state is populated
3. Ensure filter `ts.switchCount > 0` is correct
4. Check z-index (should be 40)

---

## Future Enhancements

### Potential Additions

1. **Screenshot Detection**: Detect PrintScreen key
2. **Focus Loss Detection**: Track when window loses focus
3. **Mouse Leave Detection**: Track when mouse leaves window
4. **Keyboard Shortcuts**: Disable more shortcuts (Ctrl+A, Ctrl+Z, etc.)
5. **Code Similarity Analysis**: Compare submissions for plagiarism
6. **Live Streaming**: Stream participant screens to admin
7. **AI Monitoring**: Detect unusual typing patterns

### Feature Requests

If you need additional security features, consider:
- Integration with proctoring services
- Video/audio recording
- Lock down browser extension
- Idle time detection
- Network traffic monitoring

---

## Summary

### Key Benefits

✅ **Prevents Code Copying**: No copy/paste in editor
✅ **Enhanced Monitoring**: Shows who switched tabs
✅ **Better Transparency**: Participants see their name in warnings
✅ **Improved Admin View**: Usernames displayed prominently
✅ **Presentation Ready**: Real-time alerts during contests
✅ **Database Backed**: All data persisted and queryable

### Files Modified

1. `src/app/contest/[id]/page.tsx` - Copy prevention & username warning
2. `src/app/api/log-tab-switch/route.ts` - Store userName in DB
3. `src/app/admin/contest/[id]/leaderboard/page.tsx` - Display usernames
4. `tab-switches-migration.sql` - Add user_name column

### Next Steps

1. Run database migration
2. Test copy-paste prevention
3. Test tab switch monitoring
4. Enter presentation mode and verify banner
5. Deploy to production

---

**Last Updated**: October 5, 2025
**Version**: 2.0
**Status**: Production Ready ✅
