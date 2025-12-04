@echo off
echo ========================================
echo Multi-Agent Delivery System - Web App
echo ========================================
echo.
echo Starting Flask server...
echo The web interface will open at:
echo http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd backend
python app.py

pause
