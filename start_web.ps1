# Multi-Agent Delivery System - Web App Launcher
# PowerShell script

Write-Host "========================================"
Write-Host "Multi-Agent Delivery System - Web App"
Write-Host "========================================"
Write-Host ""
Write-Host "Starting Flask server..."
Write-Host "The web interface will open at:"
Write-Host "http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server"
Write-Host "========================================"
Write-Host ""

Set-Location backend
python app.py
