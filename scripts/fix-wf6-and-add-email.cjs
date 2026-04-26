/**
 * fix-wf6-and-add-email.cjs
 *
 * 1. מחליף credentials של כל Postgres nodes ב-WF6 ל-"Postgres account 2"
 * 2. מוסיף email notification node אחרי "Mark Published"
 *
 * Run: N8N_API_KEY=xxx RESEND_API_KEY=re_xxx node scripts/fix-wf6-and-add-email.cjs
 */
const https = require('https');

const N8N_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const N8N_HOST = 'n8n.perfect-1.one';
const WF6_ID = 'YYLuBCEktMeoRcoD';
const WF6_LOCAL_PATH = 'C:/Users/USER/Desktop/wf6_live.json';

// Credential to switch TO
const CORRECT_CRED = { id: '6JlaN28HJLHbHdpL', name: 'Postgres account 2' };

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
        catch (e) { resolve({ status: res.statusCode, body: { raw: d.slice(0, 300) } }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Email HTML builder — Code node JS (runs inside n8n)
const BUILD_EMAIL_CODE = `
const d = $input.first().json;

// Article data
const title = d.article?.heroTitle || d.article?.metaTitle || d.slug || 'מאמר חדש';
const slug = d.slug || d.article?.slug || '';
const category = d.category || d.article?.category || '';
const articleUrl = 'https://perfect1.co.il/' + category + '/' + slug;
const metaDesc = d.article?.metaDescription || '';

// Idea data (from Fetch Pending Idea)
const targetQuery = d.idea?.target_query || d.target_query || '';
const whyItMatters = d.idea?.why_it_matters || d.why_it_matters || '';

// Quality gate
const score = d.gate?.score ?? d.score ?? '?';
const scoreNote = d.scoreNote || (score !== '?' ? score + '/100' : 'N/A');

const today = new Date().toLocaleDateString('he-IL');
const subject = '[Perfect1] מאמר חדש עלה — ' + title;

const html = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;background:#f9fafb;padding:24px;border-radius:8px;">' +
  '<div style="background:#1E3A5F;color:white;padding:16px 20px;border-radius:6px;margin-bottom:20px;">' +
  '<h2 style="margin:0;font-size:18px;">מאמר חדש פורסם באתר</h2>' +
  '<p style="margin:4px 0 0;font-size:13px;opacity:0.8;">perfect1.co.il · ' + today + '</p></div>' +
  '<div style="background:white;padding:20px;border-radius:6px;border:1px solid #e5e7eb;margin-bottom:16px;">' +
  '<h3 style="color:#1E3A5F;margin:0 0 8px;">' + title + '</h3>' +
  '<p style="color:#6b7280;font-size:14px;margin:0 0 16px;">' + metaDesc + '</p>' +
  '<a href="' + articleUrl + '" style="display:inline-block;background:#1E3A5F;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">פתח מאמר באתר</a>' +
  '</div>' +
  '<div style="background:white;padding:16px 20px;border-radius:6px;border:1px solid #e5e7eb;margin-bottom:16px;">' +
  '<h4 style="margin:0 0 10px;color:#374151;">למה נכתב המאמר הזה?</h4>' +
  '<table style="width:100%;font-size:13px;">' +
  '<tr><td style="color:#9ca3af;padding:4px 0;width:120px;">ביטוי מטרה:</td><td style="color:#374151;font-weight:bold;">' + targetQuery + '</td></tr>' +
  '<tr><td style="color:#9ca3af;padding:4px 0;">למה זה חשוב:</td><td style="color:#374151;">' + whyItMatters + '</td></tr>' +
  '<tr><td style="color:#9ca3af;padding:4px 0;">Quality Gate:</td><td style="color:' + (score >= 80 ? '#16a34a' : '#dc2626') + ';font-weight:bold;">' + scoreNote + '</td></tr>' +
  '</table></div>' +
  '</div>';

return [{ json: { ...d, _email_html: html, _email_subject: subject } }];
`;

const EMAIL_NODES = [
  {
    id: 'seo-wf6-build-email',
    name: 'Build Publish Email',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [2400, 300],
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: BUILD_EMAIL_CODE,
    },
  },
  {
    id: 'seo-wf6-send-email',
    name: 'Send Publish Email',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [2620, 300],
    continueOnFail: true,
    parameters: {
      method: 'POST',
      url: 'https://api.resend.com/emails',
      authentication: 'none',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: {
        parameters: [
          { name: 'Authorization', value: `Bearer ${RESEND_KEY || 'RESEND_KEY_MISSING'}` },
          { name: 'Content-Type', value: 'application/json' },
        ],
      },
      sendBody: true,
      contentType: 'raw',
      rawContentType: 'application/json',
      body: '={{ JSON.stringify({ from: "Perfect One <no-reply@perfect1.co.il>", to: ["yosi5919@gmail.com"], subject: $json._email_subject, html: $json._email_html }) }}',
    },
  },
];

async function main() {
  // n8n API returns nodes:[] for this workflow — use local backup as source of truth
  console.log('Loading WF6 from local backup:', WF6_LOCAL_PATH);
  const fs = require('fs');
  const wf = JSON.parse(fs.readFileSync(WF6_LOCAL_PATH, 'utf8'));
  console.log('WF6 name:', wf.name);
  console.log('Nodes count:', wf.nodes.length);

  // ---- TASK 1: Fix Postgres credentials ----
  let fixedCount = 0;
  wf.nodes = wf.nodes.map(n => {
    if (n.type && n.type.toLowerCase().includes('postgres')) {
      const oldCred = n.credentials?.postgres?.id || 'none';
      if (oldCred !== CORRECT_CRED.id) {
        console.log(`  Fix cred: "${n.name}" ${oldCred} -> ${CORRECT_CRED.id}`);
        n.credentials = { postgres: CORRECT_CRED };
        fixedCount++;
      } else {
        console.log(`  OK: "${n.name}" already has correct cred`);
      }
    }
    return n;
  });
  console.log(`Fixed ${fixedCount} Postgres node(s)`);

  // ---- TASK 2: Add email nodes after "Mark Published" ----
  // Remove if already exists (idempotent)
  wf.nodes = wf.nodes.filter(n => !['seo-wf6-build-email', 'seo-wf6-send-email'].includes(n.id));
  delete wf.connections['Build Publish Email'];
  delete wf.connections['Send Publish Email'];

  wf.nodes.push(...EMAIL_NODES);

  // Find "Mark Published" node
  const markNode = wf.nodes.find(n => n.name === 'Mark Published');
  if (!markNode) {
    console.error('ERROR: "Mark Published" node not found. Nodes:', wf.nodes.map(n => n.name));
    process.exit(1);
  }
  console.log(`Found anchor node: "${markNode.name}"`);

  // Get existing downstream from Mark Published (should go to Log Success)
  const markConnsExisting = wf.connections[markNode.name]?.main?.[0] || [];
  console.log('Mark Published currently connects to:', markConnsExisting.map(c => c.node));

  // Wire: Mark Published -> Build Publish Email (parallel with existing)
  if (!wf.connections[markNode.name]) wf.connections[markNode.name] = { main: [[]] };
  if (!wf.connections[markNode.name].main) wf.connections[markNode.name].main = [[]];
  if (!wf.connections[markNode.name].main[0]) wf.connections[markNode.name].main[0] = [];

  // Keep existing connections, add email branch
  if (!wf.connections[markNode.name].main[0].find(c => c.node === 'Build Publish Email')) {
    wf.connections[markNode.name].main[0].push({ node: 'Build Publish Email', type: 'main', index: 0 });
  }

  // Wire: Build Publish Email -> Send Publish Email
  wf.connections['Build Publish Email'] = {
    main: [[{ node: 'Send Publish Email', type: 'main', index: 0 }]],
  };

  // ---- Deploy ----
  // Strip read-only fields that n8n rejects on PUT
  // Only include fields accepted by n8n PUT /workflows/:id
  const putBody = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || { executionOrder: 'v1' },
  };
  // Add optional fields only if they exist and are not null
  if (wf.staticData && Object.keys(wf.staticData).length > 0) putBody.staticData = wf.staticData;
  if (wf.pinData && Object.keys(wf.pinData).length > 0) putBody.pinData = wf.pinData;

  await api('PATCH', `/workflows/${WF6_ID}`, { active: false });
  console.log('\nUploading updated WF6...');
  const update = await api('PUT', `/workflows/${WF6_ID}`, putBody);
  if (update.status !== 200) {
    console.error('Update failed:', update.status, JSON.stringify(update.body).slice(0, 500));
    process.exit(1);
  }
  console.log('Upload OK');

  const act = await api('PATCH', `/workflows/${WF6_ID}`, { active: true });
  console.log('Reactivated, status:', act.status);

  // ---- Verify ----
  const verify = await api('GET', `/workflows/${WF6_ID}`);
  const vNodes = verify.body.nodes || [];
  const pgNodes = vNodes.filter(n => n.type?.toLowerCase().includes('postgres'));
  const emailNode = vNodes.find(n => n.id === 'seo-wf6-send-email');

  console.log('\n=== VERIFICATION ===');
  pgNodes.forEach(n => {
    const ok = n.credentials?.postgres?.id === CORRECT_CRED.id;
    console.log(`  Postgres "${n.name}": ${ok ? 'OK (account 2)' : 'WRONG - ' + n.credentials?.postgres?.id}`);
  });
  console.log(`  Send Publish Email node: ${emailNode ? 'OK' : 'MISSING'}`);
  console.log(`  Active: ${verify.body.active}`);

  if (!RESEND_KEY) {
    console.log('\n*** RESEND_API_KEY not set ***');
    console.log('Email node added but Authorization header says "RESEND_KEY_MISSING".');
    console.log('To activate email: get Resend key from https://resend.com and rerun:');
    console.log('  N8N_API_KEY=xxx RESEND_API_KEY=re_xxx node scripts/fix-wf6-and-add-email.cjs');
    console.log('\nAlternatively, update the "Send Publish Email" node in n8n UI:');
    console.log('  Headers > Authorization: Bearer re_YOUR_RESEND_KEY');
  } else {
    console.log('\nResend key set. Email will fire on next article publish.');
  }
  console.log('\nDone.');
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
