@echo off
echo ================================================
echo Fixing Next.js Permissions Issue
echo ================================================
echo.

echo Step 1: Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Removing .next folder...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    if exist ".next" (
        echo WARNING: Could not delete .next folder completely
        echo Please close VS Code and run this script again
        pause
        exit /b 1
    )
)

echo Step 3: Starting development server...
echo.
npm run dev
