// Test WF6 — set cron to now+2min, wait, check execution, restore cron

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const N8N_BASE = 'https://n8n.perfect-1.one';
const WF_ID = 'YYLuBCEktMeoRcoD';
const ORIGINAL_CRON = '0 8 * * *';

async function setCron(expression) {
  const res = await fetch(`${N8N_BASE}/api/v1/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await res.json();

  const cronNode = wf.nodes.find(n => n.id === 'wf6-trigger');
  if (!cronNode) throw new Error('wf6-trigger not found');

  cronNode.parameters.rule.interval[0].expression = expression;

  const putRes = await fetch(`${N8N_BASE}/api/v1/workflows/${WF_ID}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: wf.name,
      nodes: wf.nodes,
      connections: wf.connections,
      settings: wf.settings || {},
      staticData: wf.staticData || null
    })
  });

  if (!putRes.ok) throw new Error(`PUT failed ${putRes.status}: ${await putRes.text()}`);
  const updated = await putRes.json();

  // Activate
  const actRes = await fetch(`${N8N_BASE}/api/v1/workflows/${WF_ID}/activate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  if (!actRes.ok) console.warn('Activate warning:', actRes.status);

  return updated;
}

async function getLatestExecution() {
  const res = await fetch(`${N8N_BASE}/api/v1/executions?workflowId=${WF_ID}&limit=1`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const data = await res.json();
  return data.data?.[0] || null;
}

async function getExecutionDetail(execId) {
  const res = await fetch(`${N8N_BASE}/api/v1/executions/${execId}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  return res.json();
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // Step 1: Set test cron (now + 2 minutes)
  const now = new Date();
  const testMin = (now.getUTCMinutes() + 2) % 60;
  const testHour = now.getUTCHours() + (now.getUTCMinutes() + 2 >= 60 ? 1 : 0);
  const testCron = `${testMin} ${testHour} * * *`;

  console.log(`Current UTC: ${now.toISOString()}`);
  console.log(`Test cron: ${testCron} (fires at ${testHour}:${String(testMin).padStart(2,'0')} UTC)`);

  // Get current latest execution before test
  const execBefore = await getLatestExecution();
  const execIdBefore = execBefore?.id;
  console.log(`Latest execution before test: ${execIdBefore} (${execBefore?.status})`);

  // Set test cron
  await setCron(testCron);
  console.log(`Test cron set. Waiting 3 minutes for trigger...`);

  // Wait 3 minutes
  await sleep(3 * 60 * 1000);
  console.log('3 minutes passed, checking for new execution...');

  // Check for new execution
  let newExec = null;
  for (let i = 0; i < 20; i++) {
    const exec = await getLatestExecution();
    if (exec && exec.id !== execIdBefore) {
      newExec = exec;
      break;
    }
    console.log(`Waiting for new execution... attempt ${i+1}/20`);
    await sleep(30 * 1000);
  }

  if (!newExec) {
    console.log('No new execution found after waiting. Restoring cron...');
  } else {
    console.log(`\nNew execution found: ${newExec.id} | status: ${newExec.status}`);

    // Wait if still running
    let detail = newExec;
    let attempts = 0;
    while (detail.status === 'running' && attempts < 30) {
      console.log('Execution still running, waiting 30s...');
      await sleep(30 * 1000);
      detail = await getExecutionDetail(newExec.id);
      attempts++;
    }

    console.log(`\nFinal execution status: ${detail.status}`);
    console.log(`Execution ID: ${detail.id}`);

    // Find Quality Gate output
    const qgData = detail.data?.resultData?.runData?.['SEO/AEO/GEO Quality Gate'];
    if (qgData) {
      const gateOutput = qgData[0]?.data?.main?.[0]?.[0]?.json?.gate;
      if (gateOutput) {
        console.log(`\nQuality Gate Result:`);
        console.log(`  Score: ${gateOutput.score}/100`);
        console.log(`  Passed: ${gateOutput.passed}`);
        console.log(`  Word Count: ${gateOutput.wordCount || 'N/A'}`);
        console.log(`  Breakdown: SEO=${gateOutput.breakdown?.seo} AEO=${gateOutput.breakdown?.aeo} GEO=${gateOutput.breakdown?.geo}`);
        if (gateOutput.failures?.length > 0) {
          console.log(`  Failures:`);
          gateOutput.failures.forEach(f => console.log(`    - ${f}`));
        }

        if (gateOutput.passed) {
          // Check if commit happened
          const commitData = detail.data?.resultData?.runData?.['Commit to GitHub'];
          if (commitData) {
            const commitResponse = commitData[0]?.data?.main?.[0]?.[0]?.json;
            console.log('\nCommit to GitHub response:', JSON.stringify(commitResponse?.content || commitResponse, null, 2).substring(0, 300));
          } else {
            console.log('\nNo Commit to GitHub data found (may not have reached that node)');
          }
        } else {
          // Check that Prepare Commit was NOT reached
          const prepareCommit = detail.data?.resultData?.runData?.['Prepare Commit'];
          console.log('\nPrepare Commit reached:', !!prepareCommit, '(should be false when passed=false)');
          const revisionPrompt = detail.data?.resultData?.runData?.['Revision Prompt'];
          console.log('Revision Prompt reached:', !!revisionPrompt, '(should be true when passed=false)');
        }
      } else {
        console.log('Quality Gate output not found in execution data');
      }
    } else {
      console.log('Quality Gate node data not found');
      // Show what nodes ran
      const runData = detail.data?.resultData?.runData;
      if (runData) {
        console.log('Nodes that ran:', Object.keys(runData).join(', '));
      }
    }
  }

  // Restore original cron
  console.log(`\nRestoring cron to ${ORIGINAL_CRON}...`);
  await setCron(ORIGINAL_CRON);
  console.log('Cron restored. WF6 active: true, cron: 0 8 * * * (08:00 UTC daily)');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
