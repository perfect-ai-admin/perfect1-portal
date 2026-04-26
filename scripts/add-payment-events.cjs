/**
 * Add payment_confirmed and payment_failed branches to Perfect-1 CRM Bot.
 * Usage: N8N_API_KEY=<key> node scripts/add-payment-events.cjs
 */
const https = require('https');
const fs = require('fs');

const N8N_KEY = process.env.N8N_API_KEY || '';
const WORKFLOW_ID = 'PfVBnM3Ds3I_pz9ekkYAN';
const N8N_HOST = 'n8n.perfect-1.one';

if (!N8N_KEY) {
  console.error('ERROR: Set N8N_API_KEY env var');
  process.exit(1);
}

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const req = https.request({
      hostname: N8N_HOST,
      path: '/api/v1' + path,
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
        try { resolve(JSON.parse(d)); }
        catch (e) { resolve({ _raw: d, statusCode: res.statusCode }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // Load updated workflow from local file
  const updated = JSON.parse(fs.readFileSync('docs/crm-bot-current.json'));

  // Fetch current workflow from n8n to get versionId
  console.log('Fetching current workflow...');
  const current = await api('GET', `/workflows/${WORKFLOW_ID}`);
  if (!current.id) {
    console.error('Failed to fetch workflow:', JSON.stringify(current));
    process.exit(1);
  }
  console.log('Current: name =', current.name, '| active =', current.active, '| versionId =', current.versionId);

  // Build PUT payload
  const payload = {
    name: current.name,
    nodes: updated.nodes,
    connections: updated.connections,
    settings: current.settings || {},
    staticData: current.staticData || null
  };

  console.log('Uploading updated workflow (' + updated.nodes.length + ' nodes)...');
  const result = await api('PUT', `/workflows/${WORKFLOW_ID}`, payload);
  if (!result.id) {
    console.error('Upload failed:', JSON.stringify(result));
    process.exit(1);
  }
  console.log('Upload OK | nodes:', result.nodes?.length);

  // Activate if not active
  if (!result.active) {
    console.log('Activating workflow...');
    const activated = await api('PATCH', `/workflows/${WORKFLOW_ID}/activate`);
    console.log('Activate result:', activated.active ? 'active' : JSON.stringify(activated));
  } else {
    console.log('Workflow already active.');
  }

  // Verify
  const verify = await api('GET', `/workflows/${WORKFLOW_ID}`);
  console.log('\nVerification:');
  console.log('  name:', verify.name);
  console.log('  active:', verify.active);
  console.log('  nodes:', verify.nodes?.length);
  const nodeNames = verify.nodes?.map(n => n.name) || [];
  console.log('  payment nodes present:', nodeNames.includes('WA - Payment Confirmed to Owner') && nodeNames.includes('WA - Payment Failed to Lead'));
  console.log('  Route by Event Type present:', nodeNames.includes('Route by Event Type'));
}

main().catch(e => { console.error(e); process.exit(1); });
