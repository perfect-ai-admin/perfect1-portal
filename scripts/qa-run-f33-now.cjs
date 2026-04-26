// qa-run-f33-now.cjs — set F33 cron to +2 min UTC for QA test
const N8N_BASE = 'https://n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'F33CbVflx4aApT71';

async function api(method, path, body) {
  const res = await fetch(N8N_BASE + path, {
    method,
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch(e) { return text; }
}

const wf = await api('GET', `/api/v1/workflows/${WF_ID}`);
if (!wf.nodes) { console.error('Failed:', JSON.stringify(wf).slice(0,200)); process.exit(1); }

const now = new Date();
const target = new Date(now.getTime() + 2 * 60000);
const qaMin = target.getUTCMinutes();
const qaHour = target.getUTCHours();
const qaCron = `0 ${qaMin} ${qaHour} * * *`;
const israelHour = (qaHour + 3) % 24;

const trigger = wf.nodes.find(n => n.id === 'trigger');
trigger.parameters.rule.interval[0].expression = qaCron;

console.log(`Setting F33 cron to: ${qaCron}`);
console.log(`  = UTC ${qaHour}:${String(qaMin).padStart(2,'0')} = Israel ${israelHour}:${String(qaMin).padStart(2,'0')}`);

const result = await api('PUT', `/api/v1/workflows/${WF_ID}`, {
  name: wf.name,
  nodes: wf.nodes,
  connections: wf.connections,
  settings: wf.settings,
  staticData: wf.staticData || null
});

if (result.id) {
  console.log('SUCCESS! versionId:', result.versionId);
  console.log('F33 will fire in ~2 minutes. Wait 5-7 minutes then check executions.');
} else {
  console.error('FAILED:', JSON.stringify(result).slice(0,400));
  process.exit(1);
}
