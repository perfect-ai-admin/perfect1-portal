// fix-f33-cron-qa2.cjs — set cron to +2 min in Jerusalem time (UTC+3)
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

  // Calculate Jerusalem time (+3) + 2 min
  const now = new Date();
  const ilMs = now.getTime() + 3 * 3600000; // UTC+3 = IDT
  const ilNow = new Date(ilMs);
  let qaMin = ilNow.getUTCMinutes() + 2;
  let qaHour = ilNow.getUTCHours();
  if (qaMin >= 60) { qaMin -= 60; qaHour = (qaHour + 1) % 24; }
  const qaCron = `0 ${qaMin} ${qaHour} * * *`; // n8n interprets in Asia/Jerusalem

  const trigger = wf.nodes.find(n => n.id === 'trigger');
  trigger.parameters.rule.interval[0].expression = qaCron;

  console.log(`Jerusalem time now: ${ilNow.getUTCHours()}:${String(ilNow.getUTCMinutes()).padStart(2,'0')}`);
  console.log(`Setting cron (Jerusalem): ${qaCron} → fires at IL ${qaHour}:${String(qaMin).padStart(2,'0')}`);

  const result = await api('PUT', `/api/v1/workflows/${WF_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  });

  if (result.id) {
    console.log('SUCCESS! versionId:', result.versionId, '| active:', result.active);
  } else {
    console.error('FAILED:', JSON.stringify(result).slice(0,400));
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
