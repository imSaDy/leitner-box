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
echo You can move this window aside while the app starts.
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0scripts\Start-Leitner.ps1"
endlocal
