/**
 * add-seo-publisher-email.cjs
 *
 * מוסיף email notification ל-workflow "SEO - Auto Article Publisher" ב-n8n.
 * Node חדש: "Send Publish Notification" (HTTP Request -> Resend)
 * מחובר אחרי "Mark as Published" node.
 *
 * Run: N8N_API_KEY=xxx RESEND_API_KEY=re_xxx node scripts/add-seo-publisher-email.cjs
 */
const https = require('https');

const N8N_KEY = process.env.N8N_API_KEY || '';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const N8N_HOST = 'n8n.perfect-1.one';

if (!N8N_KEY) { console.error('ERROR: Set N8N_API_KEY'); process.exit(1); }
if (!RESEND_KEY) { console.error('ERROR: Set RESEND_API_KEY'); process.exit(1); }

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: N8N_HOST,
      path: '/api/v1' + path,
      method,
      headers: {
        'X-N8N-API-KEY': N8N_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
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

// Build the email HTML via Code node (avoids n8n expression escaping issues in HTML)
const BUILD_EMAIL_CODE = `
const d = $input.first().json;
const title = d.title || d.heroTitle || d.slug || 'מאמר חדש';
const slug = d.slug || '';
const category = d.category || '';
const summary = d.metaDescription || d.description || '';
const articleUrl = 'https://perfect1.co.il/' + category + '/' + slug;
const today = new Date().toLocaleDateString('he-IL');

const html = '<div dir=\\"rtl\\" style=\\"font-family:Arial,sans-serif;max-width:600px;background:#f9fafb;padding:24px;border-radius:8px;\\">' +
  '<div style=\\"background:#1E3A5F;color:white;padding:16px 20px;border-radius:6px;margin-bottom:20px;\\">' +
  '<h2 style=\\"margin:0;font-size:18px;\\">&#x1F4DD; \\u05DE\\u05D0\\u05DE\\u05E8 \\u05D7\\u05D3\\u05E9 \\u05E4\\u05D5\\u05E8\\u05E1\\u05DD \\u05D1\\u05D0\\u05EA\\u05E8</h2>' +
  '<p style=\\"margin:4px 0 0;font-size:13px;opacity:0.8;">perfect1.co.il</p></div>' +
  '<div style=\\"background:white;padding:20px;border-radius:6px;border:1px solid #e5e7eb;\\">' +
  '<h3 style=\\"color:#1E3A5F;margin:0 0 12px;\\">' + title + '</h3>' +
  '<p style=\\"color:#6b7280;font-size:14px;margin:0 0 16px;\\">' + summary + '</p>' +
  '<table style=\\"width:100%;font-size:13px;margin-bottom:16px;\\">' +
  '<tr><td style=\\"color:#9ca3af;width:80px;padding:4px 0;\\">\\u05E7\\u05D8\\u05D2\\u05D5\\u05E8\\u05D9\\u05D4:</td><td style=\\"color:#374151;font-weight:bold;\\">' + category + '</td></tr>' +
  '<tr><td style=\\"color:#9ca3af;padding:4px 0;\\">Slug:</td><td style=\\"color:#374151;\\">' + slug + '</td></tr>' +
  '<tr><td style=\\"color:#9ca3af;padding:4px 0;\\">\\u05EA\\u05D0\\u05E8\\u05D9\\u05DB:</td><td style=\\"color:#374151;\\">' + today + '</td></tr>' +
  '</table>' +
  '<a href=\\"' + articleUrl + '\\" style=\\"display:inline-block;background:#1E3A5F;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;\\">\\u05E4\\u05EA\\u05D7 \\u05DE\\u05D0\\u05DE\\u05E8 \\u05D1\\u05D0\\u05EA\\u05E8</a>' +
  '</div></div>';

return [{ json: { ...d, _notify_html: html, _notify_subject: '\\u05DE\\u05D0\\u05DE\\u05E8 \\u05D7\\u05D3\\u05E9 \\u05E4\\u05D5\\u05E8\\u05E1\\u05DD: ' + title, _notify_url: articleUrl } }];
`;

const EMAIL_NODES = [
  {
    id: 'seo-build-email',
    name: 'Build Publish Email',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1400, 300],
    parameters: {
      mode: 'runOnceForEachItem',
      jsCode: BUILD_EMAIL_CODE,
    },
  },
  {
    id: 'seo-send-email',
    name: 'Send Publish Notification',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1620, 300],
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
          { name: 'Content-Type', value: 'application/json' },
        ],
      },
      sendBody: true,
      contentType: 'raw',
      rawContentType: 'application/json',
      body: '={{ JSON.stringify({ from: "Perfect One <no-reply@perfect1.co.il>", to: ["yosi5919@gmail.com"], subject: $json._notify_subject, html: $json._notify_html }) }}',
    },
  },
];

