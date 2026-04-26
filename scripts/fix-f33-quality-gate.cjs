// Fix F33: 1) Better prompt, 2) Quality Gate nodes, 3) Better email
const N8N_BASE = 'https://n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WF_ID = 'F33CbVflx4aApT71';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';

async function api(method, path, body) {
  const res = await fetch(`${N8N_BASE}${path}`, {
    method,
    headers: {
      'X-N8N-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch (e) { return text; }
}

async function main() {
  console.log('Fetching F33...');
  const wf = await api('GET', `/api/v1/workflows/${WF_ID}`);
  if (!wf.nodes) { console.error('Failed:', JSON.stringify(wf).slice(0,200)); process.exit(1); }
  console.log('Got workflow. Nodes:', wf.nodes.map(n => n.name));

  // =========================================================
  // PATCH 1: Build Article Prompt - החלף jsCode
  // =========================================================
  const buildPromptNode = wf.nodes.find(n => n.id === 'build-prompt');
  if (!buildPromptNode) { console.error('build-prompt not found!'); process.exit(1); }

  buildPromptNode.parameters.jsCode = `const idea = $input.first().json;
const today = new Date().toISOString().split('T')[0];

const systemPrompt = \`אתה כותב תוכן SEO בכיר בתחום הפיננסים בישראל.

המטרה: מאמר שמדורג על עשרות מילות מפתח במקביל, מותאם SEO (גוגל) + AEO/GEO (מנועי AI), בנוי להמיר ללידים.

נושא: \${idea.target_query}
עמוד אב: \${idea.parent_page_url}
למה זה חשוב: \${idea.why_it_matters}
זווית: \${idea.suggested_angle || ''}
קטגוריה: \${idea.category || 'osek-patur'}

## דרישות חובה (מאמר שלא עומד בהן ייפסל אוטומטית)

1. אורך: **1200-2000 מילים** סך הכל (ספור לפני שמחזיר!)
2. תשובה ישירה ב-section הראשון (שדה answerBlock, 40-70 מילים) לFeatured Snippet
3. 8-10 sections בדיוק לפי המבנה:
   - מה זה [הנושא] — id: "what-is"
   - איך עושים שלב אחרי שלב — id: "how-to-steps" (type: "steps")
   - כמה זה עולה — id: "cost"
   - כמה זמן זה לוקח — id: "timing"
   - יתרונות וחסרונות — id: "pros-cons" (type: "comparison")
   - טעויות נפוצות — id: "common-mistakes" (type: "callout")
   - למי זה מתאים ולמי לא — id: "who-is-it-for"
   - טיפים חשובים — id: "tips" (type: "list")
4. FAQ: **6-10 שאלות** בסגנון "כמה עולה/האם צריך/כמה זמן לוקח/האם אפשר לבד/מה קורה אם". כל תשובה 40-80 מילים.
5. Keywords: **20+ variations** (ראשי + משניים + long-tail + שאלות).
6. 2-3 CTA טבעיים (לא אגרסיביים) מפוזרים במאמר.
7. Entities חובה (3+ פעמים כל אחד): רשות המסים, מע"מ, ביטוח לאומי, מס הכנסה.
8. מספרים קונקרטיים: 8+ שנים/סכומים/אחוזים/ימים.
9. Author: בדיוק {"name":"צוות פרפקט וואן","role":"מומחי עסקים"}
10. slug: kebab-case אנגלית 2-4 מילים (דוגמה: "when-to-switch", "vat-refund-guide")
11. publishDate + updatedDate = \${today}

## החזר ONLY JSON (ללא markdown fences, ללא טקסט מסביב):

{
  "slug": "...",
  "category": "...",
  "metaTitle": "... (≤60 תווים)",
  "metaDescription": "... (≤155 תווים, עם CTA)",
  "keywords": ["...", "... 20+ items"],
  "heroTitle": "...",
  "heroSubtitle": "...",
  "publishDate": "\${today}",
  "updatedDate": "\${today}",
  "author": {"name":"צוות פרפקט וואן","role":"מומחי עסקים"},
  "readTime": 10,
  "toc": [{"id":"what-is","title":"..."}, "... 8-10 items"],
  "sections": [
    {"id":"what-is","type":"text","title":"...","answerBlock":"40-70 מילים","content":"150-220 מילים"},
    "... 8-10 sections"
  ],
  "faq": [{"question":"...","answer":"40-80 מילים"}, "... 6-10 items"],
  "relatedArticles": [{"slug":"...","category":"...","title":"..."}, "... 3-4 items"]
}\`;

return [{
  json: {
    idea_id: idea.id,
    target_query: idea.target_query,
    parent_page_url: idea.parent_page_url,
    prompt: systemPrompt,
    idea: idea,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'כתוב את המאמר עכשיו. החזר JSON בלבד.' }
    ]
  }
}];`;

  console.log('Patch 1 done: Build Article Prompt updated');

  // =========================================================
  // PATCH 2: הוסף 3 nodes חדשים: Quality Gate, Gate Switch, Log Gate Failure
  // =========================================================

  // Quality Gate node
  const qualityGateNode = {
    id: 'quality-gate',
    name: 'Quality Gate',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [2120, 220],
    parameters: {
      jsCode: `const article = $('Parse Article JSON').first().json;
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
    ...article,
    idea_id: $('Build Article Prompt').first().json.idea_id,
    gate: { score, passed, breakdown: { seo, aeo, geo }, failures, wordCount }
  }
}];`
    }
  };

  // Gate Switch node
  const gateSwitchNode = {
    id: 'gate-switch',
    name: 'Gate Switch',
    type: 'n8n-nodes-base.switch',
    typeVersion: 3.2,
    position: [2360, 220],
    parameters: {
      mode: 'expression',
      numberOutputs: 2,
      output: "={{ $json.gate && $json.gate.passed === true ? 0 : 1 }}"
    }
  };

  // Log Gate Failure node
  const logGateFailureNode = {
    id: 'log-gate-failure',
    name: 'Log Gate Failure',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [2600, 380],
    parameters: {
      method: 'PATCH',
      url: "=https://rtlpqjqdmomyptcdkmrq.supabase.co/rest/v1/seo_content_ideas?id=eq.{{ $json.idea_id }}",
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
      specifyBody: 'json',
      jsonBody: '={"status":"needs_revision","notes":"Gate failed score={{ $json.gate.score }}/100: {{ JSON.stringify($json.gate.failures) }}"}',
      options: {}
    }
  };

  // הסר את node הישן של GitHub (position ישתנה) ועדכן positions
  // GitHub node יזוז ימינה
  const githubNode = wf.nodes.find(n => n.id === 'github-commit');
  if (githubNode) {
    githubNode.position = [2600, 220];
  }
  const markPublishedNode = wf.nodes.find(n => n.id === 'mark-published');
  if (markPublishedNode) {
    markPublishedNode.position = [2840, 220];
  }
  const emailNode = wf.nodes.find(n => n.id === 'notify-email');
  if (emailNode) {
    emailNode.position = [3080, 220];
  }

  // הוסף nodes חדשים
  wf.nodes.push(qualityGateNode);
  wf.nodes.push(gateSwitchNode);
  wf.nodes.push(logGateFailureNode);

  console.log('Patch 2 done: Quality Gate + Gate Switch + Log Gate Failure added');

  // =========================================================
  // PATCH 3: שפר email node
  // =========================================================
  if (!emailNode) { console.error('email node not found!'); process.exit(1); }

  emailNode.parameters.jsonBody = `={
  "to": "yosi5919@gmail.com",
  "from": "no-reply@perfect1.co.il",
  "subject": {{ JSON.stringify("📝 מאמר חדש חי: " + $('Parse Article JSON').item.json.title) }},
  "html": {{ JSON.stringify("<div dir=\\"rtl\\" style=\\"font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f9fafb;\\"><div style=\\"background:#1E3A5F;color:white;padding:20px;border-radius:8px 8px 0 0;\\"><h1 style=\\"margin:0;font-size:22px;\\">📝 מאמר חדש עלה לאוויר</h1><p style=\\"margin:6px 0 0;opacity:0.85;font-size:13px;\\">perfect1.co.il</p></div><div style=\\"background:white;padding:24px;border:1px solid #e5e7eb;border-top:none;\\"><h2 style=\\"color:#1E3A5F;margin:0 0 12px;\\">" + $('Parse Article JSON').item.json.title + "</h2><p style=\\"color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 20px;\\">" + ($('Parse Article JSON').item.json.metaDescription || '') + "</p><table style=\\"width:100%;font-size:13px;margin-bottom:24px;border-collapse:collapse;\\"><tr><td style=\\"color:#9ca3af;padding:6px 0;width:120px;\\">קטגוריה:</td><td>" + $('Parse Article JSON').item.json.category + "</td></tr><tr><td style=\\"color:#9ca3af;padding:6px 0;\\">מילים:</td><td>" + $('Quality Gate').item.json.gate.wordCount + "</td></tr><tr><td style=\\"color:#9ca3af;padding:6px 0;\\">ציון איכות:</td><td><strong style=\\"color:#059669;\\">" + $('Quality Gate').item.json.gate.score + "/100</strong></td></tr><tr><td style=\\"color:#9ca3af;padding:6px 0;\\">Sections:</td><td>" + ($('Parse Article JSON').item.json.sections || []).length + "</td></tr><tr><td style=\\"color:#9ca3af;padding:6px 0;\\">FAQ:</td><td>" + ($('Parse Article JSON').item.json.faq || []).length + " שאלות</td></tr></table><div style=\\"text-align:center;margin:24px 0;\\"><a href=\\"https://www.perfect1.co.il/" + $('Parse Article JSON').item.json.category + "/" + $('Parse Article JSON').item.json.slug + "\\" style=\\"display:inline-block;background:#1E3A5F;color:white;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;\\">🔗 פתח מאמר באתר</a></div><p style=\\"color:#9ca3af;font-size:11px;text-align:center;margin:20px 0 0;\\"><a href=\\"https://github.com/perfect-ai-admin/perfect1-portal/blob/main/" + $('Parse Article JSON').item.json.file_path + "\\" style=\\"color:#6b7280;\\">view on github</a> &nbsp;•&nbsp; אתר יעודכן תוך 2-3 דקות אחרי commit (Vercel build)</p></div></div>") }}
}`;

  console.log('Patch 3 done: Email node updated with live URL + quality score');

  // =========================================================
  // עדכן connections
  // =========================================================
  // Parse Article JSON → Quality Gate (במקום GitHub)
  wf.connections['Parse Article JSON'] = {
    main: [[{ node: 'Quality Gate', type: 'main', index: 0 }]]
  };
  // Quality Gate → Gate Switch
  wf.connections['Quality Gate'] = {
    main: [[{ node: 'Gate Switch', type: 'main', index: 0 }]]
  };
  // Gate Switch output 0 (passed) → GitHub - Create File
  // Gate Switch output 1 (failed) → Log Gate Failure
  wf.connections['Gate Switch'] = {
    main: [
      [{ node: 'GitHub - Create File', type: 'main', index: 0 }],
      [{ node: 'Log Gate Failure', type: 'main', index: 0 }]
    ]
  };
  // GitHub → Mark as Published (already exists)
  // Mark as Published → Send Email (already exists)

  console.log('Connections updated');

  // =========================================================
  // שלח PUT לn8n
  // =========================================================
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
    console.log('SUCCESS: F33 updated!');
    console.log('  versionId:', result.versionId);
    console.log('  active:', result.active);
    console.log('  nodes count:', result.nodes?.length);
    const nodeNames = result.nodes?.map(n => n.name) || [];
    console.log('  nodes:', nodeNames.join(' | '));
  } else {
    console.error('Update failed:', JSON.stringify(result).slice(0, 500));
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
