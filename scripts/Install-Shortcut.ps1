$ErrorActionPreference = 'Stop'
$launchRoot = Split-Path -Parent $PSScriptRoot
$shellObject = New-Object -ComObject WScript.Shell
$desktopFolder = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopFolder 'Leitner Box.lnk'
$shortcut = $shellObject.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $PSScriptRoot 'Start-Leitner.ps1') + '"'
$shortcut.WorkingDirectory = $launchRoot
$shortcut.IconLocation = (Join-Path $launchRoot 'public\assets\icon.ico') + ',0'
$shortcut.WindowStyle = 7
$shortcut.Description = 'Leitner Box - private local study app'
$shortcut.Save()
Write-Output $shortcutPath
