-- Run this migration to update the database schema
-- This will add the missing columns and tables

-- First, check if contest_code column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contests' AND column_name='contest_code') THEN
        ALTER TABLE contests ADD COLUMN contest_code TEXT;
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contests' AND column_name='status') THEN
        ALTER TABLE contests ADD COLUMN status TEXT DEFAULT 'upcoming';
    END IF;
END $$;

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contests' AND column_name='created_by') THEN
        ALTER TABLE contests ADD COLUMN created_by TEXT DEFAULT 'admin';
    END IF;
END $$;

-- Generate contest codes for existing contests
UPDATE contests 
SET contest_code = UPPER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '', 'g'))
WHERE contest_code IS NULL;

-- Ensure contest codes are unique
DO $$
DECLARE
    contest_record RECORD;
    new_code TEXT;
    counter INT;
BEGIN
    FOR contest_record IN 
        SELECT id, title, contest_code 
        FROM contests 
        WHERE contest_code IS NOT NULL
        ORDER BY created_at
    LOOP
        new_code := SUBSTRING(UPPER(REGEXP_REPLACE(contest_record.title, '[^a-zA-Z0-9]', '', 'g')) FROM 1 FOR 6);
        IF LENGTH(new_code) < 6 THEN
            new_code := RPAD(new_code, 6, '0');
        END IF;
        
        counter := 0;
        WHILE EXISTS (SELECT 1 FROM contests WHERE contest_code = new_code AND id != contest_record.id) LOOP
            counter := counter + 1;
            new_code := SUBSTRING(UPPER(REGEXP_REPLACE(contest_record.title, '[^a-zA-Z0-9]', '', 'g')) FROM 1 FOR 6) || counter;
        END LOOP;
        
        UPDATE contests SET contest_code = new_code WHERE id = contest_record.id;
    END LOOP;
END $$;

-- Now make contest_code NOT NULL and UNIQUE
ALTER TABLE contests ALTER COLUMN contest_code SET NOT NULL;

-- Drop unique constraint if exists, then recreate
ALTER TABLE contests DROP CONSTRAINT IF EXISTS contests_contest_code_key;
ALTER TABLE contests ADD CONSTRAINT contests_contest_code_key UNIQUE (contest_code);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_contests_code ON contests(contest_code);
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);

-- Update contest status based on current time
UPDATE contests
SET status = CASE
    WHEN start_time > NOW() THEN 'upcoming'
    WHEN end_time < NOW() THEN 'ended'
    ELSE 'active'
END
WHERE status IS NULL OR status = 'upcoming';
