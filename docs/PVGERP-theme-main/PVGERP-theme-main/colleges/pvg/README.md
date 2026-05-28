# PVG — College Config

College: **PVG's College of Science & Commerce, Pune**  
Website: https://www.pvgcosc.ac.in  
Slug: `pvg`

## Brand

| Token | Value | Notes |
|-------|-------|-------|
| `--erp-primary` | `#881f42` | Deep rose / maroon |
| `--erp-primary-dark` | `#6b1634` | Hover / active |
| `--erp-primary-light` | `#a92755` | Gradient tint |
| `--erp-accent` | `#fdb90a` | Golden yellow highlight |
| `--erp-font` | Poppins | Loaded via Google Fonts |

## Assets

| File | Source | Usage |
|------|--------|-------|
| `assets/icon.png` | `assets/logos/pvgcosc.png` | Sidebar circle, app icon |
| `assets/logo-wordmark.png` | `assets/logos/pvgcosc-logo.png` | Top branding bar |

Both are symlinks into `assets/logos/` at the repo root.

## Required CSS variables

Every `config.css` **must** define `--erp-college`. Without it `erp-theme.js` shows a blocking error page.

| Variable | This college's value |
|----------|---------------------|
| `--erp-college` | `"pvg"` |
| `--erp-college-short` | `"PVGCOSC"` |
| `--erp-college-full` | `"PVG's College of Science & Commerce, Pune"` |
| `--erp-college-icon` | `"colleges/pvg/assets/icon.png"` |
| `--erp-college-wordmark` | `"colleges/pvg/assets/logo-wordmark.png"` |

## Usage

```html
<link rel="stylesheet" href="path/to/erp-theme.css" />
<link rel="stylesheet" href="path/to/colleges/pvg/config.css" />
<script src="path/to/erp-theme.js"></script>
```

Logos and names are injected automatically — no hardcoded paths in HTML:

```html
<img class="erp-sidebar__logo" data-erp-logo="icon" alt="Logo" />
<h2 data-erp-college-name="short"></h2>   <!-- renders: PVGCOSC -->
<p  data-erp-college-name="full"></p>     <!-- renders: PVG's College of… -->
```
