/**
 * Duplicate-article detection helper for F33.
 *
 * Usage as CLI:
 *   SUPABASE_SERVICE_KEY=... node scripts/check-duplicate.cjs <slug> "<title>"
 *   exit 0 → no duplicate, safe to publish
 *   exit 2 → duplicate found, skip
 *   exit 1 → error
 *
 * Usage as module (n8n Code node, when wired up):
 *   const { isDuplicate } = require('./scripts/check-duplicate.cjs');
 *   const dup = await isDuplicate({ slug, title });
 */
const sb = require('../lib/supabase-client.cjs');
const log = require('../lib/logger.cjs').create('check-duplicate');

async function isDuplicate({ slug, title }) {
  if (!slug && !title) return { duplicate: false, reason: 'no slug or title' };

  // Match on slug (exact) OR title ILIKE
  const conditions = [];
  if (slug) conditions.push(`slug.eq.${encodeURIComponent(slug)}`);
  if (title) {
    // PostgREST `ilike.*foo*`
    const safe = title.replace(/[*,]/g, ' ').slice(0, 80);
    conditions.push(`title.ilike.*${encodeURIComponent(safe)}*`);
  }
  const orClause = conditions.join(',');
  const path = `/seo_published_articles?select=id,slug,title,created_at&or=(${orClause})&limit=5`;

  const rows = await sb.get(path);
  if (rows.length === 0) return { duplicate: false };
  return {
    duplicate: true,
    matches: rows.map(r => ({ id: r.id, slug: r.slug, title: r.title, created_at: r.created_at })),
  };
}

async function main() {
  const slug = process.argv[2];
  const title = process.argv[3];
  if (!slug && !title) {
    log.error('usage: check-duplicate.cjs <slug> "<title>"');
    process.exit(1);
  }
  const result = await isDuplicate({ slug, title });
  if (result.duplicate) {
    log.warn('duplicate found', { matches: result.matches });
    process.exit(2);
  }
  log.info('no duplicate', { slug, title });
  process.exit(0);
}

if (require.main === module) {
  main().catch(e => { log.error('fatal', { msg: e.message }); process.exit(1); });
}

module.exports = { isDuplicate };
