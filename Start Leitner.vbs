Option Explicit

Dim shell, files, root, url, browser, chrome, edge, powershell, launcher, command, attempt, ready
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
root = files.GetParentFolderName(WScript.ScriptFullName)
url = "http://127.0.0.1:8765"

Function ServiceReady()
    Dim request, status, response
    ServiceReady = False
    On Error Resume Next
    Set request = CreateObject("WinHttp.WinHttpRequest.5.1")
    request.SetTimeouts 1000, 1000, 1000, 1500
    request.Open "GET", url & "/api/health", False
    request.Send
    If Err.Number <> 0 Then
        Err.Clear
        On Error GoTo 0
        Exit Function
    End If
    status = request.Status
    response = request.ResponseText
    On Error GoTo 0
    ServiceReady = status = 200 And InStr(response, """application"":""leitner-box""") > 0 And _
        InStr(response, """version"":""2.1.10""") > 0 And InStr(response, """ready"":true") > 0
End Function

ready = False
For attempt = 1 To 4
    If ServiceReady() Then
        ready = True
        Exit For
    End If
    WScript.Sleep 250
Next

' The probe is for a console-free launcher check; it never opens the browser.
If WScript.Arguments.Named.Exists("probe") Then
    If ready Then
        WScript.Echo "ready"
        WScript.Quit 0
    End If
    WScript.Echo "fallback"
    WScript.Quit 1
End If

If ready Then
    chrome = files.BuildPath(shell.ExpandEnvironmentStrings("%ProgramFiles%"), "Google\Chrome\Application\chrome.exe")
    edge = files.BuildPath(shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%"), "Microsoft\Edge\Application\msedge.exe")
    browser = ""
    If files.FileExists(chrome) Then browser = chrome
    If browser = "" And files.FileExists(edge) Then browser = edge
    If browser <> "" Then
        command = """" & browser & """ --profile-directory=""Default"" --app=""" & url & """ --start-maximized"
    Else
        command = url
    End If
    shell.Run command, 1, False
    WScript.Quit 0
End If

' Repair only an unavailable or outdated service. No PowerShell process is
' started when the already-running service is healthy.
powershell = shell.ExpandEnvironmentStrings("%SystemRoot%") & "\System32\WindowsPowerShell\v1.0\powershell.exe"
launcher = files.BuildPath(root, "scripts\Start-Leitner.ps1")
command = """" & powershell & """ -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & launcher & """"
shell.Run command, 0, False
