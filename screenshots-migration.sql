-- Create screenshots table to track screenshot attempts during contests
CREATE TABLE IF NOT EXISTS screenshots (
  id BIGSERIAL PRIMARY KEY,
  contest_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_screenshots_contest_id ON screenshots(contest_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_user_id ON screenshots(user_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_timestamp ON screenshots(timestamp);

-- Add comment
COMMENT ON TABLE screenshots IS 'Tracks screenshot attempts by users during contests for monitoring purposes';
