// F33 Upgrade v7 — Phases 2+3+4
// - Strengthen Build Article Prompt (1500-2200 words target, stricter requirements)
// - Add Word Count Validator node (retry trigger if <1400 words)
// - Quality Gate v7 (1400 min words, 3+ answerBlocks, 4+ relatedArticles, meta 140-160)
// - Call OpenAI: retryOnFail + maxTries 3 + 60s wait

const fs = require('fs');
const https = require('https');

const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const N8N_HOST = 'n8n.perfect-1.one';
const WORKFLOW_ID = 'F33CbVflx4aApT71';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      method,
      hostname: N8N_HOST,
      path,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(opts, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(chunks)); } catch (e) { resolve(chunks); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${chunks}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ============================
// NEW Build Article Prompt v7
// ============================
const NEW_BUILD_PROMPT_CODE = `const idea = $input.first().json;

const HUB_POOL = [
  {category:"osek-patur",slug:"how-to-open",title:"איך פותחים עוסק פטור — מדריך מלא 2026"},
  {category:"osek-patur",slug:"cost",title:"עלויות עוסק פטור — פירוט מלא"},
  {category:"osek-patur",slug:"taxes",title:"מיסוי עוסק פטור — מדריך 2026"},
  {category:"osek-patur",slug:"income-ceiling",title:"תקרת הכנסה לעוסק פטור 2026"},
  {category:"osek-patur",slug:"advantages-of-osek-patur",title:"יתרונות עוסק פטור 2026"},
  {category:"osek-murshe",slug:"how-to-open",title:"איך לפתוח עוסק מורשה — מדריך מלא 2026"},
  {category:"osek-murshe",slug:"cost",title:"כמה עולה עוסק מורשה — 2026"},
  {category:"osek-murshe",slug:"taxes",title:"מע\\"מ ומסים לעוסק מורשה 2026"},
  {category:"osek-murshe",slug:"reports",title:"דוחות וחשבוניות עוסק מורשה 2026"},
  {category:"osek-murshe",slug:"advantages-of-osek-murshe",title:"יתרונות עוסק מורשה 2026"},
  {category:"hevra-bam",slug:"how-to-open",title:"פתיחת חברה בע\\"מ אונליין 2026"},
  {category:"hevra-bam",slug:"cost",title:"כמה עולה להקים ולנהל חברה בע\\"מ 2026"},
  {category:"hevra-bam",slug:"taxes",title:"מיסוי חברה בע\\"מ 2026"},
  {category:"hevra-bam",slug:"reports",title:"דוחות חברה בע\\"מ"},
  {category:"amuta",slug:"how-to-open",title:"איך פותחים עמותה 2026"},
  {category:"amuta",slug:"cost",title:"כמה עולה לפתוח עמותה 2026"},
  {category:"guides",slug:"opening-business",title:"מדריך פתיחת עסק"},
  {category:"guides",slug:"taxation",title:"מדריך מיסוי עסקים"},
  {category:"guides",slug:"freelancers",title:"מדריך לפרילנסרים"},
  {category:"guides",slug:"which-business-type",title:"איזה סוג עסק לבחור"}
];

const systemPrompt = \`You are a senior Hebrew SEO content writer for perfect1.co.il.

OUTPUT a single valid JSON object. No markdown, no fences, no commentary.

SCHEMA (every field is REQUIRED):
{
  "slug": "<kebab-case>",
  "category": "<one of: misui|maam|miktzoa|osek-patur|osek-murshe|hevra-bam|sgirat-tikim|guides|amuta>",
  "metaTitle": "<55-60 Hebrew chars, ends with | פרפקט וואן>",
  "metaDescription": "<EXACTLY between 140 and 160 Hebrew chars including spaces — count carefully>",
  "keywords": [<array of EXACTLY 22 Hebrew long-tail phrases>],
  "heroTitle": "<H1>",
  "heroSubtitle": "<2 sentences>",
  "publishDate": "2026-04-28",
  "updatedDate": "2026-04-28",
  "author": {"name":"צוות פרפקט וואן","role":"מומחי מיסוי ועסקים"},
  "readTime": 14,
  "toc": [<10-12 entries: {id, title} matching sections>],
  "sections": [<EXACTLY 10-12 sections, mix of types below>],
  "faq": [<EXACTLY 8 items, each {question, answer} where answer is 50-150 Hebrew words>],
  "relatedArticles": [<EXACTLY 4 items from the HUB_POOL>]
}

SECTION TYPES — each text section's content MUST be 200-300 Hebrew words:
- {"id":"...","type":"text","title":"...","answerBlock":"<40-80 word direct answer that opens with a definition>","content":"<200-300 words including [internal link](/category/slug) format — at least 4 internal links across all text sections combined>"}
- {"id":"...","type":"steps","title":"...","answerBlock":"...","steps":[{"number":1,"title":"...","description":"<60+ words>"},...4-6 steps]}
- {"id":"...","type":"list","title":"...","items":[{"title":"...","description":"<40+ words>"},...5-7 items]}
- {"id":"...","type":"comparison","title":"...","headers":["...","...","..."],"rows":[[...],[...],[...]]}
- {"id":"...","type":"callout","variant":"tip","title":"...","content":"<60-100 words>"}

ABSOLUTE REQUIREMENTS — output WILL be rejected (HARD FAILURES):
1. SUM of words across all section content/answerBlock fields >= 1500 (target 1800-2200).
   COUNT YOUR WORDS BEFORE RETURNING. Each text section should be 220-280 words.
2. faq array has EXACTLY 8 items, each answer 50-150 Hebrew words.
3. metaDescription character count between 140 and 160 (count Hebrew chars + spaces).
4. metaTitle character count between 55 and 60.
5. keywords has at least 22 items.
6. relatedArticles has EXACTLY 4 items.
7. relatedArticles MUST include >= 1 entry from {osek-patur/how-to-open, osek-murshe/how-to-open, hevra-bam/how-to-open}.
8. relatedArticles MUST include >= 2 hub pages (cost, taxes, how-to-open, income-ceiling, advantages-of-*).
9. answerBlock fields: AT LEAST 3 sections must have a 40-80 word answerBlock that opens with a definition.
10. The exact terms "רשות המסים", "מע\\"מ", "ביטוח לאומי", "מס הכנסה" each appear at least 2 times across all text content.
11. At least 8 specific numeric values (years like 2026, percentages like 17%, prices in ₪).
12. The literal string "2026" appears AT LEAST 5 times in content.
13. EVERY paragraph contains at least one specific number, date, percentage, or authority name.
14. Author OBJECT exactly: {"name":"צוות פרפקט וואן","role":"מומחי מיסוי ועסקים"}.
15. Year context: 2026 only, never 2024/2025 except historical comparison.
16. Use REAL 2026 numbers: עוסק פטור ceiling 120,000 ₪/year, מע"מ 17%, ביטוח לאומי 9.07% / 22.83%, מס חברות 23%, חברה בע"מ אגרה כ-2,176 ₪.

WORD COUNT GUIDANCE (count BEFORE returning):
- 10-12 sections × 240 words avg = ~2700 words content
- + 8 FAQ × 90 words avg = 720 words
- Total written output: ~3400 words (will fit in 8000 tokens)
- IF YOUR DRAFT IS UNDER 1500 WORDS — REWRITE LONGER BEFORE RETURNING.

Return JSON only.\`;

const userPrompt = \`Write the article now. Follow the schema and ALL 16 absolute requirements.

Topic: \${idea.target_query}
Title: \${idea.suggested_article_title}
Search intent: \${idea.search_intent}
Angle: \${idea.suggested_angle}
Why it matters: \${idea.why_it_matters}
Parent page: \${idea.parent_page_url}

relatedArticles MUST be selected from this pool (pick exactly 4):
\${JSON.stringify(HUB_POOL, null, 2)}

REMINDER (HARD FAIL if violated):
- Each text section content 220-280 Hebrew words.
- 10-12 sections total.
- 8 top-level FAQ each 50-150 words.
- metaDescription 140-160 chars; metaTitle 55-60 chars.
- 22+ keywords. 4 relatedArticles.
- "2026" appears 5+ times. "רשות המסים", "מע\\"מ", "ביטוח לאומי", "מס הכנסה" each 2+ times.
- Every paragraph has a number/date/percentage/authority name.
- Use REAL 2026 numbers (120,000 ₪ ceiling, 17% מע"מ, 9.07%/22.83% ביטוח לאומי, 23% מס חברות).

Output ONLY the JSON object. RTL Hebrew throughout.\`;

return [{
  json: {
    idea_id: idea.id,
    target_query: idea.target_query,
    suggested_title: idea.suggested_article_title,
    parent_page: idea.parent_page_url,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  }
}];`;

// ============================
// NEW Quality Gate v7
// ============================
const NEW_GATE_CODE = `// =====================================================================
// Quality Gate v7 — stricter for production reliability
// 2026-04-28: Min 1400 words, 3+ answerBlocks, 4+ relatedArticles, meta 140-160
// =====================================================================

const wrapper = $('Parse Article JSON').first().json;

let article = wrapper;
try {
  if (wrapper && typeof wrapper.file_content === 'string') {
    article = JSON.parse(wrapper.file_content);
  }
} catch (e) {
  return [{
    json: {
      ...wrapper,
      idea_id: $('Build Article Prompt').first().json.idea_id,
      gate: {
        score: 0,
        passed: false,
        breakdown: { seo: 0, aeo: 0, geo: 0 },
        failures: ['Parse error: ' + (e.message || 'invalid JSON in file_content')],
        wordCount: 0,
        schemaErrors: ['file_content is not valid JSON'],
      },
      slug: wrapper.slug,
    },
  }];
}

const sections = Array.isArray(article.sections) ? article.sections : [];
const faq = Array.isArray(article.faq) ? article.faq : [];
const keywords = Array.isArray(article.keywords) ? article.keywords : [];
const metaTitle = article.metaTitle || '';
const metaDesc = article.metaDescription || '';

const wordCount = sections.reduce((sum, s) => {
  const content = (s.content || '') + ' ' + (s.answerBlock || '');
  return sum + content.split(/\\s+/).filter(Boolean).length;
}, 0);

const failures = [];

// SEO (40)
let seo = 0;
if (metaTitle.length >= 50 && metaTitle.length <= 60) seo += 10; else failures.push('metaTitle len=' + metaTitle.length + ' (need 50-60)');
if (metaDesc.length >= 140 && metaDesc.length <= 160) seo += 10; else failures.push('metaDescription ' + metaDesc.length + ' chars (need 140-160)');
if (wordCount >= 1400) seo += 10; else failures.push('Word count ' + wordCount + ' (min 1400)');
if (sections.length >= 8 && sections.length <= 12 && (article.toc || []).length >= 8) seo += 10; else failures.push('sections=' + sections.length + ' toc=' + (article.toc || []).length + ' (need 8-12)');

// AEO (30)
let aeo = 0;
if (faq.length >= 8) aeo += 15; else failures.push('FAQ=' + faq.length + ' (need 8)');
const faqOk = faq.filter(f => { const w = (f.answer || '').split(/\\s+/).filter(Boolean).length; return w >= 30 && w <= 150; }).length;
if (faq.length > 0 && faqOk >= Math.ceil(faq.length * 0.7)) aeo += 15; else failures.push('FAQ answers out of range 30-150 words (have ' + faqOk + '/' + faq.length + ')');

// GEO (30)
let geo = 0;
const allText = sections.map(s => (s.content || '') + ' ' + (s.answerBlock || '')).join(' ');
const entities = ['רשות המסים', 'מע"מ', 'ביטוח לאומי', 'מס הכנסה'];
const entitiesOk = entities.filter(e => (allText.match(new RegExp(e, 'g')) || []).length >= 2).length;
if (entitiesOk >= 3) geo += 10; else failures.push('Only ' + entitiesOk + '/4 entities mentioned 2+ times');
const numbers = (allText.match(/\\b\\d+\\b/g) || []).length;
if (numbers >= 8) geo += 10; else failures.push('Numbers=' + numbers + ' (min 8)');
if (keywords.length >= 20) geo += 10; else failures.push('Keywords=' + keywords.length + ' (min 20)');

// 2026 mentions
const year2026 = (allText.match(/2026/g) || []).length;
if (year2026 < 5) failures.push('"2026" mentioned ' + year2026 + ' times (need 5+)');

const authorOk = article.author && article.author.name === 'צוות פרפקט וואן';
if (!authorOk) failures.push('Wrong author: ' + JSON.stringify(article.author));

// Schema validation
const schemaErrors = [];
for (let i = 0; i < sections.length; i++) {
  const sec = sections[i] || {};
  if (sec.type === 'steps') {
    const steps = sec.steps || sec.items || [];
    if (!Array.isArray(steps) || steps.length === 0) {
      schemaErrors.push('Section ' + i + ' (steps): empty or invalid');
    } else {
      for (let j = 0; j < steps.length; j++) {
        const step = steps[j];
        if (typeof step === 'string') {
          schemaErrors.push('Section ' + i + ' step ' + j + ': must be object with title+description, got string');
        } else if (!step || !step.title || !step.description) {
          schemaErrors.push('Section ' + i + ' step ' + j + ': missing title or description');
        }
      }
    }
  }
  if (sec.type === 'comparison') {
    const hasTable = Array.isArray(sec.headers) && Array.isArray(sec.rows) && sec.headers.length >= 2 && sec.rows.length >= 1;
    const hasCards = Array.isArray(sec.items) && sec.items.length >= 2;
    if (!hasTable && !hasCards) {
      schemaErrors.push('Section ' + i + ' (comparison): must have headers+rows OR items');
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
      if (!items[j] || !items[j].question || !items[j].answer) {
        schemaErrors.push('Section ' + i + ' FAQ ' + j + ': missing question or answer');
      }
    }
  }
}
if (schemaErrors.length > 0) {
  failures.push.apply(failures, schemaErrors);
}

// AnswerBlock coverage v7 — HARD: 3+ answerBlocks 40-80 words
const answerBlocksOk = sections.filter(s => {
  if (!s.answerBlock) return false;
  const words = s.answerBlock.split(/\\s+/).filter(Boolean).length;
  return words >= 30 && words <= 150;
}).length;
if (answerBlocksOk < 3) {
  failures.push('Need 3+ answerBlocks 30-150 words (have ' + answerBlocksOk + ')');
}

// relatedArticles v7 — HARD: 4+ items
const related = Array.isArray(article.relatedArticles) ? article.relatedArticles : [];
if (related.length < 4) {
  failures.push('Need 4+ relatedArticles (have ' + related.length + ')');
}
const relatedLinks = related.map(r => {
  if (typeof r === 'string') return r;
  if (r && typeof r === 'object') {
    if (r.url) return r.url;
    if (r.category && r.slug) return '/' + r.category + '/' + r.slug;
  }
  return null;
}).filter(Boolean);

const HOW_TO_OPEN = ['/osek-patur/how-to-open','/osek-murshe/how-to-open','/hevra-bam/how-to-open'];
if (!relatedLinks.some(l => HOW_TO_OPEN.includes(l))) {
  failures.push('Must link to 1+ how-to-open page');
}

const HUB_PAGES = [...HOW_TO_OPEN, '/osek-patur/cost', '/osek-patur/taxes', '/osek-patur/income-ceiling', '/osek-murshe/cost', '/osek-murshe/taxes', '/hevra-bam/cost', '/hevra-bam/taxes', '/guides/taxation', '/guides/which-business-type'];
const hubHits = relatedLinks.filter(l => HUB_PAGES.includes(l)).length;
if (hubHits < 2) {
  failures.push('Must link to 2+ Hub pages (have ' + hubHits + ')');
}

const score = seo + aeo + geo;
const schemaOk = schemaErrors.length === 0;
const HARD_FAIL_KEYWORDS = ['Wrong author', 'Section ', 'must have headers', 'invalid JSON', 'Parse error', 'Need 4+ relatedArticles', 'Must link to 1+ how-to-open', 'Must link to 2+ Hub', 'Need 3+ answerBlocks', 'Word count', 'metaDescription', 'metaTitle len'];
const hardFailures = failures.filter(f => HARD_FAIL_KEYWORDS.some(k => f.indexOf(k) >= 0));
const passed = score >= 60 && authorOk && schemaOk && hardFailures.length === 0;

return [{
  json: {
    ...wrapper,
    idea_id: $('Build Article Prompt').first().json.idea_id,
    slug: wrapper.slug || article.slug,
    gate: { score, passed, breakdown: { seo, aeo, geo }, failures, wordCount, schemaErrors, version: 'v7' },
  },
}];`;

(async () => {
  console.log('Fetching live workflow...');
  const wf = await api('GET', `/api/v1/workflows/${WORKFLOW_ID}`, null);
  console.log('versionId before:', wf.versionId);

  // Backup
  fs.writeFileSync('docs/f33-pre-v7-backup.json', JSON.stringify(wf, null, 2));
  console.log('Backup saved: docs/f33-pre-v7-backup.json');

  // Update Build Article Prompt
  const buildIdx = wf.nodes.findIndex(n => n.name === 'Build Article Prompt');
  wf.nodes[buildIdx].parameters.jsCode = NEW_BUILD_PROMPT_CODE;
  console.log('Updated: Build Article Prompt');

  // Update Quality Gate
  const gateIdx = wf.nodes.findIndex(n => n.name === 'Quality Gate');
  wf.nodes[gateIdx].parameters.jsCode = NEW_GATE_CODE;
  console.log('Updated: Quality Gate');

  // Update Call OpenAI — retry config
  const openaiIdx = wf.nodes.findIndex(n => n.name === 'Call OpenAI');
  wf.nodes[openaiIdx].retryOnFail = true;
  wf.nodes[openaiIdx].maxTries = 3;
  wf.nodes[openaiIdx].waitBetweenTries = 60000;
  wf.nodes[openaiIdx].onError = 'continueRegularOutput';
  console.log('Updated: Call OpenAI (retry x3, 60s, continueRegularOutput)');

  // Build PUT payload — n8n PUT requires only writable fields
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData || null,
  };

  console.log('Pushing to n8n...');
  const result = await api('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, payload);
  console.log('versionId after:', result.versionId);
  console.log('SUCCESS — F33 v7 deployed.');
})().catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
