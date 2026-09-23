Option Explicit

' This long-running Task Scheduler action uses Windows Script Host, which has
' no console window. It launches Node hidden and monitors its health without
' creating PowerShell or CMD processes during background operation.
Dim shell, files, wmi, root, serverEntry, nodeExecutable, dataFolder, logFolder, logPath
Dim portNumber, appAddress, environment, server, current, serverPid, lastResponse
Dim started, restartDelay, nodeCommand, value
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
Set wmi = GetObject("winmgmts:\\.\root\cimv2")
root = files.GetParentFolderName(files.GetParentFolderName(WScript.ScriptFullName))
serverEntry = files.BuildPath(root, "src\server\index.js")
nodeExecutable = "node.exe"
If WScript.Arguments.Unnamed.Count > 0 Then nodeExecutable = WScript.Arguments.Unnamed(0)

Set environment = shell.Environment("PROCESS")
portNumber = 8765
value = environment("LEITNER_PORT")
If IsNumeric(value) Then
    If CLng(value) > 0 And CLng(value) < 65536 Then portNumber = CLng(value)
End If
If WScript.Arguments.Named.Exists("port") Then portNumber = CLng(WScript.Arguments.Named("port"))
appAddress = "http://127.0.0.1:" & CStr(portNumber)
environment("LEITNER_PORT") = CStr(portNumber)

dataFolder = environment("LEITNER_DATA_DIR")
If Len(dataFolder) = 0 Then dataFolder = files.BuildPath(environment("LOCALAPPDATA"), "LeitnerBox\data")
If WScript.Arguments.Named.Exists("fixture") Then dataFolder = files.BuildPath(root, "data")
environment("LEITNER_DATA_DIR") = dataFolder
logFolder = files.BuildPath(dataFolder, "logs")
EnsureFolder logFolder
logPath = files.BuildPath(logFolder, "service-supervisor.log")
nodeCommand = """" & nodeExecutable & """ --disable-warning=ExperimentalWarning """ & serverEntry & """"

If WScript.Arguments.Named.Exists("probe") Then
    WScript.Echo nodeCommand
    WScript.Quit 0
End If

Sub EnsureFolder(folderPath)
    Dim parent
    If files.FolderExists(folderPath) Then Exit Sub
    parent = files.GetParentFolderName(folderPath)
    If Len(parent) > 0 And Not files.FolderExists(parent) Then EnsureFolder parent
    files.CreateFolder folderPath
End Sub

Sub LogEvent(message)
    Dim output
    On Error Resume Next
    Set output = files.OpenTextFile(logPath, 8, True)
    output.WriteLine CStr(Now) & " " & message
    output.Close
    Err.Clear
    On Error GoTo 0
End Sub

Function FindServer()
    Dim processes, process, commandLine
    Set FindServer = Nothing
    Set processes = wmi.ExecQuery("SELECT ProcessId, CommandLine FROM Win32_Process WHERE Name = 'node.exe'")
    For Each process In processes
        commandLine = ""
        If Not IsNull(process.CommandLine) Then commandLine = CStr(process.CommandLine)
        If InStr(1, commandLine, serverEntry, vbTextCompare) > 0 Then
            Set FindServer = process
            Exit Function
        End If
    Next
End Function

Function ServiceHealthy()
    Dim request, response, status
    ServiceHealthy = False
    On Error Resume Next
    Set request = CreateObject("WinHttp.WinHttpRequest.5.1")
    request.SetTimeouts 1000, 1000, 1000, 3000
    request.Open "GET", appAddress & "/api/health", False
    request.Send
    If Err.Number = 0 Then
        status = request.Status
        response = request.ResponseText
        ServiceHealthy = status = 200 And InStr(response, """application"":""leitner-box""") > 0
    End If
    Err.Clear
    On Error GoTo 0
End Function

restartDelay = 2
Do
    started = Now
    On Error Resume Next
    Set server = FindServer()
    If Err.Number <> 0 Then LogEvent "Could not inspect Node processes: " & Err.Description
    Err.Clear
    On Error GoTo 0

    If server Is Nothing Then
        LogEvent "Starting Node service."
        On Error Resume Next
        shell.Run nodeCommand, 0, False
        If Err.Number <> 0 Then LogEvent "Could not start Node: " & Err.Description
        Err.Clear
        On Error GoTo 0
        WScript.Sleep 1000
        Set server = FindServer()
    Else
        LogEvent "Monitoring existing Node process " & CStr(server.ProcessId) & "."
    End If

    If Not server Is Nothing Then
        serverPid = CLng(server.ProcessId)
        lastResponse = Now
        Do
            WScript.Sleep 3000
            Set current = FindServer()
            If current Is Nothing Then
                LogEvent "Node process " & CStr(serverPid) & " exited."
                Exit Do
            End If
            If CLng(current.ProcessId) <> serverPid Then Exit Do
            If ServiceHealthy() Then lastResponse = Now
            If DateDiff("s", lastResponse, Now) >= 20 Then
                LogEvent "Node process " & CStr(serverPid) & " stopped answering; restarting it."
                On Error Resume Next
                current.Terminate()
                If Err.Number <> 0 Then LogEvent "Could not stop Node: " & Err.Description
                Err.Clear
                On Error GoTo 0
                Exit Do
            End If
        Loop
    End If

    If DateDiff("s", started, Now) >= 30 Then
        restartDelay = 2
    ElseIf restartDelay < 60 Then
        restartDelay = restartDelay * 2
        If restartDelay > 60 Then restartDelay = 60
    End If
    WScript.Sleep restartDelay * 1000
Loop
