/**
 * Run WF6 immediately: set cron to +2min, activate, wait, check results, restore.
 * WF6 ID: YYLuBCEktMeoRcoD
 */
const https = require('https');

const N8N_BASE = 'n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'YYLuBCEktMeoRcoD';
const ORIGINAL_CRON = '22 12 * * *';

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

async function getIsraelTime() {
  const d = new Date();
  const utcMs = d.getTime() + (d.getTimezoneOffset() * 60000);
  const israelMs = utcMs + (3 * 60 * 60000); // UTC+3
  return new Date(israelMs);
}

async function main() {
  const now = await getIsraelTime();
  const h = now.getHours();
  const m = now.getMinutes();
  const triggerM = (m + 2) % 60;
  const triggerH = (m + 2 >= 60) ? (h + 1) % 24 : h;
  const newCron = `${triggerM} ${triggerH} * * *`;

  console.log(`Israel time now: ${h}:${String(m).padStart(2,'0')}`);
  console.log(`Trigger cron: ${newCron} (fires at ${triggerH}:${String(triggerM).padStart(2,'0')} Israel)`);

  // Step 1: Fetch WF6
  console.log('\n[1/6] Fetching WF6...');
  const wf = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  if (!wf.nodes) {
    console.error('Failed to fetch WF6:', JSON.stringify(wf).slice(0, 300));
    process.exit(1);
  }
  console.log(`  name: ${wf.name} | active: ${wf.active} | nodes: ${wf.nodes.length}`);

  // Step 2: Set new cron
  const triggerNode = wf.nodes.find(n =>
    n.type === 'n8n-nodes-base.scheduleTrigger' ||
    n.name === 'Schedule Trigger' ||
    n.name?.toLowerCase().includes('schedule') ||
    n.name?.toLowerCase().includes('cron')
  );
  if (!triggerNode) {
    console.error('Schedule Trigger node not found');
    console.log('Nodes:', wf.nodes.map(n => `${n.name}(${n.type})`).join(', '));
    process.exit(1);
  }
  console.log(`  Trigger node: "${triggerNode.name}" type: ${triggerNode.type}`);

  const currentCron = triggerNode.parameters?.rule?.interval?.[0]?.expression;
  console.log(`  Current cron: ${currentCron}`);
  triggerNode.parameters.rule.interval[0].expression = newCron;

  console.log('\n[2/6] Updating cron...');
  const updateResult = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  });
  if (!updateResult.id) {
    console.error('Update failed:', JSON.stringify(updateResult).slice(0, 300));
    process.exit(1);
  }
  console.log('  Updated. versionId:', updateResult.versionId);

  // Step 3: Activate
  console.log('\n[3/6] Activating WF6...');
  const activateResult = await apiRequest('POST', `/api/v1/workflows/${WF_ID}/activate`, {});
  if (activateResult.active !== true) {
    console.error('Activation failed:', JSON.stringify(activateResult).slice(0, 200));
    process.exit(1);
  }
  console.log('  active=true');

  // Step 4: Wait 3 minutes
  console.log('\n[4/6] Waiting 3 minutes for execution (Claude writing takes 60-120s)...');
  for (let i = 0; i < 18; i++) {
    await sleep(10000);
    process.stdout.write(`  ${(i+1)*10}s...\r`);
  }
  console.log('\n  Done waiting.');

  // Step 5: Check executions
  console.log('\n[5/6] Checking executions...');
  const execs = await apiRequest('GET', `/api/v1/executions?workflowId=${WF_ID}&limit=5`);

  let latestNew = null;
  if (execs.data && execs.data.length > 0) {
    // Find execution newer than ID 4268
    latestNew = execs.data.find(e => Number(e.id) > 4268);
    if (!latestNew) {
      console.log('  No new executions found (latest IDs:', execs.data.map(e => e.id).join(', '), ')');
    } else {
      console.log('\n=== NEW EXECUTION ===');
      console.log('  ID:', latestNew.id);
      console.log('  Status:', latestNew.status);
      console.log('  Started:', latestNew.startedAt);
      console.log('  Finished:', latestNew.stoppedAt || 'still running');

      // Try to get detailed execution data
      const execDetail = await apiRequest('GET', `/api/v1/executions/${latestNew.id}`);
      if (execDetail.data?.resultData?.runData) {
        const runData = execDetail.data.resultData.runData;
        const executedNodes = Object.keys(runData);
        console.log('\n  Executed nodes:', executedNodes.join(' -> '));

        // Look for quality gate
        const gateKey = executedNodes.find(n =>
          n.toLowerCase().includes('gate') ||
          n.toLowerCase().includes('quality') ||
          n.toLowerCase().includes('score')
        );
        if (gateKey) {
          const gateOut = runData[gateKey]?.[0]?.data?.main?.[0]?.[0]?.json;
          if (gateOut) {
            console.log('\n  Quality Gate output:');
            console.log('   ', JSON.stringify(gateOut, null, 2).split('\n').join('\n    '));
          }
        }

        // Look for GitHub node
        const ghKey = executedNodes.find(n =>
          n.toLowerCase().includes('github') ||
          n.toLowerCase().includes('commit') ||
          n.toLowerCase().includes('push')
        );
        if (ghKey) {
          const ghOut = runData[ghKey]?.[0]?.data?.main?.[0]?.[0]?.json;
          if (ghOut) {
            console.log('\n  GitHub commit output:');
            console.log('   ', JSON.stringify(ghOut, null, 2).split('\n').join('\n    '));
          }
        }

        // Look for article data
        const articleKey = executedNodes.find(n =>
          n.toLowerCase().includes('article') ||
          n.toLowerCase().includes('claude') ||
          n.toLowerCase().includes('write') ||
          n.toLowerCase().includes('generat')
        );
        if (articleKey) {
          const articleOut = runData[articleKey]?.[0]?.data?.main?.[0]?.[0]?.json;
          if (articleOut) {
            const title = articleOut.title || articleOut.heroTitle || articleOut.slug || '?';
            const wordCount = articleOut.wordCount || articleOut.word_count || '?';
            const sections = articleOut.sections?.length || '?';
            const faq = articleOut.faq?.length || '?';
            const targetQuery = articleOut.target_query || articleOut.targetQuery || articleOut.keyword || '?';
            console.log('\n  Article:');
            console.log('    Title:', title);
            console.log('    word_count:', wordCount, '| sections:', sections, '| FAQ:', faq);
            console.log('    target_query:', targetQuery);
          }
        }
      } else if (execDetail.status === 'error') {
        const err = execDetail.data?.resultData?.error;
        const lastNode = execDetail.data?.resultData?.lastNodeExecuted;
        console.log('\n  ERROR at node:', lastNode);
        console.log('  Error:', JSON.stringify(err || execDetail.data?.resultData).slice(0, 500));
      }
    }
  } else {
    console.log('  No executions returned:', JSON.stringify(execs).slice(0, 200));
  }

  // Step 6: Restore original cron + deactivate
  console.log('\n[6/6] Restoring original cron + deactivating...');
  const wfFresh = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  const triggerNodeFresh = wfFresh.nodes?.find(n =>
    n.type === 'n8n-nodes-base.scheduleTrigger' ||
    n.name === 'Schedule Trigger'
  );
  if (triggerNodeFresh) {
    triggerNodeFresh.parameters.rule.interval[0].expression = ORIGINAL_CRON;
    const restoreResult = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, {
      name: wfFresh.name,
      nodes: wfFresh.nodes,
      connections: wfFresh.connections,
      settings: wfFresh.settings,
      staticData: wfFresh.staticData || null
    });
    console.log('  Cron restored:', restoreResult.id ? `OK (${ORIGINAL_CRON})` : 'FAILED');
  }

  const deactivateResult = await apiRequest('POST', `/api/v1/workflows/${WF_ID}/deactivate`, {});
  console.log('  Deactivated:', deactivateResult.active === false ? 'OK' : JSON.stringify(deactivateResult).slice(0, 100));

  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
