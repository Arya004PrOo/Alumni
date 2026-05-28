# PVG College ERP Launcher

Write-Host "Starting FastAPI Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd backend; myenv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

Write-Host "Starting Vite Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd frontend; npm run dev"

Write-Host "ERP Placement & Alumni servers launched successfully!" -ForegroundColor Green
