#!/bin/bash

# Determine Python Executable Path
if [ -f "backend/myenv/Scripts/python" ]; then
    PYTHON_EXE="myenv/Scripts/python"
elif [ -f "backend/myenv/bin/python" ]; then
    PYTHON_EXE="myenv/bin/python"
else
    PYTHON_EXE="python"
fi

echo "Starting FastAPI Backend Server..."
(cd backend && "$PYTHON_EXE" -m uvicorn app.main:app --host 0.0.0.0 --port 8000) &
BACKEND_PID=$!

echo "Starting Vite Frontend Server..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Terminate both servers on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
