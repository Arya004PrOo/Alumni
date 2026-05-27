# Alumni Module — TODO

Your module covers **alumni network + placement** (companies, drives, rounds, offers) and was added to the PVG ERP after the original 9. See `docs/PROJECT_CONTEXT.md` for the full system map, target architecture, and naming rules.

> **Two headline problems before anything else:**
> 1. **🔴🔴 Passwords are stored and compared in PLAINTEXT** (`app/routes/student.py` → `student.password != data.password`). This is a critical vulnerability — fix immediately (and you should not be storing passwords at all; see Module-Specific #1).
> 2. **🔴 This repo overlaps two systems at once.** Its `company`/`drive`/`round` models + `admin_company`/`admin_drive`/`admin_round` routes **duplicate the existing Placement module** (`ERP-Placement-System`), and its `students` table **duplicates SIS**. You need to decide what this repo *owns* (see Module-Specific #2) before polishing anything.

## 🔴 Red — Project Hygiene (Common Standards — do first)

These items are **the same for every module**. See `docs/PROJECT_CONTEXT.md` for full specs.

### H1. Adopt the canonical folder structure
**Why:** This repo is several half-projects stacked on top of each other. There are **three copies of the frontend**, the backend has a nested `frontend/` *inside* it, docs/diagrams/screenshots are committed as binaries, and two folders are double-nested with their own name.
**Change for this module:**
- **Pick ONE frontend and delete the rest.** You currently ship:
  - `alumni-connect-hub-main/alumni-connect-hub-main/` (Vite + React 19 + TS, shadcn — *this is the real one*)
  - `erp-placement-alumni-backend/frontend/` (Create-React-App, React 18, `telusko-trac-frontend`)
  - `erp-placement-alumni-backend/frontend/alumni-connect-hub-main/` (a second copy of the Vite app)
  Keep the Vite+TS app, move it to a single top-level `frontend/`, delete the other two.
- **Collapse double-nested folders:** `alumni-connect-hub-main/alumni-connect-hub-main/` → `frontend/`; `PVGERP-theme-main/PVGERP-theme-main/` → (see Yellow #note on the theme).
- **Delete from git (binaries):** `COLLEGE_ERP_SYSTEM_DOC.docx`, `updated_erp (1).png`, `Screenshot 2026-03-07 104120.png`, every `*.png`/`*.jpg`/`*.docx` under `Entity Diagram Drafts/`, both `bun.lockb` files. Host diagrams/screenshots externally and link them from `docs/`.
- **Move to `docs/`:** `alumni features.txt`, `Weekly ERP Corrections.txt`, `mermaid prompts.txt`, `trialbackendtesting.txt`, `Weekly Trello Updates/`, and the (exported-to-PNG-elsewhere) ER diagrams.
- **Rename the backend** `erp-placement-alumni-backend/` → `backend/` (and resolve the placement/alumni scope question in Module-Specific #2 first).
- **Folders with spaces must go** (they break shell scripts): `Entity Diagram Drafts/` → `docs/diagrams/`, `Weekly Trello Updates/` → `docs/trello/`.
- **Strengthen `.gitignore`:** add `*.docx`, `*.png`, `*.jpg`, `*.zip`, `*.lockb`, `node_modules/`, `.venv/`, `__pycache__/`, `.env`, `dist/`, `build/`.

After cleanup, root should contain ONLY: `README.md`, `run.sh`, `run.ps1`, `.env.example`, `.gitignore`, `docs/`, `backend/`, `frontend/`.

### H2. Add `run.sh` and `run.ps1`
**Why:** There is no reproducible way to start this module — just loose scripts and two competing frontends.
**Change:**
- Create `run.sh` (bash) and `run.ps1` (PowerShell) at repo root — follow the contract in `docs/PROJECT_CONTEXT.md`.
- Must: check Python 3.10+ / Node 18+ / Postgres 14+, create venv, `pip install -r backend/requirements.txt`, `npm install` in `frontend/`, copy `.env.example`→`.env`, run `alembic upgrade head`, start backend on **port 8009** + frontend on **port 5181**.
- Print both URLs on startup; trap Ctrl-C to clean up both processes. Support `--setup-only`, `--backend-only`, `--frontend-only`, `--reset-db`.

### H3. Frontend AuthGate — verify every page render
**Why:** Your frontend has no auth gate, and your backend has no JWT at all — anyone can open any page and hit any endpoint.
**Change:**
- `frontend/src/auth/AuthGate.jsx` (new) — wraps the router. On mount + route change: `GET /api/auth/me` against **your own backend**. 401 → `window.location = ${VITE_AUTH_URL}/login?redirect=<current-url>`. 200 → store user+role in context, render.
- `frontend/src/api/client.js` (new) — single axios instance, injects `Authorization: Bearer <jwt>`, 401 interceptor.
- `backend/app/api/v1/auth.py` → `GET /api/auth/me` — decode the ERP JWT with the shared `JWT_SECRET` (HS256), return `{user_id, email, role}` or 401.
- **Forbidden:** `?role=...` URL params, role in localStorage, trusting any identity field except a verified JWT.

### H4. Role taxonomy — handle every canonical role
**Why:** A logged-in user of any role can land on your URLs. You must respond with a clear 403 (not a crash, not silent access).
**Change:**
- Mirror the canonical roles in `backend/app/core/roles.py` (StrEnum) and gate every route with `require_roles(...)`. Return the standard 403 body (see PROJECT_CONTEXT.md).
- **`Alumni` is not yet a canonical role.** Like `Faculty`, it must be added to Auth's role catalog (`GET /api/roles/catalog`). Coordinate with the Auth owner; until then, accept `Alumni` in your enum but document that it isn't issuable yet.

**This module's role matrix (target):**

| Role | Access in Alumni/Placement module |
|---|---|
| Student | View drives they're eligible for; apply; view own applications; view alumni directory (read-only) |
| Alumni *(pending in Auth)* | **Primary** — own alumni profile, post jobs/mentorship, RSVP events |
| TPO | **Primary for placement side** — full CRUD on companies/drives/rounds/offers, view applicants |
| admin / principal / vice_principal | Full read + admin |
| hod | Dept-scoped: drives/applicants for own department |
| accountant | 403 (no access) |
| Guest | 403 |

### H5. Naming consistency (rename to canonical)
**Why:** Repo name is bare `Alumni`; the backend dir name encodes two domains; PK columns are bare `id`; folders contain spaces. See full naming rules in `docs/PROJECT_CONTEXT.md`.

**Filename + folder-name conventions — audit the WHOLE repo, not just the renames below.** This is the *same principle every module follows*; full table in the "Naming conventions" section of `docs/PROJECT_CONTEXT.md`. Walk the tree file-by-file and rename anything that doesn't match:
- **Folders:** all lowercase, **no spaces** — `backend/`, `frontend/`, `docs/` (never `Entity Diagram Drafts/`, `Weekly Trello Updates/`, `erp-placement-alumni-backend/`). Python packages `snake_case`. No double-nested same-name folders (`x/x/`).
- **Python files:** `snake_case.py` (e.g. `student_service.py`); classes inside are `PascalCase`.
- **React components:** `PascalCase.jsx`/`.tsx` (e.g. `AuthGate.jsx`). **JS utilities:** `camelCase.js`. **Config files:** lowercase (`vite.config.ts`, `tailwind.config.js`).
- **Test files:** `test_<unit>.py` (Python) / `<Component>.test.tsx` (JS).
- **Same concept = same name everywhere** at the wire: `student_id` (never `studentId`/`sid`), `user_id`, `department_id`. DB column name = API JSON key, both `snake_case`.

**Renames to apply:**

| Current | Target | Notes |
|---|---|---|
| **Repo:** `Alumni` | `pvg-alumni` | Add `pvg-` prefix, lowercase |
| **Folder:** `erp-placement-alumni-backend/` | `backend/` | After resolving scope (Module-Specific #2) |
| **Folder:** `alumni-connect-hub-main/` | `frontend/` | Keep the Vite+TS app only |
| **Folder:** `Entity Diagram Drafts/`, `Weekly Trello Updates/` | `docs/diagrams/`, `docs/trello/` | No spaces in folder names |
| `Student.id` (PK) | `student_id` | PK = `<table_singular>_id`, not bare `id` |
| `Student.university_roll_number` | (keep, but this is identity that belongs in SIS) | See Module-Specific #3 |
| `Alumni.id`, `Company.id`, `Drive.id`, `Round.id` (PKs) | `alumni_id`, `company_id`, `drive_id`, `round_id` | Disambiguate in joins |
| route prefixes `/students`, `/notifications`, `/companies`... | `/api/v1/...` | All endpoints under `/api/v1/` |
| package name `tanstack_start_ts` | `pvg-alumni-frontend` | `frontend/package.json` `name` field |
| Status/enum values (audit) | lowercase `snake_case` | e.g. drive/round/application status |

**Env vars to standardize** (in `.env.example`):
- `ALUMNI_PORT=8009`
- `DATABASE_URL` (replaces the hardcoded `postgresql://postgres:arya%40123@localhost:5433/placement_db`)
- `JWT_SECRET` (must match Auth exactly)
- `AUTH_URL`, `SIS_URL`, `NOTIFY_URL`, `PLACEMENT_URL`
- `NOTIFY_API_KEY` = value of `ALUMNI_KEY_2026`
- `VITE_API_URL`, `VITE_AUTH_URL` (frontend)

### H6. Code quality bar (lint, type-check, test)
**Why:** This module handles credentials and applicant data — bugs are incidents.
**Change:**
- `backend/pyproject.toml` — `ruff` + `mypy` + `pytest` (coverage threshold). `frontend/` — eslint + prettier + tsconfig strict (it's TypeScript — use it).
- `.pre-commit-config.yaml`, `.editorconfig` at root.
- `.github/workflows/ci.yml` — lint + type-check + tests on every PR. Add `bandit` (you have a plaintext-password bug a SAST tool would have caught).
- Delete the throwaway test/scratch files at root (`discover_api.py`, `test_admission.py`, `test_notification.py`, `puppeteer-test.js`, `screenshot.js`) or move real tests under `backend/tests/`.

### H7. Observability (health, logging, request IDs)
**Why:** When Notify (ngrok) is down your code already returns a "tunnel is taking too long" string to the user — that's a symptom of no real observability.
**Change:**
- `GET /healthz` (process up) + `GET /readyz` (DB reachable), no auth.
- Structured JSON logging with a request-ID middleware (echo `X-Request-ID`).
- Replace user-facing ngrok/tunnel error strings with the standard `503 dependency_unavailable` shape.

### H8. Secrets & config hygiene
**Why:** A DB password and a notify API key are committed to source.
**Change:**
- Move `DATABASE_URL` to env (`app/database.py:4`). No default password in code.
- Move `NOTIFICATION_URL` + `API_KEY` to env (`app/utils/notifications.py:4-5`); the ngrok URL must come from `NOTIFY_URL`.
- Add `.env.example`; ensure `.env` is gitignored.

---

## 🔴 Red — Module-Specific (do after hygiene)

### 1. Stop rolling your own auth — and never store plaintext passwords
**Why:** `app/routes/student.py` has `register_student`/`login_student` doing `student.password != data.password` against a `password` column on your `students` table. This is a plaintext-credential store and a second login system competing with the canonical Auth module. (A migration `b38235aa45a5_remove_password_hash.py` even *removed* hashing — that was the wrong direction.)
**Change:**
- **Delete** the `password` column, `register_student`, `login_student`, and `app/utils/security.py`.
- Authentication is the Auth module's job. Users log in there; your module verifies the JWT (H3). You store **no credentials**.

### 2. Decide the scope: alumni vs placement (resolve the overlap with `ERP-Placement-System`)
**Why:** Your `company.py`, `drive.py`, `round.py` models and `admin_company`/`admin_drive`/`admin_round` routes reimplement the existing **Placement module** (`ERP-Placement-System`, owner YashBorade834), which already has Companies, PlacementDrive, DriveRound, Offer, EligibilityRule, StudentApplication. Two modules owning placement = guaranteed data divergence.
**Change (pick one, coordinate with RD1991 + the Placement owner):**
- **(Recommended) This module owns only Alumni** (directory, profiles, mentorship, events, job-board *posted by alumni*). Delete the company/drive/round duplication; consume the Placement module's API for any drive data you display.
- **OR** this module *becomes* the placement module and the other is retired — but that's a bigger org decision, and the other module is more complete.
- Until resolved, do not build new features on the duplicated placement tables.

### 3. `students` table duplicates SIS — store only `student_id`
**Why:** Your `students` table holds `full_name`, `branch`, `cgpa`, `batch`, `university_roll_number` — all of which SIS is the source of truth for. Two copies drift.
**Change:**
- Drop the denormalized columns. Keep `student_id` (FK to SIS) and alumni-specific fields only (e.g. `graduation_year`, `current_employer`, `is_alumni`).
- Read name/branch/cgpa from SIS via `GET /api/v1/students/{student_id}` (add `app/services/sis_client.py`).

### 4. Lock down every endpoint
**Why:** `view_students`, `get_student/{id}`, and all `admin_*` routes have no auth dependency — anyone can read the directory and mutate companies/drives.
**Change:** Apply `Depends(require_roles(...))` per the H4 matrix. Student self-data is self-only; admin/TPO routes are admin/TPO only.

### 5. CORS: restrict origins
**Why:** `app/main.py:20` is `allow_origins=["*"]`.
**Change:** Read allowed origins from `ALLOWED_ORIGINS` env; default to the frontend dev URL only.

## 🟠 Orange — Important

### 6. Real Notify integration (not a hardcoded tunnel)
**Why:** `app/utils/notifications.py` posts to a hardcoded ngrok URL and swallows failures into user-facing strings.
**Change:** Call `${NOTIFY_URL}/api/module-notification` with `ALUMNI_KEY_2026` from env; on failure return `503 dependency_unavailable`; log it. Trigger notifications on: new drive published, application status change, alumni event invite.

### 7. Consolidate to the shared theme instead of vendoring it
**Why:** You committed the whole `PVGERP-theme-main/` package into your repo. The theme is meant to be published once (`college-erp-theme ^1.1.0`) and consumed by every frontend — vendoring a copy means it silently diverges.
**Change:** Remove the vendored `PVGERP-theme-main/` from this repo; add `college-erp-theme` as a dependency in `frontend/package.json` and import its `--erp-*` tokens. (If publishing isn't ready, coordinate — but the copy shouldn't live here long-term.)

### 8. One frontend, one framework
**Why:** Two React majors (18 CRA vs 19 Vite) and two app skeletons confuse contributors and double the maintenance.
**Change:** After H1 keeps only the Vite+React 19+TS app, delete the CRA `telusko-trac-frontend` entirely and remove its `package.json`/`package-lock.json`.

## 🟡 Yellow — Polish

### 9. Add Alembic discipline
**Why:** You have migrations (`migrations/versions/`) but also raw `migrate.py` / `force_create`-style helpers floating around.
**Change:** Make `alembic upgrade head` the only schema path; delete ad-hoc table-creation scripts.

### 10. README + docs
**Why:** `README.md` is one line.
**Change:** Document what the module owns (post Module-Specific #2), how to run it, the API surface, and the alumni/placement data model under `docs/`.

### 11. Remove dead scratch files
**Why:** `discover_api.py`, `openapi.json` snapshot, `trialbackendtesting.txt`, `puppeteer-test.js`, `screenshot.js` are dev scratch.
**Change:** Delete or move under `docs/`/`backend/tests/` as appropriate.
