#!/usr/bin/env node
/**
 * Project health report — one screen, no fluff.
 *
 * Reads from the file system (always works), and optionally pulls
 * GitHub Actions + Supabase data when the relevant env/CLI is available.
 * Designed so it never errors out — degraded info is better than no info.
 *
 *   $ node scripts/report-health.cjs
 *   $ node scripts/report-health.cjs --json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTENT = path.join(ROOT, 'src/content');
const SITEMAP = path.join(ROOT, 'public/sitemap.xml');
const PKG = path.join(ROOT, 'package.json');
const VERCEL = path.join(ROOT, 'vercel.json');
const SUPABASE_MIGRATIONS = path.join(ROOT, 'supabase/migrations');
const SUPABASE_FUNCTIONS = path.join(ROOT, 'supabase/functions');

function safeRead(p) { try { return fs.readFileSync(p, 'utf-8'); } catch { return null; } }
function safeReadJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; } }
function safeExec(cmd) { try { return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim(); } catch { return null; } }

function gitFacts() {
  return {
    branch: safeExec('git rev-parse --abbrev-ref HEAD'),
    head: safeExec('git rev-parse --short HEAD'),
    headFullSha: safeExec('git rev-parse HEAD'),
    headSubject: safeExec('git log -1 --pretty=%s'),
    headDate: safeExec('git log -1 --pretty=%ci'),
    aheadOfMain: parseInt(safeExec('git rev-list --count origin/main..HEAD') || '0', 10),
    behindMain: parseInt(safeExec('git rev-list --count HEAD..origin/main') || '0', 10),
    untracked: parseInt(safeExec('git ls-files --others --exclude-standard | wc -l') || '0', 10),
  };
}

function sitemapFacts() {
  const xml = safeRead(SITEMAP);
  if (!xml) return { exists: false };
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  const lastmodMatch = xml.match(/<lastmod>([^<]+)<\/lastmod>/);
  return {
    exists: true,
    bytes: Buffer.byteLength(xml),
    urlCount: urls.length,
    startsWithXmlDecl: xml.startsWith('<?xml'),
    sampleLastmod: lastmodMatch ? lastmodMatch[1] : null,
  };
}

function contentFacts() {
  const cats = {};
  const articles = [];
  for (const cat of fs.readdirSync(CONTENT)) {
    const dir = path.join(CONTENT, cat);
    let stat;
    try { stat = fs.statSync(dir); } catch { continue; }
    if (!stat.isDirectory()) continue;
    if (cat === 'authors') continue;
    cats[cat] = 0;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json') || f.startsWith('_')) continue;
      cats[cat]++;
      let d;
      try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')); } catch { continue; }
      // Same word counting as qa-content-scan.cjs (kept in sync deliberately).
      let text = '';
      for (const s of d.sections || []) {
        if (s.content) text += ' ' + (typeof s.content === 'string' ? s.content : JSON.stringify(s.content));
        if (s.title) text += ' ' + s.title;
        if (s.answerBlock) text += ' ' + s.answerBlock;
        if (s.description) text += ' ' + s.description;
        if (Array.isArray(s.items)) text += ' ' + s.items.map((i) => typeof i === 'string' ? i : (i.text || i.content || '')).join(' ');
      }
      for (const fa of d.faq || []) text += ' ' + (fa.question || '') + ' ' + (fa.answer || '');
      const wc = (text.trim().match(/\S+/g) || []).length;
      articles.push({ cat, slug: f.replace(/\.json$/, ''), wc, faq: (d.faq || []).length });
    }
  }
  const thinThreshold = 1200;
  const thin = articles.filter((a) => a.wc < thinThreshold);
  const noFaq = articles.filter((a) => a.faq < 3);
  return {
    totalArticles: articles.length,
    byCategory: cats,
    thinThreshold,
    thinCount: thin.length,
    missingFaqCount: noFaq.length,
  };
}

function relatedLinkFacts() {
  const cats = fs.readdirSync(CONTENT).filter((c) => {
    try { return fs.statSync(path.join(CONTENT, c)).isDirectory(); } catch { return false; }
  });
  const articleSet = new Set();
  const articleFiles = [];
  for (const cat of cats) {
    for (const f of fs.readdirSync(path.join(CONTENT, cat))) {
      if (!f.endsWith('.json') || f.startsWith('_')) continue;
      const slug = f.replace(/\.json$/, '');
      articleSet.add(`${cat}/${slug}`);
      articleFiles.push({ cat, slug, path: path.join(CONTENT, cat, f) });
    }
  }
  const vcfg = safeReadJson(VERCEL) || {};
  const redirectSet = new Set((vcfg.redirects || []).map((r) => (r.source || '').replace(/^\//, '')));
  let broken = 0;
  for (const a of articleFiles) {
    let d;
    try { d = JSON.parse(fs.readFileSync(a.path, 'utf-8')); } catch { continue; }
    for (const r of d.relatedArticles || []) {
      if (!r.category || !r.slug || r.slug === 'undefined' || r.category === 'undefined') { broken++; continue; }
      const key = `${r.category}/${r.slug}`;
      if (!articleSet.has(key) && !redirectSet.has(key)) broken++;
    }
  }
  return { brokenRelatedCount: broken };
}

function ghActionsFacts() {
  // Best-effort: only works if `gh` CLI is authenticated
  const json = safeExec('gh run list --limit 5 --json status,conclusion,name,headSha,createdAt,workflowName 2>/dev/null');
  if (!json) return { available: false };
  let runs;
  try { runs = JSON.parse(json); } catch { return { available: false }; }
  const lastDeploy = runs.find((r) => r.workflowName === 'Build, Prerender & Deploy' || r.workflowName === 'Build, Prerender &amp; Deploy');
  const lastIndexCheck = runs.find((r) => r.workflowName === 'Daily Indexation Check');
  const failedRecent = runs.filter((r) => r.conclusion && r.conclusion !== 'success').length;
  return {
    available: true,
    last5: runs.length,
    failedRecent,
    lastDeploy: lastDeploy ? { conclusion: lastDeploy.conclusion, sha: (lastDeploy.headSha || '').slice(0, 7), at: lastDeploy.createdAt } : null,
    lastIndexCheck: lastIndexCheck ? { conclusion: lastIndexCheck.conclusion, at: lastIndexCheck.createdAt } : null,
  };
}

async function supabaseFacts() {
  // Best-effort: only if SUPABASE_URL + SUPABASE_SERVICE_KEY are set
  const url = (process.env.SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '').trim();
  if (!url || !key) return { available: false, reason: 'env not set' };

  function get(p) {
    return new Promise((resolve) => {
      const u = new URL(`${url}/rest/v1${p}`);
      https.get({
        hostname: u.hostname, path: u.pathname + u.search,
        headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
      }, (res) => {
        let body = '';
        res.on('data', (c) => { if (body.length < 5000) body += c; });
        res.on('end', () => {
          const total = parseInt(res.headers['content-range']?.split('/').pop() || '0', 10);
          let parsed = null;
          try { parsed = JSON.parse(body); } catch {}
          resolve({ status: res.statusCode, total, body: parsed });
        });
      }).on('error', () => resolve({ status: 0, total: 0 }));
    });
  }

  const indexed = await get('/seo_published_articles?indexed=eq.true&select=slug&limit=1');
  const total = await get('/seo_published_articles?select=slug&limit=1');
  return {
    available: true,
    indexedCount: indexed.total,
    publishedTracked: total.total,
  };
}

function supabaseDriftFacts() {
  // Local-vs-tracked drift in supabase/. Doesn't query the live DB —
  // just compares the working tree to git. Useful as a flag for
  // "you have local changes that haven't been committed".
  function listDir(p) {
    try { return fs.readdirSync(p); } catch { return []; }
  }
  const localMigrations = listDir(SUPABASE_MIGRATIONS).filter((f) => f.endsWith('.sql'));
  const trackedMigrations = (safeExec(`git ls-files supabase/migrations/`) || '')
    .split('\n').filter(Boolean).map((p) => p.split('/').pop());
  const localFunctions = listDir(SUPABASE_FUNCTIONS)
    .filter((f) => { try { return fs.statSync(path.join(SUPABASE_FUNCTIONS, f)).isDirectory(); } catch { return false; } });
  const trackedFunctions = new Set(((safeExec(`git ls-files supabase/functions/`) || '')
    .split('\n').filter(Boolean).map((p) => p.split('/')[2]).filter(Boolean)));
  const untrackedMigrations = localMigrations.filter((m) => !trackedMigrations.includes(m));
  const untrackedFunctions = localFunctions.filter((f) => !trackedFunctions.has(f));
  return {
    localMigrations: localMigrations.length,
    trackedMigrations: trackedMigrations.length,
    untrackedMigrations: untrackedMigrations.length,
    untrackedMigrationNames: untrackedMigrations.slice(0, 5),
    localFunctions: localFunctions.length,
    trackedFunctions: trackedFunctions.size,
    untrackedFunctions: untrackedFunctions.length,
    untrackedFunctionNames: untrackedFunctions,
  };
}

async function main() {
  const args = new Set(process.argv.slice(2));

  const facts = {
    generatedAt: new Date().toISOString(),
    git: gitFacts(),
    sitemap: sitemapFacts(),
    content: contentFacts(),
    related: relatedLinkFacts(),
    ghActions: ghActionsFacts(),
    supabase: await supabaseFacts(),
    supabaseDrift: supabaseDriftFacts(),
  };

  if (args.has('--json')) {
    process.stdout.write(JSON.stringify(facts, null, 2) + '\n');
    return;
  }

  const out = [];
  out.push('=== perfect1.co.il — health report ===');
  out.push(`generated: ${facts.generatedAt}`);
  out.push('');
  out.push('--- git ---');
  out.push(`branch:      ${facts.git.branch}`);
  out.push(`head:        ${facts.git.head}  ${facts.git.headSubject || ''}`);
  out.push(`commits ahead/behind origin/main: ${facts.git.aheadOfMain}/${facts.git.behindMain}`);
  out.push(`untracked:   ${facts.git.untracked} files`);
  out.push('');
  out.push('--- sitemap ---');
  if (facts.sitemap.exists) {
    out.push(`exists:      yes`);
    out.push(`urls:        ${facts.sitemap.urlCount}`);
    out.push(`bytes:       ${facts.sitemap.bytes}`);
    out.push(`xml decl first byte: ${facts.sitemap.startsWithXmlDecl ? 'yes ✓' : 'NO — broken'}`);
    out.push(`sample lastmod: ${facts.sitemap.sampleLastmod || '(none)'}`);
  } else {
    out.push('exists:      NO — run `node scripts/generate-sitemap.js`');
  }
  out.push('');
  out.push('--- content ---');
  out.push(`articles:           ${facts.content.totalArticles}`);
  out.push(`thin (<${facts.content.thinThreshold}w): ${facts.content.thinCount}`);
  out.push(`missing/short FAQ:  ${facts.content.missingFaqCount}`);
  out.push(`broken relatedArticles: ${facts.related.brokenRelatedCount}`);
  out.push(`by category:        ${Object.entries(facts.content.byCategory).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  out.push('');
  out.push('--- github actions ---');
  if (facts.ghActions.available) {
    out.push(`recent runs (last 5): ${facts.ghActions.last5} total, ${facts.ghActions.failedRecent} failed`);
    if (facts.ghActions.lastDeploy) out.push(`last deploy:        ${facts.ghActions.lastDeploy.conclusion} (${facts.ghActions.lastDeploy.sha}) at ${facts.ghActions.lastDeploy.at}`);
    if (facts.ghActions.lastIndexCheck) out.push(`last indexation check: ${facts.ghActions.lastIndexCheck.conclusion} at ${facts.ghActions.lastIndexCheck.at}`);
  } else {
    out.push('not available (gh CLI not authenticated or not installed)');
  }
  out.push('');
  out.push('--- supabase (live) ---');
  if (facts.supabase.available) {
    out.push(`tracked published articles: ${facts.supabase.publishedTracked}`);
    out.push(`indexed=true:               ${facts.supabase.indexedCount}`);
  } else {
    out.push(`not available (${facts.supabase.reason || 'no creds'})`);
  }
  out.push('');
  out.push('--- supabase (local vs git drift) ---');
  out.push(`migrations:   ${facts.supabaseDrift.localMigrations} local, ${facts.supabaseDrift.trackedMigrations} tracked, ${facts.supabaseDrift.untrackedMigrations} untracked`);
  if (facts.supabaseDrift.untrackedMigrations > 0) {
    out.push(`              first untracked: ${facts.supabaseDrift.untrackedMigrationNames.join(', ')}${facts.supabaseDrift.untrackedMigrations > 5 ? ' …' : ''}`);
  }
  out.push(`functions:    ${facts.supabaseDrift.localFunctions} local, ${facts.supabaseDrift.trackedFunctions} tracked, ${facts.supabaseDrift.untrackedFunctions} untracked`);
  if (facts.supabaseDrift.untrackedFunctions > 0) {
    out.push(`              untracked: ${facts.supabaseDrift.untrackedFunctionNames.join(', ')}`);
  }
  out.push('');

  // Threshold flags — printed at the end so they're easy to spot
  const flags = [];
  if (!facts.sitemap.exists) flags.push('sitemap missing');
  if (facts.sitemap.exists && !facts.sitemap.startsWithXmlDecl) flags.push('sitemap.xml does not start with <?xml');
  if (facts.related.brokenRelatedCount > 0) flags.push(`${facts.related.brokenRelatedCount} broken relatedArticles`);
  if (facts.git.untracked > 50) flags.push(`${facts.git.untracked} untracked files (cleanup drift)`);
  if (facts.content.thinCount > facts.content.totalArticles * 0.6) flags.push(`>${Math.round(facts.content.thinCount / facts.content.totalArticles * 100)}% of articles are thin`);
  if (facts.ghActions.available && facts.ghActions.failedRecent >= 2) flags.push(`${facts.ghActions.failedRecent} of last 5 GH Actions runs failed`);
  if (facts.supabaseDrift.untrackedMigrations > 0) flags.push(`${facts.supabaseDrift.untrackedMigrations} supabase migrations untracked (verify applied state)`);
  if (facts.supabaseDrift.untrackedFunctions > 0) flags.push(`${facts.supabaseDrift.untrackedFunctions} supabase edge functions untracked`);

  if (flags.length === 0) {
    out.push('🟢 no flags — project state looks healthy.');
  } else {
    out.push('🔴 flags:');
    for (const f of flags) out.push(`  · ${f}`);
  }

  process.stdout.write(out.join('\n') + '\n');
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(0); });
