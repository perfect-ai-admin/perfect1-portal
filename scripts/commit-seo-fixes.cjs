/**
 * Commits SEO fix batch to GitHub main via API tree (one atomic commit).
 * Reads a list of paths to commit, only includes files that actually changed.
 *
 * Refactored to use lib/* and config/site.config.cjs.
 */
const fs = require('fs');
const path = require('path');

const gh = require('../lib/github-client.cjs');
const log = require('../lib/logger.cjs').create('commit-seo-fixes');

if (!process.env.GH_TOKEN) { log.error('Set GH_TOKEN'); process.exit(1); }

const ROOT = path.resolve(__dirname, '..');

// Explicit paths to commit (infra + scripts)
const explicit = [
  'scripts/generate-sitemap.js',
  'scripts/fix-long-meta-titles.js',
  'scripts/fix-short-meta-descriptions.js',
  'scripts/generate-static.js',
  'public/sitemap.xml',
  'package.json',
  'vercel.json',
];

const contentDir = path.join(ROOT, 'src/content');
const contentFiles = [];
for (const cat of fs.readdirSync(contentDir)) {
  const catDir = path.join(contentDir, cat);
  if (!fs.statSync(catDir).isDirectory()) continue;
  for (const f of fs.readdirSync(catDir)) {
    if (!f.endsWith('.json')) continue;
    contentFiles.push(`src/content/${cat}/${f}`);
  }
}

const allPaths = [...explicit, ...contentFiles];

async function fileChanged(localPath) {
  try {
    const localContent = fs.readFileSync(path.join(ROOT, localPath), 'utf-8');
    const remoteContent = await gh.readFile(localPath);
    if (remoteContent === null) return { changed: true, content: localContent };
    if (remoteContent === localContent) return { changed: false };
    return { changed: true, content: localContent };
  } catch {
    return { changed: false };
  }
}

(async function main() {
  log.info('checking files', { count: allPaths.length });
  const changed = [];
  let i = 0;
  for (const p of allPaths) {
    i++;
    if (i % 20 === 0) log.info('progress', { checked: i, changed: changed.length });
    const result = await fileChanged(p);
    if (result.changed) changed.push({ path: p, content: result.content });
  }
  log.info('changed', { count: changed.length });
  if (changed.length === 0) { log.info('nothing to commit'); return; }

  const sha = await gh.commitBatch({
    files: changed,
    message: `SEO: sitemap auto-gen + Article schema + cache headers + meta fixes (${changed.length} files)`,
  });
  log.info('committed', { sha: sha.slice(0,10) });
})().catch(e => {
  log.error('fatal', { msg: e.message });
  process.exit(1);
});
