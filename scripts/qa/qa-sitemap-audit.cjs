#!/usr/bin/env node
/**
 * Sitemap audit: structural validation + production HTTP check.
 *
 * Three modes:
 *   default          structural checks only (offline). Fast (<1s). Suitable
 *                    for every CI run / pre-commit.
 *   --probe          structural checks + HTTP probe of 20 critical URLs
 *                    (homepage, category hubs, top articles). Adds ~5s.
 *   --probe --all    structural checks + HTTP probe of EVERY sitemap URL.
 *                    Adds ~30-90s depending on URL count.
 *
 * Exit codes:
 *   0  — all checks passed
 *   1  — at least one critical check failed (CI should block)
 *
 * Critical failure modes detected:
 *   - sitemap.xml does not begin with <?xml on the first byte (caught
 *     the cache-purge HTML-comment regression that broke GSC parsing)
 *   - urlset namespace missing
 *   - duplicate URLs
 *   - URLs that don't use https://www.perfect1.co.il
 *   - URLs with whitespace / query strings / unintended trailing slash
 *   - any probed URL returning 4xx/5xx
 *   - any probed URL serving a meta noindex
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { SITE_URL, SITEMAP_URL } = require('../../config/site.config.cjs');

const SITEMAP_PATH = path.resolve(__dirname, '..', '..', 'public', 'sitemap.xml');
const EXPECTED_HOST = SITE_URL; // https://www.perfect1.co.il

// 20 critical URLs to probe by default. Picked because they are
// "if this is broken, the site is broken" pages — homepage, category
// hubs, headline articles, and the sitemap itself.
const CRITICAL_URLS = [
  '/',
  '/sitemap.xml',
  '/About',
  '/calculators',
  '/calculators/net-income',
  '/atzmaim-berega',
  '/patur-vs-murshe',
  '/osek-patur',
  '/osek-patur/how-to-open',
  '/osek-patur/cost',
  '/osek-murshe',
  '/osek-murshe/how-to-open',
  '/osek-murshe/vat-guide',
  '/hevra-bam',
  '/hevra-bam/how-to-open',
  '/guides',
  '/guides/opening-business',
  '/sgirat-tikim',
  '/osek-zeir',
  '/amuta',
];

// --- helpers ---

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'GET', headers: { 'User-Agent': 'perfect1-qa-sitemap-audit/1.0' } }, (res) => {
      let body = '';
      res.on('data', (c) => {
        if (body.length < 200_000) body += c;
      });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message, headers: {}, body: '' }));
    req.setTimeout(15_000, () => { req.destroy(); resolve({ status: 0, error: 'timeout', headers: {}, body: '' }); });
    req.end();
  });
}

function hasNoindex({ status, headers, body }) {
  if (status !== 200) return false;
  const xrt = headers['x-robots-tag'];
  if (xrt && /noindex/i.test(xrt)) return true;
  if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(body)) return true;
  return false;
}

// --- main ---

async function main() {
  const args = new Set(process.argv.slice(2));
  const wantProbe = args.has('--probe');
  const wantAll = args.has('--all');

  const failures = [];
  const warnings = [];

  if (!fs.existsSync(SITEMAP_PATH)) {
    failures.push(`public/sitemap.xml not found. Run "node scripts/generate-sitemap.js" first.`);
    report(failures, warnings, 0);
    return;
  }

  const xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');

  // Structural checks
  if (!xml.startsWith('<?xml')) {
    failures.push('sitemap.xml does not start with <?xml (any leading byte/comment breaks GSC parsing)');
  }
  if (!/<urlset[^>]+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(xml)) {
    failures.push('sitemap.xml missing the sitemaps.org urlset namespace');
  }
  if (!xml.trimEnd().endsWith('</urlset>')) {
    failures.push('sitemap.xml does not close with </urlset>');
  }

  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);

  if (urls.length < 50) failures.push(`sitemap has only ${urls.length} URLs (sanity floor: 50)`);

  // Host check
  const wrongHost = urls.filter((u) => !u.startsWith(EXPECTED_HOST));
  if (wrongHost.length) failures.push(`${wrongHost.length} URLs use the wrong host (expected ${EXPECTED_HOST}): ${wrongHost.slice(0, 3).join(', ')}${wrongHost.length > 3 ? ' …' : ''}`);

  // Duplicates
  const seen = new Map();
  const dupes = [];
  for (const u of urls) {
    const n = (seen.get(u) || 0) + 1;
    seen.set(u, n);
    if (n === 2) dupes.push(u);
  }
  if (dupes.length) failures.push(`${dupes.length} duplicate URLs: ${dupes.slice(0, 3).join(', ')}${dupes.length > 3 ? ' …' : ''}`);

  // Malformed
  const malformed = urls.filter((u) => /\s/.test(u) || u.includes('?') || u.includes('#') || (u !== EXPECTED_HOST + '/' && u.endsWith('/')));
  if (malformed.length) failures.push(`${malformed.length} malformed URLs: ${malformed.slice(0, 3).join(', ')}`);

  // HTTP probe
  if (wantProbe) {
    const targets = wantAll
      ? urls
      : CRITICAL_URLS.map((p) => EXPECTED_HOST + p);

    const probed = [];
    let i = 0;
    for (const u of targets) {
      i++;
      const r = await head(u);
      probed.push({ url: u, status: r.status, error: r.error, noindex: hasNoindex(r) });
      if (i % 10 === 0) process.stderr.write(`  probed ${i}/${targets.length}\n`);
    }

    const bad = probed.filter((p) => p.status !== 200);
    const noidx = probed.filter((p) => p.noindex);
    if (bad.length) failures.push(`${bad.length}/${targets.length} URLs returned non-200: ${bad.slice(0, 5).map((p) => `${p.status} ${p.url}`).join('; ')}`);
    if (noidx.length) failures.push(`${noidx.length} indexable URLs serve a noindex tag: ${noidx.slice(0, 5).map((p) => p.url).join(', ')}`);
  }

  report(failures, warnings, urls.length);
}

function report(failures, warnings, urlCount) {
  console.log(`Sitemap: ${urlCount} URLs`);
  console.log(`Failures: ${failures.length}`);
  console.log(`Warnings: ${warnings.length}`);
  if (failures.length) {
    console.log('\n=== FAILURES (CI-blocking) ===');
    for (const f of failures) console.log('  × ' + f);
  }
  if (warnings.length) {
    console.log('\n=== WARNINGS ===');
    for (const w of warnings) console.log('  ! ' + w);
  }
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Fatal:', e.stack || e.message);
  process.exit(1);
});
