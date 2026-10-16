$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$PythonExe = Join-Path $Root "backend\.venv\Scripts\python.exe"

if (-not (Test-Path $PythonExe)) {
    Write-Host "Ambiente virtual nao encontrado em $PythonExe" -ForegroundColor Red
    exit 1
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Iniciando Backend (FastAPI + LangGraph)" -ForegroundColor Green
Write-Host "API: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Swagger Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan

& $PythonExe -m uvicorn backend.main:app --reload --port 8000

