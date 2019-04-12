TITLE Starting everything...
start cmd /k call "watchEditor(browserify).bat"
start cmd /k call "watchMain(browserify).bat"
timeout /T 5 /NOBREAK > nul
start cmd /k call "watch(typescript).bat"
timeout /T 10 /NOBREAK > nul
start cmd /k call "run server.bat"