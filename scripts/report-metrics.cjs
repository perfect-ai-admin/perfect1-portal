/**
 * SEO automation metrics report — last 7 days from seo_runs.
 *
 * Run: SUPABASE_SERVICE_KEY=... node scripts/report-metrics.cjs
 *
 * Output: console table with rejection_rate + publishing_rate per script.
 */
const sb = require('../lib/supabase-client.cjs');
const log = require('../lib/logger.cjs').create('report-metrics');

function pct(num, den) {
  if (!den) return '—';
  return `${((num / den) * 100).toFixed(1)}%`;
}

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

async function main() {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceISO = since.toISOString();

  const rows = await sb.get(
    `/seo_runs?select=*&started_at=gte.${sinceISO}&order=started_at.desc`,
  );
  if (rows.length === 0) {
    log.info('no runs in last 7 days');
    return;
  }
  log.info('runs fetched', { count: rows.length });

  // Aggregate by script
  const byScript = {};
  for (const r of rows) {
    const s = r.script || 'unknown';
    if (!byScript[s]) {
      byScript[s] = { runs: 0, ideas: 0, passed: 0, failed: 0, published: 0, errors: 0, succeeded: 0, failedRuns: 0 };
    }
    const b = byScript[s];
    b.runs++;
    b.ideas += r.ideas_processed || 0;
    b.passed += r.passed_gate || 0;
    b.failed += r.failed_gate || 0;
    b.published += r.published || 0;
    b.errors += r.errors || 0;
    if (r.status === 'failed') b.failedRuns++;
    else b.succeeded++;
  }

  // Print table
  console.log('');
  console.log('=== SEO Runs — Last 7 Days ===');
  console.log('');
  console.log(`${pad('script', 32)} ${pad('runs', 6)} ${pad('ideas', 7)} ${pad('passed', 7)} ${pad('failed', 7)} ${pad('publ', 6)} ${pad('errors', 7)} ${pad('reject%', 9)} ${pad('publish%', 10)}`);
  console.log('-'.repeat(110));
  for (const [name, b] of Object.entries(byScript)) {
    const rejectRate = pct(b.failed, b.passed + b.failed);
    const publishRate = pct(b.published, b.ideas);
    console.log(
      `${pad(name, 32)} ${pad(b.runs, 6)} ${pad(b.ideas, 7)} ${pad(b.passed, 7)} ${pad(b.failed, 7)} ${pad(b.published, 6)} ${pad(b.errors, 7)} ${pad(rejectRate, 9)} ${pad(publishRate, 10)}`,
    );
  }

  // Totals
  const totals = Object.values(byScript).reduce(
    (a, b) => ({
      runs: a.runs + b.runs,
      ideas: a.ideas + b.ideas,
      passed: a.passed + b.passed,
      failed: a.failed + b.failed,
      published: a.published + b.published,
      errors: a.errors + b.errors,
    }),
    { runs: 0, ideas: 0, passed: 0, failed: 0, published: 0, errors: 0 },
  );
  console.log('-'.repeat(110));
  console.log(
    `${pad('TOTAL', 32)} ${pad(totals.runs, 6)} ${pad(totals.ideas, 7)} ${pad(totals.passed, 7)} ${pad(totals.failed, 7)} ${pad(totals.published, 6)} ${pad(totals.errors, 7)} ${pad(pct(totals.failed, totals.passed + totals.failed), 9)} ${pad(pct(totals.published, totals.ideas), 10)}`,
  );
  console.log('');
}

main().catch(e => {
  log.error('fatal', { msg: e.message });
  process.exit(1);
});
