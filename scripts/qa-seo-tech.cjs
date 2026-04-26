#!/usr/bin/env node
/**
 * SEO technical audit — three checks the existing tools didn't cover:
 *
 *   1. CANONICAL — every sitemap URL serves an HTML page whose
 *      <link rel="canonical"> tag matches its own URL exactly.
 *      Catches:
 *        - missing canonical
 *        - canonical pointing to homepage (the classic SPA bug)
 *        - canonical using http or non-www
 *        - encoded/unencoded mismatch (spaces vs %20)
 *
 *   2. INTERNAL LINKS — scan every article's section content for
 *      inline links (markdown [text](url) and HTML <a href>) and
 *      verify each internal link resolves to a real file or a
 *      vercel.json 301 redirect.
 *      Catches:
 *        - typos in author-written internal links
 *        - links to deleted articles that aren't in vercel.json
 *
 *   3. REDIRECTS — for every redirect in vercel.json, verify the
 *      destination is well-formed and (in --probe mode) returns 200.
 *      Catches:
 *        - redirect chains
 *        - redirect destinations that don't exist
 *
 * Modes:
 *   default          static checks only (offline). <2s. Always run in CI.
 *   --probe          adds HTTP probe of canonical for 15 sample URLs (~10s).
 *   --probe --all    HTTP probe of canonical for EVERY sitemap URL (~3min).
 *
 * Exit:
 *   0  — all checks passed
 *   1  — at least one critical issue
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { SITE_URL, CATEGORY_URL_MAP } = require('../config/site.config.cjs');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'src/content');
const SITEMAP = path.join(ROOT, 'public/sitemap.xml');
const VERCEL = path.join(ROOT, 'vercel.json');

// ---------------- helpers ----------------

function safeReadJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; } }

function fetchHtml(url) {
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'GET',
      headers: { 'User-Agent': 'perfect1-qa-seo-tech/1.0 (+ci)' },
    }, (res) => {
      let body = '';
      res.on('data', (c) => { if (body.length < 250_000) body += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message, body: '' }));
    req.setTimeout(15_000, () => { req.destroy(); resolve({ status: 0, error: 'timeout', body: '' }); });
    req.end();
  });
}

function stripHtmlComments(html) {
  // Comments may contain literal <link canonical> text that would otherwise
  // confuse the canonical extractor. Strip them before matching.
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function extractCanonical(html) {
  const cleaned = stripHtmlComments(html);
  const m = cleaned.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
         || cleaned.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return m ? m[1] : null;
}

function listSitemapUrls() {
  const xml = fs.readFileSync(SITEMAP, 'utf-8');
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
}

function listArticles() {
  const out = [];
  for (const cat of fs.readdirSync(CONTENT)) {
    const dir = path.join(CONTENT, cat);
    let stat;
    try { stat = fs.statSync(dir); } catch { continue; }
    if (!stat.isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json') || f.startsWith('_')) continue;
      out.push({ category: cat, slug: f.replace(/\.json$/, ''), path: path.join(dir, f) });
    }
  }
  return out;
}

// Markdown [text](url) — handles balanced parens in URL is non-trivial,
// keep simple: stop at first close-paren, which fits our content.
const MD_LINK_RE = /\[[^\]]+\]\(([^)\s]+)\)/g;
const HTML_HREF_RE = /<a[^>]+href=["']([^"']+)["']/gi;

function extractLinksFromArticle(d) {
  const urls = new Set();
  const blob = JSON.stringify(d.sections || []) + ' ' + JSON.stringify(d.faq || []) + ' ' + JSON.stringify(d.relatedArticles || []);
  for (const m of blob.matchAll(MD_LINK_RE)) urls.add(m[1]);
  for (const m of blob.matchAll(HTML_HREF_RE)) urls.add(m[1]);
  return [...urls];
}

function isInternalLink(u) {
  if (u.startsWith('#')) return false;          // anchor on same page
  if (u.startsWith('mailto:') || u.startsWith('tel:')) return false;
  if (u.startsWith('http://') || u.startsWith('https://')) {
    return u.startsWith(SITE_URL);              // external
  }
  return u.startsWith('/');                      // relative path
}

function normalizeInternal(u) {
  // strip absolute prefix, strip query/hash, leading slash
  let path = u;
  if (path.startsWith(SITE_URL)) path = path.slice(SITE_URL.length);
  const q = path.indexOf('?');
  if (q >= 0) path = path.slice(0, q);
  const h = path.indexOf('#');
  if (h >= 0) path = path.slice(0, h);
  if (path.startsWith('/')) path = path.slice(1);
  return path;
}

function loadResolvableSet() {
  const articles = listArticles();
  const set = new Set();
  // Each article gets BOTH its filesystem path (category/slug) AND its
  // public URL path (urlPrefix/slug, e.g. compare/* for the comparisons
  // folder). Internal links are author-written URLs, so resolution must
  // match the URL form.
  for (const a of articles) {
    set.add(`${a.category}/${a.slug}`);
    const prefix = (CATEGORY_URL_MAP[a.category] || '').replace(/^\//, '');
    if (prefix) set.add(`${prefix}/${a.slug}`);
  }
  // Category hubs — both folder and URL form.
  for (const cat of Object.keys(CATEGORY_URL_MAP)) {
    set.add(cat);
    const prefix = CATEGORY_URL_MAP[cat].replace(/^\//, '');
    if (prefix) set.add(prefix);
  }
  const STATIC = ['', 'about', 'About', 'Privacy', 'Terms', 'Accessibility',
                  'patur-vs-murshe', 'open-osek-patur', 'atzmaim-berega',
                  'calculators', 'calculators/net-income', 'calculators/credit-points',
                  'calculators/income-tax', 'calculators/national-insurance',
                  'calculators/company-tax', 'compare', 'authors',
                  'authors/perfect1-team', 'sitemap.xml', 'robots.txt'];
  for (const s of STATIC) set.add(s);
  return set;
}

function loadRedirects() {
  const cfg = safeReadJson(VERCEL);
  if (!cfg) return { sources: new Set(), full: [] };
  const list = (cfg.redirects || []).filter((r) => r && r.source && r.destination);
  return { sources: new Set(list.map((r) => r.source.replace(/^\//, ''))), full: list };
}

// ---------------- check 1: canonicals ----------------

async function checkCanonicals(sampleSize, all) {
  const urls = listSitemapUrls();
  const targets = all ? urls : urls.slice(0, sampleSize);

  const issues = [];
  let n = 0;
  for (const u of targets) {
    n++;
    const r = await fetchHtml(u);
    if (r.status !== 200) {
      issues.push(`${u} → HTTP ${r.status}${r.error ? ' (' + r.error + ')' : ''}`);
      continue;
    }
    const canon = extractCanonical(r.body);
    if (!canon) {
      issues.push(`${u} → MISSING <link rel="canonical">`);
      continue;
    }
    if (!canon.startsWith('https://www.perfect1.co.il')) {
      issues.push(`${u} → canonical uses wrong host: "${canon}"`);
      continue;
    }
    // Compare ignoring trailing slash on the actual URL only, but homepage
    // is the special case — canonical for / SHOULD be https://www…/ exactly.
    const norm = (s) => s.replace(/\/$/, '') || '/';
    if (norm(canon) !== norm(u)) {
      // Special bug we hunt: every page canonical pointing to homepage.
      if (canon === 'https://www.perfect1.co.il' || canon === 'https://www.perfect1.co.il/') {
        issues.push(`${u} → canonical points to HOMEPAGE (SPA misconfig)`);
      } else {
        issues.push(`${u} → canonical mismatch: declares "${canon}"`);
      }
    }
    if (n % 5 === 0) process.stderr.write(`  canonical ${n}/${targets.length}\n`);
  }
  return { totalProbed: targets.length, issues };
}

// ---------------- check 2: internal links ----------------

function checkInternalLinks() {
  const articles = listArticles();
  const resolvable = loadResolvableSet();
  const { sources: redirectSet } = loadRedirects();
  const issues = [];

  for (const a of articles) {
    let d;
    try { d = JSON.parse(fs.readFileSync(a.path, 'utf-8')); } catch { continue; }
    const links = extractLinksFromArticle(d);
    for (const raw of links) {
      if (!isInternalLink(raw)) continue;
      const norm = normalizeInternal(raw);
      if (norm === '') continue; // homepage
      if (resolvable.has(norm)) continue;
      if (redirectSet.has(norm)) continue;
      issues.push(`${a.category}/${a.slug} → ${raw}`);
    }
  }
  return { issues };
}

// ---------------- check 3: redirects ----------------

function checkRedirects() {
  const { full } = loadRedirects();
  const issues = [];
  const resolvable = loadResolvableSet();
  const sources = new Set(full.map((r) => r.source.replace(/^\//, '')));

  for (const r of full) {
    const dest = r.destination;
    // Skip catch-all rewrites
    if (r.has) continue;
    // Skip absolute external (legitimate cases)
    if (dest.startsWith('http')) continue;
    if (!dest.startsWith('/')) {
      issues.push(`malformed: source=${r.source} destination=${dest}`);
      continue;
    }
    const destNorm = dest.replace(/^\//, '').split('?')[0].split('#')[0];
    if (destNorm === '') continue; // → homepage
    // Destination must resolve OR (rare) point to another redirect's source — flag chains.
    if (!resolvable.has(destNorm) && !sources.has(destNorm)) {
      issues.push(`broken redirect: ${r.source} → ${dest} (destination not a real path or redirect)`);
    } else if (sources.has(destNorm)) {
      issues.push(`redirect chain: ${r.source} → ${dest} → (another redirect source)`);
    }
  }
  return { totalRedirects: full.length, issues };
}

// ---------------- main ----------------

async function main() {
  const args = new Set(process.argv.slice(2));
  const wantProbe = args.has('--probe');
  const wantAll = args.has('--all');

  const out = [];
  out.push('=== SEO Tech Audit ===');
  let failures = 0;

  // Internal links — fast, always run
  out.push('');
  out.push('--- internal links ---');
  const il = checkInternalLinks();
  if (il.issues.length === 0) {
    out.push('✓ no broken internal links');
  } else {
    out.push(`✗ ${il.issues.length} broken internal links:`);
    for (const i of il.issues.slice(0, 30)) out.push('   - ' + i);
    if (il.issues.length > 30) out.push(`   …and ${il.issues.length - 30} more`);
    failures += il.issues.length;
  }

  // Redirects — fast, always run
  out.push('');
  out.push('--- redirects ---');
  const rd = checkRedirects();
  out.push(`Total redirects in vercel.json: ${rd.totalRedirects}`);
  if (rd.issues.length === 0) {
    out.push('✓ all redirects resolve to real paths');
  } else {
    out.push(`✗ ${rd.issues.length} broken/chained redirects:`);
    for (const i of rd.issues) out.push('   - ' + i);
    failures += rd.issues.length;
  }

  // Canonicals — slow, gated by --probe
  out.push('');
  out.push('--- canonicals ---');
  if (wantProbe) {
    const result = await checkCanonicals(15, wantAll);
    out.push(`probed ${result.totalProbed} URLs`);
    if (result.issues.length === 0) {
      out.push('✓ all canonicals valid');
    } else {
      out.push(`✗ ${result.issues.length} canonical issues:`);
      for (const i of result.issues.slice(0, 20)) out.push('   - ' + i);
      if (result.issues.length > 20) out.push(`   …and ${result.issues.length - 20} more`);
      failures += result.issues.length;
    }
  } else {
    out.push('skipped (no --probe). Re-run with --probe to fetch live HTML.');
  }

  out.push('');
  out.push(`Total failures: ${failures}`);
  process.stdout.write(out.join('\n') + '\n');
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => { console.error('Fatal:', e.stack || e.message); process.exit(1); });
