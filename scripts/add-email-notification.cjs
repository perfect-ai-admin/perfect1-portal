/**
 * Add email notification to perfect-one-post-purchase workflow (H3eXfg8rL5MGoBwt)
 *
 * Architecture:
 *   Build Messages --> Build Email HTML (Code node)
 *                  --> Send Email via Resend (HTTP Request, continueOnFail: true)
 *
 * The Code node builds the HTML and JSON payload; the HTTP Request just POSTs it.
 * This avoids complex n8n expression escaping inside HTML strings.
 *
 * Run: N8N_API_KEY=<key> RESEND_API_KEY=<key> node scripts/add-email-notification.cjs
 */
const https = require('https');

const N8N_KEY = process.env.N8N_API_KEY || '';
const RESEND_KEY = process.env.RESEND_API_KEY || 're_REPLACE_WITH_YOUR_KEY';
const WORKFLOW_ID = 'H3eXfg8rL5MGoBwt';
const N8N_HOST = 'n8n.perfect-1.one';

if (!N8N_KEY) {
  console.error('ERROR: Set N8N_API_KEY env var');
  process.exit(1);
}

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: N8N_HOST,
      path: '/api/v1' + urlPath,
      method,
      headers: {
        'X-N8N-API-KEY': N8N_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: { raw: d } }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Code node: builds the Resend payload as $json.resend_payload
// Runs inside n8n — has access to $input, $json, etc.
const BUILD_EMAIL_CODE = `
const d = $input.first().json;
const f = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '—';
const fileCell = d.file_url
  ? '<a href="' + d.file_url + '" style="color:#10B981;">לחץ לצפייה</a>'
  : '—';
const isEmp = d.is_employee !== undefined
  ? (d.is_employee ? 'כן' : 'לא')
  : '—';
const txId = f(d.transaction_id || (d.metadata && d.metadata.transaction_id));

const html = \`<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;">
  <h2 style="color:#10B981;">&#x1F4B0; &#x05DC;&#x05E7;&#x05D5;&#x05D7; &#x05D7;&#x05D3;&#x05E9; &#x05E9;&#x05D9;&#x05DC;&#x05DD; &#x2013; &#x05E4;&#x05EA;&#x05D9;&#x05D7;&#x05EA; &#x05EA;&#x05D9;&#x05E7;</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05E9;&#x05DD; &#x05DE;&#x05DC;&#x05D0;</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.name)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05D8;&#x05DC;&#x05E4;&#x05D5;&#x05DF;</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.phone)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05D0;&#x05D9;&#x05DE;&#x05D9;&#x05D9;&#x05DC;</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.email)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05EA;.&#x05D6;.</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.id_number)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05E9;&#x05DB;&#x05D9;&#x05E8;</td><td style="padding:6px 10px;border:1px solid #ddd;">\${isEmp}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05E9;&#x05DD; &#x05E2;&#x05E1;&#x05E7;</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.business_name)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05E1;&#x05D5;&#x05D2; &#x05E2;&#x05E1;&#x05E7;</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.business_type)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05E6;&#x05E4;&#x05D9; &#x05D4;&#x05DB;&#x05E0;&#x05E1;&#x05D4;</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.income)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05E7;&#x05D5;&#x05D1;&#x05E5; &#x05EA;.&#x05D6;.</td><td style="padding:6px 10px;border:1px solid #ddd;">\${fileCell}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05E1;&#x05DB;&#x05D5;&#x05DD;</td><td style="padding:6px 10px;border:1px solid #ddd;">&#x20AA;\${f(d.amount)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05DE;&#x05D6;&#x05D4;&#x05D4; &#x05EA;&#x05E9;&#x05DC;&#x05D5;&#x05DD;</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.payment_id)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">Transaction ID</td><td style="padding:6px 10px;border:1px solid #ddd;">\${txId}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">&#x05E9;&#x05D9;&#x05E8;&#x05D5;&#x05EA;</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.service_type || d.service_label)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">Lead ID</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.lead_id)}</td></tr>
    <tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:bold;background:#f8f9fa;">Client ID</td><td style="padding:6px 10px;border:1px solid #ddd;">\${f(d.client_id)}</td></tr>
  </table>
  <p style="color:#666;font-size:12px;margin-top:20px;">&#x05E0;&#x05E9;&#x05DC;&#x05D7; &#x05D0;&#x05D5;&#x05D8;&#x05D5;&#x05DE;&#x05D8;&#x05D9;&#x05EA; &#x05DE;-Perfect One CRM</p>
</div>\`;

return [{
  json: {
    ...d,
    resend_payload: {
      from: 'Perfect One <payments@perfect1.co.il>',
      to: ['yosi5919@gmail.com'],
      subject: '\\u05DC\\u05E7\\u05D5\\u05D7 \\u05D7\\u05D3\\u05E9 \\u05E9\\u05D9\\u05DC\\u05DD \\u2013 \\u05E4\\u05EA\\u05D9\\u05D7\\u05EA \\u05EA\\u05D9\\u05E7 \\u2013 ' + f(d.name),
      html: html
    }
  }
}];
`;

