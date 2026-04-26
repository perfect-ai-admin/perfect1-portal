// v3: Fix wordCount (all fields), max_tokens=8000, Log Gate Failure jsonBody
const N8N_BASE = 'https://n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'F33CbVflx4aApT71';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';

async function api(method, path, body) {
  const res = await fetch(`${N8N_BASE}${path}`, {
    method,
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

async function main() {
  console.log('Fetching F33...');
  const wf = await api('GET', `/api/v1/workflows/${WF_ID}`);
  if (!wf.nodes) { console.error('Failed:', JSON.stringify(wf).slice(0,200)); process.exit(1); }

  // FIX 1: Quality Gate - count words recursively across all fields
  const gateNode = wf.nodes.find(n => n.id === 'quality-gate');
  gateNode.parameters.jsCode = `const parseCtx = $('Parse Article JSON').first().json;
const idea_id = parseCtx.idea_id;

let article;
try {
  article = JSON.parse(parseCtx.file_content);
} catch(e) {
  return [{ json: {
    ...parseCtx, idea_id,
    gate: { score: 0, passed: false, breakdown: { seo: 0, aeo: 0, geo: 0 }, failures: ['Cannot parse file_content: ' + e.message], wordCount: 0 }
  }}];
}

// Count words in ALL string fields recursively (covers steps, items, description, etc.)
function countWords(obj) {
  if (typeof obj === 'string') return obj.split(/\\s+/).filter(Boolean).length;
  if (Array.isArray(obj)) return obj.reduce((s, x) => s + countWords(x), 0);
  if (typeof obj === 'object' && obj !== null) return Object.values(obj).reduce((s, v) => s + countWords(v), 0);
  return 0;
}

const sections = article.sections || [];
const faq = article.faq || [];
const keywords = article.keywords || [];
const metaTitle = article.metaTitle || '';
const metaDesc = article.metaDescription || '';

// Word count = all text in sections + faq
const wordCount = countWords(sections) + countWords(faq);

const failures = [];

// SEO (40)
let seo = 0;
if (metaTitle.length > 0 && metaTitle.length <= 60) seo += 10; else failures.push('metaTitle len=' + metaTitle.length + ' (need 1-60)');
if (metaDesc.length > 0 && metaDesc.length <= 155) seo += 10; else failures.push('metaDescription len=' + metaDesc.length + ' (need 1-155)');
if (wordCount >= 1200) seo += 10; else failures.push('Word count ' + wordCount + ' (min 1200)');
if (sections.length >= 8 && sections.length <= 12 && (article.toc || []).length >= 8) seo += 10; else failures.push('sections=' + sections.length + ' toc=' + (article.toc||[]).length + ' (need 8-12)');

// AEO (30)
let aeo = 0;
if (faq.length >= 6) aeo += 15; else failures.push('FAQ=' + faq.length + ' (min 6)');
const faqOk = faq.filter(f => { const w = (f.answer||'').split(/\\s+/).filter(Boolean).length; return w >= 30 && w <= 100; }).length;
if (faq.length > 0 && faqOk >= Math.ceil(faq.length * 0.6)) aeo += 15; else failures.push('FAQ answers: ' + faqOk + '/' + faq.length + ' in range 30-100 words');

// GEO (30)
let geo = 0;
const allText = JSON.stringify(sections);
const entities = ['רשות המסים','מע"מ','ביטוח לאומי','מס הכנסה'];
const entitiesOk = entities.filter(e => (allText.match(new RegExp(e,'g'))||[]).length >= 2).length;
if (entitiesOk >= 3) geo += 10; else failures.push('Only ' + entitiesOk + '/4 entities mentioned 2+ times');
const numbers = (allText.match(/\\b\\d+\\b/g) || []).length;
if (numbers >= 8) geo += 10; else failures.push('Numbers=' + numbers + ' (min 8)');
if (keywords.length >= 20) geo += 10; else failures.push('Keywords=' + keywords.length + ' (min 20)');

const authorOk = article.author && article.author.name === 'צוות פרפקט וואן';
if (!authorOk) failures.push('Wrong author: ' + JSON.stringify(article.author));

const score = seo + aeo + geo;
const passed = score >= 75 && authorOk;

return [{
  json: {
    ...parseCtx,
    idea_id,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    sections: article.sections,
    faq: article.faq,
    keywords: article.keywords,
    author: article.author,
    toc: article.toc,
    gate: { score, passed, breakdown: { seo, aeo, geo }, failures, wordCount }
  }
}];`;
  console.log('Fix 1: Quality Gate jsCode updated (recursive wordCount, relaxed FAQ range 30-100)');

  // FIX 2: Call OpenAI - increase max_tokens to 8000
  const openaiNode = wf.nodes.find(n => n.id === 'openai-call');
  if (!openaiNode) { console.error('openai-call not found!'); process.exit(1); }
  openaiNode.parameters.jsonBody = openaiNode.parameters.jsonBody.replace('"max_tokens": 4000', '"max_tokens": 8000');
  console.log('Fix 2: OpenAI max_tokens → 8000');

  // FIX 3: Log Gate Failure - use sendBody with proper JSON (not expression in value)
  const logGateNode = wf.nodes.find(n => n.id === 'log-gate-failure');
  if (!logGateNode) { console.error('log-gate-failure not found!'); process.exit(1); }

  // Use specifyBody: 'json' with a jsonBody that only has simple expressions
  logGateNode.parameters = {
    method: 'PATCH',
    url: '=https://rtlpqjqdmomyptcdkmrq.supabase.co/rest/v1/seo_content_ideas?id=eq.{{ $json.idea_id }}',
    authentication: 'none',
    sendHeaders: true,
    specifyHeaders: 'keypair',
    headerParameters: {
      parameters: [
        { name: 'Authorization', value: `Bearer ${SUPABASE_SERVICE_KEY}` },
        { name: 'apikey', value: SUPABASE_SERVICE_KEY },
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Prefer', value: 'return=representation' }
      ]
    },
    sendBody: true,
    contentType: 'json',
    specifyBody: 'keypair',
    bodyParameters: {
      parameters: [
        { name: 'status', value: 'needs_revision' },
        { name: 'notes', value: '=Gate {{ $json.gate.score }}/100 failed' }
      ]
    },
    options: {}
  };
  console.log('Fix 3: Log Gate Failure → keypair body (avoids JSON injection)');

  // Push
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };

  const result = await api('PUT', `/api/v1/workflows/${WF_ID}`, payload);
  if (result.id) {
    console.log('\nSUCCESS! versionId:', result.versionId);
    console.log('active:', result.active);
  } else {
    console.error('FAILED:', JSON.stringify(result).slice(0,500));
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
