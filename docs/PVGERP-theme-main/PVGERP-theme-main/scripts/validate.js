#!/usr/bin/env node
/**
 * Pre-publish validation:
 * Ensures the required theme files exist before publishing to npm.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const root     = path.join(__dirname, '..');
const required = [
  'erp-theme.css',
  'erp-theme.js',
  'index.js',
  'index.mjs',
  'colleges/pvg/config.css',
];

let ok = true;

for (const file of required) {
  const full = path.join(root, file);
  if (fs.existsSync(full)) {
    console.log(`  ✓  ${file}`);
  } else {
    console.error(`  ✗  MISSING: ${file}`);
    ok = false;
  }
}

if (!ok) {
  console.error('\nprepublishOnly: validation failed — missing required files.');
  process.exit(1);
} else {
  console.log('\n✓ All required files present. Safe to publish.\n');
}