const BUILD_EMAIL_NODE = {
  id: 'build-email-payload',
  name: 'Build Email Payload',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [920, 480],
  continueOnFail: false,
  parameters: {
    mode: 'runOnceForEachItem',
    jsCode: BUILD_EMAIL_CODE
  }
};

const SEND_EMAIL_NODE = {
  id: 'send-email-via-resend',
  name: 'Send Email via Resend',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [1140, 480],
  continueOnFail: true,
  parameters: {
    method: 'POST',
    url: 'https://api.resend.com/emails',
    authentication: 'none',
    sendHeaders: true,
    specifyHeaders: 'keypair',
    headerParameters: {
      parameters: [
        { name: 'Authorization', value: `Bearer ${RESEND_KEY}` },
        { name: 'Content-Type', value: 'application/json' }
      ]
    },
    sendBody: true,
    contentType: 'raw',
    rawContentType: 'application/json',
    body: '={{ JSON.stringify($json.resend_payload) }}'
  }
};

async function main() {
  console.log('Fetching workflow', WORKFLOW_ID, '...');
  const get = await api('GET', `/workflows/${WORKFLOW_ID}`);
  if (get.status !== 200) {
    console.error('Failed:', get.status, JSON.stringify(get.body).slice(0, 300));
    process.exit(1);
  }

  const wf = get.body;
  console.log('Workflow:', wf.name, '| Active:', wf.active);
  console.log('Nodes:', wf.nodes.map(n => n.name).join(', '));

  // Remove old email nodes if present (idempotent)
  wf.nodes = wf.nodes.filter(n =>
    !['send-email-notification', 'build-email-payload', 'send-email-via-resend'].includes(n.id)
  );
  delete wf.connections['Build Email Payload'];
  delete wf.connections['Send Email Notification'];

  // Add new nodes
  wf.nodes.push(BUILD_EMAIL_NODE, SEND_EMAIL_NODE);

  // Wire Build Messages -> Build Email Payload (parallel)
  if (!wf.connections['Build Messages']) {
    wf.connections['Build Messages'] = { main: [[]] };
  }
  if (!wf.connections['Build Messages'].main) {
    wf.connections['Build Messages'].main = [[]];
  }
  if (!wf.connections['Build Messages'].main[0]) {
    wf.connections['Build Messages'].main[0] = [];
  }
  const bmc = wf.connections['Build Messages'].main[0];
  if (!bmc.find(c => c.node === 'Build Email Payload')) {
    bmc.push({ node: 'Build Email Payload', type: 'main', index: 0 });
    console.log('Connected: Build Messages -> Build Email Payload');
  }

  // Wire Build Email Payload -> Send Email via Resend
  wf.connections['Build Email Payload'] = {
    main: [[{ node: 'Send Email via Resend', type: 'main', index: 0 }]]
  };

  // Deactivate
  console.log('Deactivating...');
  await api('PATCH', `/workflows/${WORKFLOW_ID}`, { active: false });

  // Update
  console.log('Uploading...');
  const update = await api('PUT', `/workflows/${WORKFLOW_ID}`, wf);
  console.log('Update status:', update.status);
  if (update.status !== 200) {
    console.error('Failed:', JSON.stringify(update.body, null, 2).slice(0, 500));
    process.exit(1);
  }

  // Reactivate
  console.log('Reactivating...');
  const act = await api('PATCH', `/workflows/${WORKFLOW_ID}`, { active: true });
  console.log('Reactivate status:', act.status);

  // Verify
  const verify = await api('GET', `/workflows/${WORKFLOW_ID}`);
  const buildNode = (verify.body.nodes || []).find(n => n.id === 'build-email-payload');
  const sendNode = (verify.body.nodes || []).find(n => n.id === 'send-email-via-resend');
  const buildConns = verify.body.connections?.['Build Messages']?.main?.[0] || [];

  console.log('\n=== VERIFICATION ===');
  console.log('Build Email Payload node:', buildNode ? 'OK' : 'MISSING');
  console.log('Send Email via Resend node:', sendNode ? 'OK' : 'MISSING');
  console.log('Build Messages connections:', buildConns.map(c => c.node).join(', '));
  console.log('Total nodes:', (verify.body.nodes || []).length);
  console.log('Active:', verify.body.active);

  if (RESEND_KEY === 're_REPLACE_WITH_YOUR_KEY') {
    console.log('\nWARNING: RESEND_API_KEY not set — email will fail at runtime.');
    console.log('  1. Sign up free at https://resend.com (100 emails/day)');
    console.log('  2. Verify sender: payments@perfect1.co.il (or use resend.dev for test)');
    console.log('  3. Rerun: N8N_API_KEY=xxx RESEND_API_KEY=re_xxx node scripts/add-email-notification.cjs');
  } else {
    console.log('\nResend key configured. Email node ready.');
    console.log('Test: trigger a payment_confirmed webhook and check yosi5919@gmail.com');
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
