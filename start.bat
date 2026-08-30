@echo off
echo =======================================================
echo          Starting Dresync AI Wardrobe Stylist
echo =======================================================
echo.

:: 1. Setup and start Backend (Python/FastAPI)
echo [1/2] Starting Backend API...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Installing backend requirements...
pip install -r requirements.txt > nul
if not exist .env copy .env.example .env > nul

echo Starting FastAPI server in the background...
start "Dresync Backend API" cmd /c "uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
cd ..
echo.

:: 2. Setup and start Frontend (React/Vite)
echo [2/2] Starting Frontend...
cd frontend
echo Installing frontend dependencies (this may take a minute)...
:: Using npm.cmd explicitly to ensure it runs correctly on Windows
call npm.cmd install
echo Starting Vite dev server...
call npm.cmd run dev
