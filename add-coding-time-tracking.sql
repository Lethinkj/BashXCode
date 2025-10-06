-- Add coding_times table to track when users start coding on each problem
CREATE TABLE IF NOT EXISTS coding_times (
  id SERIAL PRIMARY KEY,
  contest_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  problem_id VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contest_id, user_id, problem_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_coding_times_contest_user 
ON coding_times(contest_id, user_id);

-- Add solve time tracking to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS solve_time_seconds INTEGER DEFAULT NULL;

COMMENT ON TABLE coding_times IS 'Tracks when users start coding on each problem for solve time calculation';
COMMENT ON COLUMN submissions.solve_time_seconds IS 'Time taken to solve the problem in seconds (from start coding to successful submission)';
