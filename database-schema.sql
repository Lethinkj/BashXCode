-- Clan Contest Platform Database Schema (v2.0)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (NEW)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Contests table (UPDATED with contest code and status)
CREATE TABLE IF NOT EXISTS contests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    contest_code TEXT UNIQUE NOT NULL, -- NEW: Simple join code
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'upcoming', -- NEW: upcoming, active, ended
    problems JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contest Participants (NEW - tracks who joined which contest)
CREATE TABLE IF NOT EXISTS contest_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contest_id, user_id)
);

-- Submissions table (UPDATED - use user_id instead of user_name)
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    contest_id TEXT NOT NULL,
    problem_id TEXT NOT NULL,
    user_id UUID NOT NULL, -- CHANGED: from user_name to user_id
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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_contests_created ON contests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time);
CREATE INDEX IF NOT EXISTS idx_contests_code ON contests(contest_code);
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_participants_contest ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON contest_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest ON submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest_user ON submissions(contest_id, user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest_problem ON submissions(contest_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Foreign key constraints
ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS fk_submissions_contest;
ALTER TABLE submissions 
ADD CONSTRAINT fk_submissions_contest 
FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE;

ALTER TABLE submissions 
DROP CONSTRAINT IF EXISTS fk_submissions_user;
ALTER TABLE submissions 
ADD CONSTRAINT fk_submissions_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE contest_participants 
DROP CONSTRAINT IF EXISTS fk_participants_contest;
ALTER TABLE contest_participants 
ADD CONSTRAINT fk_participants_contest 
FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE;

ALTER TABLE contest_participants 
DROP CONSTRAINT IF EXISTS fk_participants_user;
ALTER TABLE contest_participants 
ADD CONSTRAINT fk_participants_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create a view for leaderboard (optimized queries with user info)
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    s.contest_id,
    s.user_id,
    u.email,
    u.full_name,
    SUM(s.points) as total_points,
    COUNT(DISTINCT s.problem_id) as solved_problems,
    MAX(s.submitted_at) as last_submission_time
FROM submissions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'accepted'
GROUP BY s.contest_id, s.user_id, u.email, u.full_name;

-- Function to generate contest code from title
CREATE OR REPLACE FUNCTION generate_contest_code(contest_title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INT := 0;
BEGIN
    -- Remove special characters and convert to uppercase
    base_code := UPPER(REGEXP_REPLACE(contest_title, '[^a-zA-Z0-9]', '', 'g'));
    
    -- Take first 6 characters, pad if needed
    base_code := SUBSTRING(base_code FROM 1 FOR 6);
    IF LENGTH(base_code) < 6 THEN
        base_code := RPAD(base_code, 6, '0');
    END IF;
    
    final_code := base_code;
    
    -- Check if code exists, add number if needed
    WHILE EXISTS (SELECT 1 FROM contests WHERE contest_code = final_code) LOOP
        counter := counter + 1;
        final_code := base_code || counter;
    END LOOP;
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Function to update contest status based on time
CREATE OR REPLACE FUNCTION update_contest_status()
RETURNS void AS $$
BEGIN
    -- Update to 'active' if start time has passed and end time hasn't
    UPDATE contests
    SET status = 'active'
    WHERE status = 'upcoming' 
    AND start_time <= NOW() 
    AND end_time > NOW();
    
    -- Update to 'ended' if end time has passed
    UPDATE contests
    SET status = 'ended'
    WHERE status IN ('upcoming', 'active')
    AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Comment on tables
COMMENT ON TABLE users IS 'Stores user accounts with email/password authentication';
COMMENT ON TABLE contests IS 'Stores contest information with timing and join codes';
COMMENT ON TABLE contest_participants IS 'Tracks which users have joined which contests';
COMMENT ON TABLE submissions IS 'Stores user code submissions and results';
COMMENT ON VIEW leaderboard_view IS 'Optimized view for leaderboard queries with user info';
