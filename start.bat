@echo off
title Saviynt AI Onboarder
echo.
echo  ============================================
echo   Saviynt AI Onboarder - Starting...
echo  ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo  ERROR: Node.js is not installed.
  echo.
  echo  Please download and install Node.js 18+ from:
  echo    https://nodejs.org
  echo.
  echo  After installing Node.js, run this file again.
  echo.
  pause
  exit /b 1
)

REM Move to the folder where start.bat lives
cd /d "%~dp0"

REM Install server dependencies if not already done
if not exist "server\node_modules" (
  echo  Installing server dependencies...
  npm install --prefix server
  if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERROR: Failed to install dependencies.
    echo  Check your internet connection and try again.
    echo.
    pause
    exit /b 1
  )
  echo  Dependencies installed.
  echo.
)

REM Ensure data and logs folders exist
if not exist "data\" mkdir data
if not exist "documents\" mkdir documents
if not exist "logs\" mkdir logs

REM Open browser after short delay (runs in background)
echo  Opening browser at http://localhost:3000...
start /b cmd /c "timeout /t 2 >nul && start http://localhost:3000"

REM Start the server (blocks until closed)
echo  Server starting...
echo  (Close this window to stop the server)
echo.
node server\server.cjs

echo.
echo  Server stopped.
pause
