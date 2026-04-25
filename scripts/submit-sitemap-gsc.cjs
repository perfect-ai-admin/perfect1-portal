/**
 * Post-deploy GSC sitemap maintenance.
 *
 *   1. Delete the bogus /sitemap entry (no extension) once if it still
 *      exists — there is no such file on the site, GSC has been receiving
 *      the SPA HTML fallback and surfacing it as a parse error.
 *   2. Submit /sitemap.xml so GSC re-fetches the latest version.
 *
 * Uses GOOGLE_SERVICE_ACCOUNT_KEY (must have webmasters scope).
 */

const { google } = require('googleapis');

const SITE_URL_OPTIONS = ['sc-domain:perfect1.co.il', 'https://www.perfect1.co.il/'];
const SITEMAP_URL = 'https://www.perfect1.co.il/sitemap.xml';
const BOGUS_SITEMAP_URL = 'https://www.perfect1.co.il/sitemap';

async function tryAcrossSites(action) {
  let lastErr;
  for (const siteUrl of SITE_URL_OPTIONS) {
    try {
      const result = await action(siteUrl);
      return { siteUrl, result };
    } catch (e) {
      console.log(`  ${siteUrl} → ${e.code || ''} ${e.message || ''}`.trim());
      lastErr = e;
    }
  }
  throw lastErr;
}

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

  console.log(`[1] Removing bogus sitemap entry: ${BOGUS_SITEMAP_URL}`);
  try {
    const { siteUrl } = await tryAcrossSites((siteUrl) =>
      webmasters.sitemaps.delete({ siteUrl, feedpath: BOGUS_SITEMAP_URL })
    );
    console.log(`  ✓ Deleted from ${siteUrl}`);
  } catch (e) {
    if (e.code === 404) console.log('  · Already absent (404).');
    else console.log(`  · Delete skipped (${e.code || ''} ${e.message || ''})`.trim());
  }

  console.log(`\n[2] Submitting valid sitemap: ${SITEMAP_URL}`);
  try {
    const { siteUrl } = await tryAcrossSites((siteUrl) =>
      webmasters.sitemaps.submit({ siteUrl, feedpath: SITEMAP_URL })
    );
    console.log(`  ✓ Submitted to ${siteUrl}`);
  } catch (e) {
    console.error(`  ✗ Submit failed: ${e.code || ''} ${e.message || ''}`.trim());
    console.error('    Service account may need Search Console access to the property.');
    return;
  }

  console.log(`\n[3] Sitemaps state after maintenance:`);
  for (const siteUrl of SITE_URL_OPTIONS) {
    try {
      const res = await webmasters.sitemaps.list({ siteUrl });
      const items = res.data.sitemap || [];
      console.log(`  ${siteUrl}: ${items.length} sitemap(s)`);
      for (const s of items) {
        console.log(`    - ${s.path}  errors=${s.errors || 0}  warnings=${s.warnings || 0}  lastDownloaded=${s.lastDownloaded || '-'}`);
      }
      break;
    } catch (e) {
      console.log(`  ${siteUrl} list → ${e.code || ''} ${e.message || ''}`.trim());
    }
  }
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(0);
});
