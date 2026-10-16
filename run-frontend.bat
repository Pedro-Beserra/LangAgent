@echo off
title Fact-Checking Agent Frontend
echo ===================================================
echo Iniciando Frontend (React + Vite)
echo App disponivel em: http://localhost:5173
echo ===================================================

cd /d "%~dp0frontend"
npm run dev
pause

