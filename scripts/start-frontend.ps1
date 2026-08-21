# Start CivicAI frontend (Windows PowerShell)
Set-Location $PSScriptRoot\..\frontend

if (-not (Test-Path ".\.env.local")) {
    Copy-Item .env.example .env.local
}

if (-not (Test-Path ".\node_modules")) {
    npm install
}

Write-Host "Starting frontend on http://localhost:3000"
npm run dev
