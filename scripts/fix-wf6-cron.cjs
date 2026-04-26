/**
 * Fix WF6 cron expression: "45 11 * * *" -> "0 45 11 * * *"
 * n8n uses 6-field cron (seconds minutes hours day month weekday)
 */
const https = require('https');

const N8N_BASE = 'n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'YYLuBCEktMeoRcoD';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: N8N_BASE,
      path,
      method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); }
        catch (e) { resolve(chunks); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Fetching WF6...');
  const wf = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  
  if (!wf.nodes) {
    console.error('Failed:', JSON.stringify(wf).slice(0, 200));
    process.exit(1);
  }
  
  const triggerNode = wf.nodes.find(n => n.name === 'Schedule Trigger');
  if (!triggerNode) {
    console.error('Schedule Trigger not found');
    process.exit(1);
  }
  
  const currentExpr = triggerNode.parameters?.rule?.interval?.[0]?.expression;
  console.log('Current cron expression:', currentExpr);
  
  // Fix: add seconds field "0" at the start for 6-field cron
  // Old: "45 11 * * *" = seconds=45, min=11, hour=*, day=*, month=* (runs every hour at :11:45)
  // New: "0 45 11 * * *" = sec=0, min=45, hour=11, day=*, month=*, weekday=* (runs once daily at 11:45)
  triggerNode.parameters.rule.interval[0].expression = '0 45 11 * * *';
  console.log('New cron expression: 0 45 11 * * * (daily at 11:45 Israel time)');
  
  const putBody = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };
  
  console.log('Updating WF6...');
  const result = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, putBody);
  
  if (result.id) {
    console.log('SUCCESS: WF6 updated. versionId:', result.versionId);
    
    // Verify
    const check = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
    const newExpr = check.nodes?.find(n => n.name === 'Schedule Trigger')?.parameters?.rule?.interval?.[0]?.expression;
    console.log('Verified expression:', newExpr);
  } else {
    console.error('Update failed:', JSON.stringify(result).slice(0, 300));
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
