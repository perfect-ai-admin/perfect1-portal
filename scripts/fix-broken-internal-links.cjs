/**
 * Fix broken internal links in all article JSONs.
 *
 * 1. Scans src/content/{cat}/*.json — builds map of existing article paths
 * 2. For each article's relatedArticles, checks if target exists
 * 3. Fixes:
 *    - Strips leading '//'
 *    - Re-maps wrong category
 *    - For missing slugs → replaces with priority hub link
 *    - Pads to 4 if related count < 4
 * 4. Commits batch via GitHub Tree API
 *
 * Refactored to use lib/* and config/site.config.cjs.
 */
const fs = require('fs');
const path = require('path');

const { PRIORITY_HUBS } = require('../config/site.config.cjs');
const gh = require('../lib/github-client.cjs');
const log = require('../lib/logger.cjs').create('fix-internal-links');

if (!process.env.GH_TOKEN) { log.error('Set GH_TOKEN'); process.exit(1); }

const CONTENT_DIR = path.resolve(__dirname, '../src/content');

// Build index of existing articles
const existing = new Set();
const slugIndex = {};
for (const cat of fs.readdirSync(CONTENT_DIR)) {
  const catDir = path.join(CONTENT_DIR, cat);
  if (!fs.statSync(catDir).isDirectory()) continue;
  for (const f of fs.readdirSync(catDir)) {
    if (f.startsWith('_') || !f.endsWith('.json')) continue;
    const slug = f.replace('.json', '');
    existing.add(`${cat}/${slug}`);
    (slugIndex[slug] = slugIndex[slug] || []).push(cat);
  }
}
log.info('articles loaded', { count: existing.size });

function bestPathForSlug(slug) {
  const cats = slugIndex[slug];
  if (!cats) return null;
  const pref = ['osek-patur','osek-murshe','hevra-bam','sgirat-tikim','guides'];
  for (const p of pref) if (cats.includes(p)) return `${p}/${slug}`;
  return `${cats[0]}/${slug}`;
}

function normalizeRelated(r) {
  let category, slug, title;
  if (typeof r === 'string') {
    let s = r.trim().replace(/^\/+/, '');
    const parts = s.split('/').filter(Boolean);
    if (parts.length >= 2) { category = parts[0]; slug = parts[1]; }
    else return null;
  } else if (r && typeof r === 'object') {
    category = (r.category || '').replace(/^\/+/,'').replace(/\/$/,'');
    slug = (r.slug || '').replace(/^\/+/,'').replace(/\/$/,'');
    title = r.title;
  } else return null;

  if (!category || !slug) return null;

  const target = `${category}/${slug}`;
  if (existing.has(target)) return { category, slug, title: title || '' };

  const remap = bestPathForSlug(slug);
  if (remap && remap !== target) {
    const [newCat, newSlug] = remap.split('/');
    return { category: newCat, slug: newSlug, title: title || '', _remapped: true };
  }
  return null;
}

function pickRelated(original, selfCategory, selfSlug) {
  const kept = [];
  const seen = new Set([`${selfCategory}/${selfSlug}`]);
  for (const r of (original || [])) {
    const fixed = normalizeRelated(r);
    if (!fixed) continue;
    const key = `${fixed.category}/${fixed.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push({ category: fixed.category, slug: fixed.slug, title: fixed.title });
    if (kept.length >= 4) break;
  }
  for (const h of PRIORITY_HUBS) {
    if (kept.length >= 4) break;
    const key = `${h.category}/${h.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push({ category: h.category, slug: h.slug, title: h.title });
  }
  return kept;
}

const changes = [];
for (const cat of fs.readdirSync(CONTENT_DIR)) {
  const catDir = path.join(CONTENT_DIR, cat);
  if (!fs.statSync(catDir).isDirectory()) continue;
  for (const f of fs.readdirSync(catDir)) {
    if (f.startsWith('_') || !f.endsWith('.json')) continue;
    const filePath = path.join(catDir, f);
    let data;
    try { data = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { continue; }

    const slug = f.replace('.json','');
    const original = data.relatedArticles || [];
    const newList = pickRelated(original, cat, slug);

    const before = JSON.stringify(original);
    const after = JSON.stringify(newList);
    if (before !== after) {
      data.relatedArticles = newList;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      changes.push({
        path: `src/content/${cat}/${f}`,
        content: JSON.stringify(data, null, 2) + '\n',
      });
    }
  }
}
log.info('files needing fixes', { count: changes.length });

(async function main() {
  if (changes.length === 0) { log.info('nothing to commit'); return; }
  const sha = await gh.commitBatch({
    files: changes,
    message: `Fix: broken internal links in ${changes.length} articles + add priority hubs`,
  });
  log.info('committed', { sha: sha.slice(0,10) });
})().catch(e => {
  log.error('fatal', { msg: e.message });
  process.exit(1);
});
