@echo off
title Cooling Hub Launcher
echo ===================================================
echo             Starting Cooling Hub Application
echo ===================================================
echo.

echo [1/2] Launching Backend Server (FastAPI on Port 8000)...
start "Cooling Hub - Backend API" cmd /k "cd /d %~dp0backend && (if exist venv\Scripts\python.exe (venv\Scripts\python.exe run.py) else (python run.py))"

echo [2/2] Launching Frontend Server (Vite React on Port 5173)...
start "Cooling Hub - Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo  Both servers have been launched in separate windows!
echo.
echo  * Frontend: http://localhost:5173
echo  * Backend API Docs: http://127.0.0.1:8000/docs
echo ===================================================
echo.
echo You can keep this window open or close it.
pause
