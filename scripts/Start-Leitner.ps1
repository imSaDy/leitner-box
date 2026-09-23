param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$launchRoot = Split-Path -Parent $PSScriptRoot
$dataFolder = if ($env:LEITNER_DATA_DIR) { $env:LEITNER_DATA_DIR } else { Join-Path $env:LOCALAPPDATA 'LeitnerBox\data' }
$portNumber = if ($env:LEITNER_PORT) { [int]$env:LEITNER_PORT } else { 8765 }
$appAddress = "http://127.0.0.1:$portNumber"
$serverEntry = Join-Path $launchRoot 'src\server\index.js'
$supervisorEntry = Join-Path $PSScriptRoot 'Supervise-Leitner.vbs'
$taskName = 'LeitnerBoxLocalService'
$launchMutex = New-Object System.Threading.Mutex($false, 'Local\LeitnerBoxLauncher')
$hasLaunchLock = $false
function Stop-StaleLeitnerService {
    param([switch]$CurrentInstallOnly)
    try {
        $expectedEntry = [System.IO.Path]::GetFullPath($serverEntry)
        $listeners = Get-NetTCPConnection -LocalPort $portNumber -State Listen -ErrorAction Stop
        foreach ($listener in $listeners) {
            $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction Stop
            $commandLine = [string]$process.CommandLine
            $sameInstall = $commandLine.IndexOf($expectedEntry, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
            $isExpectedNode = $process.Name -ieq 'node.exe' -and
                ($sameInstall -or (-not $CurrentInstallOnly -and $commandLine -match '[\\/]src[\\/]server[\\/]index\.js'))
            if (-not $isExpectedNode) { continue }
            Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
            for ($attempt = 0; $attempt -lt 20; $attempt++) {
                Start-Sleep -Milliseconds 100
                if (-not (Get-Process -Id $process.ProcessId -ErrorAction SilentlyContinue)) { return $true }
            }
        }
    } catch {}
    # Stopping the scheduled task may already have closed the old listener.
    # An empty port is the successful state, even when there was no process
    # left for this function to kill.
    $remaining = Get-NetTCPConnection -LocalPort $portNumber -State Listen -ErrorAction SilentlyContinue
    return -not [bool]$remaining
}
try {
    $hasLaunchLock = $launchMutex.WaitOne(15000)
    if (-not $hasLaunchLock) { throw 'Leitner startup is already in progress. Please try again in a few seconds.' }
    $nodeExecutable = (Get-Command node.exe -ErrorAction Stop).Source
    $nodeVersionText = & $nodeExecutable --version
    if ($LASTEXITCODE -ne 0 -or -not $nodeVersionText) { throw 'Node.js did not return a version.' }
    $nodeVersion = [version](([string]$nodeVersionText).Trim().TrimStart('v'))
    if ($nodeVersion -lt [version]'24.11.0') { throw 'Node.js 24.11 or later is required.' }
    New-Item -ItemType Directory -Path $dataFolder -Force | Out-Null
    $health = $null
    $errorLog = $null
    try { $health = Invoke-RestMethod "$appAddress/api/health" -TimeoutSec 2 } catch {}
    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($health -and $health.application -eq 'leitner-box' -and $health.version -ne '2.1.10') {
        if ($task) { Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue }
        if (-not (Stop-StaleLeitnerService)) {
            throw 'An older Leitner service is still running. Close it or restart Windows, then try again.'
        }
        $health = $null
    }
    if ($health -and $health.application -eq 'leitner-box' -and -not $health.ready) {
        if ($task) { Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue }
        if (-not (Stop-StaleLeitnerService)) {
            throw 'The Leitner database connection needs a restart. Close the earlier service, then try again.'
        }
        $health = $null
    }
    $expectedTaskArgument = '"' + $supervisorEntry + '" "' + $nodeExecutable + '"'
    if ($task -and ($task.Actions[0].Execute -ne (Join-Path $env:SystemRoot 'System32\wscript.exe') -or
        $task.Actions[0].Arguments -ne $expectedTaskArgument -or $task.Triggers.Count -ne 1 -or -not $task.Settings.Hidden)) {
        Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        $task = $null
        Stop-StaleLeitnerService | Out-Null
        $health = $null
    }
    if (-not $task) {
        if ($health -and $health.application -eq 'leitner-box') {
            Stop-StaleLeitnerService | Out-Null
            $health = $null
        }
        $action = New-ScheduledTaskAction -Execute (Join-Path $env:SystemRoot 'System32\wscript.exe') -Argument $expectedTaskArgument -WorkingDirectory $launchRoot
        $trigger = New-ScheduledTaskTrigger -AtLogOn -User ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name)
        $principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
        $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew -Hidden -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
        $task = Get-ScheduledTask -TaskName $taskName
    }
    if (-not $health -and $task.State -eq 'Running') {
        try { $health = Invoke-RestMethod "$appAddress/api/health" -TimeoutSec 3 } catch {}
        if (-not $health) {
            # A running task can hold a Node process that owns the port but no
            # longer answers requests. Restart only this installation's process.
            Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
            Stop-StaleLeitnerService -CurrentInstallOnly | Out-Null
            for ($attempt = 0; $attempt -lt 20; $attempt++) {
                $task = Get-ScheduledTask -TaskName $taskName
                if ($task.State -ne 'Running') { break }
                Start-Sleep -Milliseconds 100
            }
        }
    }
    if (-not $health -or $task.State -ne 'Running') {
        $logFolder = Join-Path $dataFolder 'logs'
        New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
        if ($task.State -ne 'Running') { Start-ScheduledTask -TaskName $taskName }
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
        if (-not $errorLog) {
            $errorLog = Get-ChildItem -LiteralPath (Join-Path $dataFolder 'logs') -File -Filter 'server-*-error.log' -ErrorAction SilentlyContinue |
                Sort-Object LastWriteTime -Descending |
                Select-Object -First 1 -ExpandProperty FullName
        }
        $detail = if ($errorLog -and (Test-Path -LiteralPath $errorLog)) {
            [System.IO.File]::ReadAllText($errorLog).Trim()
        } else { '' }
        if (-not $detail) { $detail = 'The local service did not respond.' }
        throw "Leitner could not start.`n`n$detail`n`nLog: $errorLog"
    }
    if ($health.application -ne 'leitner-box' -or $health.version -ne '2.1.10') {
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
    if ($NoBrowser) { Write-Error ($_ | Format-List * -Force | Out-String); exit 1 }
    if ($hasLaunchLock) {
        $launchMutex.ReleaseMutex()
        $hasLaunchLock = $false
    }
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($_.Exception.Message, 'Leitner', 'OK', 'Error') | Out-Null
    exit 1
} finally {
    if ($hasLaunchLock) { $launchMutex.ReleaseMutex() }
    $launchMutex.Dispose()
}
