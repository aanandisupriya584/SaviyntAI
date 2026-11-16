@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js 22.12 or newer before starting.
  pause
  exit /b 1
)
if not exist "server\node_modules\express" (
  call npm.cmd ci --prefix server
  if errorlevel 1 exit /b 1
)
if not exist "frontend\node_modules\vite" (
  call npm.cmd ci --prefix frontend
  if errorlevel 1 exit /b 1
)
call npm.cmd run build
if errorlevel 1 exit /b 1
echo Open http://localhost:3003 after the server starts.
call npm.cmd start
