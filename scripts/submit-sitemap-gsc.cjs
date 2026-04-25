/**
 * Submit/refresh sitemap to Google Search Console after deploy.
 *
 * Uses GOOGLE_SERVICE_ACCOUNT_KEY (must have webmasters scope).
 * Tells GSC: "the sitemap was updated, please re-fetch."
 */

const { google } = require('googleapis');

const SITEMAP_URL = 'https://www.perfect1.co.il/sitemap.xml';
const SITE_URL_OPTIONS = ['sc-domain:perfect1.co.il', 'https://www.perfect1.co.il/'];

async function main() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.error('GOOGLE_SERVICE_ACCOUNT_KEY not set; skipping.');
    return;
  }
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });

  const webmasters = google.webmasters({ version: 'v3', auth });

  let lastErr;
  for (const siteUrl of SITE_URL_OPTIONS) {
    try {
      await webmasters.sitemaps.submit({
        siteUrl,
        feedpath: SITEMAP_URL,
      });
      console.log(`✓ Sitemap submitted to GSC for ${siteUrl}`);
      lastErr = null;
      break;
    } catch (e) {
      console.log(`  ${siteUrl} → ${e.code || ''} ${e.message || ''}`.trim());
      lastErr = e;
    }
  }
  if (lastErr) {
    console.error(`✗ Could not submit sitemap to any property. Service account may need Search Console permission added.`);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(0); });
