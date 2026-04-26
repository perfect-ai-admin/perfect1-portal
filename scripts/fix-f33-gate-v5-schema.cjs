// Fix F33 Quality Gate v5 — strict section schema validation + answerBlock coverage
// Also tightens the article-prompt to forbid string-based steps + require comparison tables.
const N8N_BASE = 'https://n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'F33CbVflx4aApT71';

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
  if (!wf.nodes) { console.error('Failed:', JSON.stringify(wf).slice(0, 200)); process.exit(1); }

  // ----------------------------------------------------------------
  // PATCH A: Quality Gate — add strict section schema validation
  // ----------------------------------------------------------------
  const gate = wf.nodes.find(n => n.id === 'quality-gate');
  if (!gate) { console.error('quality-gate node not found'); process.exit(1); }

  gate.parameters.jsCode = `const article = $('Parse Article JSON').first().json;
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
if (sections.length >= 8 && sections.length <= 12 && (article.toc || []).length >= 8) seo += 10; else failures.push('sections=' + sections.length + ' toc=' + (article.toc || []).length + ' (need 8-12)');

// AEO (30)
let aeo = 0;
if (faq.length >= 6) aeo += 15; else failures.push('FAQ=' + faq.length + ' (min 6)');
const faqOk = faq.filter(f => { const w = (f.answer || '').split(/\\s+/).filter(Boolean).length; return w >= 40 && w <= 80; }).length;
if (faq.length > 0 && faqOk >= Math.ceil(faq.length * 0.6)) aeo += 15; else failures.push('FAQ answers out of range 40-80 words');

// GEO (30)
let geo = 0;
const allText = sections.map(s => (s.content || '') + ' ' + (s.answerBlock || '')).join(' ');
const entities = ['רשות המסים', 'מע"מ', 'ביטוח לאומי', 'מס הכנסה'];
const entitiesOk = entities.filter(e => (allText.match(new RegExp(e, 'g')) || []).length >= 2).length;
if (entitiesOk >= 3) geo += 10; else failures.push('Only ' + entitiesOk + '/4 entities mentioned 2+ times');
const numbers = (allText.match(/\\b\\d+\\b/g) || []).length;
if (numbers >= 8) geo += 10; else failures.push('Numbers=' + numbers + ' (min 8)');
if (keywords.length >= 20) geo += 10; else failures.push('Keywords=' + keywords.length + ' (min 20)');

const authorOk = article.author && article.author.name === 'צוות פרפקט וואן';
if (!authorOk) failures.push('Wrong author: ' + JSON.stringify(article.author));

// =============================================================
// STRICT SECTION SCHEMA VALIDATION (v5 — added 2026-04-26)
// Sections that fail schema render as broken UI on the live site.
// =============================================================
const schemaErrors = [];
for (let i = 0; i < sections.length; i++) {
  const sec = sections[i];

  if (sec.type === 'steps') {
    const steps = sec.steps || sec.items || [];
    if (!Array.isArray(steps) || steps.length === 0) {
      schemaErrors.push('Section ' + i + ' (steps): empty or invalid');
      continue;
    }
    for (let j = 0; j < steps.length; j++) {
      const step = steps[j];
      if (typeof step === 'string') {
        schemaErrors.push('Section ' + i + ' step ' + j + ': must be object {title, description}, got string');
      } else if (!step.title || !step.description) {
        schemaErrors.push('Section ' + i + ' step ' + j + ': missing title or description');
      }
    }
  }

  if (sec.type === 'comparison') {
    const hasTable = Array.isArray(sec.headers) && Array.isArray(sec.rows) && sec.headers.length >= 2 && sec.rows.length >= 1;
    const hasCards = Array.isArray(sec.items) && sec.items.length >= 2;
    if (!hasTable && !hasCards) {
      schemaErrors.push('Section ' + i + ' (comparison): must have headers(>=2)+rows(>=1) OR items(>=2)');
    }
  }

  if (sec.type === 'list') {
    const items = sec.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      schemaErrors.push('Section ' + i + ' (list): empty items');
    }
  }

  if (sec.type === 'faq') {
    const items = sec.items || [];
    for (let j = 0; j < items.length; j++) {
      if (!items[j].question || !items[j].answer) {
        schemaErrors.push('Section ' + i + ' FAQ ' + j + ': missing question or answer');
      }
    }
  }
}
if (schemaErrors.length > 0) {
  failures.push.apply(failures, schemaErrors);
}

// AnswerBlock coverage — at least 50% of text sections must have answerBlock
const textSections = sections.filter(s => s.type === 'text');
const withBlock = textSections.filter(s => s.answerBlock).length;
if (textSections.length >= 4 && withBlock / textSections.length < 0.5) {
  failures.push('AnswerBlock coverage: ' + withBlock + '/' + textSections.length + ' text sections have answerBlock — need 50%+');
}

const score = seo + aeo + geo;
// Schema errors are HARD FAIL — even with high score, broken sections kill the article
const schemaOk = schemaErrors.length === 0;
const passed = score >= 75 && authorOk && schemaOk;

return [{
  json: {
    ...article,
    idea_id: $('Build Article Prompt').first().json.idea_id,
    gate: { score, passed, breakdown: { seo, aeo, geo }, failures, wordCount, schemaErrors }
  }
}];`;

  console.log('Patch A: Quality Gate updated with strict schema validation + answerBlock coverage');

  // ----------------------------------------------------------------
  // PATCH B: Build Article Prompt — clarify section schema requirements
  // ----------------------------------------------------------------
  const promptNode = wf.nodes.find(n => n.id === 'build-prompt');
  if (!promptNode) { console.error('build-prompt node not found'); process.exit(1); }

  // Inject extra schema rules into the existing prompt, after rule 11.
  const existing = promptNode.parameters.jsCode;
  const schemaRules = `
12. **steps section**: חייב להיות מערך של objects בפורמט {"title":"שלב X: כותרת","description":"תיאור מלא"}. **אסור** להחזיר מערך של strings — ה-frontend לא יודע לרנדר את זה והמאמר ישבר.
13. **comparison section**: חייב להכיל **headers** (מערך עם 2+ כותרות עמודות) ו-**rows** (מערך מערכים — כל row הוא מערך של ערכי תאים תואם להאדרים). אם אין טבלה אמיתית — אל תשתמש ב-type "comparison", השתמש ב-"text" או "list". דוגמה: {"type":"comparison","headers":["X","Y","Z"],"rows":[["a","b","c"],["d","e","f"]]}
14. **answerBlock**: כל section עיקרי מסוג "text" — חייב answerBlock קצר (40-60 מילים) לציטוט AI/Featured Snippet. לפחות 50% מ-text sections.
`;
  if (!existing.includes('steps section')) {
    promptNode.parameters.jsCode = existing.replace(
      '11. publishDate + updatedDate = ${today}',
      '11. publishDate + updatedDate = ${today}' + schemaRules
    );
    console.log('Patch B: prompt updated with section schema rules (12-14)');
  } else {
    console.log('Patch B: prompt already has schema rules — skipping');
  }

  // ----------------------------------------------------------------
  // Push to n8n
  // ----------------------------------------------------------------
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };

  console.log('Pushing updated F33 to n8n...');
  const result = await api('PUT', `/api/v1/workflows/${WF_ID}`, payload);

  if (result.id) {
    console.log('SUCCESS — F33 v5 schema-strict gate live');
    console.log('  versionId:', result.versionId);
    console.log('  active:', result.active);
    console.log('  nodes:', result.nodes?.length);
  } else {
    console.error('Update failed:', JSON.stringify(result).slice(0, 500));
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
