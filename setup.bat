@echo off
echo ========================================================
echo               Setting up Test LM Environment
echo ========================================================
echo.

:: 1. Copy .env if not exists
if not exist .env (
    echo [*] Creating .env file from .env.example...
    copy .env.example .env
) else (
    echo [*] .env file already exists.
)
echo.

:: 2. Setup Python Virtual Environment
echo [*] Checking Python environment...
if not exist venv (
    echo [*] Creating Python virtual environment (venv)...
    python -m venv venv
)
echo [*] Installing/Updating Python dependencies in venv...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
call deactivate
echo.

:: 3. Install Root Node Dependencies
echo [*] Installing root npm dependencies...
call npm install

:: 4. Install Backend Node Dependencies
echo [*] Installing backend npm dependencies...
cd backend
call npm install
echo [*] Building backend TypeScript...
call npm run build
cd ..

:: 5. Install Next.js Frontend Node Dependencies
echo [*] Installing next-app npm dependencies...
cd next-app
call npm install
cd ..

echo.
echo ========================================================
echo               Setup Completed Successfully!
echo ========================================================
echo You can now start the application by running start.bat
echo.
pause
