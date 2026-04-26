/**
 * Deploys the FollowUp Bot n8n relay workflow.
 *
 * ARCHITECTURE: The brain lives in the Supabase Edge Function `followupDispatch`.
 * n8n is a THIN relay — it just receives a webhook and forwards to the edge
 * function. This keeps secrets out of n8n, makes logic testable as TypeScript,
 * and reuses the production-tested whatsappHelper.
 *
 * Required env:
 *   N8N_API_URL           e.g. https://n8n.perfect-1.one/api/v1
 *   N8N_API_KEY           n8n personal API token
 *   SUPABASE_URL          e.g. https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  (injected into n8n credential reference below)
 *
 * PREREQUISITE: In n8n UI, create an HTTP Header Auth credential named
 * "Supabase Service Role" with header `Authorization: Bearer <service_key>`.
 * Pass its id via env N8N_SUPABASE_CRED_ID. Without it the deploy still works
 * but the request uses plain HTTP (the edge function accepts anon too if
 * invoked with service role key by pg_net, but from n8n we want auth).
 */

const fs = require('fs');
const path = require('path');

const N8N_API_URL = process.env.N8N_API_URL || '';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const N8N_SUPABASE_CRED_ID = process.env.N8N_SUPABASE_CRED_ID || '';

function bail(msg) { console.error('ERROR:', msg); process.exit(1); }

if (!N8N_API_URL || !N8N_API_KEY) bail('set N8N_API_URL and N8N_API_KEY');
if (!SUPABASE_URL) bail('set SUPABASE_URL');

const DISPATCH_URL = `${SUPABASE_URL}/functions/v1/followupDispatch`;

// ============================================================
// WORKFLOW: FollowUp Bot (thin relay)
// Webhook → HTTP Request → return response
// ============================================================
function buildRelayWorkflow() {
  const httpNode = {
    id: 'disp-forward',
    name: 'Forward to followupDispatch',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [440, 300],
    parameters: {
      method: 'POST',
      url: DISPATCH_URL,
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify($json.body || $json) }}',
      options: {
        retry: { maxTries: 3, waitBetweenTries: 2000 },
        response: { response: { neverError: true, responseFormat: 'json' } },
        timeout: 30000,
      },
    },
  };

  if (N8N_SUPABASE_CRED_ID) {
    httpNode.parameters.authentication = 'genericCredentialType';
    httpNode.parameters.genericAuthType = 'httpHeaderAuth';
    httpNode.credentials = {
      httpHeaderAuth: { id: N8N_SUPABASE_CRED_ID, name: 'Supabase Service Role' },
    };
  }

  return {
    name: 'FollowUp Bot',
    nodes: [
      {
        id: 'disp-webhook',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [220, 300],
        webhookId: 'followup-bot',
        parameters: {
          httpMethod: 'POST',
          path: 'followup-bot',
          responseMode: 'onReceived',
          options: { responseCode: 200 },
        },
      },
      httpNode,
    ],
    connections: {
      Webhook: { main: [[{ node: 'Forward to followupDispatch', type: 'main', index: 0 }]] },
    },
    settings: { executionOrder: 'v1' },
  };
}

// ============================================================
// DEPLOY
// ============================================================
async function n8nRequest(method, p, body) {
  const url = N8N_API_URL.replace(/\/$/, '') + p;
  const resp = await fetch(url, {
    method,
    headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`n8n ${method} ${p} → ${resp.status}: ${t}`);
  }
  return resp.json();
}

async function upsertWorkflow(wf) {
  const list = await n8nRequest('GET', `/workflows?name=${encodeURIComponent(wf.name)}`);
  const existing = (list.data || []).find((w) => w.name === wf.name);
  if (existing) {
    console.log(`→ updating ${wf.name} (${existing.id})`);
    return n8nRequest('PUT', `/workflows/${existing.id}`, wf);
  }
  console.log(`→ creating ${wf.name}`);
  return n8nRequest('POST', '/workflows', wf);
}

(async () => {
  const wf = buildRelayWorkflow();
  // Snapshot the JSON (no secrets since we only reference credentials by id)
  const docsPath = path.join(__dirname, '..', 'docs', 'FollowUp Bot.json');
  fs.writeFileSync(docsPath, JSON.stringify(wf, null, 2));
  console.log(`✓ snapshot written to ${docsPath}`);

  const deployed = await upsertWorkflow(wf);
  console.log(`✓ deployed id=${deployed.id}`);

  console.log('\nNext steps:');
  console.log('  1. In n8n UI, activate the workflow "FollowUp Bot"');
  console.log('  2. In Supabase SQL editor, run:');
  console.log(`     ALTER DATABASE postgres SET app.followup_dispatch_url = '${DISPATCH_URL}';`);
  console.log('     ALTER DATABASE postgres SET app.followup_service_role = \'<SERVICE_ROLE_JWT>\';');
  console.log('     SELECT pg_reload_conf();');
})().catch((e) => { console.error(e); process.exit(1); });
