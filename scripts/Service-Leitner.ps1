$ErrorActionPreference = 'Stop'
$launchRoot = Split-Path -Parent $PSScriptRoot
$dataFolder = if ($env:LEITNER_DATA_DIR) { $env:LEITNER_DATA_DIR } else { Join-Path $env:LOCALAPPDATA 'LeitnerBox\data' }
$nodeExecutable = (Get-Command node.exe -ErrorAction Stop).Source
$serverEntry = Join-Path $launchRoot 'src\server\index.js'
$logFolder = Join-Path $dataFolder 'logs'
New-Item -ItemType Directory -Path $logFolder -Force | Out-Null

# Task Scheduler owns this process. An unexpected server exit is restarted
# without requiring the browser window or the launcher to remain open.
$restartDelay = 2
while ($true) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
    $outputLog = Join-Path $logFolder "server-$stamp.log"
    $errorLog = Join-Path $logFolder "server-$stamp-error.log"
    $started = Get-Date
    try {
        $server = Start-Process -FilePath $nodeExecutable -ArgumentList @('--disable-warning=ExperimentalWarning', ('"' + $serverEntry + '"')) -WorkingDirectory $launchRoot -WindowStyle Hidden -RedirectStandardOutput $outputLog -RedirectStandardError $errorLog -PassThru
        $server.WaitForExit()
        Add-Content -LiteralPath $errorLog -Value "Service exited at $(Get-Date -Format o) with code $($server.ExitCode)."
    } catch {
        Add-Content -LiteralPath $errorLog -Value "Service start failed at $(Get-Date -Format o): $($_.Exception.Message)"
    }
    Get-ChildItem -LiteralPath $logFolder -File -Filter 'server-*.log' |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip 80 |
        Remove-Item -Force
    if (((Get-Date) - $started).TotalSeconds -ge 30) { $restartDelay = 2 }
    else { $restartDelay = [Math]::Min($restartDelay * 2, 60) }
    Start-Sleep -Seconds $restartDelay
}
