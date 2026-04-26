import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Structural sanity tests for content JSONs.
 *
 * These don't enforce length/quality (that's qa-content-scan.cjs).
 * They enforce that the *shape* is not catastrophically broken — the
 * specific failure modes we hit in 2026-04-25:
 *   - TOC promised 10 sections, only 1 existed (soft 404)
 *   - placeholder content with literal "test query" / "lorem"
 *   - articles published with empty sections array
 */

const ROOT = resolve(process.cwd(), 'src/content');
const PLACEHOLDER_TOKENS = [
  'test query',
  'lorem ipsum',
  'placeholder',
  'TODO:',
  'FIXME:',
  'XXX:',
];

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

// authors/ contains person profiles (different shape — no sections),
// not articles. Skip it from article-shape assertions.
const SKIP_CATEGORIES = new Set(['authors']);

function listArticles() {
  const out = [];
  for (const cat of readdirSync(ROOT)) {
    if (SKIP_CATEGORIES.has(cat)) continue;
    const dir = join(ROOT, cat);
    let stat;
    try { stat = statSync(dir); } catch { continue; }
    if (!stat.isDirectory()) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.json') || f.startsWith('_')) continue;
      out.push({ slug: f.replace(/\.json$/, ''), category: cat, path: join(dir, f) });
    }
  }
  return out;
}

const articles = listArticles();

describe('content shape sanity', () => {
  it('every article has the required top-level fields', () => {
    const missing = [];
    for (const a of articles) {
      const d = readJson(a.path);
      const required = ['metaTitle', 'metaDescription', 'heroTitle', 'sections'];
      for (const k of required) {
        if (d[k] === undefined || d[k] === null || d[k] === '') {
          missing.push(`${a.category}/${a.slug}: missing ${k}`);
        }
      }
    }
    expect(missing, `articles with missing core fields:\n  ${missing.join('\n  ')}`).toEqual([]);
  });

  it('sections array is non-empty for every article', () => {
    const empty = [];
    for (const a of articles) {
      const d = readJson(a.path);
      if (!Array.isArray(d.sections) || d.sections.length === 0) {
        empty.push(`${a.category}/${a.slug}`);
      }
    }
    expect(empty, `articles with empty sections:\n  ${empty.join('\n  ')}`).toEqual([]);
  });

  it('TOC count never exceeds sections count by more than 2 (soft-404 detector)', () => {
    // Tolerance of 2 because some TOC entries are anchors to in-section subheaders.
    const offenders = [];
    for (const a of articles) {
      const d = readJson(a.path);
      const toc = (d.toc || []).length;
      const sec = (d.sections || []).length;
      if (toc > sec + 2) {
        offenders.push(`${a.category}/${a.slug}: toc=${toc}, sections=${sec}, gap=${toc - sec}`);
      }
    }
    expect(offenders, `broken stubs (TOC promises sections that don't exist):\n  ${offenders.join('\n  ')}`).toEqual([]);
  });

  it('no placeholder/test tokens in metaTitle, heroTitle, or keywords', () => {
    const tainted = [];
    for (const a of articles) {
      const d = readJson(a.path);
      const haystacks = [
        ['metaTitle', d.metaTitle || ''],
        ['heroTitle', d.heroTitle || ''],
        ['keywords', (d.keywords || []).join(' ')],
      ];
      for (const [field, text] of haystacks) {
        const lower = text.toLowerCase();
        for (const tok of PLACEHOLDER_TOKENS) {
          if (lower.includes(tok.toLowerCase())) {
            tainted.push(`${a.category}/${a.slug}.${field}: contains "${tok}"`);
          }
        }
      }
    }
    expect(tainted, `placeholder/test tokens leaked into content:\n  ${tainted.join('\n  ')}`).toEqual([]);
  });

  it('article slug in JSON matches filename slug (catches misfiling/renames)', () => {
    const mismatches = [];
    for (const a of articles) {
      const d = readJson(a.path);
      // slug field is optional in some templates, only check when present
      if (d.slug && d.slug !== a.slug) {
        mismatches.push(`${a.category}/${a.slug}: filename says "${a.slug}", JSON.slug says "${d.slug}"`);
      }
      if (d.category && d.category !== a.category) {
        mismatches.push(`${a.category}/${a.slug}: in /${a.category}/ but JSON.category="${d.category}"`);
      }
    }
    expect(mismatches, `slug/category mismatches:\n  ${mismatches.join('\n  ')}`).toEqual([]);
  });
});
