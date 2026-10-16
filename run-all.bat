@echo off
echo ===================================================
echo Iniciando Aplicacao Completa (Backend + Frontend)
echo ===================================================

start "Fact-Checking Backend" cmd /c "%~dp0run-backend.bat"
start "Fact-Checking Frontend" cmd /c "%~dp0run-frontend.bat"

echo.
echo Ambos os servicos foram iniciados em janelas separadas!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
timeout /t 5
