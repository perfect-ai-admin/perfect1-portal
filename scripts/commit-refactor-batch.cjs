/**
 * One-shot: commits all refactor files (config, lib, scripts, tests, migrations, CI) atomically.
 * Creates a single commit on main via GitHub API tree.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GH_TOKEN;
if (!TOKEN) { console.error('Set GH_TOKEN'); process.exit(1); }
const REPO = 'perfect-ai-admin/perfect1-portal';
const ROOT = path.resolve(__dirname, '..');

const paths = [
  // Config + lib (new infrastructure)
  'config/site.config.cjs',
  'lib/ai-provider.cjs',
  'lib/github-client.cjs',
  'lib/logger.cjs',
  'lib/supabase-client.cjs',
  'lib/url-mapper.cjs',
  // Refactored scripts
  'scripts/notify-google-indexing.cjs',
  'scripts/notify-indexnow.cjs',
  'scripts/submit-sitemap-gsc.cjs',
  'scripts/check-indexation-status.cjs',
  'scripts/bulk-request-indexing.cjs',
  'scripts/backfill-faq.cjs',
  'scripts/fix-broken-internal-links.cjs',
  'scripts/commit-seo-fixes.cjs',
  // New helper scripts
  'scripts/report-metrics.cjs',
  'scripts/check-duplicate.cjs',
  'scripts/commit-refactor-batch.cjs',
  // Tests
  'tests/url-mapper.test.js',
  'tests/quality-gate.test.js',
  // Migrations
  'supabase/migrations/20260426100000_seo_runs_observability.sql',
  'supabase/migrations/20260426110000_seo_runs_observability_v2.sql',
  // Docs
  'docs/STAGING.md',
  // CI
  '.github/workflows/deploy.yml',
  // package + lock (vitest devDep + test script)
  'package.json',
  'package-lock.json',
];

function gh(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com', port: 443, path: '/repos/' + REPO + p, method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'testbot',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch (e) { resolve({ status: res.statusCode, body: b }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async function main() {
  console.log('Reading parent...');
  const ref = await gh('GET', '/git/ref/heads/main');
  const parentSha = ref.body.object.sha;
  const pc = await gh('GET', '/git/commits/' + parentSha);
  const baseTree = pc.body.tree.sha;
  console.log(`parent: ${parentSha.slice(0,10)} | tree: ${baseTree.slice(0,10)}`);

  console.log(`Uploading ${paths.length} blobs...`);
  const tree = [];
  for (const p of paths) {
    const local = path.join(ROOT, p);
    if (!fs.existsSync(local)) {
      console.log(`  SKIP missing: ${p}`);
      continue;
    }
    const content = fs.readFileSync(local);
    const blob = await gh('POST', '/git/blobs', {
      content: content.toString('base64'),
      encoding: 'base64',
    });
    if (!blob.body.sha) {
      console.log(`  FAIL blob ${p}: ${JSON.stringify(blob.body).slice(0,100)}`);
      continue;
    }
    tree.push({ path: p, mode: '100644', type: 'blob', sha: blob.body.sha });
    process.stdout.write('.');
  }
  console.log(`\n${tree.length} blobs uploaded`);

  const tr = await gh('POST', '/git/trees', { base_tree: baseTree, tree });
  if (!tr.body.sha) {
    console.error('TREE FAIL:', JSON.stringify(tr.body).slice(0,300));
    process.exit(1);
  }
  console.log(`tree: ${tr.body.sha.slice(0,10)}`);

  const cm = await gh('POST', '/git/commits', {
    message: 'Refactor: extract config + lib + tests + CI test step (production hardening)',
    tree: tr.body.sha,
    parents: [parentSha],
  });
  if (!cm.body.sha) {
    console.error('COMMIT FAIL:', JSON.stringify(cm.body).slice(0,300));
    process.exit(1);
  }
  console.log(`commit: ${cm.body.sha.slice(0,10)}`);

  const upd = await gh('PATCH', '/git/refs/heads/main', { sha: cm.body.sha, force: false });
  console.log(`ref update: ${upd.status}`);
  console.log(`\nhttps://github.com/${REPO}/commit/${cm.body.sha}`);
  console.log(`\nCOMMIT_SHA=${cm.body.sha}`);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
