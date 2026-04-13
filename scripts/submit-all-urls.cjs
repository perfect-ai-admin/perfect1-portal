/**
 * One-time bulk submit — sends ALL content URLs to Google Indexing API.
 * Run via: GOOGLE_SERVICE_ACCOUNT_KEY=... node scripts/submit-all-urls.cjs
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.perfect1.co.il';
const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content');

const CATEGORY_URL_MAP = {
  'osek-patur': '/osek-patur',
  'osek-murshe': '/osek-murshe',
  'hevra-bam': '/hevra-bam',
  'sgirat-tikim': '/sgirat-tikim',
  'guides': '/guides',
  'comparisons': '/compare',
  'osek-zeir': '/osek-zeir',
};

function getAllContentUrls() {
  const urls = [];

  // Category hub pages
  for (const cat of Object.keys(CATEGORY_URL_MAP)) {
    if (cat !== 'comparisons') {
      urls.push(`${SITE_URL}${CATEGORY_URL_MAP[cat]}`);
    }
  }

  // Article pages
  for (const [category, urlPrefix] of Object.entries(CATEGORY_URL_MAP)) {
    const catDir = path.join(CONTENT_DIR, category);
    if (!fs.existsSync(catDir)) continue;

    for (const file of fs.readdirSync(catDir)) {
      if (!file.endsWith('.json') || file === '_category.json') continue;
      const slug = file.replace('.json', '');
      urls.push(`${SITE_URL}${urlPrefix}/${slug}`);
    }
  }

  // Homepage
  urls.push(SITE_URL + '/');

  return urls;
}

async function main() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.error('ERROR: GOOGLE_SERVICE_ACCOUNT_KEY not set');
    process.exit(1);
  }

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();

  const urls = getAllContentUrls();
  console.log(`=== Submitting ${urls.length} URLs to Google Indexing API ===\n`);

  let success = 0, failed = 0;
  for (const url of urls) {
    try {
      await client.request({
        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
        method: 'POST',
        data: { url, type: 'URL_UPDATED' },
      });
      console.log(`✓ ${url}`);
      success++;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.log(`✗ ${url} → ${msg}`);
      failed++;
    }
    // Rate limit
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n=== Done: ${success} succeeded, ${failed} failed out of ${urls.length} ===`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
