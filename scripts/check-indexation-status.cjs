/**
 * Daily indexation tracker.
 *
 * Runs daily via GitHub Actions cron.
 * For every article published in the last 14 days, calls GSC URL Inspection API
 * to check if it's indexed. If not, sends an email alert via Supabase sendEmail.
 *
 * Updates seo_published_articles with `indexed_at`, `last_indexation_check`,
 * and `coverage_state` (auto-creates columns via ALTER if missing — caller's job).
 *
 * Required env:
 *   GOOGLE_SERVICE_ACCOUNT_KEY — service account JSON
 *   SUPABASE_SERVICE_KEY       — Supabase service role
 *   SUPABASE_URL               — https://....supabase.co
 *   ALERT_EMAIL                — destination for unindexed alerts
 */

const { google } = require('googleapis');
const https = require('https');

const SITE_PROPERTY = 'sc-domain:perfect1.co.il';
const SITE_URL = 'https://www.perfect1.co.il';
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://rtlpqjqdmomyptcdkmrq.supabase.co').trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_KEY || '').trim();
const ALERT_EMAIL = (process.env.ALERT_EMAIL || 'yosi5919@gmail.com').trim();
const GSA_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const ALERT_AGE_HOURS = 48; // alert if unindexed after this many hours

function supabaseApi(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const u = new URL(`${SUPABASE_URL}/rest/v1${path}`);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: method === 'PATCH' ? 'return=minimal' : '',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: d ? JSON.parse(d) : null }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function fetchRecentArticles() {
  const since = new Date();
  since.setDate(since.getDate() - 14);
  const sinceISO = since.toISOString();
  const { body } = await supabaseApi(
    'GET',
    `/seo_published_articles?select=id,category,slug,title,created_at,indexed_at&created_at=gte.${sinceISO}&order=created_at.desc`,
  );
  return Array.isArray(body) ? body : [];
}

async function inspectUrl(searchconsole, url) {
  const r = await searchconsole.urlInspection.index.inspect({
    requestBody: { inspectionUrl: url, siteUrl: SITE_PROPERTY },
  });
  return r.data?.inspectionResult?.indexStatusResult || {};
}

async function updateArticleStatus(id, fields) {
  await supabaseApi('PATCH', `/seo_published_articles?id=eq.${id}`, fields);
}

async function sendAlertEmail(unindexed) {
  if (unindexed.length === 0) return;
  const html = `
<div dir="rtl" style="font-family:Arial; max-width:600px;">
  <h2 style="color:#b00020;">⚠️ ${unindexed.length} מאמרים לא באינדקס Google</h2>
  <p>הבדיקה רצה ${new Date().toLocaleDateString('he-IL')}. המאמרים האלה פורסמו לפני 48+ שעות אך עדיין לא באינדקס:</p>
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr style="background:#f5f5f5;"><th align="right">כותרת</th><th align="right">URL</th><th align="right">סטטוס GSC</th><th align="right">פורסם</th></tr>
    ${unindexed.map(u => `
      <tr style="border-bottom:1px solid #eee;">
        <td>${u.title}</td>
        <td><a href="${u.url}">${u.url.replace('https://www.perfect1.co.il','')}</a></td>
        <td>${u.coverageState}</td>
        <td>${new Date(u.created_at).toLocaleDateString('he-IL')}</td>
      </tr>`).join('')}
  </table>
  <h3>פעולה מומלצת:</h3>
  <ol>
    <li>פתח <a href="https://search.google.com/search-console">GSC</a></li>
    <li>בדוק כל URL ישירות → "בקש אינדוקס"</li>
    <li>תוך 24-48 שעות ייכנס לאינדקס</li>
  </ol>
</div>`;
  const payload = JSON.stringify({
    to: ALERT_EMAIL,
    subject: `[Perfect1] ⚠️ ${unindexed.length} מאמרים לא באינדקס`,
    html,
    from: 'Perfect1 SEO Bot <no-reply@perfect1.co.il>',
  });
  return new Promise((resolve) => {
    const u = new URL(`${SUPABASE_URL}/functions/v1/sendEmail`);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ console.log(`Email status: ${res.statusCode}`); resolve(); }); });
    req.on('error', e => { console.error('Email error:', e.message); resolve(); });
    req.write(payload); req.end();
  });
}

async function main() {
  if (!GSA_KEY || !SUPABASE_KEY) {
    console.error('Missing GOOGLE_SERVICE_ACCOUNT_KEY or SUPABASE_SERVICE_KEY');
    process.exit(1);
  }
  const credentials = JSON.parse(GSA_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  console.log('=== Indexation Status Check ===\n');
  const articles = await fetchRecentArticles();
  console.log(`Articles published in last 14 days: ${articles.length}\n`);
  if (articles.length === 0) return;

  const unindexed = [];
  let alreadyIndexed = 0;
  let newlyIndexed = 0;
  let notYet = 0;

  for (const a of articles) {
    const url = `${SITE_URL}/${a.category}/${a.slug}`;
    if (a.indexed_at) { alreadyIndexed++; continue; }

    try {
      const r = await inspectUrl(searchconsole, url);
      const verdict = r.verdict || 'UNKNOWN';
      const cov = r.coverageState || '';
      const isIndexed = verdict === 'PASS' || /Submitted and indexed|Indexed/i.test(cov);
      console.log(`  ${isIndexed ? '✓' : '·'} ${url} | ${cov}`);

      const ageHours = (Date.now() - new Date(a.created_at).getTime()) / 3.6e6;
      const updates = {
        last_indexation_check: new Date().toISOString(),
        coverage_state: cov,
      };
      if (isIndexed) {
        updates.indexed_at = new Date().toISOString();
        newlyIndexed++;
      } else {
        notYet++;
        if (ageHours > ALERT_AGE_HOURS) {
          unindexed.push({ ...a, url, coverageState: cov });
        }
      }
      await updateArticleStatus(a.id, updates);
    } catch (e) {
      console.log(`  ✗ ${url} | API error: ${e.message?.slice(0,80)}`);
    }
    // Rate limit: GSC URL Inspection API is 600 req/min, but be gentle
    await new Promise(r => setTimeout(r, 1100));
  }

  console.log(`\n=== Summary ===`);
  console.log(`Already indexed: ${alreadyIndexed}`);
  console.log(`Newly indexed: ${newlyIndexed}`);
  console.log(`Not yet indexed: ${notYet}`);
  console.log(`Unindexed >${ALERT_AGE_HOURS}h: ${unindexed.length}`);

  if (unindexed.length > 0) {
    console.log('\nSending alert email...');
    await sendAlertEmail(unindexed);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
