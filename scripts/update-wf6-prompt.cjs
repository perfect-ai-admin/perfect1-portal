/**
 * update-wf6-prompt.cjs
 *
 * מעדכן את Build Writer Prompt ואת SEO/AEO/GEO Quality Gate ב-WF6.
 *
 * Run: N8N_API_KEY=xxx node scripts/update-wf6-prompt.cjs
 */
'use strict';
const https = require('https');
const fs = require('fs');
const path = require('path');

const N8N_KEY = process.env.N8N_API_KEY || '';
const N8N_HOST = 'n8n.perfect-1.one';
const WF_ID = 'YYLuBCEktMeoRcoD';

if (!N8N_KEY) {
  console.error('ERROR: Set N8N_API_KEY env var');
  console.error('Usage: N8N_API_KEY=xxx node scripts/update-wf6-prompt.cjs');
  process.exit(1);
}

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: N8N_HOST,
      path: '/api/v1' + urlPath,
      method,
      headers: {
        'X-N8N-API-KEY': N8N_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let buf = '';
      res.on('data', d => buf += d);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${buf.slice(0, 300)}`));
        } else {
          try { resolve(JSON.parse(buf)); } catch { resolve(buf); }
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// =====================
// Build Writer Prompt — new jsCode
// =====================
const newBuildCode = `const data = $input.first().json;
const today = new Date().toISOString().split('T')[0];

const prompt = \`אתה כותב תוכן SEO בכיר בתחום הפיננסים בישראל.

המטרה:
לכתוב מאמר שמדורג על עשרות מילות מפתח שונות במקביל (לא רק ביטוי אחד),
מותאם גם ל-SEO (גוגל) וגם ל-AEO/GEO (מנועי AI), ובנוי להמיר ללידים.

נושא המאמר: \${data.target_query}
הקשר לעמוד מקור: \${data.source_page_url}
למה זה חשוב: \${data.why_it_matters}

## דרישות חובה

1. אורך: 1200-2000 מילים סך הכל (ספור את המילים לפני שאתה מחזיר!)

2. תשובה ישירה בתחילת המאמר (2-4 שורות) — ב-section הראשון, בשדה answerBlock. זה מה שיתפוס Featured Snippet + AEO.

3. מבנה H2 חובה (sections) — כל אחד מהם חייב להופיע:
   - מה זה [הנושא] — section.id: "what-is"
   - איך עושים את זה שלב אחרי שלב — section.id: "how-to-steps" (type: "steps")
   - כמה זה עולה — section.id: "cost"
   - כמה זמן זה לוקח — section.id: "timing"
   - יתרונות וחסרונות — section.id: "pros-cons" (type: "comparison")
   - טעויות נפוצות — section.id: "common-mistakes" (type: "callout")
   - למי זה מתאים ולמי לא — section.id: "who-is-it-for"
   - טיפים חשובים — section.id: "tips" (type: "list")

4. FAQ — לפחות 6-10 שאלות אמיתיות שאנשים מחפשים בגוגל.
   סגנון השאלות חובה:
   - "כמה עולה..."
   - "האם צריך..."
   - "כמה זמן לוקח..."
   - "האם אפשר לבד..."
   - "מה קורה אם..."
   כל תשובה: 40-80 מילים, ברורה וישירה.

5. וריאציות מילות מפתח — שלב בטבעיות ב-content:
   - וריאציות של הנושא הראשי (3-5 דרכים לנסח)
   - שאלות חיפוש נפוצות (בתוך פסקאות)
   - long-tail keywords (ביטויים של 3-5 מילים)
   בלי לדחוף בכוח — שיישמע טבעי.

6. 2-3 נקודות CTA טבעיות בתוך המאמר:
   אחרי הסבר → זיהוי בעיה → ואז:
   "בדקו עכשיו..." / "ניתן לבדוק בצורה פשוטה..." / "פנו אלינו לייעוץ ראשוני..."
   לא פרסומת אגרסיבית — צריך להרגיש טבעי ומעזר.

   הוסף אחד כ-section מסוג "cta-inline" באמצע, אחד בסוף המאמר.

7. סיכום קצר + CTA בסוף — section אחרון מסוג "cta-inline".

8. סגנון:
   - ברור, מקצועי, אמין
   - לא שיווקי מדי — אתה מסביר, לא מוכר
   - מותאם לקורא ישראלי: "שקל", "מע\\"מ", "רשות המסים", "ביטוח לאומי"
   - פסקאות של 3-5 משפטים (לא קירות טקסט)

9. עברית תקנית בלבד. מונחים באנגלית רק במקום שזה הכרחי.

10. Entities חובה (להזכיר לפחות 3 פעמים כל אחת): רשות המסים, מע\\"מ, ביטוח לאומי, מס הכנסה.

11. Author קבוע: {"name":"צוות פרפקט וואן","role":"מומחי עסקים"}

12. Slug באנגלית (שדה \\\`slug_english\\\`): 2-4 מילים kebab-case (דוגמה: "vat-refund-guide", "osek-patur-cost")

13. publishDate + updatedDate = TODAY (\${today})

## החזר ONLY JSON (ללא markdown fences, ללא טקסט לפני/אחרי):

{
  "slug_english": "...",
  "category": "\${data.category}",
  "metaTitle": "כותרת עם ביטוי ראשי (עד 60 תווים)",
  "metaDescription": "תיאור עם ביטוי ראשי + CTA (עד 155 תווים)",
  "keywords": [
    "ביטוי ראשי",
    "ווריאציה 1",
    "... לפחות 20 ביטויים שונים (ראשי + משניים + long-tail + שאלות)"
  ],
  "heroTitle": "H1 עם ביטוי ראשי",
  "heroSubtitle": "משפט תומך אחד",
  "readTime": 10,
  "toc": [
    {"id": "what-is", "title": "מה זה ..."},
    {"id": "how-to-steps", "title": "איך עושים את זה שלב אחרי שלב"},
    {"id": "cost", "title": "כמה זה עולה"},
    {"id": "timing", "title": "כמה זמן זה לוקח"},
    {"id": "pros-cons", "title": "יתרונות וחסרונות"},
    {"id": "common-mistakes", "title": "טעויות נפוצות"},
    {"id": "who-is-it-for", "title": "למי זה מתאים"},
    {"id": "tips", "title": "טיפים חשובים"},
    {"id": "summary", "title": "סיכום"}
  ],
  "sections": [
    {
      "id": "what-is",
      "type": "text",
      "title": "מה זה ...",
      "answerBlock": "תשובה ישירה של 40-70 מילים לשאלה המרכזית. מתאים ל-Featured Snippet.",
      "content": "פסקה מלאה של 150-200 מילים עם וריאציות מילות מפתח. מסביר מה זה, למי זה מיועד, ולמה זה חשוב בהקשר ישראלי 2026."
    },
    "... 8-10 sections נוספים לפי המבנה"
  ],
  "faq": [
    {"question": "כמה עולה ...?", "answer": "תשובה 40-80 מילים"},
    "... 6-10 שאלות"
  ],
  "relatedArticles": [
    {"slug": "how-to-open", "category": "osek-patur", "title": "..."},
    {"slug": "cost", "category": "osek-patur", "title": "..."},
    {"slug": "taxes", "category": "osek-patur", "title": "..."}
  ]
}

לפני שאתה מחזיר — ודא:
✓ סך מילים ≥ 1200
✓ 8-10 sections לפחות
✓ 6-10 FAQ
✓ 20+ keywords
✓ slug_english באנגלית kebab-case
✓ author = "צוות פרפקט וואן" (מדויק)
✓ יש answerBlock בכל section (40-70 מילים)\`;

return [{ json: {
  ...data,
  prompt,
  today
}}];`;

// =====================
// Quality Gate — new jsCode
// =====================
const newGateCode = `const input = $input.first().json;
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

// Word count ≥1200 (10)
const sections = article.sections || [];
let totalWords = 0;
for (const s of sections) {
  const texts = [];
  if (s.content) texts.push(s.content);
  if (s.answerBlock) texts.push(s.answerBlock);
  if (s.description) texts.push(s.description);
  if (s.items) s.items.forEach(i => { if (i.description) texts.push(i.description); if (i.title) texts.push(i.title); });
  if (s.steps) s.steps.forEach(i => { if (i.description) texts.push(i.description); });
  totalWords += texts.join(' ').split(/\\s+/).filter(Boolean).length;
}
if (totalWords >= 1200) {
  seoScore += 10;
} else {
  failures.push(\`Word count too low: \${totalWords} words (min 1200)\`);
}

// Structure: ≥8 sections, heroTitle exists (H1), TOC exists, ≥3 relatedArticles (10)
const hasHeroTitle = !!(article.heroTitle);
const hasToc = Array.isArray(article.toc) && article.toc.length >= 8;
const hasRelated = Array.isArray(article.relatedArticles) && article.relatedArticles.length >= 3;
const hasSections = sections.length >= 8;
if (hasSections && hasHeroTitle && hasToc && hasRelated) {
  seoScore += 10;
} else {
  if (!hasSections) failures.push(\`Not enough sections: \${sections.length} (min 8)\`);
  if (!hasHeroTitle) failures.push('heroTitle (H1) missing');
  if (!hasToc) failures.push(\`TOC too short: \${(article.toc||[]).length} entries (min 8)\`);
  if (!hasRelated) failures.push(\`relatedArticles too few: \${(article.relatedArticles || []).length} (min 3)\`);
}

// =====================
// AEO — 30 points
// =====================

// FAQ: ≥6 questions (10)
const faq = article.faq || [];
if (faq.length >= 6) {
  aeoScore += 10;
} else {
  failures.push(\`FAQ too few: \${faq.length} questions (min 6)\`);
}

// FAQ answer length: each 40-90 words (10)
const answerLengths = faq.map(f => (f.answer || '').split(/\\s+/).filter(Boolean).length);
const allAnswersOk = answerLengths.every(l => l >= 40 && l <= 90);
if (faq.length >= 6 && allAnswersOk) {
  aeoScore += 10;
} else if (faq.length >= 6) {
  const bad = answerLengths.filter(l => l < 40 || l > 90);
  failures.push(\`\${bad.length} FAQ answers outside 40-80 word range (found: \${answerLengths.join(', ')})\`);
}

// Direct answer: first non-callout section has answerBlock ≥40 words (10)
const firstContentSection = sections.find(s => s.type !== 'callout' && s.type !== 'cta-inline');
const answerBlock = firstContentSection ? (firstContentSection.answerBlock || '') : '';
const answerWordCount = answerBlock.split(/\\s+/).filter(Boolean).length;
if (answerBlock && answerWordCount >= 40 && answerWordCount <= 80) {
  aeoScore += 10;
} else {
  if (!answerBlock) failures.push('answerBlock missing in first content section');
  else failures.push(\`answerBlock length \${answerWordCount} words (target 40-80, min 40)\`);
}

// =====================
// GEO — 30 points
// =====================

const allText = JSON.stringify(article);

// Entity mentions: ≥3 entities each with ≥3 mentions (10)
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

// E-E-A-T: correct author name + updatedDate + keywords ≥20 (10)
const authorName = article.author && article.author.name;
const correctAuthor = authorName === 'צוות פרפקט וואן';
const hasUpdated = !!(article.updatedDate);
const hasKeywords = Array.isArray(article.keywords) && article.keywords.length >= 20;
if (correctAuthor && hasUpdated && hasKeywords) {
  geoScore += 10;
} else {
  if (!correctAuthor) failures.push(\`Wrong author: "\${authorName}" (must be "צוות פרפקט וואן")\`);
  if (!hasUpdated) failures.push('updatedDate missing');
  if (!hasKeywords) failures.push(\`keywords too few: \${(article.keywords || []).length} (min 20)\`);
}

// =====================
// Final score — passed = score >= 85 AND zero failures
// =====================
const score = seoScore + aeoScore + geoScore;
const passed = (score >= 85) && (failures.length === 0);

return [{ json: {
  ...input,
  gate: {
    score,
    breakdown: { seo: seoScore, aeo: aeoScore, geo: geoScore },
    failures,
    passed
  }
}}];`;

async function main() {
  console.log('Fetching WF6 from n8n...');
  const wf = await api('GET', `/workflows/${WF_ID}`);
  console.log('Got workflow:', wf.name, '| active:', wf.active);

  // Find nodes
  const buildNode = wf.nodes.find(n => n.id === 'wf6-build-prompt');
  const gateNode = wf.nodes.find(n => n.id === 'wf6-quality-gate');

  if (!buildNode) throw new Error('Build Writer Prompt node not found!');
  if (!gateNode) throw new Error('Quality Gate node not found!');

  // Update jsCode
  buildNode.parameters.jsCode = newBuildCode;
  gateNode.parameters.jsCode = newGateCode;

  console.log('Nodes updated in memory. Pushing to n8n...');

  // PUT the updated workflow
  const result = await api('PUT', `/workflows/${WF_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData,
  });

  console.log('');
  console.log('SUCCESS');
  console.log('Workflow:', result.name);
  console.log('Active:', result.active);
  const triggerNode = result.nodes.find(n => n.id === 'wf6-trigger');
  const cron = triggerNode?.parameters?.rule?.interval?.[0]?.expression;
  console.log('Cron:', cron);

  // Verify nodes were updated
  const verifyBuild = result.nodes.find(n => n.id === 'wf6-build-prompt');
  const verifyGate = result.nodes.find(n => n.id === 'wf6-quality-gate');
  const buildOk = verifyBuild?.parameters?.jsCode?.includes('1200-2000 מילים');
  const gateOk = verifyGate?.parameters?.jsCode?.includes('totalWords >= 1200');
  console.log('Build Writer Prompt updated:', buildOk ? 'YES' : 'NO');
  console.log('Quality Gate updated:', gateOk ? 'YES' : 'NO');
}

main().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
