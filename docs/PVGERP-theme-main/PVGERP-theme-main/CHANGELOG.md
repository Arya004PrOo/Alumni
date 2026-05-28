# Changelog

All notable changes to this project will be documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project uses [Semantic Versioning](https://semver.org/).

---

## [1.1.0] — 2026-05-03

### Added
- **College identity system** (`ERP.College`) — `erp-theme.js` now reads `--erp-college` from the loaded config; shows a full-page blocking error if no college config is loaded
  - Auto-injects logos into `[data-erp-logo="icon|wordmark"]` elements
  - Auto-fills college names into `[data-erp-college-name="short|full"]` elements
  - Sets `data-erp-college="<slug>"` on `<html>` for CSS targeting
  - Exposes `ERP.College.data` object for module JS
- **Semantic colour variants** — each state now ships four tokens:
  `--erp-{success|warning|danger|info}` + `-bg`, `-text`, `-border`
- **Component heights** — `--erp-input-h` (38px), `--erp-input-h-sm` (30px), `--erp-input-h-lg` (46px), `--erp-textarea-h` (90px); buttons and inputs share the same height token
- **Typography scale** — `--erp-text-xs` → `--erp-text-3xl`, font-weight steps (`--erp-fw-*`), line-height steps (`--erp-lh-*`)
- **Spacing scale** — `--erp-space-1` → `--erp-space-16` (4 px grid, 10 steps)
- **Z-index layers** — named tokens `--erp-z-dropdown` → `--erp-z-guard`; JS reads them at runtime via `cssInt()`
- **Shape tokens** — `--erp-radius-xl`, `--erp-radius-full` (pill), `--erp-border-width` / `-md` / `-lg`
- **Interaction tokens** — `--erp-focus-ring`, `--erp-opacity-muted`
- **`examples/`** — four ready-to-run module pages: login, dashboard, admission form, notifications
- **PVGCOSC branding** in `colleges/pvg/` — new logos (pvgcosc.png, pvgcosc-logo.png), rose/maroon palette (`#881f42`)

### Changed
- `colleges/pvg/config.css` — updated to PVG's College of Science & Commerce branding and added all required `--erp-college-*` variables
- `.erp-btn` — uses `height: var(--erp-input-h)` instead of vertical padding
- `.erp-form-control` — uses `height: var(--erp-input-h)` and `--erp-focus-ring`
- `.erp-alert--*`, `.erp-badge--*`, `.erp-pill--*` — use semantic `-bg` / `-text` / `-border` tokens instead of hardcoded `rgba()` values
- All `z-index` values in CSS and JS replaced with named layer tokens

### Removed
- Old COET&M logo assets (`pvgcoet-icon-180.jpg`, `pvgcoet-logo.jpg`) and their dead symlinks

---

## [1.0.0] — 2026-04-11

### Added
- `erp-theme.css` — core generic stylesheet with full `--erp-*` design token system
- `erp-theme.js` — browser JS with `ERP` global namespace (Sidebar, Modal, Toast, Confirm, Loader, Form, Breadcrumb, Notifications)
- `colleges/pvg/config.css` — PVG COET&M, Pune brand overrides (navy #003A6A, Poppins)
- `colleges/pvg/assets/` — square icon and wordmark logos for PVG
- `examples/` — four ready-to-run HTML pages (login, dashboard, admission form, notifications)
- `index.js` / `index.mjs` — CJS and ESM entry points exposing file paths for bundler integration
- `package.json` — npm package metadata, `files` whitelist, `exports` map
- `scripts/validate.js` — pre-publish safety check
