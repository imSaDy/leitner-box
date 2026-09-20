param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$launchRoot = Split-Path -Parent $PSScriptRoot
$dataFolder = if ($env:LEITNER_DATA_DIR) { $env:LEITNER_DATA_DIR } else { Join-Path $env:LOCALAPPDATA 'LeitnerBox\data' }
$portNumber = if ($env:LEITNER_PORT) { [int]$env:LEITNER_PORT } else { 8765 }
$appAddress = "http://127.0.0.1:$portNumber"
$serverEntry = Join-Path $launchRoot 'src\server\index.js'
$launchMutex = New-Object System.Threading.Mutex($false, 'Local\LeitnerBoxLauncher')
$hasLaunchLock = $false
function Stop-StaleLeitnerService {
    try {
        $expectedEntry = [System.IO.Path]::GetFullPath($serverEntry)
        $listeners = Get-NetTCPConnection -LocalPort $portNumber -State Listen -ErrorAction Stop
        foreach ($listener in $listeners) {
            $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction Stop
            $commandLine = [string]$process.CommandLine
            $isExpectedNode = $process.Name -ieq 'node.exe' -and
                $commandLine.IndexOf($expectedEntry, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
            if (-not $isExpectedNode) { continue }
            Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
            for ($attempt = 0; $attempt -lt 20; $attempt++) {
                Start-Sleep -Milliseconds 100
                if (-not (Get-Process -Id $process.ProcessId -ErrorAction SilentlyContinue)) { return $true }
            }
        }
    } catch {}
    return $false
}
try {
    $hasLaunchLock = $launchMutex.WaitOne(15000)
    if (-not $hasLaunchLock) { throw 'Leitner startup is already in progress. Please try again in a few seconds.' }
    $nodeExecutable = (Get-Command node.exe -ErrorAction Stop).Source
    $nodeVersion = [version]((& $nodeExecutable --version).Trim().TrimStart('v'))
    if ($nodeVersion -lt [version]'24.11.0') { throw 'Node.js 24.11 or later is required.' }
    New-Item -ItemType Directory -Path $dataFolder -Force | Out-Null
    $health = $null
    $errorLog = $null
    try { $health = Invoke-RestMethod "$appAddress/api/health" -TimeoutSec 2 } catch {}
    if ($health -and $health.application -eq 'leitner-box' -and $health.version -ne '2.1.3') {
        if (-not (Stop-StaleLeitnerService)) {
            throw 'An older Leitner service is still running. Close it or restart Windows, then try again.'
        }
        $health = $null
    }
    if (-not $health) {
        $logFolder = Join-Path $dataFolder 'logs'
        New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
        $logStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
        $outputLog = Join-Path $logFolder "server-$logStamp.log"
        $errorLog = Join-Path $logFolder "server-$logStamp-error.log"
        Start-Process -FilePath $nodeExecutable -ArgumentList @('--disable-warning=ExperimentalWarning', ('"' + $serverEntry + '"')) -WorkingDirectory $launchRoot -WindowStyle Hidden -RedirectStandardOutput $outputLog -RedirectStandardError $errorLog | Out-Null
        Get-ChildItem -LiteralPath $logFolder -File -Filter 'server-*.log' |
            Sort-Object LastWriteTime -Descending |
            Select-Object -Skip 40 |
            Remove-Item -Force
        for ($attempt = 0; $attempt -lt 40; $attempt++) {
            Start-Sleep -Milliseconds 250
            try { $health = Invoke-RestMethod "$appAddress/api/health" -TimeoutSec 1; break } catch {}
        }
    }
    if (-not $health) {
        $detail = if ($errorLog -and (Test-Path -LiteralPath $errorLog)) {
            (Get-Content -LiteralPath $errorLog -Raw).Trim()
        } else {
            'The local service did not respond.'
        }
        throw "Leitner could not start.`n`n$detail`n`nLog: $errorLog"
    }
    if ($health.application -ne 'leitner-box' -or $health.version -ne '2.1.3') {
        throw "Another application is using port $portNumber."
    }
    if ($NoBrowser) { Write-Output $appAddress; exit 0 }
    $browserExecutable = @(
        (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe')
    ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if (-not $browserExecutable) { Start-Process $appAddress; exit 0 }
    # Migration is an explicit one-time tool. Daily launches always open the
    # database-backed application; its own setup screen handles a truly empty DB.
    Start-Process -FilePath $browserExecutable -ArgumentList @('--profile-directory="Default"', ('--app="' + $appAddress + '"'), '--start-maximized')
} catch {
    if ($NoBrowser) { Write-Error $_.Exception.Message; exit 1 }
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($_.Exception.Message, 'Leitner', 'OK', 'Error') | Out-Null
    exit 1
} finally {
    if ($hasLaunchLock) { $launchMutex.ReleaseMutex() }
    $launchMutex.Dispose()
}
