/**
 * Google Indexing API — auto-notify on content changes
 *
 * Runs after deploy in GitHub Actions.
 * Detects which content JSON files changed in the last commit,
 * maps them to live URLs, and sends URL_UPDATED notifications
 * to Google's Indexing API for fast re-crawling.
 *
 * Refactored: pulls config + URL mapping from /config and /lib (no inline duplication).
 */

const { execSync } = require('child_process');
const { google } = require('googleapis');

const { CONTENT_DIR_REL, RATE_LIMIT_MS } = require('../config/site.config.cjs');
const { fileToUrl } = require('../lib/url-mapper.cjs');

function getChangedContentFiles() {
  try {
    const diff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' });
    return diff
      .split('\n')
      .filter(f => f.startsWith(CONTENT_DIR_REL) && f.endsWith('.json'))
      .filter(f => !f.includes('_category.json'));
  } catch {
    console.log('Could not get git diff, checking all content files');
    return [];
  }
}

async function notifyGoogle(urls) {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();

  const results = { success: 0, failed: 0, errors: [] };

  for (const url of urls) {
    try {
      const response = await client.request({
        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
        method: 'POST',
        data: { url, type: 'URL_UPDATED' },
      });
      console.log(`✓ ${url} → ${response.data.urlNotificationMetadata?.latestUpdate?.type || 'OK'}`);
      results.success++;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.error(`✗ ${url} → ${msg}`);
      results.failed++;
      results.errors.push({ url, error: msg });
    }
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS.google));
  }

  return results;
}

async function main() {
  console.log('=== Google Indexing API Notification ===\n');

  const changedFiles = getChangedContentFiles();
  if (changedFiles.length === 0) {
    console.log('No content files changed. Nothing to notify.');
    return;
  }

  console.log(`Found ${changedFiles.length} changed content file(s):`);
  changedFiles.forEach(f => console.log(`  ${f}`));

  const urls = changedFiles.map(fileToUrl).filter(Boolean);
  if (urls.length === 0) {
    console.log('No valid URLs to notify.');
    return;
  }

  console.log(`\nNotifying Google about ${urls.length} URL(s):\n`);

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.error('ERROR: GOOGLE_SERVICE_ACCOUNT_KEY not set. Skipping.');
    process.exit(1);
  }

  const results = await notifyGoogle(urls);
  console.log(`\n=== Done: ${results.success} succeeded, ${results.failed} failed ===`);

  if (results.failed > 0) {
    console.log('Errors:', JSON.stringify(results.errors, null, 2));
  }
}

main().catch(err => {
  console.error('Indexing notification error:', err.message);
  process.exit(0);
});
