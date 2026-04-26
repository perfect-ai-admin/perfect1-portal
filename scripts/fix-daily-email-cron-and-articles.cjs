// Fix Daily Email workflow:
// 1. Change cron from 08:30 Israel to 11:30 Israel (after F33 at 11:00)
// 2. Convert "Fetch Today's Articles" from HTTP node to Code node
//    so it always returns 1 item even when no articles today (empty array no longer stops chain)

const N8N_BASE = 'https://n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'pP0LzSvFURy3BCBd';

const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';

async function api(method, path, body) {
  const res = await fetch(N8N_BASE + path, {
    method,
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

const FETCH_ARTICLES_CODE = `// Fetch today's published articles from Supabase
// Always returns exactly 1 item so the downstream chain never stops
const https = require('https');

const SUPABASE_KEY = '${SUPABASE_SERVICE_KEY}';

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve([]); } });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

const today = new Date().toISOString().split('T')[0];
const url = 'https://rtlpqjqdmomyptcdkmrq.supabase.co/rest/v1/seo_published_articles?created_at=gte.' + today + 'T00:00:00&select=*&order=created_at.desc';
const articles = await httpsGet(url, { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY });

// Always return 1 item containing the articles array
return [{ json: { articles: Array.isArray(articles) ? articles : [] } }];`;

async function main() {
  console.log('Fetching Daily Email workflow...');
  const wf = await api('GET', `/api/v1/workflows/${WF_ID}`);
  if (!wf.nodes) { console.error('Failed:', JSON.stringify(wf).slice(0,200)); process.exit(1); }

  // FIX 1: Change cron from 0 30 8 (08:30 Israel) to 0 30 11 (11:30 Israel)
  const schedNode = wf.nodes.find(n => n.type === 'n8n-nodes-base.scheduleTrigger');
  console.log('Current cron:', schedNode.parameters.rule.interval[0].expression);
  schedNode.parameters.rule.interval[0].expression = '0 30 11 * * *';
  console.log('New cron: 0 30 11 * * * (11:30 Israel time)');

  // FIX 2: Convert "Fetch Today's Articles" to Code node — always returns 1 item
  const ftaNode = wf.nodes.find(n => n.name === "Fetch Today's Articles");
  ftaNode.type = 'n8n-nodes-base.code';
  ftaNode.typeVersion = 2;
  ftaNode.parameters = { jsCode: FETCH_ARTICLES_CODE };
  console.log('Converted Fetch Today Articles to Code node');

  // FIX 3: Update Build Daily Email to read from new structure { articles: [...] }
  const buildNode = wf.nodes.find(n => n.name === 'Build Daily Email');
  buildNode.parameters.jsCode = buildNode.parameters.jsCode.replace(
    `const articlesRaw = $("Fetch Today's Articles").first().json;\n  const articles = Array.isArray(articlesRaw) ? articlesRaw : (articlesRaw.body || []);`,
    `const articlesData = $("Fetch Today's Articles").first().json;\n  const articles = articlesData.articles || [];`
  );
  console.log('Updated Build Daily Email to read articles.articles');

  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };

  const r = await api('PUT', `/api/v1/workflows/${WF_ID}`, payload);
  if (r.id) {
    console.log('\nWorkflow updated successfully!');
    console.log('- Cron: now fires at 11:30 Israel time (after F33 at 11:00)');
    console.log('- Fetch Today Articles: Code node, always returns 1 item');
    console.log('- Build Daily Email: reads articles.articles');
  } else {
    console.error('PUT failed:', JSON.stringify(r).slice(0,300));
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
