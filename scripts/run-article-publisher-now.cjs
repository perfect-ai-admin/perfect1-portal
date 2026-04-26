/**
 * Manual Article Publisher — runs the F33 logic directly
 * Usage: node scripts/run-article-publisher-now.cjs
 */
const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';
const GITHUB_TOKEN_CRED_ID = 'vnu7CHFvm9UDM36w'; // We'll need to get this from n8n or use a known token
const GITHUB_REPO = 'perfect-ai-admin/perfect1-portal';

// Get OpenAI key from n8n credentials - we'll need to fetch it
const N8N_BASE = 'https://n8n.perfect-1.one';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(opts, (res) => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(chunks) }); }
        catch (e) { resolve({ status: res.statusCode, body: chunks }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function supabase(method, path, body = null) {
  const r = await request(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey': SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json'
    }
  }, body);
  return r.body;
}

async function main() {
  console.log('=== Manual Article Publisher ===\n');
  
  // Step 1: Log run start
  console.log('1. Logging run start...');
  await supabase('POST', '/rest/v1/seo_runs', { run_type: 'content_ideas', status: 'running' });
  
  // Step 2: Fetch pending ideas
  console.log('2. Fetching pending ideas...');
  const ideasResp = await supabase('POST', '/rest/v1/rpc/get_seo_ideas_to_publish', { max_per_day: 1 });
  console.log('   available_slots:', ideasResp.available_slots, '| published_today:', ideasResp.published_today);
  
  if (!ideasResp.available_slots || ideasResp.available_slots <= 0) {
    console.log('   No slots available today. Already published enough.');
    return;
  }
  
  if (!ideasResp.ideas || ideasResp.ideas.length === 0) {
    console.log('   No pending ideas found.');
    return;
  }
  
  const idea = ideasResp.ideas[0];
  console.log(`   Picked idea #${idea.id}: "${idea.suggested_article_title}"`);
  console.log(`   Target query: ${idea.target_query}`);
  
  // Step 3: Get OpenAI key from n8n credentials
  console.log('\n3. Getting OpenAI credentials from n8n...');
  const credResp = await request(`${N8N_BASE}/api/v1/credentials/enLroXreMPFDnrNF`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  let openaiKey = null;
  if (credResp.body && credResp.body.data && credResp.body.data.apiKey) {
    openaiKey = credResp.body.data.apiKey;
    console.log('   Got OpenAI key from n8n credentials');
  } else {
    console.log('   Could not get from n8n, trying credential test...');
    console.log('   Response:', JSON.stringify(credResp.body).slice(0, 200));
  }
  
  // Step 4: Get GitHub token from n8n
  console.log('\n4. Getting GitHub credentials from n8n...');
  const ghCredResp = await request(`${N8N_BASE}/api/v1/credentials/${GITHUB_TOKEN_CRED_ID}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  console.log('   GitHub cred response:', JSON.stringify(ghCredResp.body).slice(0, 200));
  
  let githubToken = null;
  if (ghCredResp.body && ghCredResp.body.data) {
    const d = ghCredResp.body.data;
    githubToken = d.value || d.headerValue || d.token || d.password;
    if (githubToken && githubToken.startsWith('Bearer ')) githubToken = githubToken.slice(7);
    console.log('   Got GitHub token:', githubToken ? 'YES (len=' + githubToken.length + ')' : 'NO');
  }
  
  if (!openaiKey || !githubToken) {
    console.error('\nCannot proceed without credentials. Check n8n credential access.');
    process.exit(1);
  }
  
  console.log('\nAll credentials obtained. Ready to generate article.');
}

main().catch(e => { console.error('Fatal:', e.message, e.stack); process.exit(1); });
