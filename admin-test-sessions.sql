-- Admin Test Sessions Tracking (Optional)
-- This table tracks when admins test contests for analytics purposes

CREATE TABLE IF NOT EXISTS admin_test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email VARCHAR(255) NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  contest_id TEXT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  contest_title TEXT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  total_submissions INTEGER DEFAULT 0,
  problems_attempted INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_test_sessions_admin ON admin_test_sessions(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_test_sessions_contest ON admin_test_sessions(contest_id);
CREATE INDEX IF NOT EXISTS idx_admin_test_sessions_started ON admin_test_sessions(started_at DESC);

-- Comments
COMMENT ON TABLE admin_test_sessions IS 'Tracks admin test sessions for analytics and quality assurance';
COMMENT ON COLUMN admin_test_sessions.admin_email IS 'Email of the admin who tested the contest';
COMMENT ON COLUMN admin_test_sessions.contest_id IS 'ID of the contest being tested';
COMMENT ON COLUMN admin_test_sessions.started_at IS 'When the admin started testing';
COMMENT ON COLUMN admin_test_sessions.ended_at IS 'When the admin finished testing (if tracked)';
COMMENT ON COLUMN admin_test_sessions.total_submissions IS 'Number of submissions made during test';
COMMENT ON COLUMN admin_test_sessions.problems_attempted IS 'Number of unique problems attempted';
COMMENT ON COLUMN admin_test_sessions.notes IS 'Optional notes about the test session';

-- Example queries:

-- Get all test sessions for a contest
-- SELECT * FROM admin_test_sessions WHERE contest_id = 'your-contest-id' ORDER BY started_at DESC;

-- Get all test sessions by an admin
-- SELECT * FROM admin_test_sessions WHERE admin_email = 'admin@example.com' ORDER BY started_at DESC;

-- Get recent test sessions (last 7 days)
-- SELECT * FROM admin_test_sessions WHERE started_at >= NOW() - INTERVAL '7 days' ORDER BY started_at DESC;

-- NOTE: This table is OPTIONAL. The admin test mode works without it.
-- It's only for tracking/analytics purposes.
