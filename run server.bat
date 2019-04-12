@echo off

set "PID="
for /f "tokens=2" %%A in ('tasklist /FI "WINDOWTITLE eq nodeServer" ^| findstr /i "cmd.exe" 2^>NUL') do @set "PID=%%A"

TITLE nodeServer

TASKKILL /PID %PID%

node ./public/scripts/app.js
pause
