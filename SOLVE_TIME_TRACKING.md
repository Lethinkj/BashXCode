# Solve Time Tracking Implementation

## Overview

Implemented a comprehensive solve time tracking system that calculates the time taken to solve each problem from when a user starts coding until they submit a successful solution. The leaderboard now ranks participants by:
1. Total points (higher is better)
2. Number of problems solved (more is better)
3. **Total solve time (lower is better)** ⭐ NEW
4. First submission time (earlier is better)

## Features Implemented

### 1. **Coding Start Time Detection** ⏱️

**Trigger:** When user modifies the template code
- Detects when user starts typing code (not just template)
- Logs timestamp to `coding_times` table
- One timestamp per user/problem/contest combination

**Implementation:** `src/app/contest/[id]/page.tsx`
```tsx
useEffect(() => {
  if (code && !codingStartTime && code !== getLanguageTemplate(language)) {
    setCodingStartTime(new Date().toISOString());
    fetch('/api/log-coding-start', {
      body: JSON.stringify({ 
        contestId, 
        userId, 
        problemId, 
        startTime: new Date().toISOString() 
      })
    });
  }
}, [code, codingStartTime]);
```

### 2. **API Endpoint for Coding Start** 📡

**File:** `src/app/api/log-coding-start/route.ts`

**Request:**
```json
{
  "contestId": "string",
  "userId": "string", 
  "problemId": "string",
  "startTime": "2024-01-01T12:00:00.000Z"
}
```

**Logic:**
- UPSERT query (insert or update if exists)
- Unique constraint prevents duplicates
- Returns success/error response

### 3. **Solve Time Calculation** 🧮

**Location:** `src/app/api/submissions/route.ts`

**When:** After all test cases pass (`allPassed === true`)

**Calculation:**
```typescript
const codingTimeResult = await sql`
  SELECT start_time FROM coding_times 
  WHERE contest_id = ${contestId} 
    AND user_id = ${userId} 
    AND problem_id = ${problemId}
`;

if (codingTimeResult.length > 0) {
  const startTime = new Date(codingTimeResult[0].start_time);
  const endTime = new Date();
  solveTimeSeconds = Math.floor((endTime - startTime) / 1000);
}
```

**Stored:** In `submissions.solve_time_seconds` column

### 4. **Database Schema** 🗄️

**New Table:** `coding_times`
```sql
CREATE TABLE coding_times (
  contest_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  problem_id VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  UNIQUE(contest_id, user_id, problem_id)
);

CREATE INDEX idx_coding_times_lookup 
ON coding_times(contest_id, user_id);
```

**Updated Table:** `submissions`
```sql
ALTER TABLE submissions 
ADD COLUMN solve_time_seconds INTEGER;
```

### 5. **Leaderboard Enhancement** 🏆

**Updated Query:** `src/lib/storage.ts`

**Key Changes:**
- Selects `solve_time_seconds` from submissions
- Calculates `SUM(solve_time_seconds)` as `total_solve_time`
- Sorts by total solve time (ascending = faster is better)

**Sorting Logic:**
```sql
ORDER BY 
  is_banned ASC,              -- Banned users last
  total_points DESC,          -- Higher points first
  solved_problems DESC,       -- More problems solved first
  total_solve_time ASC,       -- Faster solve time first ⭐ NEW
  first_submission_time ASC   -- Earlier submissions first
```

### 6. **UI Display** 🎨

**Participant Leaderboard:** `src/app/contest/[id]/leaderboard/page.tsx`
- New "Solve Time" column
- Format: `1h 23m 45s` or `23m 45s` or `45s`
- Blue color to highlight

**Admin Leaderboard:** `src/app/admin/contest/[id]/leaderboard/page.tsx`
- Same formatting
- Responsive display (hidden on small screens)

**Time Formatter:**
```typescript
const formatSolveTime = (seconds: number) => {
  if (!seconds) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  else if (minutes > 0) return `${minutes}m ${secs}s`;
  else return `${secs}s`;
};
```

### 7. **Problem Switching Reset** 🔄

**Issue:** When switching problems, old state persisted
**Solution:** Clear all state when user switches problems

```tsx
onClick={() => {
  setSelectedProblem(problem);
  setCode(getLanguageTemplate(language));
  setCodingStartTime(null);  // Reset coding start time
  setTestInput('');
  setTestOutput('');
  setAllTestsPassed(false);
  fetchSubmissions();
}}
```

## Type Definitions

**Submission Interface:**
```typescript
export interface Submission {
  // ... existing fields
  solveTimeSeconds?: number;  // Time in seconds to solve
}
```

**LeaderboardEntry Interface:**
```typescript
export interface LeaderboardEntry {
  // ... existing fields
  totalSolveTime?: number;  // Sum of all solve times in seconds
}
```

## Migration Steps

### Step 1: Apply Database Migration

Run this SQL in your Supabase dashboard:

