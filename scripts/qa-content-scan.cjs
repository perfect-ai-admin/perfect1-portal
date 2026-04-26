#!/usr/bin/env node
/**
 * Content QA scanner.
 *
 * Walks src/content/* and reports on every article + every category:
 *   - hard failures (placeholder content, broken stubs, missing required fields)
 *   - soft warnings (under MIN_WORD_COUNT, missing FAQ, weak internal linking,
 *     suspect template-duplication for city pages, off-spec metaTitle/metaDescription)
 *
 * Two output modes:
 *   default        — human-readable summary to stdout
 *   --json         — machine-readable JSON to stdout (for CI consumption)
 *   --priority     — only print the prioritized action list
 *
 * Exit codes:
 *   0  — no hard failures
 *   1  — hard failures found (CI should block on this)
 *
 * Soft warnings never fail the run — they're a backlog, not a gate.
 *
 * The hard failures here are a SUPERSET of what the vitest suites enforce.
 * If you want a tight CI gate, run `npm test`. If you want the full audit
 * (including the soft items), run `npm run qa:content`.
 */

const fs = require('fs');
const path = require('path');
const { MIN_WORD_COUNT, CATEGORY_URL_MAP } = require('../config/site.config.cjs');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'src/content');
const VERCEL_CONFIG = path.join(ROOT, 'vercel.json');

// Categories with non-article shape — skipped from article-shape gates.
const SKIP_CATS = new Set(['authors']);

const PLACEHOLDER_TOKENS = [
  'test query',
  'lorem ipsum',
  'placeholder',
  'TODO:',
  'FIXME:',
  'XXX:',
];

// --- helpers ---

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function articleWordCount(d) {
  // Count words in section content + faq answers (the user-visible body).
  // Excludes meta/keywords (those are signals, not content).
  let text = '';
  for (const s of d.sections || []) {
    if (s.content) text += ' ' + (typeof s.content === 'string' ? s.content : JSON.stringify(s.content));
    if (s.title)   text += ' ' + s.title;
    if (s.answerBlock) text += ' ' + s.answerBlock;
    if (s.description) text += ' ' + s.description;
    if (Array.isArray(s.items)) text += ' ' + s.items.map((i) => typeof i === 'string' ? i : (i.text || i.content || '')).join(' ');
  }
  for (const f of d.faq || []) {
    text += ' ' + (f.question || '') + ' ' + (f.answer || '');
  }
  return (text.trim().match(/\S+/g) || []).length;
}

function listArticles() {
  const out = [];
  for (const cat of fs.readdirSync(CONTENT)) {
    if (SKIP_CATS.has(cat)) continue;
    const dir = path.join(CONTENT, cat);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json') || f.startsWith('_')) continue;
      out.push({
        category: cat,
        slug: f.replace(/\.json$/, ''),
        path: path.join(dir, f),
      });
    }
  }
  return out;
}

