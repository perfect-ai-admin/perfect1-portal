/**
 * GitHub API client — extracted from commit-seo-fixes.cjs and friends.
 * Handles tree/blob commits, content reads, and ref updates.
 */
const https = require('https');
const { GITHUB_REPO } = require('../config/site.config.cjs');

function getToken() {
  const t = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!t) throw new Error('GH_TOKEN or GITHUB_TOKEN not set');
  return t;
}

function api(method, p, body, repo) {
  const data = body ? JSON.stringify(body) : null;
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${repo || GITHUB_REPO}${p}`,
      method,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'perfect1-seo-automation',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getMainSha(repo) {
  const { body } = await api('GET', '/git/ref/heads/main', null, repo);
  return body.object.sha;
}

async function getBaseTreeSha(parentSha, repo) {
  const { body } = await api('GET', `/git/commits/${parentSha}`, null, repo);
  return body.tree.sha;
}

async function readFile(repoPath, repo) {
  const { status, body } = await api('GET', `/contents/${repoPath}?ref=main`, null, repo);
  if (status === 404) return null;
  if (!body || !body.content) return null;
  return Buffer.from(body.content, 'base64').toString('utf-8');
}

/**
 * Atomic batch commit — files = [{path, content}, ...]
 * Returns commit SHA.
 */
async function commitBatch({ files, message, repo }) {
  if (!files || files.length === 0) throw new Error('commitBatch: no files');
  const parentSha = await getMainSha(repo);
  const baseTreeSha = await getBaseTreeSha(parentSha, repo);

  const treeItems = [];
  for (const f of files) {
    const { body: blob } = await api('POST', '/git/blobs', {
      content: Buffer.from(f.content).toString('base64'),
      encoding: 'base64',
    }, repo);
    treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const { body: tree } = await api('POST', '/git/trees', {
    base_tree: baseTreeSha,
    tree: treeItems,
  }, repo);

  const { body: commit } = await api('POST', '/git/commits', {
    message, tree: tree.sha, parents: [parentSha],
  }, repo);

  await api('PATCH', '/git/refs/heads/main', {
    sha: commit.sha, force: false,
  }, repo);

  return commit.sha;
}

module.exports = { api, getMainSha, getBaseTreeSha, readFile, commitBatch };