```sql
-- Create coding_times table
CREATE TABLE IF NOT EXISTS coding_times (
  contest_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  problem_id VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  UNIQUE(contest_id, user_id, problem_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coding_times_lookup 
ON coding_times(contest_id, user_id);

-- Add solve_time_seconds to submissions
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS solve_time_seconds INTEGER;

-- Add index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_submissions_solve_time 
ON submissions(contest_id, user_id, solve_time_seconds);
```

### Step 2: Clear Cache

```bash
# Windows
.\fix-cache-errors.bat

# Or manually
Remove-Item -Path ".next" -Recurse -Force
npm run build
```

### Step 3: Test Workflow

1. **Join Contest** → Enter contest page
2. **Select Problem** → Click on a problem
3. **Start Coding** → Modify template code (timer starts)
4. **Submit Solution** → Submit working code
5. **Check Result** → Verify "Solve Time: Xm Ys" appears
6. **View Leaderboard** → See solve time column and ranking

## Example Scenario

### Contest: "Algorithm Challenge"

**Problem 1: Two Sum (Easy) - 10 points**

| User | Start Time | Submit Time | Result | Solve Time |
|------|-----------|------------|--------|------------|
| Alice | 10:00:00 | 10:05:30 | ✅ Pass | 5m 30s |
| Bob | 10:00:00 | 10:08:45 | ✅ Pass | 8m 45s |

**Problem 2: Binary Search (Medium) - 20 points**

| User | Start Time | Submit Time | Result | Solve Time |
|------|-----------|------------|--------|------------|
| Alice | 10:06:00 | 10:15:00 | ✅ Pass | 9m 0s |
| Bob | 10:09:00 | 10:12:30 | ✅ Pass | 3m 30s |

**Final Leaderboard:**

| Rank | Participant | Points | Problems | Total Solve Time |
|------|------------|--------|----------|------------------|
| 🥇 1 | Bob | 30 | 2/2 | **12m 15s** ⭐ |
| 🥈 2 | Alice | 30 | 2/2 | 14m 30s |

**Why Bob wins:**
- Same points (30)
- Same problems solved (2)
- **Faster total solve time (12m 15s vs 14m 30s)** ⭐

## Benefits

✅ **Fair Ranking:** Speed matters for tie-breaking
✅ **Accurate Tracking:** Starts when actual coding begins
✅ **Real-time Updates:** Leaderboard reflects solve times immediately
✅ **Problem-Level Granularity:** Track time per problem
✅ **Prevents Gaming:** Can't pre-write code (timer starts on first edit)

## Anti-Cheating Integration

Combined with existing features:
- ✅ Tab switch detection
- ✅ Full-screen exit tracking
- ✅ Problem state reset
- ✅ **Solve time tracking** ⭐ NEW

## Files Modified

### Core Logic:
1. `src/app/contest/[id]/page.tsx` - Start time detection & reset
2. `src/app/api/log-coding-start/route.ts` - NEW - API endpoint
3. `src/app/api/submissions/route.ts` - Solve time calculation
4. `src/lib/storage.ts` - Storage layer update & leaderboard query

### Type Definitions:
5. `src/types/index.ts` - Updated interfaces

### UI Components:
6. `src/app/contest/[id]/leaderboard/page.tsx` - Display solve time
7. `src/app/admin/contest/[id]/leaderboard/page.tsx` - Admin display

### Database:
8. `add-coding-time-tracking.sql` - NEW - Migration file

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] User enters contest and sees problems
- [ ] Coding start time logged when user types
- [ ] Problem switching resets coding timer
- [ ] Successful submission calculates solve time
- [ ] Leaderboard shows solve time column
- [ ] Leaderboard sorts by solve time for ties
- [ ] Admin leaderboard displays solve time
- [ ] Time formatting is human-readable
- [ ] Multiple problems calculate total correctly

## Troubleshooting

### Solve Time Not Showing
1. Check if `coding_times` table exists
2. Verify `solve_time_seconds` column exists
3. Clear `.next` cache and rebuild
4. Check browser console for API errors

### Incorrect Time Calculation
1. Verify user modified template code (not just viewing)
2. Check `coding_times` table has entry
3. Ensure successful submission (all test cases passed)
4. Check timezone issues in timestamps

### Leaderboard Not Sorting Correctly
1. Verify `total_solve_time` in SQL query
2. Check ORDER BY clause includes solve time
3. Ensure banned users appear last
4. Test with multiple users at same points

## Future Enhancements

- [ ] Show per-problem solve time in submission history
- [ ] Display solve time on contest page after submission
- [ ] Add solve time statistics (average, fastest, slowest)
- [ ] Highlight users who solved problems fastest
- [ ] Export solve time data to CSV
- [ ] Add solve time charts/graphs

## Summary

✅ **Coding start time tracking** - Logged when user modifies template
✅ **Solve time calculation** - Computed on successful submission
✅ **Leaderboard sorting** - Considers solve time for ranking
✅ **UI display** - Shows formatted time in both leaderboards
✅ **Problem state reset** - Clears timer when switching problems
✅ **Database migration** - Ready to apply

**Result:** Complete time-based leaderboard system that accurately tracks and ranks participants by solve speed! 🏆⚡
