/**
 * college-erp-theme
 *
 * This package ships browser-ready CSS and JS assets.
 * The exports below let bundlers (webpack, vite, rollup, etc.)
 * resolve file paths so you can import them directly.
 *
 * Usage in a bundler:
 *   import 'college-erp-theme/css';          // erp-theme.css
 *   import { ERP } from 'college-erp-theme'; // browser global (window.ERP)
 *
 * Usage via CDN / plain HTML (no bundler):
 *   <link rel="stylesheet" href="node_modules/college-erp-theme/erp-theme.css" />
 *   <link rel="stylesheet" href="node_modules/college-erp-theme/colleges/pvg/config.css" />
 *   <script src="node_modules/college-erp-theme/erp-theme.js"></script>
 *
 * CDN (unpkg / jsDelivr):
 *   https://unpkg.com/college-erp-theme/erp-theme.css
 *   https://unpkg.com/college-erp-theme/erp-theme.js
 *   https://unpkg.com/college-erp-theme/colleges/pvg/config.css
 */

'use strict';

const path = require('path');

/** Absolute path to erp-theme.css */
const cssPath = path.join(__dirname, 'erp-theme.css');

/** Absolute path to erp-theme.js */
const jsPath  = path.join(__dirname, 'erp-theme.js');

/**
 * Returns the absolute path to a college config file.
 * @param {string} slug - College folder name (e.g. 'pvg')
 * @returns {string}
 */
function collegeConfig(slug) {
  return path.join(__dirname, 'colleges', slug, 'config.css');
}

/**
 * Returns the absolute path to a college asset.
 * @param {string} slug  - College folder name (e.g. 'pvg')
 * @param {string} asset - Asset filename (e.g. 'icon-180.jpg')
 * @returns {string}
 */
function collegeAsset(slug, asset) {
  return path.join(__dirname, 'colleges', slug, 'assets', asset);
}

module.exports = { cssPath, jsPath, collegeConfig, collegeAsset };
