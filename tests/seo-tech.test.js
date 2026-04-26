import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { CATEGORY_URL_MAP, SITE_URL } = require('../config/site.config.cjs');

/**
 * SEO tech tests — complement to sitemap-integrity, related-articles-integrity,
 * and content-shape. These catch broken inline links inside section content
 * (the markdown [text](url) and HTML <a href> kind) and validate that every
 * vercel.json redirect points to a real path.
 *
 * Each broken link is "Crawled — currently not indexed" fuel for Google.
 */

const ROOT = resolve(process.cwd(), 'src/content');
const VERCEL_CONFIG = resolve(process.cwd(), 'vercel.json');

const MD_LINK_RE = /\[[^\]]+\]\(([^)\s]+)\)/g;
const HTML_HREF_RE = /<a[^>]+href=["']([^"']+)["']/gi;

function readJson(p) { return JSON.parse(readFileSync(p, 'utf-8')); }

function listArticles() {
  const out = [];
  for (const cat of readdirSync(ROOT)) {
    const dir = join(ROOT, cat);
    let stat;
    try { stat = statSync(dir); } catch { continue; }
    if (!stat.isDirectory()) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json') || f.startsWith('_')) continue;
      out.push({ category: cat, slug: f.replace(/\.json$/, ''), path: join(dir, f) });
    }
  }
  return out;
}

function buildResolvableSet() {
  const articles = listArticles();
  const set = new Set();
  for (const a of articles) {
    set.add(`${a.category}/${a.slug}`);
    const prefix = (CATEGORY_URL_MAP[a.category] || '').replace(/^\//, '');
    if (prefix) set.add(`${prefix}/${a.slug}`);
  }
  for (const cat of Object.keys(CATEGORY_URL_MAP)) {
    set.add(cat);
    set.add(CATEGORY_URL_MAP[cat].replace(/^\//, ''));
  }
  // Static + hub pages (kept in sync with scripts/qa-seo-tech.cjs)
  for (const s of ['', 'about', 'About', 'Privacy', 'Terms', 'Accessibility',
                   'patur-vs-murshe', 'open-osek-patur', 'atzmaim-berega',
                   'calculators', 'calculators/net-income', 'calculators/credit-points',
                   'calculators/income-tax', 'calculators/national-insurance',
                   'calculators/company-tax', 'compare', 'authors',
                   'authors/perfect1-team', 'sitemap.xml', 'robots.txt']) set.add(s);
  return set;
}

function loadRedirectSources() {
  if (!existsSync(VERCEL_CONFIG)) return new Set();
  const cfg = readJson(VERCEL_CONFIG);
  return new Set((cfg.redirects || []).map((r) => (r.source || '').replace(/^\//, '')));
}

function loadRedirects() {
  if (!existsSync(VERCEL_CONFIG)) return [];
  return (readJson(VERCEL_CONFIG).redirects || []).filter((r) => r && r.source && r.destination);
}

function isInternalLink(u) {
  if (u.startsWith('#') || u.startsWith('mailto:') || u.startsWith('tel:')) return false;
  if (u.startsWith('http://') || u.startsWith('https://')) return u.startsWith(SITE_URL);
  return u.startsWith('/');
}

function normalizeInternal(u) {
  let p = u;
  if (p.startsWith(SITE_URL)) p = p.slice(SITE_URL.length);
  const q = p.indexOf('?'); if (q >= 0) p = p.slice(0, q);
  const h = p.indexOf('#'); if (h >= 0) p = p.slice(0, h);
  if (p.startsWith('/')) p = p.slice(1);
  return p;
}

const articles = listArticles();
const resolvable = buildResolvableSet();
const redirectSources = loadRedirectSources();

describe('SEO tech — internal link integrity', () => {
  it('every inline link in section content resolves to a real file or redirect', () => {
    const broken = [];
    for (const a of articles) {
      const d = readJson(a.path);
      const blob = JSON.stringify(d.sections || []) + ' ' + JSON.stringify(d.faq || []);
      const links = new Set();
      for (const m of blob.matchAll(MD_LINK_RE)) links.add(m[1]);
      for (const m of blob.matchAll(HTML_HREF_RE)) links.add(m[1]);
      for (const raw of links) {
        if (!isInternalLink(raw)) continue;
        const norm = normalizeInternal(raw);
        if (norm === '') continue;
        if (resolvable.has(norm) || redirectSources.has(norm)) continue;
        broken.push(`${a.category}/${a.slug} → ${raw}`);
      }
    }
    expect(broken, `broken inline links:\n  ${broken.join('\n  ')}`).toEqual([]);
  });
});

describe('SEO tech — vercel.json redirects', () => {
  const redirects = loadRedirects();
  const redirectSources = new Set(redirects.map((r) => r.source.replace(/^\//, '')));

  it('every redirect destination is well-formed', () => {
    const malformed = redirects.filter((r) => {
      if (r.has) return false; // catch-all rewrites are allowed any destination
      const d = r.destination;
      return !(d.startsWith('/') || d.startsWith('http'));
    });
    expect(malformed, `malformed redirects: ${malformed.map((r) => r.source).join(', ')}`).toEqual([]);
  });

  it('every internal redirect destination resolves to a real path', () => {
    const broken = [];
    for (const r of redirects) {
      if (r.has) continue;
      if (r.destination.startsWith('http')) continue;
      const norm = r.destination.replace(/^\//, '').split('?')[0].split('#')[0];
      if (norm === '') continue;
      if (!resolvable.has(norm) && !redirectSources.has(norm)) {
        broken.push(`${r.source} → ${r.destination}`);
      }
    }
    expect(broken, `redirects with broken destinations:\n  ${broken.join('\n  ')}`).toEqual([]);
  });

  it('no redirect chains (A → B where B is also a source)', () => {
    const chains = [];
    for (const r of redirects) {
      if (r.has) continue;
      if (r.destination.startsWith('http')) continue;
      const norm = r.destination.replace(/^\//, '').split('?')[0].split('#')[0];
      if (redirectSources.has(norm)) chains.push(`${r.source} → ${r.destination}`);
    }
    expect(chains, `redirect chains found:\n  ${chains.join('\n  ')}`).toEqual([]);
  });
});
