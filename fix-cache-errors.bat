@echo off
echo ============================================
echo   CLEARING VS CODE CACHE
echo ============================================
echo.

REM Kill all Node processes (TypeScript server)
echo [1/4] Stopping TypeScript server...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

REM Verify files are deleted
echo [2/4] Verifying deleted files...
if exist "src\app\api\log-screenshot" (
    echo    Deleting log-screenshot...
    rmdir /S /Q "src\app\api\log-screenshot"
)
if exist "src\app\api\screenshots" (
    echo    Deleting screenshots...
    rmdir /S /Q "src\app\api\screenshots"
)

REM Clear TypeScript cache
echo [3/4] Clearing TypeScript cache...
if exist ".next" rmdir /S /Q ".next"
if exist "tsconfig.tsbuildinfo" del /F /Q "tsconfig.tsbuildinfo"

REM Instructions
echo [4/4] Final steps...
echo.
echo ============================================
echo   ALMOST DONE!
echo ============================================
echo.
echo Please follow these steps IN ORDER:
echo.
echo 1. CLOSE THIS TERMINAL
echo.
echo 2. In VS Code, press: Ctrl+Shift+P
echo.
echo 3. Type: "Developer: Reload Window"
echo.
echo 4. Press: Enter
echo.
echo The errors will disappear! ✓
echo.
echo ============================================
pause
