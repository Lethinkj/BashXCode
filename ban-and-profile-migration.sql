-- Ban User and Profile Management Migration

-- Add ban columns to contest_participants table
ALTER TABLE contest_participants ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE contest_participants ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE contest_participants ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contest_participants ADD COLUMN IF NOT EXISTS banned_by TEXT;

-- Add password change requirement flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- Create index for faster ban queries
CREATE INDEX IF NOT EXISTS idx_contest_participants_banned ON contest_participants(contest_id, is_banned);

-- Comments
COMMENT ON COLUMN contest_participants.is_banned IS 'Whether user is banned from this specific contest';
COMMENT ON COLUMN contest_participants.ban_reason IS 'Reason provided by admin for the ban';
COMMENT ON COLUMN contest_participants.banned_at IS 'Timestamp when user was banned';
COMMENT ON COLUMN contest_participants.banned_by IS 'Admin ID who banned the user';
COMMENT ON COLUMN users.must_change_password IS 'Forces user to change password on next login (for password resets)';
