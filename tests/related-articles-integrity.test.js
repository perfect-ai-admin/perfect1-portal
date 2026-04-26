import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join } from 'path';

/**
 * relatedArticles integrity:
 *
 * Every article's relatedArticles[] must resolve to either
 *   (a) a real file at src/content/<category>/<slug>.json, OR
 *   (b) a redirect target listed in vercel.json.
 *
 * This catches the failure mode where deleting an article leaves
 * dangling cross-references that the SPA renders as broken links —
 * which Google sees and treats as a low-quality signal.
 */

const ROOT = resolve(process.cwd(), 'src/content');
const VERCEL_CONFIG = resolve(process.cwd(), 'vercel.json');

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function listArticles() {
  const out = [];
  for (const cat of readdirSync(ROOT)) {
    const dir = join(ROOT, cat);
    let stat;
    try { stat = statSync(dir); } catch { continue; }
    if (!stat.isDirectory()) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      out.push({ category: cat, file: f, path: join(dir, f) });
    }
  }
  return out;
}

const articles = listArticles();
const articlePathSet = new Set(articles.map((a) => `${a.category}/${a.file.replace(/\.json$/, '')}`));

const vercelRedirects = (() => {
  if (!existsSync(VERCEL_CONFIG)) return [];
  const cfg = readJson(VERCEL_CONFIG);
  return (cfg.redirects || [])
    .map((r) => r.source)
    .filter(Boolean);
})();

const redirectSet = new Set(vercelRedirects.map((s) => s.replace(/^\//, '')));

describe('relatedArticles integrity', () => {
  it('content directory has at least one article (sanity)', () => {
    expect(articles.length).toBeGreaterThan(0);
  });

  it('every relatedArticles entry resolves to a real file or a 301 redirect', () => {
    const broken = [];
    for (const a of articles) {
      let data;
      try { data = readJson(a.path); } catch { continue; }
      const related = data.relatedArticles || [];
      for (const r of related) {
        if (!r.category || !r.slug) {
          broken.push(`${a.category}/${a.file} → MISSING category or slug`);
          continue;
        }
        if (r.slug === 'undefined' || r.category === 'undefined') {
          broken.push(`${a.category}/${a.file} → "undefined" target`);
          continue;
        }
        const key = `${r.category}/${r.slug}`;
        if (articlePathSet.has(key)) continue;
        if (redirectSet.has(key)) continue; // covered by vercel.json 301
        broken.push(`${a.category}/${a.file} → ${key} (no file, no redirect)`);
      }
    }
    expect(broken, `broken relatedArticles refs:\n  ${broken.join('\n  ')}`).toEqual([]);
  });

  it('no relatedArticle references a category not in CATEGORY_URL_MAP', () => {
    const { CATEGORY_URL_MAP } = require('../config/site.config.cjs');
    const validCats = new Set(Object.keys(CATEGORY_URL_MAP));
    const offenders = [];
    for (const a of articles) {
      let data;
      try { data = readJson(a.path); } catch { continue; }
      for (const r of data.relatedArticles || []) {
        if (r.category && !validCats.has(r.category)) {
          offenders.push(`${a.category}/${a.file} → unknown category "${r.category}"`);
        }
      }
    }
    expect(offenders, `unknown categories:\n  ${offenders.join('\n  ')}`).toEqual([]);
  });
});
