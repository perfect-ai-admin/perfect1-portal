/**
 * IndexNow protocol notifier — Bing, Yandex, Naver, Seznam.
 *
 * Runs after deploy alongside Google Indexing API.
 * Detects content URL changes from last commit and pushes to IndexNow API.
 * Bing typically indexes within hours.
 *
 * Refactored: pulls IndexNow key + URL mapping from /config and /lib.
 */

const { execSync } = require('child_process');
const https = require('https');

const {
  SITE_HOST,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
  CONTENT_DIR_REL,
} = require('../config/site.config.cjs');
const { fileToUrl } = require('../lib/url-mapper.cjs');

function getChangedContentFiles() {
  try {
    const diff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' });
    return diff
      .split('\n')
      .filter(f => f.startsWith(CONTENT_DIR_REL) && f.endsWith('.json'))
      .filter(f => !f.includes('_category.json'));
  } catch {
    return [];
  }
}

function postIndexNow(urls) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: urls,
    });
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('=== IndexNow Notification (Bing, Yandex, etc.) ===\n');

  const changed = getChangedContentFiles();
  if (changed.length === 0) {
    console.log('No content files changed. Nothing to notify.');
    return;
  }

  const urls = changed.map(fileToUrl).filter(Boolean);
  if (urls.length === 0) {
    console.log('No valid URLs to notify.');
    return;
  }

  console.log(`Notifying ${urls.length} URL(s) to IndexNow:\n`);
  urls.forEach(u => console.log(`  → ${u}`));
  console.log();

  try {
    const r = await postIndexNow(urls);
    if (r.status === 200 || r.status === 202) {
      console.log(`✓ IndexNow accepted ${urls.length} URLs (HTTP ${r.status})`);
      console.log(`  Bing/Yandex will crawl within hours.`);
    } else {
      console.error(`✗ IndexNow returned HTTP ${r.status}`);
      console.error(`  Body: ${r.body}`);
    }
  } catch (e) {
    console.error('IndexNow error:', e.message);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(0); });
