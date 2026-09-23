$ErrorActionPreference = 'Stop'
$launchRoot = Split-Path -Parent $PSScriptRoot
$shellObject = New-Object -ComObject WScript.Shell
$desktopFolder = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopFolder 'Leitner Box.lnk'
$shortcut = $shellObject.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\wscript.exe'
$shortcut.Arguments = '"' + (Join-Path $launchRoot 'Start Leitner.vbs') + '"'
$shortcut.WorkingDirectory = $launchRoot
$shortcut.IconLocation = (Join-Path $launchRoot 'public\assets\icon.ico') + ',0'
$shortcut.WindowStyle = 7
$shortcut.Description = 'Leitner Box - private local study app'
$shortcut.Save()
Write-Output $shortcutPath
