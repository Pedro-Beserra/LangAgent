@echo off
title Fact-Checking Agent Backend
echo ===================================================
echo Iniciando Backend (FastAPI + LangGraph)
echo API disponivel em: http://localhost:8000
echo Documentacao Swagger: http://localhost:8000/docs
echo ===================================================

cd /d "%~dp0"
call "%~dp0backend\.venv\Scripts\activate.bat"
python -m uvicorn backend.main:app --reload --port 8000
pause

