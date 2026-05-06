@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=%LOCALAPPDATA%\OpenAI\Codex\bin\node.exe"

if not exist "%NODE_EXE%" (
  set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

if not exist "%NODE_EXE%" (
  echo Node.js is niet gevonden.
  echo Installeer Node.js via https://nodejs.org en probeer daarna opnieuw.
  pause
  exit /b 1
)

echo Songfestival Poule wordt gestart...
echo Laat dit venster open zolang mensen de app gebruiken.
echo.
"%NODE_EXE%" server.js
pause
