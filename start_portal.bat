@echo off
echo Starting WebGIS GeolLM Portal...
echo.

echo Starting Backend Server...
start cmd /k "cd backend && python app.py"

echo.
echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Development Server...
start cmd /k "cd frontend && yarn dev"

echo.
echo WebGIS GeolLM Portal is starting up!
echo.
echo - Backend API: http://localhost:5000/api
echo - Frontend: http://localhost:3000
echo.
echo IMPORTANT: Fixed Features in This Version:
echo - Distance and Area Measurement tools now work directly on the map
echo - JSON-based queries (replacing SQL) with auto-zoom to results
echo - Clear All function for measurements is now working properly
echo - Removed OpenStreetMap contributors reference
echo.
echo See the test-features.md file for instructions on testing the new features.
echo.

timeout /t 5 /nobreak >nul
