/**
 * IndexNow protocol notifier — Bing, Yandex, Naver, Seznam, IndexNow.
 *
 * Runs after deploy alongside Google Indexing API.
 * Detects content URL changes from last commit and pushes to IndexNow API.
 * Bing typically indexes within hours.
 *
 * IndexNow key: f192557dbb787a9c644cd9695b63976046d2eef1cd538d7a46318fc51a7e1aa8
 * Verification file: public/{key}.txt — must be accessible at https://www.perfect1.co.il/{key}.txt
 */

const { execSync } = require('child_process');
const https = require('https');

const SITE_HOST = 'www.perfect1.co.il';
const SITE_URL = `https://${SITE_HOST}`;
const INDEXNOW_KEY = 'f192557dbb787a9c644cd9695b63976046d2eef1cd538d7a46318fc51a7e1aa8';
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const CONTENT_DIR = 'src/content/';

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
  'amuta': '/amuta',
  'authors': '/authors',
};

function getChangedContentFiles() {
  try {
    const diff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' });
    return diff
      .split('\n')
      .filter(f => f.startsWith(CONTENT_DIR) && f.endsWith('.json'))
      .filter(f => !f.includes('_category.json'));
  } catch {
    return [];
  }
}

function fileToUrl(filePath) {
  const relative = filePath.replace(CONTENT_DIR, '').replace('.json', '');
  const parts = relative.split('/');
  if (parts.length !== 2) return null;
  const [category, slug] = parts;
  const urlPrefix = CATEGORY_URL_MAP[category];
  if (!urlPrefix) return null;
  return `${SITE_URL}${urlPrefix}/${slug}`;
}

function postIndexNow(urls) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
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
