-- Create tab_switches table for monitoring user activity
CREATE TABLE IF NOT EXISTS tab_switches (
  id SERIAL PRIMARY KEY,
  contest_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  switch_count INTEGER DEFAULT 1,
  last_switch_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contest_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tab_switches_contest ON tab_switches(contest_id);
CREATE INDEX IF NOT EXISTS idx_tab_switches_user ON tab_switches(user_id);

-- Add comments
COMMENT ON TABLE tab_switches IS 'Tracks tab switching activity during contests for admin monitoring';
COMMENT ON COLUMN tab_switches.switch_count IS 'Total number of times user switched tabs during contest';
COMMENT ON COLUMN tab_switches.last_switch_time IS 'Timestamp of the most recent tab switch';
