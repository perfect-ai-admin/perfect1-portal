// Trigger F33 by setting cron to 2 min from now, wait, then restore
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

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Fetching F33...');
  const wf = await api('GET', `/api/v1/workflows/${WF_ID}`);
  if (!wf.nodes) { console.error('Failed:', JSON.stringify(wf).slice(0,200)); process.exit(1); }

  // Calculate Israel time + 2 min
  const now = new Date();
  const israelTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const min = israelTime.getUTCMinutes();
  const hour = israelTime.getUTCHours();
  const targetMin = (min + 2) % 60;
  const targetHour = (min + 2 >= 60) ? (hour + 1) % 24 : hour;
  const triggerCron = `0 ${targetMin} ${targetHour} * * *`;
  const restoreCron = '0 0 11 * * *';

  console.log(`Israel time now: ${hour}:${String(min).padStart(2,'0')}`);
  console.log(`Setting cron to trigger at Israel ${targetHour}:${String(targetMin).padStart(2,'0')}`);
  console.log(`Trigger cron: ${triggerCron}`);

  // Update cron
  const triggerNode = wf.nodes.find(n => n.id === 'trigger');
  if (!triggerNode) { console.error('trigger node not found!'); process.exit(1); }

  const originalCron = triggerNode.parameters.rule.interval[0].expression;
  console.log('Original cron:', originalCron);

  triggerNode.parameters.rule.interval[0].expression = triggerCron;

  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };

  let r = await api('PUT', `/api/v1/workflows/${WF_ID}`, payload);
  if (!r.id) { console.error('PUT failed:', JSON.stringify(r).slice(0,300)); process.exit(1); }
  console.log('Cron updated. Waiting 3 minutes for execution...');

  await sleep(3 * 60 * 1000);

  // Get executions
  console.log('\nChecking executions...');
  const execs = await api('GET', `/api/v1/executions?workflowId=${WF_ID}&limit=5`);
  if (execs.data && execs.data.length > 0) {
    const latest = execs.data[0];
    console.log('Latest execution:');
    console.log('  id:', latest.id);
    console.log('  status:', latest.status);
    console.log('  startedAt:', latest.startedAt);
    console.log('  stoppedAt:', latest.stoppedAt);

    // Get execution details
    const execDetail = await api('GET', `/api/v1/executions/${latest.id}`);
    if (execDetail.data) {
      const nodeData = execDetail.data;
      // Find quality gate result
      const gateData = nodeData['Quality Gate'];
      if (gateData) {
        const gate = gateData.data?.main?.[0]?.[0]?.json?.gate;
        if (gate) {
          console.log('\nQuality Gate result:');
          console.log('  score:', gate.score + '/100');
          console.log('  passed:', gate.passed);
          console.log('  wordCount:', gate.wordCount);
          console.log('  breakdown:', JSON.stringify(gate.breakdown));
          if (gate.failures.length > 0) {
            console.log('  failures:', gate.failures.join(', '));
          }
        }
      }
    }
  } else {
    console.log('No executions found yet. Check manually.');
  }

  // Restore cron
  console.log('\nRestoring cron to:', restoreCron);
  const wf2 = await api('GET', `/api/v1/workflows/${WF_ID}`);
  const tNode = wf2.nodes.find(n => n.id === 'trigger');
  tNode.parameters.rule.interval[0].expression = restoreCron;

  const payload2 = {
    name: wf2.name,
    nodes: wf2.nodes,
    connections: wf2.connections,
    settings: wf2.settings,
    staticData: wf2.staticData || null
  };
  const r2 = await api('PUT', `/api/v1/workflows/${WF_ID}`, payload2);
  if (r2.id) {
    console.log('Cron restored to:', restoreCron);
    console.log('F33 active:', r2.active);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
