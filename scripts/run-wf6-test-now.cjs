/**
 * Test WF6 after architectural fix.
 * Sets cron to now+2min, deactivate+activate to reload scheduler, polls for result.
 */
const https = require('https');

const N8N_BASE = 'n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'YYLuBCEktMeoRcoD';
const ORIGINAL_CRON = '0 8 * * *';

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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const now = new Date();
  const triggerM = (now.getUTCMinutes() + 2) % 60;
  const triggerH = now.getUTCHours() + (now.getUTCMinutes() + 2 >= 60 ? 1 : 0);
  const testCron = `${triggerM} ${triggerH} * * *`;

  console.log(`Current UTC: ${now.toISOString()}`);
  console.log(`Test cron: ${testCron} (fires at ${triggerH}:${String(triggerM).padStart(2,'0')} UTC)`);

  // Fetch WF6
  console.log('\n[1] Fetching WF6...');
  const wf = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  console.log(`  name: ${wf.name} | active: ${wf.active} | nodes: ${wf.nodes?.length}`);

  const lastExecRes = await apiRequest('GET', `/api/v1/executions?workflowId=${WF_ID}&limit=1`);
  const lastExecId = lastExecRes.data?.[0]?.id;
  console.log(`  Last execution before test: ${lastExecId}`);

  // Verify our Switch node is in place
  const switchNode = wf.nodes?.find(n => n.name === 'IF Gate Passed');
  console.log(`  Gate node type: ${switchNode?.type} | output: ${switchNode?.parameters?.output}`);

  // Set test cron
  const cronNode = wf.nodes.find(n => n.id === 'wf6-trigger');
  cronNode.parameters.rule.interval[0].expression = testCron;

  console.log('\n[2] Updating cron...');
  const updated = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  });
  console.log(`  cron updated to: ${testCron}`);

  // Critical: deactivate + activate to reload scheduler
  console.log('\n[3] Deactivate + reactivate to reload scheduler...');
  await apiRequest('POST', `/api/v1/workflows/${WF_ID}/deactivate`, {});
  await sleep(2000);
  const actResult = await apiRequest('POST', `/api/v1/workflows/${WF_ID}/activate`, {});
  console.log(`  active: ${actResult.active}`);

  // Wait for trigger (3.5 minutes from now)
  console.log('\n[4] Waiting 3.5 minutes for trigger...');
  for (let i = 0; i < 21; i++) {
    await sleep(10000);
    process.stdout.write(`  ${(i+1)*10}s... \r`);
  }
  console.log('\n  Wait complete.');

  // Poll for new execution (up to 5 more minutes)
  console.log('\n[5] Polling for new execution...');
  let newExec = null;
  for (let i = 0; i < 30; i++) {
    const res = await apiRequest('GET', `/api/v1/executions?workflowId=${WF_ID}&limit=1`);
    const latest = res.data?.[0];
    if (latest && latest.id !== lastExecId) {
      newExec = latest;
      console.log(`  NEW EXECUTION: ${latest.id} | status: ${latest.status}`);
      break;
    }
    process.stdout.write(`  Attempt ${i+1}/30 - still at ${lastExecId}...\r`);
    await sleep(10000);
  }

  if (!newExec) {
    console.log('\n  TIMEOUT: No new execution found after 5 minutes.');
    console.log('  n8n scheduler did not pick up the cron change.');
  } else {
    // Wait if still running
    let detail = await apiRequest('GET', `/api/v1/executions/${newExec.id}`);
    let wait = 0;
    while (detail.status === 'running' && wait < 20) {
      process.stdout.write(`  Still running... ${wait*15}s\r`);
      await sleep(15000);
      detail = await apiRequest('GET', `/api/v1/executions/${newExec.id}`);
      wait++;
    }

    console.log(`\n=== EXECUTION RESULT ===`);
    console.log(`  ID: ${detail.id}`);
    console.log(`  Status: ${detail.status}`);
    console.log(`  Started: ${detail.startedAt}`);
    console.log(`  Finished: ${detail.stoppedAt}`);

    const runData = detail.data?.resultData?.runData;
    if (runData) {
      console.log(`  Nodes ran: ${Object.keys(runData).join(' -> ')}`);

      const gateRun = runData['SEO/AEO/GEO Quality Gate'];
      if (gateRun) {
        const gate = gateRun[0]?.data?.main?.[0]?.[0]?.json?.gate;
        console.log(`\n  Quality Gate:`);
        console.log(`    Score: ${gate?.score}/100`);
        console.log(`    Passed: ${gate?.passed}`);
        console.log(`    Word Count: ${gate?.wordCount || 'N/A'}`);
        console.log(`    SEO: ${gate?.breakdown?.seo} | AEO: ${gate?.breakdown?.aeo} | GEO: ${gate?.breakdown?.geo}`);
        if (gate?.failures?.length > 0) {
          console.log(`    Failures:`);
          gate.failures.forEach(f => console.log(`      - ${f}`));
        } else {
          console.log(`    Failures: NONE`);
        }

        if (gate?.passed) {
          const commitRan = !!runData['Prepare Commit'];
          const ghRan = !!runData['Commit to GitHub'];
          const revRan = !!runData['Revision Prompt'];
          console.log(`\n  Routing: Prepare Commit ran=${commitRan} | GitHub ran=${ghRan} | Revision ran=${revRan}`);
          if (!revRan && commitRan) {
            console.log(`  ROUTING CORRECT: passed=true -> Commit (not Revision)`);
            const ghRun = runData['Commit to GitHub'];
            if (ghRun) {
              const ghOut = ghRun[0]?.data?.main?.[0]?.[0]?.json;
              const url = ghOut?.content?.html_url || ghOut?.commit?.html_url;
              console.log(`  GitHub URL: ${url || JSON.stringify(ghOut).substring(0,300)}`);
            }
          } else {
            console.log(`  ROUTING ERROR: passed=true but went to Revision!`);
          }
        } else {
          const revRan = !!runData['Revision Prompt'];
          const commitRan = !!runData['Prepare Commit'];
          console.log(`\n  Routing: Prepare Commit ran=${commitRan} | Revision ran=${revRan}`);
          if (revRan && !commitRan) {
            console.log(`  ROUTING CORRECT: passed=false -> Revision (no commit)`);
          } else {
            console.log(`  ROUTING ERROR: passed=false but Prepare Commit ran!`);
          }
        }
      } else {
        console.log(`  Quality Gate node did not run`);
        if (detail.status === 'error') {
          const err = detail.data?.resultData?.error;
          const lastNode = detail.data?.resultData?.lastNodeExecuted;
          console.log(`  Error at node: ${lastNode}`);
          console.log(`  Error: ${JSON.stringify(err).substring(0,400)}`);
        }
      }
    }
  }

  // Restore cron + keep active
  console.log(`\n[6] Restoring cron to ${ORIGINAL_CRON}...`);
  const wfFresh = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  const cronFresh = wfFresh.nodes.find(n => n.id === 'wf6-trigger');
  cronFresh.parameters.rule.interval[0].expression = ORIGINAL_CRON;
  await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, {
    name: wfFresh.name,
    nodes: wfFresh.nodes,
    connections: wfFresh.connections,
    settings: wfFresh.settings,
    staticData: wfFresh.staticData || null
  });

  // Deactivate + reactivate to register correct cron
  await apiRequest('POST', `/api/v1/workflows/${WF_ID}/deactivate`, {});
  await sleep(1000);
  const finalAct = await apiRequest('POST', `/api/v1/workflows/${WF_ID}/activate`, {});
  console.log(`  Cron restored: ${ORIGINAL_CRON} | active: ${finalAct.active}`);
  console.log('Done.');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
