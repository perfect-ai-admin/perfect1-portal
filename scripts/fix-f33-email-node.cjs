const https = require('https');

const N8N_BASE = 'n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'F33CbVflx4aApT71';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: N8N_BASE,
      path: path,
      method: method,
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

async function main() {
  console.log('Fetching F33 workflow...');
  const wf = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  
  if (!wf.nodes) {
    console.error('Failed to get workflow:', JSON.stringify(wf).slice(0, 200));
    process.exit(1);
  }
  
  console.log('Current nodes:', wf.nodes.map(n => n.name));
  
  // Find and fix the email node
  const emailNode = wf.nodes.find(n => n.id === 'notify-email');
  if (!emailNode) {
    console.error('Email node not found!');
    process.exit(1);
  }
  
  console.log('Found email node. Fixing jsonBody expression...');
  
  // Replace the problematic jsonBody with one that uses $json references properly
  // The fix: use a Code node approach — change from httpRequest with expression to
  // a cleaner expression that avoids single-quotes inside {{ }}
  // n8n expression syntax: use $now.format('dd.MM.yyyy') — but single quotes inside are the issue
  // Fix: use $now.toISO() and do string manipulation, OR just use a Set node before.
  // Simplest fix: replace $now.toFormat('dd.MM.yyyy') with $now.toISOString().slice(0,10)
  
  // The real issue: jsonBody starts with = and has {{ }} mixed with HTML string containing single quotes
  // Fix: build the subject and html OUTSIDE using a Code node, then reference $json.subject / $json.html
  
  // OPTION: Replace the broken email node with a Code node that builds the body, 
  // followed by a clean httpRequest node that uses $json.subject etc.
  
  // Simpler fix: Change the jsonBody to use proper n8n expressions
  // Replace: {{ $now.toFormat('dd.MM.yyyy') }} with {{ $now.toISO().slice(0,10) }}
  // And fix the outer = expression format
  
  const title = "={{ $('Parse Article JSON').item.json.title }}";
  const category = "={{ $('Parse Article JSON').item.json.category }}";
  const slug = "={{ $('Parse Article JSON').item.json.slug }}";
  
  // New approach: use a proper JSON body without mixing template literals
  emailNode.parameters.jsonBody = `={
  "to": "yosi5919@gmail.com",
  "from": "no-reply@perfect1.co.il",
  "subject": {{ JSON.stringify("מאמר חדש עלה: " + $('Parse Article JSON').item.json.title) }},
  "html": {{ JSON.stringify("<div dir=\\"rtl\\" style=\\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;\\"><h1 style=\\"color:#1a1a1a;font-size:24px;\\">" + $('Parse Article JSON').item.json.title + "</h1><p><strong>קטגוריה:</strong> " + $('Parse Article JSON').item.json.category + "</p><p><strong>Slug:</strong> " + $('Parse Article JSON').item.json.slug + "</p><p><strong>תאריך פרסום:</strong> " + $now.toISO().slice(0,10) + "</p><div style=\\"margin:24px 0;\\"><a href=\\"https://perfect1.co.il/" + $('Parse Article JSON').item.json.category + "/" + $('Parse Article JSON').item.json.slug + "\\" style=\\"background-color:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;\\">קרא את המאמר המלא</a></div><p style=\\"color:#888;font-size:12px;\\">פרפקט וואן | perfect1.co.il</p></div>") }}
}`;
  
  console.log('New jsonBody:', emailNode.parameters.jsonBody.slice(0, 300));
  
  // Prepare the PUT body — only send what n8n API expects
  const putBody = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };
  
  console.log('Updating workflow...');
  const result = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, putBody);
  
  if (result.id) {
    console.log('SUCCESS: Workflow updated. versionId:', result.versionId);
  } else {
    console.error('Update failed:', JSON.stringify(result).slice(0, 500));
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
