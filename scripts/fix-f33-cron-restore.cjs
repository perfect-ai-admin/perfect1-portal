// fix-f33-cron-restore.cjs — restore cron to daily 11:00 Jerusalem
const N8N_BASE = 'https://n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'F33CbVflx4aApT71';

async function api(method, path, body) {
  const res = await fetch(`${N8N_BASE}${path}`, {
    method,
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

async function main() {
  const wf = await api('GET', `/api/v1/workflows/${WF_ID}`);
  if (!wf.nodes) { console.error('Failed:', JSON.stringify(wf).slice(0,200)); process.exit(1); }

  const trigger = wf.nodes.find(n => n.id === 'trigger');
  const currentCron = trigger.parameters.rule.interval[0].expression;
  console.log('Current cron:', currentCron);

  trigger.parameters.rule.interval[0].expression = '0 0 11 * * *';
  console.log('Restoring to: 0 0 11 * * * (11:00 Jerusalem daily)');

  const result = await api('PUT', `/api/v1/workflows/${WF_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  });

  if (result.id) {
    console.log('SUCCESS! versionId:', result.versionId, '| active:', result.active);
    console.log('Cron restored to 11:00 Jerusalem daily');
  } else {
    console.error('FAILED:', JSON.stringify(result).slice(0,400));
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
