/**
 * Bulk-request indexing for ALL articles that are not yet indexed.
 *
 * One-shot script — run via GitHub Actions workflow_dispatch.
 *
 * What it does:
 * 1. Reads all articles from src/content/{cat}/*.json (skip _category.json)
 * 2. Queries seo_published_articles to filter out articles already confirmed indexed
 * 3. For each unindexed URL:
 *    - POST to Google Indexing API (URL_UPDATED)
 *    - Add to IndexNow batch
 * 4. POST IndexNow batch to api.indexnow.org (Bing + Yandex pickup within hours)
 * 5. Submit sitemap.xml to GSC for re-fetch
 * 6. Report counts to console + send summary email
 *
 * Required env: GOOGLE_SERVICE_ACCOUNT_KEY, SUPABASE_SERVICE_KEY
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { google } = require('googleapis');

const SITE_HOST = 'www.perfect1.co.il';
const SITE_URL = `https://${SITE_HOST}`;
const SITE_PROPERTY = 'sc-domain:perfect1.co.il';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY = 'f192557dbb787a9c644cd9695b63976046d2eef1cd538d7a46318fc51a7e1aa8';
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://rtlpqjqdmomyptcdkmrq.supabase.co').trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_KEY || '').trim();
const ALERT_EMAIL = (process.env.ALERT_EMAIL || 'yosi5919@gmail.com').trim();
const CONTENT_DIR = path.resolve(__dirname, '../src/content');

const CATEGORY_URL_MAP = {
  'osek-patur':'/osek-patur','osek-murshe':'/osek-murshe','hevra-bam':'/hevra-bam',
  'sgirat-tikim':'/sgirat-tikim','guides':'/guides','comparisons':'/compare',
  'osek-zeir':'/osek-zeir','misui':'/misui','maam':'/maam','hashbonaut':'/hashbonaut',
  'mishpati':'/mishpati','shivuk':'/shivuk','tech':'/tech','mimun':'/mimun',
  'miktzoa':'/miktzoa','cities':'/cities','services':'/services','amuta':'/amuta',
  'authors':'/authors',
};

// --- Helpers ---

function listAllArticles() {
  const out = [];
  for (const cat of fs.readdirSync(CONTENT_DIR)) {
    const dir = path.join(CONTENT_DIR, cat);
    if (!fs.statSync(dir).isDirectory()) continue;
    const prefix = CATEGORY_URL_MAP[cat];
    if (!prefix) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith('_') || !f.endsWith('.json')) continue;
      const slug = f.replace('.json', '');
      out.push({ category: cat, slug, url: `${SITE_URL}${prefix}/${slug}` });
    }
  }
  return out;
}

function supabaseGet(query) {
  return new Promise((resolve, reject) => {
    const u = new URL(`${SUPABASE_URL}/rest/v1${query}`);
    https.get({
      hostname: u.hostname, path: u.pathname + u.search,
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(d);
          if (!Array.isArray(parsed)) {
            console.warn(`Supabase returned non-array (status ${res.statusCode}):`, JSON.stringify(parsed).slice(0,200));
            resolve([]);
          } else {
            resolve(parsed);
          }
        } catch (e) { console.warn('Supabase parse error:', e.message); resolve([]); }
      });
    }).on('error', reject);
  });
}

function postIndexNowBatch(urls) {
  const payload = JSON.stringify({
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function sendSummaryEmail(stats) {
  const html = `
<div dir="rtl" style="font-family:Arial; max-width:600px;">
  <h2 style="color:#1a73e8;">🚀 Bulk Indexing Push — סיכום</h2>
  <table style="width:100%; border-collapse:collapse; font-size:14px;">
    <tr><td>סך מאמרים באתר:</td><td><b>${stats.total}</b></td></tr>
    <tr><td>כבר באינדקס:</td><td>${stats.alreadyIndexed}</td></tr>
    <tr><td>שלחנו לאינדקס היום:</td><td><b>${stats.pushed}</b></td></tr>
    <tr><td>Google Indexing API:</td><td>${stats.googleSuccess} OK / ${stats.googleFailed} fail</td></tr>
    <tr><td>IndexNow (Bing/Yandex):</td><td>HTTP ${stats.indexNowStatus}</td></tr>
    <tr><td>Sitemap submitted:</td><td>${stats.sitemapSubmitted ? '✓' : '✗'}</td></tr>
  </table>
  <p style="color:#666; font-size:13px; margin-top:16px;">
    Bing/Yandex יאנדקסו תוך שעות. Google בדרך כלל 1-7 ימים. בדיקה יומית תרוץ ב-12:00 ושלח אלרט אם משהו לא נכנס תוך 48 שעות.
  </p>
</div>`;
  const payload = JSON.stringify({
    to: ALERT_EMAIL,
    subject: `[Perfect1] 🚀 Bulk Indexing — ${stats.pushed} URLs נשלחו`,
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

// --- Main ---

async function main() {
  const credKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credKey || !SUPABASE_KEY) {
    console.error('Missing GOOGLE_SERVICE_ACCOUNT_KEY or SUPABASE_SERVICE_KEY');
    process.exit(1);
  }
  const credentials = JSON.parse(credKey);

  console.log('=== Bulk Indexing Push ===\n');

  // 1. List all articles
  const all = listAllArticles();
  console.log(`Articles in src/content: ${all.length}`);

  // 2. Filter out already-indexed
  let indexed = [];
  try {
    indexed = await supabaseGet('/seo_published_articles?select=category,slug,indexed_at&indexed_at=not.is.null');
  } catch (e) {
    console.warn('DB query failed, treating all as unindexed:', e.message);
  }
  const indexedKeys = new Set(Array.isArray(indexed) ? indexed.map(a => `${a.category}/${a.slug}`) : []);
  console.log(`Already indexed (per DB): ${indexedKeys.size}`);

  const toPush = all.filter(a => !indexedKeys.has(`${a.category}/${a.slug}`));
  console.log(`To push: ${toPush.length}\n`);

  if (toPush.length === 0) {
    console.log('Nothing to push. Done.');
    return;
  }

  // 3. Google Indexing API
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/indexing',
      'https://www.googleapis.com/auth/webmasters',
    ],
  });
  const client = await auth.getClient();

  let googleSuccess = 0, googleFailed = 0;
  console.log('Pushing to Google Indexing API...');
  for (const a of toPush) {
    try {
      await client.request({
        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
        method: 'POST',
        data: { url: a.url, type: 'URL_UPDATED' },
      });
      googleSuccess++;
      process.stdout.write('.');
    } catch (e) {
      googleFailed++;
      process.stdout.write('x');
    }
    if ((googleSuccess + googleFailed) % 50 === 0) {
      console.log(` (${googleSuccess + googleFailed} / ${toPush.length})`);
    }
    // Rate limit: 200/min, sleep 350ms ≈ 170/min
    await new Promise(r => setTimeout(r, 350));
  }
  console.log(`\nGoogle: ${googleSuccess} OK, ${googleFailed} failed\n`);

  // 4. IndexNow (Bing/Yandex) — batch up to 10000 per request
  console.log('Pushing to IndexNow...');
  const urls = toPush.map(a => a.url);
  const inResult = await postIndexNowBatch(urls);
  console.log(`IndexNow: HTTP ${inResult.status}\n`);

  // 5. Submit sitemap to GSC
  let sitemapOK = false;
  try {
    const webmasters = google.webmasters({ version: 'v3', auth });
    await webmasters.sitemaps.submit({
      siteUrl: SITE_PROPERTY,
      feedpath: SITEMAP_URL,
    });
    sitemapOK = true;
    console.log(`Sitemap submitted to GSC: ${SITEMAP_URL}\n`);
  } catch (e) {
    console.error('Sitemap submit error:', e.message);
  }

  // 6. Email summary
  await sendSummaryEmail({
    total: all.length,
    alreadyIndexed: indexedKeys.size,
    pushed: toPush.length,
    googleSuccess, googleFailed,
    indexNowStatus: inResult.status,
    sitemapSubmitted: sitemapOK,
  });

  console.log('=== Done ===');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
