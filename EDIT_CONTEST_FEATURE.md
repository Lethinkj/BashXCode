# Edit Contest Feature

## Overview
Admin and super admin users can now edit existing contests after creation. This includes modifying contest details, problems, test cases, and timing.

## Features Implemented

### 1. Datetime Picker Fix
**Problem**: The datetime-local input was displaying incorrect times because of timezone and format mismatches.

**Solution**: Created helper functions to properly convert between ISO format (database) and datetime-local format (input field).

```typescript
// Converts ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
const formatDateTimeForInput = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Converts datetime-local format to ISO string for database
const convertLocalToISO = (localDateTime: string): string => {
  const date = new Date(localDateTime);
  return date.toISOString();
};
```

### 2. Edit Contest UI

#### Added Edit Mode State
- `editingContestId`: Tracks which contest is being edited (null for create mode)
- Form heading changes between "Create Contest" and "Edit Contest"
- Submit button changes between "Create Contest" and "Update Contest"
- Cancel button shows "Cancel Edit" when editing

#### Edit Button on Contest Cards
Each existing contest now has an "Edit Contest" button (✏️) that:
- Loads contest data into the form
- Converts datetime to proper format for inputs
- Scrolls to top for easy editing
- Switches form to edit mode

#### Dual-Mode Form Handler
`handleCreateContest()` now supports both create and update:
- **Create Mode**: POST to `/api/contests`
- **Edit Mode**: PUT to `/api/contests/[id]`
- Validates times (end must be after start)
- Converts datetime-local to ISO before sending

### 3. Backend API

#### PUT Endpoint
Location: `src/app/api/contests/[id]/route.ts`

Validates:
- Problems array exists and has at least one problem
- Each problem has: title, description, points, test cases
- End time is after start time

Updates contest using `contestStorage.update(id, data)`

#### Database Update
Location: `src/lib/storage.ts`

The `contestStorage.update()` method:
- Fetches existing contest
- Merges with update data
- Updates database (including problems JSONB)
- Returns updated contest

## Usage

### For Admins:

1. **Navigate to Admin Dashboard**
   - Login at `/admin`
   - View all existing contests

2. **Edit a Contest**
   - Click "✏️ Edit Contest" button on any contest card
   - Form populates with current contest data
   - Modify any fields:
     - Title
     - Description
     - Start/End times (datetime picker now works correctly!)
     - Problems (title, description, points)
     - Test cases (input, expected output)
   - Click "Update Contest" to save changes
   - Click "Cancel" to discard changes

3. **Datetime Picker**
   - Times now display correctly in your local timezone
   - Selecting a time no longer jumps to default values
   - End time validation ensures it's after start time

## Technical Details

### Time Handling
- **Database Format**: ISO 8601 string with timezone (e.g., "2024-01-15T10:00:00.000Z")
- **Input Format**: datetime-local format (e.g., "2024-01-15T10:00")
- **Display Format**: Localized string (e.g., "1/15/2024, 10:00:00 AM")

### State Management
```typescript
const [editingContestId, setEditingContestId] = useState<string | null>(null);

// Load contest for editing
const handleEditContest = (contest: Contest) => {
  setEditingContestId(contest.id);
  setFormData({
    title: contest.title,
    description: contest.description,
    startTime: formatDateTimeForInput(contest.startTime),
    endTime: formatDateTimeForInput(contest.endTime),
  });
  setProblems(contest.problems);
  setShowForm(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cancel editing
const handleCancelEdit = () => {
  setEditingContestId(null);
  setShowForm(false);
  // Reset form data...
};
```

### API Call
```typescript
const url = editingContestId 
  ? `/api/contests/${editingContestId}` 
  : '/api/contests';
const method = editingContestId ? 'PUT' : 'POST';

const response = await fetch(url, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(contestData),
});
```

## Testing Checklist

- [x] Datetime picker displays correct local times
- [x] Datetime picker saves times correctly
- [x] Edit button loads contest data into form
- [x] Form heading shows "Edit Contest" when editing
- [x] Submit button shows "Update Contest" when editing
- [x] Time validation (end > start) works
- [x] PUT endpoint validates data properly
- [x] Database updates correctly
- [ ] Test across different timezones (recommended)
- [ ] Test editing contests with multiple problems
- [ ] Test canceling edit mode
- [ ] Test creating new contest after editing

## Files Modified

1. **src/app/admin/page.tsx**
   - Added datetime conversion helpers
   - Added edit state management
   - Added handleEditContest() and handleCancelEdit()
   - Updated handleCreateContest() for dual mode
   - Updated UI elements (heading, buttons)
   - Added Edit button to contest cards

2. **src/app/api/contests/[id]/route.ts**
   - Enhanced PUT endpoint with validation
   - Added time validation
   - Added problems/test cases validation
   - Improved error handling

3. **src/lib/storage.ts**
   - No changes needed (update method already existed)

## Future Enhancements

- [ ] Add confirmation dialog when editing ("You have unsaved changes")
- [ ] Add undo/redo functionality
- [ ] Add contest deletion with confirmation
- [ ] Add bulk edit for multiple contests
- [ ] Add version history/audit log
- [ ] Add scheduled updates
- [ ] Add draft mode for contests
