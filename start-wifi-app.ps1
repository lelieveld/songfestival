$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$nodePaths = @(
  "$env:LOCALAPPDATA\OpenAI\Codex\bin\node.exe",
  "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

$node = $nodePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $node) {
  Write-Host "Node.js is niet gevonden."
  Write-Host "Installeer Node.js via https://nodejs.org en probeer daarna opnieuw."
  Read-Host "Druk op Enter om te sluiten"
  exit 1
}

Write-Host "Songfestival Poule wordt gestart..."
Write-Host "Laat dit venster open zolang mensen de app gebruiken."
Write-Host ""
& $node server.js
