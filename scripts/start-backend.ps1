# Start CivicAI backend (Windows PowerShell)
Set-Location $PSScriptRoot\..\backend

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Creating virtual environment..."
    py -3.12 -m venv .venv
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt
}

if (-not (Test-Path ".\.env")) {
    Copy-Item .env.example .env
    Write-Host "Created .env from .env.example — add your API keys before deploying."
}

Write-Host "Starting backend on http://127.0.0.1:8000"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
