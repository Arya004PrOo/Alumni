# Logo Assets

Master logo files for all colleges using this ERP theme.  
Each college's `assets/` folder contains symlinks pointing here.

## PVG's College of Science & Commerce, Pune

| File | Dimensions | Usage |
|------|-----------|-------|
| `pvgcosc.png` | ~180×180 | Sidebar circle, app icon, favicon base |
| `pvgcosc-logo.png` | Full width | Horizontal wordmark, branding bar |

Symlinked from:
- `colleges/pvg/assets/icon.png` → `pvgcosc.png`
- `colleges/pvg/assets/logo-wordmark.png` → `pvgcosc-logo.png`

## Adding logos for a new college

1. Drop the files here: `assets/logos/<slug>-icon.png` and `assets/logos/<slug>-logo.png`
2. Create symlinks in the college folder:
   ```bash
   ln -sf ../../../assets/logos/<slug>-icon.png colleges/<slug>/assets/icon.png
   ln -sf ../../../assets/logos/<slug>-logo.png colleges/<slug>/assets/logo-wordmark.png
   ```
3. Update `--erp-college-icon` and `--erp-college-wordmark` in `colleges/<slug>/config.css`
