/**
 * fix-short-meta-descriptions.js
 * Appends a standard CTA to metaDescriptions shorter than 120 chars.
 * Skips files that already contain "פרפקט וואן" or "ייעוץ חינם" in the description.
 * Run: node scripts/fix-short-meta-descriptions.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CONTENT_DIR = resolve(__dirname, '../src/content');
const CTA = ' | מדריך מלא בפרפקט וואן, הרשמו לייעוץ חינם.';
const MIN = 120;
const MAX = 155;

const CATEGORIES = [
  'osek-patur', 'osek-murshe', 'hevra-bam', 'osek-zeir',
  'sgirat-tikim', 'amuta', 'guides', 'misui', 'maam',
  'miktzoa', 'cities', 'services', 'comparisons'
];

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

    if (typeof data.metaDescription !== 'string') continue;
    const original = data.metaDescription;
    if (original.length >= MIN) continue;

    // Skip if already has CTA-like content
    if (original.includes('פרפקט וואן') || original.includes('ייעוץ חינם')) continue;

    let fixed = original + CTA;
    // Trim to MAX if overshoot
    if (fixed.length > MAX) {
      fixed = fixed.slice(0, MAX);
    }

    data.metaDescription = fixed;
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    changed.push({ file: `${cat}/${file}`, before: original.length, after: fixed.length });
  }
}

if (changed.length === 0) {
  console.log('No metaDescriptions under 120 chars found.');
} else {
  console.log(`Fixed ${changed.length} metaDescriptions:`);
  for (const c of changed) {
    console.log(`  ${c.file}  ${c.before} → ${c.after} chars`);
  }
}
