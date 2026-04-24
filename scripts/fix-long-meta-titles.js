/**
 * fix-long-meta-titles.js
 * Shortens metaTitle fields longer than 60 characters.
 * Strategy:
 *   1. Remove " | פרפקט וואן" suffix if present
 *   2. If still >60, truncate at last whole word ≤60 chars
 * Prints a list of changed files at the end.
 * Run: node scripts/fix-long-meta-titles.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CONTENT_DIR = resolve(__dirname, '../src/content');
const BRAND_SUFFIX = ' | פרפקט וואן';
const MAX = 60;

const CATEGORIES = [
  'osek-patur', 'osek-murshe', 'hevra-bam', 'osek-zeir',
  'sgirat-tikim', 'amuta', 'guides', 'misui', 'maam',
  'miktzoa', 'cities', 'services', 'comparisons'
];

function shorten(title) {
  if (title.length <= MAX) return title;

  // Step 1: remove brand suffix
  if (title.endsWith(BRAND_SUFFIX)) {
    title = title.slice(0, -BRAND_SUFFIX.length).trim();
  }
  if (title.length <= MAX) return title;

  // Step 2: truncate at last word boundary ≤60
  const cut = title.slice(0, MAX);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 0) {
    return cut.slice(0, lastSpace);
  }
  // No space found — hard cut (shouldn't normally happen)
  return cut;
}

const changed = [];

for (const cat of CATEGORIES) {
  const catDir = join(CONTENT_DIR, cat);
  if (!existsSync(catDir)) continue;

  for (const file of readdirSync(catDir)) {
    if (extname(file) !== '.json') continue;
    const filePath = join(catDir, file);
    let raw;
    try { raw = readFileSync(filePath, 'utf-8'); } catch { continue; }
    let data;
    try { data = JSON.parse(raw); } catch { continue; }

    if (typeof data.metaTitle !== 'string') continue;
    const original = data.metaTitle;
    if (original.length <= MAX) continue;

    const fixed = shorten(original);
    if (fixed === original) continue;

    data.metaTitle = fixed;
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    changed.push({ file: `${cat}/${file}`, before: original, after: fixed });
  }
}

if (changed.length === 0) {
  console.log('No metaTitles over 60 chars found.');
} else {
  console.log(`Fixed ${changed.length} metaTitles:\n`);
  for (const c of changed) {
    console.log(`  ${c.file}`);
    console.log(`    BEFORE (${c.before.length}): ${c.before}`);
    console.log(`    AFTER  (${c.after.length}): ${c.after}`);
  }
}
