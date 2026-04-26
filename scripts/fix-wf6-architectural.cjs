// WF6 — Architectural Fix
// 1. Replace IF Gate with Switch node
// 2. Fix Quality Gate thresholds (1500 words, score>=85, real FAQ range)
// 3. Strengthen Build Writer Prompt

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const N8N_BASE = 'https://n8n.perfect-1.one';
const WF_ID = 'YYLuBCEktMeoRcoD';

async function main() {
  const res = await fetch(`${N8N_BASE}/api/v1/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  if (!res.ok) throw new Error(`GET ${res.status}: ${await res.text()}`);
  const wf = await res.json();
  console.log('Fetched:', wf.name, '| active:', wf.active, '| nodes:', wf.nodes.length);

  // ============================================================
  // 1. Replace "IF Gate Passed" with Switch node
  // ============================================================
  const ifGateIdx = wf.nodes.findIndex(n => n.name === 'IF Gate Passed');
  if (ifGateIdx === -1) throw new Error('IF Gate Passed node not found');

  const ifGateNode = wf.nodes[ifGateIdx];
  const ifGatePosition = ifGateNode.position;
  console.log('Found IF Gate at position:', ifGatePosition);

  // Replace with Switch node — same position, same id (wf6-if-gate) so connections still work
  wf.nodes[ifGateIdx] = {
    id: 'wf6-if-gate',
    name: 'IF Gate Passed',
    type: 'n8n-nodes-base.switch',
    typeVersion: 3.2,
    position: ifGatePosition,
    parameters: {
      mode: 'expression',
      output: '={{ $json.gate && $json.gate.passed === true ? 0 : 1 }}',
      numberOutputs: 2
    },
    disabled: false
  };
  console.log('PATCH 1: Replaced IF Gate with Switch node (2 outputs, output 0=passed, output 1=failed)');

  // Ensure connections for "IF Gate Passed" are correct: main[0] -> Prepare Commit, main[1] -> Revision Prompt
  if (!wf.connections['IF Gate Passed']) {
    wf.connections['IF Gate Passed'] = { main: [[], []] };
  }
  wf.connections['IF Gate Passed'].main[0] = [{ node: 'Prepare Commit', type: 'main', index: 0 }];
  wf.connections['IF Gate Passed'].main[1] = [{ node: 'Revision Prompt', type: 'main', index: 0 }];
  console.log('PATCH 1: Connections verified: main[0]=Prepare Commit, main[1]=Revision Prompt');

  // ============================================================
  // 2. Fix Quality Gate — real thresholds
  // ============================================================
  const qgNode = wf.nodes.find(n => n.id === 'wf6-quality-gate');
  if (!qgNode) throw new Error('wf6-quality-gate not found');

  qgNode.parameters.jsCode = `const input = $input.first().json;
const { article, target_query } = input;
const failures = [];
let seoScore = 0;
let aeoScore = 0;
let geoScore = 0;

// =====================
// SEO — 40 points
// =====================

// metaTitle: valid + ≤60 chars (10)
const metaTitle = article.metaTitle || '';
const titleContainsQuery = metaTitle.includes(target_query || '');
if (metaTitle && metaTitle.length <= 60 && titleContainsQuery) {
  seoScore += 10;
} else {
  if (!metaTitle) failures.push('metaTitle missing');
  else if (metaTitle.length > 60) failures.push(\`metaTitle too long (\${metaTitle.length} chars, max 60)\`);
  else failures.push('metaTitle does not contain target_query');
}

// metaDescription: ≤155 chars + contains target_query + CTA (10)
const metaDesc = article.metaDescription || '';
const ctaWords = ['למד', 'קרא', 'גלה', 'בדוק', 'השווה', 'הורד', 'קבל', 'פנה', 'התחל'];
const hasCta = ctaWords.some(w => metaDesc.includes(w));
const descContainsQuery = metaDesc.includes(target_query || '');
if (metaDesc && metaDesc.length <= 155 && descContainsQuery && hasCta) {
  seoScore += 10;
} else {
  if (!metaDesc) failures.push('metaDescription missing');
  else if (metaDesc.length > 155) failures.push(\`metaDescription too long (\${metaDesc.length} chars, max 155)\`);
  else if (!descContainsQuery) failures.push('metaDescription does not contain target_query');
  else if (!hasCta) failures.push('metaDescription missing CTA word');
}

// Word count ≥1500 (10) — RESTORED to real minimum
const sections = article.sections || [];
let totalWords = 0;
for (const s of sections) {
  const texts = [];
  if (s.content) texts.push(s.content);
  if (s.answerBlock) texts.push(s.answerBlock);
  if (s.description) texts.push(s.description);
  if (s.items) s.items.forEach(i => {
    if (typeof i === 'string') texts.push(i);
    if (i && i.description) texts.push(i.description);
    if (i && i.title) texts.push(i.title);
    if (i && i.answer) texts.push(i.answer);
  });
  if (s.steps) s.steps.forEach(i => {
    if (typeof i === 'string') texts.push(i);
    if (i && i.description) texts.push(i.description);
    if (i && i.title) texts.push(i.title);
  });
  totalWords += texts.join(' ').split(/\\s+/).filter(Boolean).length;
}
// Also count FAQ words
const faqItems = article.faq || [];
faqItems.forEach(f => {
  if (f.question) totalWords += f.question.split(/\\s+/).filter(Boolean).length;
  if (f.answer) totalWords += f.answer.split(/\\s+/).filter(Boolean).length;
});

if (totalWords >= 1500) {
  seoScore += 10;
} else {
  failures.push(\`Word count too low: \${totalWords} words (min 1500)\`);
}

// Structure: ≥10 sections, heroTitle exists (H1), TOC exists, ≥3 relatedArticles (10)
const hasHeroTitle = !!(article.heroTitle);
const hasToc = Array.isArray(article.toc) && article.toc.length >= 8;
const hasRelated = Array.isArray(article.relatedArticles) && article.relatedArticles.length >= 3;
const hasSections = sections.length >= 10;
if (hasSections && hasHeroTitle && hasToc && hasRelated) {
  seoScore += 10;
} else {
  if (!hasSections) failures.push(\`Not enough sections: \${sections.length} (min 10)\`);
  if (!hasHeroTitle) failures.push('heroTitle (H1) missing');
  if (!hasToc) failures.push(\`TOC too short: \${(article.toc||[]).length} entries (min 8)\`);
  if (!hasRelated) failures.push(\`relatedArticles too few: \${(article.relatedArticles || []).length} (min 3)\`);
}

// =====================
// AEO — 30 points
// =====================

// FAQ: ≥5 questions (10)
const faq = article.faq || [];
if (faq.length >= 5) {
  aeoScore += 10;
} else {
  failures.push(\`FAQ too few: \${faq.length} questions (min 5)\`);
}

// FAQ answer length: each 40-80 words (10) — STRICT range
const answerLengths = faq.map(f => (f.answer || '').split(/\\s+/).filter(Boolean).length);
const allAnswersOk = answerLengths.every(l => l >= 40 && l <= 80);
if (faq.length >= 5 && allAnswersOk) {
  aeoScore += 10;
} else if (faq.length >= 5) {
  const bad = answerLengths.filter(l => l < 40 || l > 80);
  failures.push(\`\${bad.length} FAQ answers outside 40-80 word range (found: \${answerLengths.join(', ')})\`);
}

// Direct answer: first non-callout section has answerBlock 40-70 words (10) — STRICT range
const firstContentSection = sections.find(s => s.type !== 'callout' && s.type !== 'cta-inline');
const answerBlock = firstContentSection ? (firstContentSection.answerBlock || '') : '';
const answerWordCount = answerBlock.split(/\\s+/).filter(Boolean).length;
if (answerBlock && answerWordCount >= 40 && answerWordCount <= 70) {
  aeoScore += 10;
} else {
  if (!answerBlock) failures.push('answerBlock missing in first content section');
  else failures.push(\`answerBlock length \${answerWordCount} words (target 40-70 words)\`);
}

// =====================
// GEO — 30 points
// =====================

const allText = JSON.stringify(article);

// Entity mentions: ≥4 of the authority entities must appear (10)
const entities = ['רשות המסים', 'מעמ', 'ביטוח לאומי', 'מס הכנסה'];
const entityCounts = entities.map(e => {
  const escaped = e.replace(/"/g, '');
  const regex = new RegExp(escaped, 'g');
  const matches = allText.match(regex) || [];
  return { entity: e, count: matches.length };
});
const entitiesWithMin3 = entityCounts.filter(ec => ec.count >= 3);
if (entitiesWithMin3.length >= 3) {
  geoScore += 10;
} else {
  const insufficient = entityCounts.filter(ec => ec.count < 3).map(ec => \`\${ec.entity}(\${ec.count}x)\`);
  failures.push(\`Entities appear fewer than 3 times each: \${insufficient.join(', ')} — need ≥3 entities each with ≥3 mentions\`);
}

// Concrete numbers: ≥8 (10)
const numberMatches = allText.match(/(20\\d{2}|\\d[\\d,]*\\s*[₪%]|\\d+\\s*(ש"ח|אחוז|ימים|שנים|חודשים))/g) || [];
if (numberMatches.length >= 8) {
  geoScore += 10;
} else {
  failures.push(\`Not enough concrete numbers/amounts: \${numberMatches.length} found (min 8)\`);
}

// E-E-A-T: correct author name + updatedDate + keywords ≥4 (10)
const authorName = article.author && article.author.name;
const correctAuthor = authorName === 'צוות פרפקט וואן';
const hasUpdated = !!(article.updatedDate);
const hasKeywords = Array.isArray(article.keywords) && article.keywords.length >= 4;
if (correctAuthor && hasUpdated && hasKeywords) {
  geoScore += 10;
} else {
  if (!correctAuthor) failures.push(\`Wrong author: "\${authorName}" (must be exactly "צוות פרפקט וואן")\`);
  if (!hasUpdated) failures.push('updatedDate missing');
  if (!hasKeywords) failures.push(\`keywords too few: \${(article.keywords || []).length} (min 4)\`);
}

// =====================
// Final score — passed = score >= 85 AND no failures
// =====================
const score = seoScore + aeoScore + geoScore;
// passed requires score >= 85 AND no failures (including wrong author = automatic fail)
const passed = (score >= 85) && failures.length === 0;

return [{ json: {
  ...input,
  gate: {
    score,
    breakdown: { seo: seoScore, aeo: aeoScore, geo: geoScore },
    failures,
    passed,
    wordCount: totalWords
  }
}}];`;

  console.log('PATCH 2: Quality Gate updated — word count 1500, FAQ 40-80 words, answerBlock 40-70, score>=85, author strict');

  // ============================================================
  // 3. Strengthen Build Writer Prompt
  // ============================================================
  const builderNode = wf.nodes.find(n => n.id === 'wf6-build-prompt');
  if (!builderNode) throw new Error('wf6-build-prompt not found');

  builderNode.parameters.jsCode = `const data = $input.first().json;
const today = new Date().toISOString().split('T')[0];
const internalLinksRaw = data.internal_links;
let internalLinksArr = [];
try {
  internalLinksArr = typeof internalLinksRaw === 'string' ? JSON.parse(internalLinksRaw) : (internalLinksRaw || []);
} catch(e) { internalLinksArr = []; }

const relatedSlugs = ['how-to-open','cost','faq','taxes','accountant','bituach-leumi','rights','management','income-ceiling','status-change','tax-reporting'];

const prompt = \`אתה כותב עבור פורטל SEO מקצועי בישראל. מאמר קצר מ-1500 מילים לא ייפורסם בשום תנאי — תתבייש להחזיר כזה.

### תהליך חובה לפני שתענה:

1. כתוב את המאמר המלא
2. ספור מילים בכל section: section.content.split(/\\s+/).length
3. אם סך כל המילים < 1500 — הרחב כל section לפחות ב-50% והחזר מחדש
4. ודא שכל FAQ answer בין 40-80 מילים — ספור!
5. ודא answerBlock של section ראשון בין 40-70 מילים — ספור!

### דוגמה לאורך section נכון (סקלה בלבד):

"החזר מע״מ לעוסק מורשה הוא זכות בסיסית המוענקת לכל עוסק הרשום במע״מ, ומאפשרת לו לקזז את המע״מ ששילם על הוצאות עסקיות מהמע״מ שגבה מלקוחותיו. בפועל, כל חודשיים (או חודש, בהתאם למחזור) העוסק מגיש דוח מע״מ לרשות המסים הכולל את ההפרש בין המע״מ שגבה (מע״מ עסקאות) למע״מ ששילם (מע״מ תשומות). נכון לשנת 2026, שיעור המע״מ בישראל עומד על 18%, לאחר העלאה מ-17% בינואר 2025. לדוגמה, עוסק שגבה מלקוחותיו 100,000 ש״ח + מע״מ של 18,000 ש״ח, ושילם על הוצאות עסקיות 40,000 ש״ח + 7,200 ש״ח מע״מ, ידווח על מע״מ נטו של 10,800 ש״ח לתשלום. אם המע״מ שתשלם על הוצאות גדול מהמע״מ שגבה — יש לך זכאות להחזר ממס, שיועבר לחשבונך בתוך 30 ימי עסקים. חשוב לשמור את כל החשבוניות מקור לפחות 7 שנים לביקורות עתידיות של רשות המסים."

זה section אחד של 180 מילים. אתה צריך 10-12 כאלה = 1800-2200 מילים סך הכול.

### משימה: כתוב מאמר SEO בנושא: "\${data.suggested_article_title}"
ביטוי ראשי: \${data.target_query}
קטגוריה: \${data.category}
כוונת חיפוש: \${data.search_intent}
זווית: \${data.suggested_angle}
קישורים פנימיים מוצעים: \${JSON.stringify(internalLinksArr)}

### דרישות חובה — המאמר יידחה אם לא יעמוד בהן:
- בדיוק 10-12 sections (לא פחות!)
- מינימום 1500 מילים סה"כ. כל section: 150+ מילים content, 40-70 מילים answerBlock
- FAQ: בדיוק 5 שאלות, כל תשובה 40-80 מילים בדיוק (ספור אחת אחת!)
- metaTitle: ≤60 תווים + ביטוי ראשי
- metaDescription: ≤155 תווים + ביטוי ראשי + מילת CTA (קרא/גלה/פנה/קבל/בדוק)
- slug_english: 2-4 מילים באנגלית kebab-case (דוגמה: "receipt-guide", "vat-registration")
- entities חובה (כל אחת לפחות 3 פעמים): רשות המסים, מעמ, ביטוח לאומי, מס הכנסה
- מינימום 8 מספרים קונקרטיים (שנים/סכומים/אחוזים/ימים)
- author: {"name":"צוות פרפקט וואן","role":"מומחי עסקים"} — אם תחזיר שם אחר, המאמר יידחה אוטומטית
- publishDate + updatedDate = \${today}
- TOC: id של כל פריט חייב להתאים ל-id של section אמיתי
- relatedArticles: בחר 3-4 slugs אמיתיים מהרשימה: \${relatedSlugs.join(', ')} — category: \${data.category}
- section types מותרים בלבד: text | list | steps | callout | faq | quote | comparison | cta-inline
- חובה section אחד מסוג cta-inline

### מבנה JSON לדוגמה (ממלא תוכן מלא — לא רשימה חלקית):
{
  "slug_english": "receipt-guide",
  "category": "\${data.category}",
  "slug": "receipt-guide",
  "metaTitle": "קבלה עוסק פטור — מדריך מלא 2026 | פרפקט וואן",
  "metaDescription": "איך מוציאים קבלה כעוסק פטור? כל מה שצריך לדעת על קבלות, חוקים ומס הכנסה ב-2026. קרא עכשיו.",
  "keywords": ["\${data.target_query}", "ביטוי 2", "ביטוי 3", "ביטוי 4"],
  "heroTitle": "קבלה עוסק פטור — המדריך המלא ל-2026",
  "heroSubtitle": "כל מה שצריך לדעת על הוצאת קבלה כעוסק פטור",
  "publishDate": "\${today}",
  "updatedDate": "\${today}",
  "author": {"name": "צוות פרפקט וואן", "role": "מומחי עסקים"},
  "readTime": 12,
  "toc": [{"id":"intro","title":"מבוא"}, {"id":"what-is","title":"מה זה"}, ...12 entries total],
  "sections": [
    {
      "id":"intro",
      "type":"text",
      "title":"מבוא",
      "answerBlock":"תשובה ישירה 40-70 מילים (ספור!) על \${data.target_query}. כולל מספרים, רשות המסים, מע״מ.",
      "content":"טקסט מלא 150+ מילים. רשות המסים... מע״מ... ביטוח לאומי... מס הכנסה... כולל 2026, 120,000 ש״ח..."
    },
    ... (עוד 9-11 sections, כל אחת content 150+ מילים)
  ],
  "relatedArticles": [{"slug":"how-to-open","category":"\${data.category}","title":"פתיחת עוסק פטור"},{"slug":"cost","category":"\${data.category}","title":"עלות"},{"slug":"taxes","category":"\${data.category}","title":"מיסוי"}],
  "faq": [
    {"question":"שאלה 1?","answer":"תשובה בדיוק 40-80 מילים עם מספרים ו-entities (ספור!)"},
    {"question":"שאלה 2?","answer":"תשובה 40-80 מילים"},
    {"question":"שאלה 3?","answer":"תשובה 40-80 מילים"},
    {"question":"שאלה 4?","answer":"תשובה 40-80 מילים"},
    {"question":"שאלה 5?","answer":"תשובה 40-80 מילים"}
  ]
}

החזר ONLY JSON, בלי markdown fences, בלי הסברים.\`;

return [{ json: {
  ...data,
  prompt,
  today
}}];`;

  console.log('PATCH 3: Build Writer Prompt strengthened with word count enforcement and clear FAQ range');

  // ============================================================
  // PUT updated workflow
  // ============================================================
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData || null,
  };

  console.log('\nPushing updated workflow...');
  const putRes = await fetch(`${N8N_BASE}/api/v1/workflows/${WF_ID}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(`PUT failed ${putRes.status}: ${text}`);
  }

  const updated = await putRes.json();
  console.log('WF6 updated successfully.');
  console.log('  id:', updated.id);
  console.log('  name:', updated.name);
  console.log('  active:', updated.active);
  console.log('  nodes count:', updated.nodes?.length);

  // Verify Switch node replaced IF node
  const switchNode = updated.nodes?.find(n => n.name === 'IF Gate Passed');
  console.log('\nVerification — IF Gate Passed node type:', switchNode?.type);
  console.log('Switch output param:', switchNode?.parameters?.output);

  // Verify connections
  const conn = updated.connections?.['IF Gate Passed'];
  console.log('Connections main[0]:', conn?.main?.[0]?.[0]?.node);
  console.log('Connections main[1]:', conn?.main?.[1]?.[0]?.node);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
