@echo off
REM Auto-Pull Server Script for Desktop PC (Windows)
REM This script continuously monitors GitHub and pulls updates
REM Run this on your desktop PC to keep the server up to date

set PROJECT_DIR=C:\path\to\your\project
set GITHUB_REPO=https://github.com/jrchicken9/rork-fit4duty.git
set BRANCH=main
set CHECK_INTERVAL=30

echo 🚀 Starting Auto-Pull Server Monitor...
echo 📁 Project Directory: %PROJECT_DIR%
echo 🔗 GitHub Repo: %GITHUB_REPO%
echo ⏱️  Check Interval: %CHECK_INTERVAL% seconds
echo.

cd /d "%PROJECT_DIR%" || (
    echo ❌ Error: Could not navigate to project directory
    pause
    exit /b 1
)

REM Function to check for updates
:check_for_updates
echo 🔍 Checking for updates... (%date% %time%)
git fetch origin %BRANCH%

REM Get current commit hashes
for /f "tokens=*" %%i in ('git rev-parse HEAD') do set LOCAL=%%i
for /f "tokens=*" %%i in ('git rev-parse origin/%BRANCH%') do set REMOTE=%%i

if not "%LOCAL%"=="%REMOTE%" (
    echo 🔄 Updates found! Pulling latest changes...
    
    REM Stash any local changes (if any)
    git stash
    
    REM Pull latest changes
    git pull origin %BRANCH%
    
    REM Install any new dependencies
    echo 📦 Installing dependencies...
    npm install
    
    REM Restart the Expo server
    echo 🔄 Restarting Expo server...
    taskkill /f /im node.exe 2>nul
    timeout /t 2 /nobreak >nul
    
    REM Start Expo server with tunnel
    echo 🚀 Starting Expo server with tunnel...
    start /b npx expo start --tunnel
    
    echo ✅ Server updated and restarted!
    echo 🌐 Your app is now live with latest changes
    echo.
) else (
    echo ✅ No updates found
)

REM Wait before next check
timeout /t %CHECK_INTERVAL% /nobreak >nul
goto check_for_updates
