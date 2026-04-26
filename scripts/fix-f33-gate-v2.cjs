// Fix Quality Gate (reads file_content) + Log Gate Failure (valid jsonBody)
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

  // Fix Quality Gate - parse file_content
  const gateNode = wf.nodes.find(n => n.id === 'quality-gate');
  if (!gateNode) { console.error('quality-gate node not found!'); process.exit(1); }

  gateNode.parameters.jsCode = `const parseCtx = $('Parse Article JSON').first().json;
const idea_id = parseCtx.idea_id;

// Parse the article from file_content string
let article;
try {
  article = JSON.parse(parseCtx.file_content);
} catch(e) {
  return [{ json: {
    ...parseCtx,
    idea_id,
    gate: { score: 0, passed: false, breakdown: { seo: 0, aeo: 0, geo: 0 }, failures: ['Cannot parse file_content: ' + e.message], wordCount: 0 }
  }}];
}

const sections = article.sections || [];
const faq = article.faq || [];
const keywords = article.keywords || [];
const metaTitle = article.metaTitle || '';
const metaDesc = article.metaDescription || '';

const wordCount = sections.reduce((sum, s) => {
  const content = (s.content || '') + ' ' + (s.answerBlock || '');
  return sum + content.split(/\\s+/).filter(Boolean).length;
}, 0);

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
const faqOk = faq.filter(f => { const w = (f.answer||'').split(/\\s+/).filter(Boolean).length; return w >= 40 && w <= 80; }).length;
if (faq.length > 0 && faqOk >= Math.ceil(faq.length * 0.6)) aeo += 15; else failures.push('FAQ answers out of range 40-80 words');

// GEO (30)
let geo = 0;
const allText = sections.map(s => (s.content||'') + ' ' + (s.answerBlock||'')).join(' ');
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
    // expose article fields for email node
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    sections: article.sections,
    faq: article.faq,
    keywords: article.keywords,
    author: article.author,
    gate: { score, passed, breakdown: { seo, aeo, geo }, failures, wordCount }
  }
}];`;

  console.log('Quality Gate jsCode updated (reads file_content)');

  // Fix Log Gate Failure - valid JSON body without template literals inside
  const logGateNode = wf.nodes.find(n => n.id === 'log-gate-failure');
  if (!logGateNode) { console.error('log-gate-failure not found!'); process.exit(1); }

  // Use a simple jsonBody with separate expressions
  logGateNode.parameters.jsonBody = '={"status":"needs_revision","notes":"Gate {{ $json.gate.score }}/100: {{ $json.gate.failures.join(\', \') }}"}';

  console.log('Log Gate Failure jsonBody fixed');

  // Also fix email node to use Quality Gate data (since gate exposes it now)
  // email already references $('Quality Gate').item.json.gate.wordCount and $('Parse Article JSON') for other fields
  // Update email to use $('Quality Gate') for article data too
  const emailNode = wf.nodes.find(n => n.id === 'notify-email');
  if (emailNode) {
    emailNode.parameters.jsonBody = `={
  "to": "yosi5919@gmail.com",
  "from": "no-reply@perfect1.co.il",
  "subject": {{ JSON.stringify("📝 מאמר חדש חי: " + $('Quality Gate').item.json.title) }},
  "html": {{ JSON.stringify("<div dir=\\"rtl\\" style=\\"font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f9fafb;\\"><div style=\\"background:#1E3A5F;color:white;padding:20px;border-radius:8px 8px 0 0;\\"><h1 style=\\"margin:0;font-size:22px;\\">📝 מאמר חדש עלה לאוויר</h1><p style=\\"margin:6px 0 0;opacity:0.85;font-size:13px;\\">perfect1.co.il</p></div><div style=\\"background:white;padding:24px;border:1px solid #e5e7eb;border-top:none;\\"><h2 style=\\"color:#1E3A5F;margin:0 0 12px;\\">" + $('Quality Gate').item.json.title + "</h2><p style=\\"color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 20px;\\">" + ($('Quality Gate').item.json.metaDescription || '') + "</p><table style=\\"width:100%;font-size:13px;margin-bottom:24px;border-collapse:collapse;\\"><tr><td style=\\"color:#9ca3af;padding:6px 0;width:120px;\\">קטגוריה:</td><td>" + $('Quality Gate').item.json.category + "</td></tr><tr><td style=\\"color:#9ca3af;padding:6px 0;\\">מילים:</td><td>" + $('Quality Gate').item.json.gate.wordCount + "</td></tr><tr><td style=\\"color:#9ca3af;padding:6px 0;\\">ציון איכות:</td><td><strong style=\\"color:#059669;\\">" + $('Quality Gate').item.json.gate.score + "/100</strong></td></tr><tr><td style=\\"color:#9ca3af;padding:6px 0;\\">Sections:</td><td>" + ($('Quality Gate').item.json.sections || []).length + "</td></tr><tr><td style=\\"color:#9ca3af;padding:6px 0;\\">FAQ:</td><td>" + ($('Quality Gate').item.json.faq || []).length + " שאלות</td></tr></table><div style=\\"text-align:center;margin:24px 0;\\"><a href=\\"https://www.perfect1.co.il/" + $('Quality Gate').item.json.category + "/" + $('Quality Gate').item.json.slug + "\\" style=\\"display:inline-block;background:#1E3A5F;color:white;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;\\">🔗 פתח מאמר באתר</a></div><p style=\\"color:#9ca3af;font-size:11px;text-align:center;margin:20px 0 0;\\"><a href=\\"https://github.com/perfect-ai-admin/perfect1-portal/blob/main/" + $('Quality Gate').item.json.file_path + "\\" style=\\"color:#6b7280;\\">view on github</a> &nbsp;•&nbsp; אתר יעודכן תוך 2-3 דקות אחרי commit (Vercel build)</p></div></div>") }}
}`;
    console.log('Email node updated to use Quality Gate data');
  }

  // Push
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };

  console.log('Pushing fixes...');
  const result = await api('PUT', `/api/v1/workflows/${WF_ID}`, payload);

  if (result.id) {
    console.log('SUCCESS! versionId:', result.versionId);
    console.log('active:', result.active);
    console.log('nodes:', result.nodes?.length);
  } else {
    console.error('FAILED:', JSON.stringify(result).slice(0,500));
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
