@echo off
echo ================================================
echo Bash X Code - Fix Solve Time Issue
echo ================================================
echo.
echo This will help you fix the "N/A" solve time issue
echo.
echo STEP 1: Apply Database Migration
echo ================================================
echo.
echo 1. Open this link in your browser:
echo    https://supabase.com/dashboard
echo.
echo 2. Select your project
echo.
echo 3. Click "SQL Editor" (left sidebar)
echo.
echo 4. Click "New Query"
echo.
echo 5. Copy the content from: add-coding-time-tracking.sql
echo.
echo 6. Paste into SQL Editor and click "Run"
echo.
pause
echo.
echo STEP 2: Clear Cache and Rebuild
echo ================================================
echo.
echo Clearing Next.js cache...
if exist .next (
    rmdir /s /q .next
    echo ✓ Cache cleared
) else (
    echo ℹ No cache to clear
)
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Building project...
call npm run build
echo.
echo ================================================
echo STEP 3: Start Development Server
echo ================================================
echo.
echo Starting server...
echo.
call npm run dev
