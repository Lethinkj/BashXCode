-- Clan Contest Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contests table
CREATE TABLE IF NOT EXISTS contests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    problems JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    contest_id TEXT NOT NULL,
    problem_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    passed_test_cases INTEGER DEFAULT 0,
    total_test_cases INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    execution_time DECIMAL(10, 3),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contests_created ON contests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time);
CREATE INDEX IF NOT EXISTS idx_submissions_contest ON submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_name);
CREATE INDEX IF NOT EXISTS idx_submissions_contest_user ON submissions(contest_id, user_name);
CREATE INDEX IF NOT EXISTS idx_submissions_contest_problem ON submissions(contest_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Foreign key constraint (optional, for data integrity)
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS fk_submissions_contest;

ALTER TABLE submissions 
ADD CONSTRAINT fk_submissions_contest 
FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE;

-- Create a view for leaderboard (optimized queries)
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    contest_id,
    user_name,
    SUM(points) as total_points,
    COUNT(DISTINCT problem_id) as solved_problems,
    MAX(submitted_at) as last_submission_time
FROM submissions
WHERE status = 'accepted'
GROUP BY contest_id, user_name;

-- Comment on tables
COMMENT ON TABLE contests IS 'Stores contest information and problems';
COMMENT ON TABLE submissions IS 'Stores user code submissions and results';
COMMENT ON VIEW leaderboard_view IS 'Optimized view for leaderboard queries';
