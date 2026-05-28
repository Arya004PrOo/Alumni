# PVG College ERP Launcher - PowerShell Edition

param (
    [switch]$SetupOnly,
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$ResetDb
)

# 1. Prerequisite Version Checks (Python & Node)
Write-Host "Running prerequisite version checks..." -ForegroundColor Cyan

# Check Python (3.10+)
try {
    $pyVerStr = & python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
    $pyParts = $pyVerStr.Split(".")
    $pyMajor = [int]$pyParts[0]
    $pyMinor = [int]$pyParts[1]
    if ($pyMajor -ne 3 -or $pyMinor -lt 10) {
        Write-Error "Python 3.10+ is required. Found version: $pyVerStr"
        exit 1
    }
    Write-Host "Python check passed: v$pyVerStr" -ForegroundColor Green
} catch {
    Write-Error "Python is not installed or not in system PATH."
    exit 1
}

# Check Node (18+)
try {
    $nodeVer = & node -v
    if ($nodeVer -match "v(\d+)\.") {
        $nodeMajor = [int]$Matches[1]
        if ($nodeMajor -lt 18) {
            Write-Error "Node 18+ is required. Found version: $nodeVer"
            exit 1
        }
    }
    Write-Host "Node check passed: $nodeVer" -ForegroundColor Green
} catch {
    Write-Error "Node.js is not installed or not in system PATH."
    exit 1
}

# 2. Virtual Environment Setup
$venvDir = "backend\myenv"
if (-not (Test-Path $venvDir)) {
    Write-Host "Creating virtual environment at $venvDir..." -ForegroundColor Cyan
    & python -m venv $venvDir
}

# Resolve Python Executable in Venv
$venvPython = "$venvDir\Scripts\python.exe"

# 3. Environment Variables Configuration (.env)
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend\.env from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" "backend\.env"
}
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

# 4. Dependency Installations
Write-Host "Installing/updating backend requirements..." -ForegroundColor Cyan
& $venvPython -m pip install -r backend\requirements.txt

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend node dependencies..." -ForegroundColor Cyan
    Push-Location frontend
    & npm install
    Pop-Location
} elseif ($SetupOnly) {
    Write-Host "Updating frontend node dependencies..." -ForegroundColor Cyan
    Push-Location frontend
    & npm install
    Pop-Location
}

# 5. PostgreSQL version check (Requires DB credentials inside backend\.env)
Write-Host "Checking PostgreSQL server version..." -ForegroundColor Cyan
& $venvPython -c "
import os, psycopg2, sys
from dotenv import load_dotenv
load_dotenv('backend/.env')
try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    cur.execute('SHOW server_version;')
    ver = cur.fetchone()[0]
    major = int(ver.split('.')[0])
    print(f'Postgres Server version found: {ver}')
    if major < 14:
        print('Error: Postgres version must be 14+')
        sys.exit(1)
    sys.exit(0)
except Exception as e:
    print(f'Postgres connection / version check warning: {e}')
    print('Ensure PostgreSQL is running and credentials in backend/.env are correct.')
    sys.exit(1)
"
if ($LASTEXITCODE -ne 0) {
    Write-Warning "PostgreSQL check did not pass. Please verify your DATABASE_URL in backend/.env."
}

# 6. Database Schema Reset
if ($ResetDb) {
    Write-Host "Resetting database schema..." -ForegroundColor Red
    & $venvPython -c "
import os, psycopg2, sys
from dotenv import load_dotenv
load_dotenv('backend/.env')
try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute('DROP SCHEMA public CASCADE;')
    cur.execute('CREATE SCHEMA public;')
    cur.execute('GRANT ALL ON SCHEMA public TO public;')
    print('Database public schema reset completed successfully.')
except Exception as e:
    print(f'Database reset failed: {e}', file=sys.stderr)
    sys.exit(1)
"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Database reset failed. Exiting."
        exit 1
    }
}

# 7. Alembic Schema Migration
Write-Host "Running database migrations via Alembic..." -ForegroundColor Cyan
Push-Location backend
& myenv\Scripts\alembic upgrade head
Pop-Location
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Alembic migrations failed. Check database logs."
}

# If --setup-only was requested, exit here
if ($SetupOnly) {
    Write-Host "Setup completed successfully." -ForegroundColor Green
    exit 0
}

# 8. Start Servers
$startBackend = $true
$startFrontend = $true

if ($BackendOnly) {
    $startBackend = $true
    $startFrontend = $false
}
if ($FrontendOnly) {
    $startBackend = $false
    $startFrontend = $true
}

$processes = @()

$executionBlock = {
    try {
        if ($startBackend) {
            Write-Host "Starting FastAPI Backend Server on port 8009..." -ForegroundColor Cyan
            $backendProcess = Start-Process -FilePath "$venvPython" -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8009" -WorkingDirectory "backend" -PassThru -NoNewWindow
            $processes += $backendProcess
        }
        if ($startFrontend) {
            Write-Host "Starting Vite Frontend Server on port 5181..." -ForegroundColor Green
            $frontendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "frontend" -PassThru -NoNewWindow
            $processes += $frontendProcess
        }

        # Print URLs
        Write-Host ""
        if ($startFrontend) {
            Write-Host "Frontend URL: http://localhost:5181" -ForegroundColor Green
        }
        if ($startBackend) {
            Write-Host "Backend URL:  http://localhost:8009" -ForegroundColor Cyan
        }
        Write-Host "Press Ctrl+C to terminate servers..." -ForegroundColor Yellow
        Write-Host ""

        # Main monitoring loop
        while ($true) {
            Start-Sleep -Seconds 1
            foreach ($p in $processes) {
                if ($p.HasExited) {
                    Write-Host "Process with PID $($p.Id) exited with code $($p.ExitCode)." -ForegroundColor Red
                    exit 1
                }
            }
        }
    } finally {
        Write-Host "`nStopping background servers..." -ForegroundColor Yellow
        foreach ($p in $processes) {
            if (-not $p.HasExited) {
                Write-Host "Killing process PID $($p.Id)..." -ForegroundColor Yellow
                Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# Run the execution block
& $executionBlock
