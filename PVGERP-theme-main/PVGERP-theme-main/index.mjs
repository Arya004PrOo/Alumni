/**
 * college-erp-theme — ESM entry
 *
 * Usage in Vite / modern bundlers:
 *   import erpCss from 'college-erp-theme/css';          // resolves erp-theme.css
 *   import 'college-erp-theme/colleges/pvg/config.css';  // PVG branding
 */

import { createRequire } from 'module';
import { fileURLToPath }  from 'url';
import path               from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to erp-theme.css */
export const cssPath = path.join(__dirname, 'erp-theme.css');

/** Absolute path to erp-theme.js */
export const jsPath  = path.join(__dirname, 'erp-theme.js');

/**
 * Returns the absolute path to a college config file.
 * @param {string} slug - College folder name (e.g. 'pvg')
 */
export function collegeConfig(slug) {
  return path.join(__dirname, 'colleges', slug, 'config.css');
}

/**
 * Returns the absolute path to a college asset.
 * @param {string} slug  - College folder name (e.g. 'pvg')
 * @param {string} asset - Asset filename (e.g. 'icon-180.jpg')
 */
export function collegeAsset(slug, asset) {
  return path.join(__dirname, 'colleges', slug, 'assets', asset);
}
