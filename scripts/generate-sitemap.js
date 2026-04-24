/**
 * generate-sitemap.js
 * Scans src/content and writes public/sitemap.xml automatically.
 * Run: node scripts/generate-sitemap.js
 * Auto-run: configured as "prebuild" in package.json
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'src/content');
const OUTPUT = join(ROOT, 'public/sitemap.xml');
const BASE_URL = 'https://www.perfect1.co.il';
const TODAY = new Date().toISOString().split('T')[0];

const CATEGORIES = [
  'osek-patur', 'osek-murshe', 'hevra-bam', 'osek-zeir',
  'sgirat-tikim', 'amuta', 'guides', 'misui', 'maam',
  'miktzoa', 'cities', 'services'
];

// Static pages always in sitemap (not JSON-driven)
const STATIC_PAGES = [
  { loc: '/',                        lastmod: TODAY,       changefreq: 'daily',   priority: '1.0' },
  { loc: '/About',                   lastmod: TODAY,       changefreq: 'monthly', priority: '0.6' },
  { loc: '/patur-vs-murshe',         lastmod: TODAY,       changefreq: 'monthly', priority: '0.8' },
  { loc: '/open-osek-patur',         lastmod: TODAY,       changefreq: 'monthly', priority: '0.6' },
  { loc: '/atzmaim-berega',          lastmod: TODAY,       changefreq: 'monthly', priority: '0.8' },
  { loc: '/calculators',             lastmod: TODAY,       changefreq: 'weekly',  priority: '0.9' },
  { loc: '/calculators/net-income',  lastmod: TODAY,       changefreq: 'monthly', priority: '0.8' },
  { loc: '/calculators/credit-points', lastmod: TODAY,     changefreq: 'monthly', priority: '0.8' },
  { loc: '/Privacy',                 lastmod: TODAY,       changefreq: 'yearly',  priority: '0.3' },
  { loc: '/Terms',                   lastmod: TODAY,       changefreq: 'yearly',  priority: '0.3' },
  { loc: '/Accessibility',           lastmod: TODAY,       changefreq: 'yearly',  priority: '0.3' },
];

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return {}; }
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>\n    <loc>${BASE_URL}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const entries = [];

// Static pages
for (const page of STATIC_PAGES) {
  entries.push(urlEntry(page));
}

// Category hubs + articles
for (const cat of CATEGORIES) {
  const catDir = join(CONTENT_DIR, cat);
  if (!existsSync(catDir)) continue;

  // Hub
  const catFile = join(catDir, '_category.json');
  if (existsSync(catFile)) {
    const d = readJson(catFile);
    entries.push(urlEntry({
      loc: `/${cat}`,
      lastmod: d.updatedDate || d.publishDate || TODAY,
      changefreq: 'weekly',
      priority: '0.8'
    }));
  }

  // Articles
  for (const file of readdirSync(catDir).sort()) {
    if (file.startsWith('_') || extname(file) !== '.json') continue;
    const slug = file.replace('.json', '');
    const d = readJson(join(catDir, file));
    entries.push(urlEntry({
      loc: `/${cat}/${slug}`,
      lastmod: d.updatedDate || d.publishDate || TODAY,
      changefreq: 'monthly',
      priority: '0.6'
    }));
  }
}

// Comparisons
const compDir = join(CONTENT_DIR, 'comparisons');
if (existsSync(compDir)) {
  for (const file of readdirSync(compDir).sort()) {
    if (extname(file) !== '.json') continue;
    const d = readJson(join(compDir, file));
    entries.push(urlEntry({
      loc: `/compare/${file.replace('.json', '')}`,
      lastmod: d.updatedDate || d.publishDate || TODAY,
      changefreq: 'monthly',
      priority: '0.6'
    }));
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

writeFileSync(OUTPUT, xml, 'utf-8');
console.log(`sitemap.xml: ${entries.length} URLs → ${OUTPUT}`);
