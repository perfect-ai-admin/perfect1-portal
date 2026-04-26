// WF6 — 3 targeted patches
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const N8N_BASE = 'https://n8n.perfect-1.one';
const WF_ID = 'YYLuBCEktMeoRcoD';

async function main() {
  // 1. Fetch current workflow
  const res = await fetch(`${N8N_BASE}/api/v1/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  if (!res.ok) throw new Error(`GET ${res.status}: ${await res.text()}`);
  const wf = await res.json();
  console.log('Fetched:', wf.name, '| active:', wf.active, '| nodes:', wf.nodes.length);

  // ============================================================
  // PATCH 1: Fix IF Gate Passed connections (swap main[0] and main[1])
  // ============================================================
  const conn = wf.connections['IF Gate Passed'];
  if (!conn) throw new Error('Connection "IF Gate Passed" not found');

  const current0 = conn.main[0][0].node;
  const current1 = conn.main[1][0].node;
  console.log(`PATCH 1: current main[0]=${current0} main[1]=${current1}`);

  // Swap: TRUE branch (main[0]) -> Prepare Commit, FALSE branch (main[1]) -> Revision Prompt
  conn.main[0][0].node = 'Prepare Commit';
  conn.main[1][0].node = 'Revision Prompt';
  console.log('PATCH 1 applied: main[0]=Prepare Commit (TRUE), main[1]=Revision Prompt (FALSE)');

  // ============================================================
  // PATCH 2: Replace Build Writer Prompt with stronger prompt
  // ============================================================
  const builderNode = wf.nodes.find(n => n.id === 'wf6-build-prompt');
  if (!builderNode) throw new Error('Node wf6-build-prompt not found');

  builderNode.parameters.jsCode = `const data = $input.first().json;
const today = new Date().toISOString().split('T')[0];
const internalLinksRaw = data.internal_links;
let internalLinksArr = [];
try {
  internalLinksArr = typeof internalLinksRaw === 'string' ? JSON.parse(internalLinksRaw) : (internalLinksRaw || []);
} catch(e) { internalLinksArr = []; }

const relatedSlugs = ['how-to-open','cost','faq','taxes','accountant','bituach-leumi','rights','management','income-ceiling','status-change','tax-reporting'];

const prompt = \`\u05d0\u05ea\u05d4 \u05db\u05d5\u05ea\u05d1 \u05ea\u05d5\u05db\u05df SEO \u05d1\u05e2\u05d1\u05e8\u05d9\u05ea \u05dc\u05e4\u05d5\u05e8\u05d8\u05dc perfect1.co.il.

\u05de\u05e9\u05d9\u05de\u05d4: \u05db\u05ea\u05d5\u05d1 \u05de\u05d0\u05de\u05e8 SEO \u05d1\u05e0\u05d5\u05e9\u05d0: "\${data.suggested_article_title}"
\u05d1\u05d9\u05d8\u05d5\u05d9 \u05e8\u05d0\u05e9\u05d9: \${data.target_query}
\u05e7\u05d8\u05d2\u05d5\u05e8\u05d9\u05d4: \${data.category}
\u05db\u05d5\u05d5\u05e0\u05ea \u05d7\u05d9\u05e4\u05d5\u05e9: \${data.search_intent}
\u05d6\u05d5\u05d5\u05d9\u05ea: \${data.suggested_angle}
\u05e7\u05d9\u05e9\u05d5\u05e8\u05d9\u05dd \u05e4\u05e0\u05d9\u05de\u05d9\u05d9\u05dd \u05de\u05d5\u05e6\u05e2\u05d9\u05dd: \${JSON.stringify(internalLinksArr)}

\u05d3\u05e8\u05d9\u05e9\u05d5\u05ea \u05d7\u05d5\u05d1\u05d4 \u2014 \u05d4\u05de\u05d0\u05de\u05e8 \u05d9\u05d9\u05e4\u05e1\u05dc \u05d0\u05dd \u05dc\u05d0 \u05e2\u05d5\u05de\u05d3 \u05d1\u05d4\u05dd:
- \u05d1\u05d3\u05d9\u05d5\u05e7 10-12 sections (\u05dc\u05d0 \u05e4\u05d7\u05d5\u05ea!)
- \u05de\u05d9\u05e0\u05d9\u05de\u05d5\u05dd 1800 \u05de\u05d9\u05dc\u05d9\u05dd \u05e1\u05d4"כ. ספור: 180+ מילים בכל section.
- FAQ: בדיוק 5 שאלות, כל תשובה 40-60 מילים
- metaTitle ≤60 תווים + ביטוי ראשי
- metaDescription ≤155 תווים + ביטוי ראשי + CTA
- slug_english: 2-4 מילים באנגלית kebab-case (דוגמה: "receipt-guide", "vat-registration")
- entities חובה (כל אחת לפחות 3 פעמים): רשות המסים, מע"מ, ביטוח לאומי, מס הכנסה
- מינימום 8 מספרים קונקרטיים (שנים/סכומים/אחוזים/ימים)
- author קבוע: {"name":"צוות פרפקט וואן","role":"מומחי עסקים"}
- publishDate + updatedDate = \${today}
- TOC: id של כל פריט חייב להתאים ל-id של section אמיתי
- relatedArticles: בחר 3-4 slugs אמיתיים מהרשימה: \${relatedSlugs.join(', ')} — category: \${data.category}
- section types מותרים בלבד: text | list | steps | callout | faq | quote | comparison | cta-inline
- חובה section אחד מסוג cta-inline

החזר ONLY JSON, בלי markdown fences, בלי הסברים.

דוגמת מבנה (קיצרתי תוכן — אתה ממלא מלא):
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
  "toc": [{"id":"what-is","title":"מה זה קבלה עוסק פטור"}, {"id":"how-to","title":"איך מוציאים קבלה"}, {"id":"laws","title":"חוקים ורגולציה"}, {"id":"amounts","title":"סכומים ותעריפים"}, {"id":"digital","title":"קבלה דיגיטלית"}, {"id":"mistakes","title":"טעויות נפוצות"}, {"id":"tax","title":"מס הכנסה וקבלות"}, {"id":"bituach","title":"ביטוח לאומי"}, {"id":"vat","title":"מע\\"מ לעוסק פטור"}, {"id":"faq-section","title":"שאלות נפוצות"}, {"id":"summary","title":"סיכום"}, {"id":"cta","title":"פנה אלינו"}],
  "sections": [
    {"id":"what-is","type":"text","title":"מה זה קבלה עוסק פטור","answerBlock":"תשובה ישירה 40-60 מילים על \${data.target_query}. כולל מספרים ו-entities כמו מס הכנסה ורשות המסים.","content":"טקסט מלא 180+ מילים. רשות המסים מגדירה... מע\\"מ עבור עוסק פטור... ביטוח לאומי מחייב... מס הכנסה קובע... כולל 2026 ו-120,000 ש\\"ח..."},
    {"id":"how-to","type":"steps","title":"איך מוציאים קבלה צעד אחר צעד","steps":["שלב 1: ...180+ מילים סה\\"כ בכל שלבי ה-steps"]},
    {"id":"laws","type":"text","title":"חוקים ורגולציה","content":"180+ מילים. רשות המסים, מע\\"מ..."},
    {"id":"amounts","type":"list","title":"סכומים ותעריפים עדכניים 2026","items":["פריט 1..."]},
    {"id":"digital","type":"text","title":"קבלה דיגיטלית","content":"180+ מילים..."},
    {"id":"mistakes","type":"list","title":"טעויות נפוצות","items":["טעות 1..."]},
    {"id":"tax","type":"text","title":"מס הכנסה וקבלות","content":"180+ מילים..."},
    {"id":"bituach","type":"text","title":"ביטוח לאומי","content":"180+ מילים..."},
    {"id":"vat","type":"text","title":"מע\\"מ לעוסק פטור","content":"180+ מילים..."},
    {"id":"faq-section","type":"faq","title":"שאלות נפוצות","items":[{"question":"...","answer":"40-60 מילים"}]},
    {"id":"summary","type":"callout","title":"סיכום","content":"180+ מילים..."},
    {"id":"cta","type":"cta-inline","title":"רוצה עזרה אישית?","content":"צוות פרפקט וואן כאן לעזור. צור קשר עכשיו.","ctaText":"צור קשר","ctaLink":"/contact"}
  ],
  "relatedArticles": [{"slug":"how-to-open","category":"\${data.category}","title":"פתיחת עוסק פטור"},{"slug":"cost","category":"\${data.category}","title":"עלות עוסק פטור"},{"slug":"taxes","category":"\${data.category}","title":"מיסוי עוסק פטור"}],
  "faq": [
    {"question":"שאלה 1?","answer":"תשובה 40-60 מילים עם מספרים ו-entities"},
    {"question":"שאלה 2?","answer":"תשובה 40-60 מילים"},
    {"question":"שאלה 3?","answer":"תשובה 40-60 מילים"},
    {"question":"שאלה 4?","answer":"תשובה 40-60 מילים"},
    {"question":"שאלה 5?","answer":"תשובה 40-60 מילים"}
  ]
}\`;

return [{ json: {
  ...data,
  prompt,
  today
}}];`;

  console.log('PATCH 2 applied: Build Writer Prompt updated with strong requirements');

  // ============================================================
  // PATCH 3: Parse Article JSON — throw if slug_english invalid
  // ============================================================
  const parseNode = wf.nodes.find(n => n.id === 'wf6-parse-article');
  if (!parseNode) throw new Error('Node wf6-parse-article not found');

  parseNode.parameters.jsCode = `const claudeResponse = $input.first().json;
const upstream = $('Build Writer Prompt').first().json;

let article = null;
try {
  const rawText = claudeResponse.choices[0].message.content.trim();
  const cleaned = rawText
    .replace(/^\`\`\`json\\s*/i, '')
    .replace(/^\`\`\`\\s*/i, '')
    .replace(/\\s*\`\`\`$/i, '')
    .trim();
  article = JSON.parse(cleaned);
} catch (e) {
  throw new Error('Failed to parse LLM JSON response: ' + e.message);
}

// Validate slug_english — THROW if missing or invalid (no Hebrew transliteration fallback)
function sanitizeSlug(s) {
  if (!s || typeof s !== 'string') return null;
  const cleaned = s.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return cleaned.length >= 2 ? cleaned.slice(0, 60) : null;
}

const rawSlug = article.slug_english || article.slug;
const finalSlug = sanitizeSlug(rawSlug);

if (!finalSlug) {
  throw new Error(
    'INVALID slug_english: got "' + rawSlug + '". ' +
    'The LLM must return a valid 2-4 word English kebab-case slug in slug_english field. ' +
    'Example: "receipt-guide", "vat-registration", "bituach-leumi-guide".'
  );
}

// Force correct author
article.author = { name: 'צוות פרפקט וואן', role: 'מומחי עסקים' };

// Force today's dates
const today = upstream.today || new Date().toISOString().split('T')[0];
article.publishDate = today;
article.updatedDate = today;

return [{ json: {
  article,
  idea_id: upstream.idea_id,
  opportunity_id: upstream.opportunity_id,
  target_query: upstream.target_query,
  suggested_article_title: upstream.suggested_article_title,
  category: upstream.category,
  slug: finalSlug,
  run_id: upstream.run_id,
  iteration: upstream.iteration || 0,
  today
}}];`;

  console.log('PATCH 3 applied: Parse Article JSON now throws on invalid slug_english');

  // ============================================================
  // PUT updated workflow (active=false per instructions)
  // ============================================================
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData || null,
  };

  console.log('Pushing updated workflow...');
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

  // Deactivate per instructions (n8n_update_full_workflow active=false)
  console.log('Deactivating WF6...');
  const deactRes = await fetch(`${N8N_BASE}/api/v1/workflows/${WF_ID}/deactivate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  if (!deactRes.ok) {
    const t = await deactRes.text();
    console.warn('Deactivate response:', deactRes.status, t);
  } else {
    const d = await deactRes.json();
    console.log('WF6 active after deactivate:', d.active);
  }
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
