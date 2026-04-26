/**
 * Deploy dedup fix for workflow Yo18hwPWHGndxsZ3
 * Fixes duplicate WhatsApp greeting by replacing noop triggers with atomic DB lock.
 *
 * Run: N8N_API_KEY=<your-key> node scripts/deploy-dedup-fix.cjs
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const N8N_KEY = process.env.N8N_API_KEY || '';
const WORKFLOW_ID = 'Yo18hwPWHGndxsZ3';
const WORKFLOW_FILE = path.join(__dirname, '..', '..', '..', 'n8n-exports', 'wf_v2_dedup_fixed.json');

if (!N8N_KEY) {
  console.error('ERROR: Set N8N_API_KEY env var');
  process.exit(1);
}

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'n8n.perfect-1.one',
      path: '/api/v1' + urlPath,
      method,
      headers: {
        'X-N8N-API-KEY': N8N_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: { raw: d } }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Loading fixed workflow from:', WORKFLOW_FILE);
  const wf = JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf-8'));

  console.log('Nodes count:', wf.nodes.length);
  console.log('Dedup nodes:', wf.nodes.filter(n => n.id.startsWith('pg-dedup') || n.id === 'if-dedup-ok').map(n => n.name));

  // 1. Deactivate workflow before update
  console.log('\nDeactivating workflow...');
  const deact = await api('PATCH', `/workflows/${WORKFLOW_ID}`, { active: false });
  console.log('Deactivate status:', deact.status);

  // 2. Update workflow
  console.log('\nUploading fixed workflow...');
  const update = await api('PUT', `/workflows/${WORKFLOW_ID}`, wf);
  console.log('Update status:', update.status);
  if (update.status !== 200) {
    console.error('Update failed:', JSON.stringify(update.body, null, 2).slice(0, 500));
    process.exit(1);
  }

  // 3. Reactivate
  console.log('\nReactivating workflow...');
  const act = await api('PATCH', `/workflows/${WORKFLOW_ID}`, { active: true });
  console.log('Reactivate status:', act.status);

  // 4. Verify
  console.log('\nVerifying deployed workflow...');
  const verify = await api('GET', `/workflows/${WORKFLOW_ID}`);
  const deployedNodes = verify.body.nodes || [];
  const dedupNode = deployedNodes.find(n => n.id === 'pg-dedup-greeting');
  const ifNode = deployedNodes.find(n => n.id === 'if-dedup-ok');
  const oldNoop1 = deployedNodes.find(n => n.id === 'noop-greeting-trigger');
  const oldNoop2 = deployedNodes.find(n => n.id === 'noop-first-message');

  console.log('\n=== VERIFICATION ===');
  console.log('Dedup: Lock Greeting node:', dedupNode ? 'EXISTS OK' : 'MISSING - ERROR');
  console.log('Dedup: First Execution Only node:', ifNode ? 'EXISTS OK' : 'MISSING - ERROR');
  console.log('noop-greeting-trigger (old):', oldNoop1 ? 'STILL EXISTS - ERROR' : 'REMOVED OK');
  console.log('noop-first-message (old):', oldNoop2 ? 'STILL EXISTS - ERROR' : 'REMOVED OK');
  console.log('Total nodes:', deployedNodes.length);
  console.log('\nDeploy complete!');
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
