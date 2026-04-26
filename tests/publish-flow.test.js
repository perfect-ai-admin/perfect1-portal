import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { fileToUrl, listAllArticles } = require('../lib/url-mapper.cjs');
const { CATEGORY_URL_MAP, SITE_URL } = require('../config/site.config.cjs');

/**
 * End-to-end publish-flow integrity.
 *
 * For each article on disk, verify the chain:
 *   src/content/<cat>/<slug>.json
 *     → fileToUrl maps it correctly
 *     → public/sitemap.xml contains the URL
 *     → category prefix matches CATEGORY_URL_MAP
 *
 * This is the structural backbone of the SEO pipeline. If any link in
 * this chain breaks, articles silently disappear from indexing — so the
 * test deliberately walks the chain rather than checking each piece in
 * isolation.
 *
 * No network. No payments / CRM / bot touched (those flows live in
 * Supabase functions / n8n and are out of scope per docs/DO-NOT-TOUCH.md).
 */

const ROOT = resolve(process.cwd());
const CONTENT = resolve(ROOT, 'src/content');
const SITEMAP = resolve(ROOT, 'public/sitemap.xml');

describe('publish flow — file → URL → sitemap chain', () => {
  // authors/ contains person profiles, not articles — sitemap-generator
  // intentionally omits them from public/sitemap.xml. Same convention
  // used in tests/content-shape.test.js.
  const SKIP_CATEGORIES = new Set(['authors']);
  const articles = listAllArticles(CONTENT).filter((a) => !SKIP_CATEGORIES.has(a.category));
  const xml = readFileSync(SITEMAP, 'utf-8');
  const sitemapUrls = new Set(
    Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1])
  );

  it('lib/url-mapper.listAllArticles found at least 50 articles', () => {
    expect(articles.length).toBeGreaterThanOrEqual(50);
  });

  it('every discovered article maps to a non-null URL', () => {
    const broken = [];
    for (const a of articles) {
      const filePath = join(CONTENT, a.category, a.slug + '.json');
      const url = fileToUrl(filePath);
      if (!url) broken.push(`${a.category}/${a.slug} → fileToUrl returned null`);
    }
    expect(broken, broken.join('\n')).toEqual([]);
  });

  it('every discovered article appears in the sitemap', () => {
    const missing = [];
    for (const a of articles) {
      if (!sitemapUrls.has(a.url)) missing.push(a.url);
    }
    expect(missing, `articles missing from sitemap:\n  ${missing.join('\n  ')}`).toEqual([]);
  });

  it('every article URL uses the prefix declared in CATEGORY_URL_MAP', () => {
    const wrong = [];
    for (const a of articles) {
      const expectedPrefix = CATEGORY_URL_MAP[a.category];
      if (!expectedPrefix) {
        wrong.push(`${a.category}/${a.slug}: category not in CATEGORY_URL_MAP`);
        continue;
      }
      const expected = `${SITE_URL}${expectedPrefix}/${a.slug}`;
      if (a.url !== expected) {
        wrong.push(`${a.category}/${a.slug}: got ${a.url}, expected ${expected}`);
      }
    }
    expect(wrong, wrong.join('\n')).toEqual([]);
  });

  it('every article file is readable and parses as JSON', () => {
    const broken = [];
    for (const a of articles) {
      const filePath = join(CONTENT, a.category, a.slug + '.json');
      if (!existsSync(filePath)) {
        broken.push(`${a.category}/${a.slug}: file not found`);
        continue;
      }
      try {
        JSON.parse(readFileSync(filePath, 'utf-8'));
      } catch (e) {
        broken.push(`${a.category}/${a.slug}: invalid JSON (${e.message})`);
      }
    }
    expect(broken, broken.join('\n')).toEqual([]);
  });
});

describe('publish flow — known-canonical articles spot check', () => {
  // Three articles from three different categories. If any of these
  // disappear from the chain, something has gone seriously wrong.
  const SPOT_CHECKS = [
    { category: 'osek-patur', slug: 'how-to-open' },
    { category: 'osek-murshe', slug: 'vat-guide' },
    { category: 'guides', slug: 'opening-business' },
  ];

  const xml = readFileSync(SITEMAP, 'utf-8');

  for (const spec of SPOT_CHECKS) {
    it(`/${spec.category}/${spec.slug} is present end-to-end`, () => {
      const filePath = join(CONTENT, spec.category, spec.slug + '.json');
      expect(existsSync(filePath), `file missing: ${filePath}`).toBe(true);

      const url = fileToUrl(filePath);
      expect(url, `URL mapping returned null`).not.toBeNull();
      expect(url.startsWith('https://www.perfect1.co.il/')).toBe(true);

      expect(xml.includes(`<loc>${url}</loc>`), `${url} not in sitemap`).toBe(true);

      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      expect(data.metaTitle, 'metaTitle missing').toBeTruthy();
      expect(data.heroTitle, 'heroTitle missing').toBeTruthy();
      expect(Array.isArray(data.sections) && data.sections.length > 0, 'sections empty').toBe(true);
    });
  }
});
