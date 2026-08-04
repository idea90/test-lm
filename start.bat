@echo off
echo ========================================================
echo                 Starting Test LM App
echo ========================================================
echo.

:: Check if node_modules exists
if not exist node_modules (
    echo [!] Dependencies not found. Running setup.bat first...
    call setup.bat
)

if not exist backend\node_modules (
    echo [!] Backend dependencies not found. Running setup.bat first...
    call setup.bat
)

if not exist next-app\node_modules (
    echo [!] Frontend dependencies not found. Running setup.bat first...
    call setup.bat
)

echo [*] Launching Express backend and Next.js frontend...
echo [*] App will be available at: http://localhost:3000
echo.

call npm start