async function findSeoPublisherWorkflow() {
  const res = await api('GET', '/workflows?limit=100');
  if (res.status !== 200) throw new Error(`List workflows failed: ${res.status}`);
  const workflows = res.body.data || res.body;
  const wf = workflows.find(w =>
    w.name && (
      w.name.toLowerCase().includes('seo') &&
      (w.name.toLowerCase().includes('article') || w.name.toLowerCase().includes('publisher') || w.name.toLowerCase().includes('publish'))
    )
  );
  if (!wf) {
    console.log('All workflow names:');
    workflows.forEach(w => console.log(' -', w.id, w.name));
    throw new Error('SEO article publisher workflow not found — check name above');
  }
  return wf;
}

function findMarkAsPublishedNode(wf) {
  return wf.nodes.find(n =>
    n.name && (
      n.name.toLowerCase().includes('mark') ||
      n.name.toLowerCase().includes('published') ||
      n.name.toLowerCase().includes('פרסם') ||
      n.name.toLowerCase().includes('update')
    )
  );
}

async function main() {
  console.log('Finding SEO Article Publisher workflow...');
  const summary = await findSeoPublisherWorkflow();
  console.log(`Found: "${summary.name}" (ID: ${summary.id})`);

  const get = await api('GET', `/workflows/${summary.id}`);
  if (get.status !== 200) throw new Error(`Get workflow failed: ${get.status}`);
  const wf = get.body;
  console.log('Nodes:', wf.nodes.map(n => n.name).join(', '));

  const markNode = findMarkAsPublishedNode(wf);
  if (!markNode) {
    console.error('ERROR: Could not find "Mark as Published" node. Nodes:', wf.nodes.map(n => n.name));
    process.exit(1);
  }
  console.log(`"Mark as Published" node: "${markNode.name}"`);

  // Remove existing email nodes (idempotent)
  wf.nodes = wf.nodes.filter(n => !['seo-build-email', 'seo-send-email'].includes(n.id));
  delete wf.connections['Build Publish Email'];

  // Add new nodes
  wf.nodes.push(...EMAIL_NODES);

  // Wire: Mark as Published -> Build Publish Email
  if (!wf.connections[markNode.name]) {
    wf.connections[markNode.name] = { main: [[]] };
  }
  if (!wf.connections[markNode.name].main) wf.connections[markNode.name].main = [[]];
  if (!wf.connections[markNode.name].main[0]) wf.connections[markNode.name].main[0] = [];

  const markConns = wf.connections[markNode.name].main[0];
  if (!markConns.find(c => c.node === 'Build Publish Email')) {
    markConns.push({ node: 'Build Publish Email', type: 'main', index: 0 });
    console.log(`Connected: "${markNode.name}" -> "Build Publish Email"`);
  }

  // Wire: Build Publish Email -> Send Publish Notification
  wf.connections['Build Publish Email'] = {
    main: [[{ node: 'Send Publish Notification', type: 'main', index: 0 }]],
  };

  // Deactivate -> Update -> Reactivate
  await api('PATCH', `/workflows/${summary.id}`, { active: false });
  console.log('Uploading updated workflow...');
  const update = await api('PUT', `/workflows/${summary.id}`, wf);
  if (update.status !== 200) {
    console.error('Update failed:', JSON.stringify(update.body, null, 2).slice(0, 500));
    process.exit(1);
  }

  const act = await api('PATCH', `/workflows/${summary.id}`, { active: true });
  console.log('Reactivated, status:', act.status);

  // Verify
  const verify = await api('GET', `/workflows/${summary.id}`);
  const emailNode = (verify.body.nodes || []).find(n => n.id === 'seo-send-email');
  console.log('\n=== VERIFICATION ===');
  console.log('Send Publish Notification node:', emailNode ? 'OK' : 'MISSING');
  console.log('Active:', verify.body.active);
  console.log('\nDone. Next article publish will trigger email to yosi5919@gmail.com');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
