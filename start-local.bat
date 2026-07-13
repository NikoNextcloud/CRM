@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "LOCAL_NODE=C:\Users\User\Documents\IPTV\.runtime\node-v24.18.0-win-x64"
if exist "%LOCAL_NODE%\npm.cmd" (
  set "PATH=%LOCAL_NODE%;%PATH%"
  set "NPM_CMD=%LOCAL_NODE%\npm.cmd"
) else (
  set "NPM_CMD=npm"
)
echo.
echo Инсталиране на зависимостите за PrintPilot AI CRM...
call "%NPM_CMD%" install
echo.
echo Стартиране на PrintPilot AI CRM на http://localhost:3000
call "%NPM_CMD%" run dev
