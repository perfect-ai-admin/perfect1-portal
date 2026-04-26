/**
 * Commits E-E-A-T + WebP + slug rename changes to GitHub main.
 * Includes binary file (og-image.webp) via base64 upload.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GH_TOKEN;
if (!TOKEN) { console.error('Set GH_TOKEN'); process.exit(1); }
const REPO = 'perfect-ai-admin/perfect1-portal';
const ROOT = path.resolve(__dirname, '..');

// Files to commit (relative to repo root)
const explicit = [
  'src/content/authors/_organization.json',
  'src/content/authors/perfect1-team.json',
  'src/portal/components/SchemaMarkup.jsx',
  'scripts/generate-static.js',
  'src/portal/templates/AuthorPage.jsx',
  'src/App.jsx',
  'scripts/convert-og-webp.mjs',
  'vercel.json',
  'public/sitemap.xml',
  'public/og-image.webp',
  'scripts/update-slug-db.sql',
  // Renamed slug files — add new ones (and we'll need to delete old via tree)
  'src/content/osek-murshe/complete-guide.json',
  'src/content/osek-murshe/why-choose.json',
  'src/content/osek-murshe/full-tax-guide.json',
  'src/content/osek-murshe/requirements.json',
];

// Old slug files to delete
const toDelete = [
  'src/content/osek-murshe/hamadrikh-hamaleh-leryishui-osek-murshe-beyisrael.json',
  'src/content/osek-murshe/why-choose-osek-murshe-advantages-and-disadvantages.json',
  'src/content/osek-murshe/taxes-for-osek-murshe-all-you-need-to-know.json',
  'src/content/osek-murshe/requirments-for-opening-osek-murshe.json',
];

function gh(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${REPO}${p}`,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'perfect1-eeat-committer',
        ...(data ? {'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)} : {}),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async function main() {
  console.log('Reading main ref...');
  const { body: refData } = await gh('GET', '/git/ref/heads/main');
  const parentSha = refData.object.sha;
  const { body: parentCommit } = await gh('GET', `/git/commits/${parentSha}`);
  const baseTreeSha = parentCommit.tree.sha;

  console.log('Building tree items for', explicit.length, 'paths +', toDelete.length, 'deletions');
  const treeItems = [];

  // Additions
  for (const p of explicit) {
    const localPath = path.join(ROOT, p);
    if (!fs.existsSync(localPath)) {
      console.log(`  SKIP (missing): ${p}`);
      continue;
    }
    const isBinary = p.endsWith('.webp') || p.endsWith('.png') || p.endsWith('.jpg');
    const content = fs.readFileSync(localPath);
    const { body: blob } = await gh('POST', '/git/blobs', {
      content: content.toString('base64'),
      encoding: 'base64',
    });
    treeItems.push({ path: p, mode: '100644', type: 'blob', sha: blob.sha });
    process.stdout.write(isBinary ? 'B' : '.');
  }

  // Deletions (sha=null removes from tree)
  for (const p of toDelete) {
    treeItems.push({ path: p, mode: '100644', type: 'blob', sha: null });
    process.stdout.write('-');
  }
  console.log('');

  console.log('Creating tree + commit...');
  const { body: tree } = await gh('POST', '/git/trees', {
    base_tree: baseTreeSha,
    tree: treeItems,
  });
  const { body: commit } = await gh('POST', '/git/commits', {
    message: `SEO E-E-A-T + WebP + slug rename: Organization author, /authors page, og-image.webp (96% smaller), 4 slugs shortened with 301`,
    tree: tree.sha,
    parents: [parentSha],
  });
  const { status } = await gh('PATCH', '/git/refs/heads/main', {
    sha: commit.sha, force: false,
  });
  console.log(`Commit: ${commit.sha.slice(0,10)} | status: ${status}`);
  console.log(`View: https://github.com/${REPO}/commit/${commit.sha}`);
})();
