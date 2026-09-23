$ErrorActionPreference = 'Stop'
$launchRoot = Split-Path -Parent $PSScriptRoot
$dataFolder = if ($env:LEITNER_DATA_DIR) { $env:LEITNER_DATA_DIR } else { Join-Path $env:LOCALAPPDATA 'LeitnerBox\data' }
$nodeExecutable = (Get-Command node.exe -ErrorAction Stop).Source
$serverEntry = Join-Path $launchRoot 'src\server\index.js'
$portNumber = if ($env:LEITNER_PORT) { [int]$env:LEITNER_PORT } else { 8765 }
$appAddress = "http://127.0.0.1:$portNumber"
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
        $server = $null
        $listener = Get-NetTCPConnection -LocalPort $portNumber -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($listener) {
            $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction SilentlyContinue
            if ($owner.Name -eq 'node.exe' -and
                ([string]$owner.CommandLine).IndexOf($serverEntry, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $server = Get-Process -Id $owner.ProcessId -ErrorAction Stop
                Add-Content -LiteralPath $errorLog -Value "Monitoring existing service process $($server.Id)."
            } else {
                Add-Content -LiteralPath $errorLog -Value "Port $portNumber is in use by another application."
                Start-Sleep -Seconds 10
                continue
            }
        }
        if (-not $server) {
            $server = Start-Process -FilePath $nodeExecutable -ArgumentList @('--disable-warning=ExperimentalWarning', ('"' + $serverEntry + '"')) -WorkingDirectory $launchRoot -WindowStyle Hidden -RedirectStandardOutput $outputLog -RedirectStandardError $errorLog -PassThru
        }
        $lastResponse = Get-Date
        while ($true) {
            Start-Sleep -Seconds 3
            $server.Refresh()
            if ($server.HasExited) { break }
            try {
                $health = Invoke-RestMethod "$appAddress/api/health" -TimeoutSec 3
                if ($health.application -eq 'leitner-box') { $lastResponse = Get-Date }
            } catch {}
            if (((Get-Date) - $lastResponse).TotalSeconds -ge 20) {
                Add-Content -LiteralPath $errorLog -Value "Service stopped answering health checks at $(Get-Date -Format o); restarting it."
                $server.Kill()
                break
            }
        }
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
