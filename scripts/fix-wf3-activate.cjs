/**
 * Fix WF3 cron (5-field -> 6-field) and activate it
 * "0 8 * * *" (5 fields) -> "0 0 8 * * *" (6 fields) = daily at 08:00 Israel
 */
const https = require('https');

const N8N_BASE = 'n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'mcuHdVaje5WfjU1C';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: N8N_BASE, path, method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => { try { resolve(JSON.parse(chunks)); } catch (e) { resolve(chunks); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const wf = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  if (!wf.nodes) { console.error('Failed:', JSON.stringify(wf).slice(0,200)); process.exit(1); }
  
  console.log('WF3 active:', wf.active);
  
  // Fix cron on scheduler node
  const trigger = wf.nodes.find(n => n.type && n.type.includes('scheduleTrigger'));
  if (trigger) {
    const old = trigger.parameters?.rule?.interval?.[0]?.expression;
    console.log('Old cron:', old);
    // "0 8 * * *" 5-field = seconds=0, min=8, hour=every = runs every hour at :08
    // Fix to "0 0 8 * * *" 6-field = sec=0, min=0, hour=8, daily
    trigger.parameters.rule.interval[0].expression = '0 0 8 * * *';
    console.log('New cron: 0 0 8 * * * (daily at 08:00 Israel time)');
  }
  
  const putBody = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };
  
  const result = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, putBody);
  if (!result.id) { console.error('Update failed:', JSON.stringify(result).slice(0,200)); process.exit(1); }
  console.log('Cron fixed. versionId:', result.versionId);
  
  // Now activate WF3
  const activateResult = await apiRequest('POST', `/api/v1/workflows/${WF_ID}/activate`);
  console.log('Activate result:', JSON.stringify(activateResult).slice(0, 200));
  
  // Verify
  const check = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  console.log('WF3 now active:', check.active);
  console.log('WF3 cron:', check.nodes?.find(n => n.type?.includes('scheduleTrigger'))?.parameters?.rule?.interval?.[0]?.expression);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
