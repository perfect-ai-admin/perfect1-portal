/**
 * Commits the indexation automation files to GitHub main.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GH_TOKEN;
if (!TOKEN) { console.error('Set GH_TOKEN'); process.exit(1); }
const REPO = 'perfect-ai-admin/perfect1-portal';
const ROOT = path.resolve(__dirname, '..');

const paths = [
  'scripts/notify-indexnow.cjs',
  'scripts/submit-sitemap-gsc.cjs',
  'scripts/check-indexation-status.cjs',
  'scripts/commit-indexation-automation.cjs',
  '.github/workflows/deploy.yml',
  '.github/workflows/check-indexation.yml',
  'public/f192557dbb787a9c644cd9695b63976046d2eef1cd538d7a46318fc51a7e1aa8.txt',
  'supabase/migrations/20260425100000_indexation_tracking.sql',
];

function gh(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com', path: `/repos/${REPO}${p}`, method,
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept':'application/vnd.github+json','User-Agent':'p1-idx',
        ...(data?{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}:{}) }
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve({status:res.statusCode,body:JSON.parse(d)});}catch(e){resolve({status:res.statusCode,body:d});}}); });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}

(async()=>{
  const { body: refData } = await gh('GET','/git/ref/heads/main');
  const parentSha = refData.object.sha;
  const { body: parentCommit } = await gh('GET',`/git/commits/${parentSha}`);
  const baseTreeSha = parentCommit.tree.sha;

  const treeItems = [];
  for (const p of paths) {
    const local = path.join(ROOT, p);
    if (!fs.existsSync(local)) { console.log('skip missing:', p); continue; }
    const content = fs.readFileSync(local);
    const { body: blob } = await gh('POST','/git/blobs', { content: content.toString('base64'), encoding: 'base64' });
    treeItems.push({ path: p, mode: '100644', type: 'blob', sha: blob.sha });
    process.stdout.write('.');
  }
  console.log('');
  const { body: tree } = await gh('POST','/git/trees', { base_tree: baseTreeSha, tree: treeItems });
  const { body: commit } = await gh('POST','/git/commits', {
    message: 'SEO Auto-Indexation: IndexNow + GSC sitemap submit + daily coverage tracker',
    tree: tree.sha, parents: [parentSha],
  });
  const { status } = await gh('PATCH','/git/refs/heads/main', { sha: commit.sha, force: false });
  console.log(`Commit: ${commit.sha.slice(0,10)} | status: ${status}`);
  console.log(`https://github.com/${REPO}/commit/${commit.sha}`);
})();
