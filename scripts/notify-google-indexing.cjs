/**
 * Google Indexing API — auto-notify on content changes
 *
 * Runs after deploy in GitHub Actions.
 * Detects which content JSON files changed in the last commit,
 * maps them to live URLs, and sends URL_UPDATED notifications
 * to Google's Indexing API for fast re-crawling.
 */

const { execSync } = require('child_process');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// --- Config ---
const SITE_URL = 'https://www.perfect1.co.il';
const CONTENT_DIR = 'src/content/';

// Category slug → URL prefix mapping
const CATEGORY_URL_MAP = {
  'osek-patur': '/osek-patur',
  'osek-murshe': '/osek-murshe',
  'hevra-bam': '/hevra-bam',
  'sgirat-tikim': '/sgirat-tikim',
  'guides': '/guides',
  'comparisons': '/compare',
  'osek-zeir': '/osek-zeir',
  'misui': '/misui',
  'maam': '/maam',
  'hashbonaut': '/hashbonaut',
  'mishpati': '/mishpati',
  'shivuk': '/shivuk',
  'tech': '/tech',
  'mimun': '/mimun',
  'miktzoa': '/miktzoa',
  'cities': '/cities',
  'services': '/services',
};

function getChangedContentFiles() {
  try {
    // Get files changed in the last commit
    const diff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' });
    return diff
      .split('\n')
      .filter(f => f.startsWith(CONTENT_DIR) && f.endsWith('.json'))
      .filter(f => !f.includes('_category.json')); // skip category meta files
  } catch {
    console.log('Could not get git diff, checking all content files');
    return [];
  }
}

function fileToUrl(filePath) {
  // src/content/osek-murshe/how-to-open.json → /osek-murshe/how-to-open
  const relative = filePath.replace(CONTENT_DIR, '').replace('.json', '');
  const parts = relative.split('/');

  if (parts.length !== 2) return null;

  const [category, slug] = parts;
  const urlPrefix = CATEGORY_URL_MAP[category];

  if (!urlPrefix) {
    console.warn(`Unknown category: ${category}`);
    return null;
  }

  return `${SITE_URL}${urlPrefix}/${slug}`;
}

async function notifyGoogle(urls) {
  // Load service account credentials from env
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
        data: {
          url,
          type: 'URL_UPDATED',
        },
      });

      console.log(`✓ ${url} → ${response.data.urlNotificationMetadata?.latestUpdate?.type || 'OK'}`);
      results.success++;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.error(`✗ ${url} → ${msg}`);
      results.failed++;
      results.errors.push({ url, error: msg });
    }

    // Rate limit: max 200 requests/minute, be conservative
    if (urls.length > 10) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return results;
}

async function main() {
  console.log('=== Google Indexing API Notification ===\n');

  // 1. Find changed content files
  const changedFiles = getChangedContentFiles();

  if (changedFiles.length === 0) {
    console.log('No content files changed. Nothing to notify.');
    return;
  }

  console.log(`Found ${changedFiles.length} changed content file(s):`);
  changedFiles.forEach(f => console.log(`  ${f}`));

  // 2. Map to URLs
  const urls = changedFiles.map(fileToUrl).filter(Boolean);

  if (urls.length === 0) {
    console.log('No valid URLs to notify.');
    return;
  }

  console.log(`\nNotifying Google about ${urls.length} URL(s):\n`);

  // 3. Send to Indexing API
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.error('ERROR: GOOGLE_SERVICE_ACCOUNT_KEY not set. Skipping.');
    process.exit(1);
  }

  const results = await notifyGoogle(urls);

  console.log(`\n=== Done: ${results.success} succeeded, ${results.failed} failed ===`);

  if (results.failed > 0) {
    console.log('Errors:', JSON.stringify(results.errors, null, 2));
    // Don't fail the build for indexing errors
  }
}

main().catch(err => {
  console.error('Indexing notification error:', err.message);
  // Don't fail the build
  process.exit(0);
});
