# PVG College ERP – Placement & Alumni Portal

A modernized, high-performance module of the College ERP system for managing alumni records, notifications, tracking analytics, and placement directories.

## Project Structure

This project follows the canonical ERP module folder structure:
* `backend/` – FastAPI backend server with PostgreSQL database integration and secure token verification.
* `frontend/` – Vite + React 19 + TypeScript frontend styling with TailwindCSS and custom college branding themes.
* `docs/` – Project design systems, ER diagrams, Trello boards, and theme packages.

## Running the Application

### 1. Backend Server
1. Ensure your `.env` configuration file is placed under the `backend/` folder.
2. Run the FastAPI development server:
   ```bash
   cd backend
   myenv/Scripts/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### 2. Frontend Development Server
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm run dev
   ```
2. The application will be served locally at `http://localhost:5173`.