function readRedirects() {
  if (!fs.existsSync(VERCEL_CONFIG)) return new Set();
  const cfg = readJson(VERCEL_CONFIG);
  return new Set((cfg.redirects || []).map((r) => (r.source || '').replace(/^\//, '')));
}

// --- analysis ---

function analyzeArticle(a, ctx) {
  const data = readJson(a.path);
  const hardFailures = [];
  const softWarnings = [];

  const required = ['metaTitle', 'metaDescription', 'heroTitle', 'sections'];
  for (const k of required) {
    if (!data[k] || (Array.isArray(data[k]) && data[k].length === 0)) {
      hardFailures.push(`missing-${k}`);
    }
  }

  const tocLen = (data.toc || []).length;
  const sectionsLen = (data.sections || []).length;
  if (tocLen > sectionsLen + 2) hardFailures.push(`broken-toc-stub:toc=${tocLen}/sec=${sectionsLen}`);

  // Placeholder detector
  const haystack = [
    data.metaTitle || '',
    data.heroTitle || '',
    (data.keywords || []).join(' '),
    JSON.stringify(data.sections || []).slice(0, 5000),
  ].join(' ').toLowerCase();
  for (const tok of PLACEHOLDER_TOKENS) {
    if (haystack.includes(tok.toLowerCase())) hardFailures.push(`placeholder:${tok}`);
  }

  // slug/category mismatch
  if (data.slug && data.slug !== a.slug) hardFailures.push(`slug-mismatch:json=${data.slug}/file=${a.slug}`);
  if (data.category && data.category !== a.category) hardFailures.push(`category-mismatch:json=${data.category}/dir=${a.category}`);

  // Broken relatedArticles
  for (const r of data.relatedArticles || []) {
    if (!r.category || !r.slug || r.slug === 'undefined' || r.category === 'undefined') {
      hardFailures.push(`related-undefined:${r.category || '?'}/${r.slug || '?'}`);
      continue;
    }
    const key = `${r.category}/${r.slug}`;
    if (!ctx.articleSet.has(key) && !ctx.redirectSet.has(key)) {
      hardFailures.push(`related-broken:${key}`);
    }
  }

  // ----- soft warnings -----
  const wc = articleWordCount(data);
  if (wc < MIN_WORD_COUNT) softWarnings.push(`thin:${wc}w`);

  if (!Array.isArray(data.faq) || data.faq.length < 3) softWarnings.push(`faq:${(data.faq || []).length}`);

  const titleLen = (data.metaTitle || '').length;
  if (titleLen === 0 || titleLen > 60) softWarnings.push(`metaTitle:${titleLen}c`);
  const descLen = (data.metaDescription || '').length;
  if (descLen < 120 || descLen > 160) softWarnings.push(`metaDescription:${descLen}c`);

  if ((data.relatedArticles || []).length < 3) softWarnings.push(`few-related:${(data.relatedArticles || []).length}`);

  return { ...a, wordCount: wc, hardFailures, softWarnings };
}

// City template-duplication detector (not gating, just informational).
function cityDuplicationSignal(results) {
  const cities = results.filter((r) => r.category === 'cities');
  if (cities.length < 2) return null;
  const sigs = cities.map((c) => {
    const d = readJson(c.path);
    return {
      slug: c.slug,
      tocLen: (d.toc || []).length,
      sections: (d.sections || []).length,
      faqLen: (d.faq || []).length,
      wc: c.wordCount,
    };
  });
  const ref = sigs[0];
  const matchesRef = sigs.filter((s) =>
    s.tocLen === ref.tocLen &&
    s.sections === ref.sections &&
    Math.abs(s.wc - ref.wc) < 200
  );
  if (matchesRef.length === sigs.length && sigs.length >= 2) {
    return `cities/* appear to share a common template (${sigs.length} files, identical TOC/section count, word count within 200): ${sigs.map((s) => s.slug).join(', ')}. Add unique per-city content to avoid GSC "Duplicate without user-selected canonical".`;
  }
  return null;
}

// --- entry ---

function main() {
  const args = new Set(process.argv.slice(2));
  const articles = listArticles();
  const articleSet = new Set(articles.map((a) => `${a.category}/${a.slug}`));
  const redirectSet = readRedirects();

  const results = articles.map((a) => analyzeArticle(a, { articleSet, redirectSet }));

  const hardFailed = results.filter((r) => r.hardFailures.length > 0);
  const thin = results.filter((r) => r.wordCount < MIN_WORD_COUNT);
  const noFaq = results.filter((r) => r.softWarnings.some((w) => w.startsWith('faq:')));
  const cityDup = cityDuplicationSignal(results);

  const summary = {
    totalArticles: results.length,
    hardFailureCount: hardFailed.length,
    thinCount: thin.length,
    missingFaqCount: noFaq.length,
    minWordCount: MIN_WORD_COUNT,
    cityDuplication: cityDup,
  };

  // --- output modes ---
  if (args.has('--json')) {
    process.stdout.write(JSON.stringify({ summary, results }, null, 2));
    process.exit(hardFailed.length > 0 ? 1 : 0);
  }

  if (args.has('--priority')) {
    const priority = [
      ...hardFailed.map((r) => ({ kind: 'HARD', url: `/${r.category}/${r.slug}`, reasons: r.hardFailures })),
      ...thin
        .filter((r) => r.hardFailures.length === 0)
        .sort((a, b) => a.wordCount - b.wordCount)
        .slice(0, 10)
        .map((r) => ({ kind: 'EXPAND', url: `/${r.category}/${r.slug}`, words: r.wordCount })),
    ];
    process.stdout.write(JSON.stringify(priority, null, 2));
    process.exit(0);
  }

  // Human report
  const out = [];
  out.push('=== Content QA Scan ===\n');
  out.push(`Total articles: ${summary.totalArticles}`);
  out.push(`Hard failures:  ${summary.hardFailureCount}  (CI-blocking)`);
  out.push(`Thin (<${MIN_WORD_COUNT}w): ${summary.thinCount}`);
  out.push(`Missing/short FAQ: ${summary.missingFaqCount}`);
  if (cityDup) out.push(`\n[city duplication] ${cityDup}`);

  if (hardFailed.length > 0) {
    out.push('\n=== HARD FAILURES (block deploy) ===');
    for (const r of hardFailed) {
      out.push(`  /${r.category}/${r.slug}`);
      for (const f of r.hardFailures) out.push(`     × ${f}`);
    }
  }

  out.push('\n=== Top 10 thinnest articles (expand priority) ===');
  thin.sort((a, b) => a.wordCount - b.wordCount).slice(0, 10).forEach((r) => {
    out.push(`  ${String(r.wordCount).padStart(5)}w  /${r.category}/${r.slug}`);
  });

  out.push('\n=== Articles per category ===');
  const byCat = {};
  for (const r of results) byCat[r.category] = (byCat[r.category] || 0) + 1;
  for (const [c, n] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
    out.push(`  ${String(n).padStart(3)}  ${c}`);
  }

  process.stdout.write(out.join('\n') + '\n');
  process.exit(hardFailed.length > 0 ? 1 : 0);
}

main();
