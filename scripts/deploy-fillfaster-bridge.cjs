/**
 * Deploy: FillFaster Agreement Bridge
 *
 * Required env:
 *   N8N_API_URL        e.g. https://n8n.perfect-1.one/api/v1
 *   N8N_API_KEY        n8n personal API token
 *   N8N_FF_CRED_ID     ID of "FillFaster API Key" credential in n8n
 *                      (HTTP Header Auth: X-Api-Key: <your-fillfaster-key>)
 *
 * PREREQUISITE: In n8n UI, create HTTP Header Auth credential named
 * "FillFaster API Key" with header X-Api-Key = <your FillFaster API key>.
 * Then pass its id via N8N_FF_CRED_ID.
 */

const fs = require('fs');
const path = require('path');

const N8N_API_URL = (process.env.N8N_API_URL || '').replace(/\/$/, '');
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const FF_CRED_ID   = process.env.N8N_FF_CRED_ID || 'FILL_FASTER_CRED_ID';

function bail(msg) { console.error('ERROR:', msg); process.exit(1); }
if (!N8N_API_URL || !N8N_API_KEY) bail('set N8N_API_URL and N8N_API_KEY');

function buildWorkflow() {
  const wf = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'docs', 'fillfaster-agreement-bridge.json'), 'utf8')
  );

  // Inject real credential id
  const ffNode = wf.nodes.find(n => n.id === 'ff-create-link');
  if (ffNode && FF_CRED_ID !== 'FILL_FASTER_CRED_ID') {
    ffNode.credentials.httpHeaderAuth.id = FF_CRED_ID;
  }

  return wf;
}

async function n8nReq(method, p, body) {
  const url = N8N_API_URL + p;
  const resp = await fetch(url, {
    method,
    headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`n8n ${method} ${p} -> ${resp.status}: ${t}`);
  }
  return resp.json();
}

async function upsertWorkflow(wf) {
  const list = await n8nReq('GET', `/workflows?name=${encodeURIComponent(wf.name)}`);
  const existing = (list.data || []).find(w => w.name === wf.name);
  if (existing) {
    console.log(`updating existing workflow id=${existing.id}`);
    return n8nReq('PUT', `/workflows/${existing.id}`, { ...wf, id: existing.id });
  }
  console.log('creating new workflow');
  return n8nReq('POST', '/workflows', wf);
}

async function activateWorkflow(id) {
  return n8nReq('POST', `/workflows/${id}/activate`);
}

(async () => {
  const wf = buildWorkflow();
  const deployed = await upsertWorkflow(wf);
  console.log(`deployed id=${deployed.id}`);

  await activateWorkflow(deployed.id);
  console.log('workflow activated');

  const base = N8N_API_URL.replace('/api/v1', '');
  const webhookUrl = `${base}/webhook/fillfaster-agreement-bridge`;
  console.log('\nWebhook URL:');
  console.log(webhookUrl);

  console.log('\nTest example:');
  console.log(`curl -X POST "${webhookUrl}" \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"fid":"your_form_id","prefill_data":{"שם מלא":"ישראל ישראלי","ת.ז":"123456789"},"user_data":{"lead_id":"abc","agent_id":"xyz","template_key":"close_file"},"template_key":"close_file","template_label":"הסכם סגירת תיק","lead_name":"ישראל ישראלי","lead_email":"test@example.com"}\'');
})().catch(e => { console.error(e); process.exit(1); });
