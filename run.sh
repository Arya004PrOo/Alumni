#!/bin/bash

# Parse arguments
SETUP_ONLY=false
BACKEND_ONLY=false
FRONTEND_ONLY=false
RESET_DB=false

for arg in "$@"; do
    case $arg in
        --setup-only) SETUP_ONLY=true ;;
        --backend-only) BACKEND_ONLY=true ;;
        --frontend-only) FRONTEND_ONLY=true ;;
        --reset-db) RESET_DB=true ;;
        *) echo "Unknown option: $arg"; exit 1 ;;
    esac
done

echo "Running prerequisite version checks..."

# 1. Prerequisite Version Checks (Python & Node)
# Check Python (3.10+)
if ! command -v python &> /dev/null; then
    echo "Error: Python is not installed or not in PATH."
    exit 1
fi
PY_VER=$(python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PY_MAJOR=$(echo "$PY_VER" | cut -d'.' -f1)
PY_MINOR=$(echo "$PY_VER" | cut -d'.' -f2)
if [ "$PY_MAJOR" -ne 3 ] || [ "$PY_MINOR" -lt 10 ]; then
    echo "Error: Python 3.10+ is required. Found version: $PY_VER"
    exit 1
fi
echo "Python check passed: v$PY_VER"

# Check Node (18+)
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH."
    exit 1
fi
NODE_VER=$(node -v)
NODE_MAJOR=$(echo "$NODE_VER" | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "Error: Node 18+ is required. Found version: $NODE_VER"
    exit 1
fi
echo "Node check passed: $NODE_VER"

# 2. Virtual Environment Setup
VENV_DIR="backend/myenv"
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment at $VENV_DIR..."
    python -m venv "$VENV_DIR"
fi

# Resolve Python & Alembic executables in venv
PYTHON_EXE="$VENV_DIR/Scripts/python"
ALEMBIC_EXE="$VENV_DIR/Scripts/alembic"
if [ -f "$VENV_DIR/bin/python" ]; then
    PYTHON_EXE="$VENV_DIR/bin/python"
    ALEMBIC_EXE="$VENV_DIR/bin/alembic"
fi

# 3. Environment Variables Configuration (.env)
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from template..."
    cp .env.example backend/.env
fi
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# 4. Dependency Installations
echo "Installing/updating backend requirements..."
"$PYTHON_EXE" -m pip install -r backend/requirements.txt

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend node dependencies..."
    (cd frontend && npm install)
elif [ "$SETUP_ONLY" = true ]; then
    echo "Updating frontend node dependencies..."
    (cd frontend && npm install)
fi

# 5. PostgreSQL version check (Requires DB credentials inside backend/.env)
echo "Checking PostgreSQL server version..."
"$PYTHON_EXE" -c "
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
if [ $? -ne 0 ]; then
    echo "Warning: PostgreSQL check did not pass. Please verify DATABASE_URL in backend/.env."
fi

# 6. Database Schema Reset
if [ "$RESET_DB" = true ]; then
    echo "Resetting database schema..."
    "$PYTHON_EXE" -c "
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
    if [ $? -ne 0 ]; then
        echo "Error: Database reset failed. Exiting."
        exit 1
    fi
fi

# 7. Alembic Schema Migration
echo "Running database migrations via Alembic..."
(cd backend && "$ALEMBIC_EXE" upgrade head)
if [ $? -ne 0 ]; then
    echo "Warning: Alembic migrations failed. Check database logs."
fi

# If --setup-only was requested, exit here
if [ "$SETUP_ONLY" = true ]; then
    echo "Setup completed successfully."
    exit 0
fi

# 8. Start Servers
START_BACKEND=true
START_FRONTEND=true

if [ "$BACKEND_ONLY" = true ]; then
    START_BACKEND=true
    START_FRONTEND=false
fi
if [ "$FRONTEND_ONLY" = true ]; then
    START_BACKEND=false
    START_FRONTEND=true
fi

PIDS=()

# Clean up processes on exit or interrupt
cleanup() {
    echo -e "\nStopping background servers..."
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping process $pid..."
            kill "$pid" 2>/dev/null
        fi
    done
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

if [ "$START_BACKEND" = true ]; then
    echo "Starting FastAPI Backend Server on port 8009..."
    (cd backend && "$PYTHON_EXE" -m uvicorn app.main:app --host 0.0.0.0 --port 8009) &
    PIDS+=($!)
fi

if [ "$START_FRONTEND" = true ]; then
    echo "Starting Vite Frontend Server on port 5181..."
    (cd frontend && npm run dev) &
    PIDS+=($!)
fi

# Print URLs
echo ""
if [ "$START_FRONTEND" = true ]; then
    echo "Frontend URL: http://localhost:5181"
fi
if [ "$START_BACKEND" = true ]; then
    echo "Backend URL:  http://localhost:8009"
fi
echo "Press Ctrl+C to terminate servers..."
echo ""

# Wait for all background tasks
wait
