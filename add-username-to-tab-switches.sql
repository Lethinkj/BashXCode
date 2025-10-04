-- Migration to add user_name column to existing tab_switches table
-- Run this if you already have a tab_switches table without the user_name column

-- Step 1: Add user_name column (allow NULL initially)
ALTER TABLE tab_switches ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Step 2: Update existing records to use email as name if null
-- This ensures we have data for all existing records
UPDATE tab_switches 
SET user_name = user_email 
WHERE user_name IS NULL OR user_name = '';

-- Step 3: Make user_name NOT NULL now that all records have values
ALTER TABLE tab_switches 
ALTER COLUMN user_name SET NOT NULL;

-- Step 4: Add comment
COMMENT ON COLUMN tab_switches.user_name IS 'Full name of the user for display in admin monitoring';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tab_switches' 
ORDER BY ordinal_position;

-- Show sample data
SELECT id, user_name, user_email, switch_count 
FROM tab_switches 
LIMIT 5;
