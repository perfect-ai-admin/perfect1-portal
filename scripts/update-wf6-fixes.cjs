// Update WF6 in n8n with bug fixes
const WORKFLOW_ID = 'YYLuBCEktMeoRcoD';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const N8N_BASE = 'https://n8n.perfect-1.one';

const fs = require('fs');
const path = require('path');

async function main() {
  const wfPath = path.join(__dirname, 'seo-wf6-article-writer.json');
  const localWf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));

  // 1. Fetch current WF from n8n to get full metadata (id, versionId, etc.)
  console.log('Fetching current WF6 from n8n...');
  const getRes = await fetch(`${N8N_BASE}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
  });
  if (!getRes.ok) {
    const text = await getRes.text();
    throw new Error(`GET failed ${getRes.status}: ${text}`);
  }
  const current = await getRes.json();
  console.log('Current workflow name:', current.name, '| active:', current.active);

  // 2. Build update payload — preserve id, name, settings, active=false
  const payload = {
    name: current.name,
    nodes: localWf.nodes,
    connections: localWf.connections,
    settings: localWf.settings || current.settings,
    staticData: current.staticData || null,
    // active is read-only via API — do not include
  };

  // 3. PUT update
  console.log('Pushing updated WF6...');
  const putRes = await fetch(`${N8N_BASE}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(`PUT failed ${putRes.status}: ${text}`);
  }

  const updated = await putRes.json();
  console.log('WF6 updated successfully.');
  console.log('  id:', updated.id);
  console.log('  name:', updated.name);
  console.log('  active:', updated.active);
  console.log('  nodes count:', updated.nodes?.length);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
