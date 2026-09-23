@echo off
setlocal
title Install Leitner Box
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Install-Shortcut.ps1"
if errorlevel 1 (
  echo.
  echo Installation failed. Make sure Node.js 24.11 or later is installed.
  pause
  exit /b 1
)
echo.
echo Leitner Box shortcut was added to your Desktop.
echo The app is starting now.
start "" /b wscript.exe "%~dp0Start Leitner.vbs"
endlocal
