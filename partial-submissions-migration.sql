-- Partial Submissions Feature Migration
-- This migration adds support for partial credit submissions

-- No schema changes needed - just behavioral updates:
-- 1. Submissions can now have 'partial' status
-- 2. Points calculation updated to award 50% for >=2 test cases
-- 3. Users can resubmit to upgrade from partial to full credit

-- Status values now include:
-- - 'accepted': All test cases passed (100% points)
-- - 'partial': >=2 test cases passed (50% points)
-- - 'wrong_answer': <2 test cases passed (0 points)
-- - 'compilation_error': Code doesn't compile (0 points)
-- - 'runtime_error': Code crashes during execution (0 points)
-- - 'time_limit': Code exceeds time limit (0 points)

-- Note: The submissions table already has all required columns:
-- - id, contest_id, problem_id, user_id
-- - code (stores full submitted code)
-- - language, status, passed_test_cases, total_test_cases
-- - points, submitted_at, execution_time, details

-- Feature behaviors:
-- 1. Partial Credit:
--    - If user passes >=2 test cases but not all, they get 50% points
--    - Status is set to 'partial'
--    - They can see which tests failed and resubmit

-- 2. Point Updates:
--    - If user previously had partial credit and now passes all tests
--    - New submission gets full points (100%)
--    - Leaderboard automatically updates with best submission

-- 3. Submission History:
--    - All submissions are saved with their code
--    - Users can view past submissions
--    - Users can load old code back into editor
--    - Users can see progression (partial → full)

-- 4. UI Features:
--    - "View Code" button on each submission
--    - Modal showing full code with syntax highlighting
--    - Copy code to clipboard
--    - Load code back into editor
--    - Clear status indicators (✓ Accepted, ◐ Partial, ✗ Failed)

-- Query to see partial submissions:
-- SELECT user_id, problem_id, status, passed_test_cases, total_test_cases, points, submitted_at
-- FROM submissions
-- WHERE status = 'partial'
-- ORDER BY submitted_at DESC;

-- Query to see user progression on a problem:
-- SELECT submitted_at, status, passed_test_cases, total_test_cases, points
-- FROM submissions
-- WHERE user_id = '<user_id>' AND problem_id = '<problem_id>'
-- ORDER BY submitted_at ASC;
