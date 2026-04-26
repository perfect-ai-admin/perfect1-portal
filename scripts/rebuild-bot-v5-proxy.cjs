/**
 * Rebuilds workflow Yo18hwPWHGndxsZ3 as a simple proxy:
 * GREENAPI Webhook → Extract Payload → Forward to botHandleReply → Log Result
 *
 * Usage: N8N_API_KEY=<key> node scripts/rebuild-bot-v5-proxy.cjs
 */

const N8N_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WORKFLOW_ID = 'Yo18hwPWHGndxsZ3';
const N8N_BASE = 'https://n8n.perfect-1.one';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njc0NjMsImV4cCI6MjA5MDQ0MzQ2M30.NceenXJ43_B3NN9MVz4b5wR4t1Si0hRfYedfmtoujXQ';
const SUPABASE_URL = 'https://rtlpqjqdmomyptcdkmrq.supabase.co/functions/v1/botHandleReply';

async function api(method, path, body) {
  const res = await fetch(`${N8N_BASE}/api/v1${path}`, {
    method,
    headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`n8n ${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function main() {
  console.log('Fetching workflow', WORKFLOW_ID, '...');
  const current = await api('GET', `/workflows/${WORKFLOW_ID}`);
  console.log(`Current: "${current.name}", ${current.nodes.length} nodes, active=${current.active}`);

  const nodes = [
    // Node 1: Keep the exact trigger with same id/webhookId/path
    {
      parameters: {
        httpMethod: 'POST',
        path: 'perfect-one-osek-patur',
        options: {},
        responseMode: 'onReceived',
      },
      id: 'wh-main',
      name: 'GREENAPI Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 300],
      webhookId: 'd78caf31-d435-4fba-ad86-b2877da560f9',
    },

    // Node 2: Extract payload (filter non-message webhooks + annotate fields)
    {
      parameters: {
        jsCode: `// Extract fields from Green API webhook payload
const body = $input.first().json;

// Only process actual incoming messages
const typeWebhook = body.typeWebhook || '';
if (typeWebhook !== 'incomingMessageReceived') {
  return []; // Skip delivery receipts, status updates, etc.
}

const senderData = body.senderData || {};
const messageData = body.messageData || {};

return [{
  json: {
    // Pass the ENTIRE body so botHandleReply can parse everything
    ...body,
    // Annotated fields for easy logging/debugging
    _phone: (senderData.sender || '').replace('@c.us', ''),
    _message: messageData.textMessageData?.textMessage
      || messageData.extendedTextMessageData?.text
      || '',
    _buttonId: messageData.buttonsResponseMessage?.selectedButtonId || '',
    _idMessage: body.idMessage || '',
    _typeMessage: messageData.typeMessage || '',
    _timestamp: new Date().toISOString(),
  }
}];`,
      },
      id: 'extract-payload',
      name: 'Extract Payload',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [480, 300],
    },

    // Node 3: Forward everything to botHandleReply
    {
      parameters: {
        method: 'POST',
        url: SUPABASE_URL,
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Authorization', value: `Bearer ${SUPABASE_ANON_KEY}` },
            { name: 'apikey', value: SUPABASE_ANON_KEY },
          ],
        },
        sendBody: true,
        contentType: 'json',
        body: '={{ $json }}',
        options: {
          timeout: 30000,
          allowUnauthorizedCerts: false,
        },
        onError: 'continueRegularOutput',
      },
      id: 'forward-to-supabase',
      name: 'Forward to botHandleReply',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [720, 300],
    },

    // Node 4: Log result (Set node for observability)
    {
      parameters: {
        assignments: {
          assignments: [
            {
              id: 'log-status',
              name: 'status',
              value: '={{ $json.status || "forwarded" }}',
              type: 'string',
            },
            {
              id: 'log-ts',
              name: 'forwardedAt',
              value: '={{ new Date().toISOString() }}',
              type: 'string',
            },
          ],
        },
        options: {},
      },
      id: 'log-result',
      name: 'Log Result',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [960, 300],
    },
  ];

  const connections = {
    'GREENAPI Webhook': {
      main: [[{ node: 'Extract Payload', type: 'main', index: 0 }]],
    },
    'Extract Payload': {
      main: [[{ node: 'Forward to botHandleReply', type: 'main', index: 0 }]],
    },
    'Forward to botHandleReply': {
      main: [[{ node: 'Log Result', type: 'main', index: 0 }]],
    },
  };

  const payload = {
    name: current.name,
    nodes,
    connections,
    settings: current.settings || { executionOrder: 'v1' },
    staticData: null,
  };

  // Deactivate before updating
  if (current.active) {
    console.log('Deactivating workflow...');
    await api('POST', `/workflows/${WORKFLOW_ID}/deactivate`);
  }

  console.log('Updating workflow with 4 nodes...');
  const updated = await api('PUT', `/workflows/${WORKFLOW_ID}`, payload);
  console.log(`Updated: ${updated.nodes.length} nodes`);

  // Reactivate
  console.log('Activating workflow...');
  await api('POST', `/workflows/${WORKFLOW_ID}/activate`);

  console.log('\n=== DONE ===');
  console.log('Workflow ID:', updated.id);
  console.log('Name:', updated.name);
  console.log('Active:', true);
  console.log('Nodes:');
  updated.nodes.forEach(n => console.log(' -', n.name, '|', n.type));
  console.log('\nWebhook path: perfect-one-osek-patur (UNCHANGED)');
  console.log('Forwards to:', SUPABASE_URL);
}

main().catch(err => { console.error('FAILED:', err.message); process.exit(1); });
