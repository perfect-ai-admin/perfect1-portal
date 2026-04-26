// fix-f33-gate-v4.cjs
// Fix: wordCount >= 400 -> 1200, add hardFails, strengthen prompt
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
  if (!wf.nodes) { console.error('Failed:', JSON.stringify(wf).slice(0,300)); process.exit(1); }
  console.log('Nodes:', wf.nodes.length, '| versionId:', wf.versionId);

  // ---- FIX 1: Quality Gate ----
  const gateNode = wf.nodes.find(n => n.id === 'quality-gate');
  if (!gateNode) { console.error('quality-gate not found'); process.exit(1); }

  // Verify current bug
  const curCode = gateNode.parameters.jsCode;
  console.log('  Current gate has >= 400 (bug):', curCode.includes('wordCount >= 400'));
  console.log('  Current gate has hardFails:', curCode.includes('hardFails'));

  // New gate code — Hebrew strings as unicode escapes to avoid file encoding issues
  // \u05e8\u05e9\u05d5\u05ea \u05d4\u05de\u05e1\u05d9\u05dd = רשות המסים
  // \u05de\u05e2"\u05de = מע"מ
  // \u05d1\u05d9\u05d8\u05d5\u05d7 \u05dc\u05d0\u05d5\u05de\u05d9 = ביטוח לאומי
  // \u05de\u05e1 \u05d4\u05db\u05e0\u05e1\u05d4 = מס הכנסה
  // \u05e6\u05d5\u05d5\u05ea \u05e4\u05e8\u05e4\u05e7\u05d8 \u05d5\u05d0\u05d5\u05df = צוות פרפקט וואן
  gateNode.parameters.jsCode = [
    "const article = $('Parse Article JSON').first().json;",
    "const sections = article.sections || [];",
    "const faq = article.faq || [];",
    "const keywords = article.keywords || [];",
    "const metaTitle = article.metaTitle || '';",
    "const metaDesc = article.metaDescription || '';",
    "",
    "const wordCount = sections.reduce((sum, s) => {",
    "  const content = (s.content || '') + ' ' + (s.answerBlock || '');",
    "  return sum + content.split(/\\s+/).filter(Boolean).length;",
    "}, 0);",
    "",
    "const failures = [];",
    "const hardFails = [];",
    "",
    "// SEO (40)",
    "let seo = 0;",
    "if (metaTitle.length > 0 && metaTitle.length <= 60) seo += 10; else failures.push('metaTitle len=' + metaTitle.length);",
    "if (metaDesc.length > 0 && metaDesc.length <= 155) seo += 10; else failures.push('metaDescription len=' + metaDesc.length);",
    "if (wordCount >= 1200) seo += 10; else { failures.push('Word count ' + wordCount + ' (min 1200)'); hardFails.push('word_count'); }",
    "if (sections.length >= 8 && sections.length <= 12 && (article.toc || []).length >= 8) seo += 10; else { failures.push('sections=' + sections.length + ' toc=' + (article.toc||[]).length); hardFails.push('structure'); }",
    "",
    "// AEO (30)",
    "let aeo = 0;",
    "if (faq.length >= 6) aeo += 15; else { failures.push('FAQ=' + faq.length + ' (min 6)'); hardFails.push('faq_count'); }",
    "const faqOk = faq.filter(f => { const w = (f.answer||'').split(/\\s+/).filter(Boolean).length; return w >= 40 && w <= 80; }).length;",
    "if (faq.length > 0 && faqOk >= Math.ceil(faq.length * 0.6)) aeo += 15; else failures.push('FAQ answers out of 40-80 range');",
    "",
    "// GEO (30)",
    "let geo = 0;",
    "const allText = sections.map(s => (s.content||'') + ' ' + (s.answerBlock||'')).join(' ');",
    "const entities = ['\\u05e8\\u05e9\\u05d5\\u05ea \\u05d4\\u05de\\u05e1\\u05d9\\u05dd','\\u05de\\u05e2\"\\u05de','\\u05d1\\u05d9\\u05d8\\u05d5\\u05d7 \\u05dc\\u05d0\\u05d5\\u05de\\u05d9','\\u05de\\u05e1 \\u05d4\\u05db\\u05e0\\u05e1\\u05d4'];",
    "const entitiesOk = entities.filter(e => (allText.match(new RegExp(e,'g'))||[]).length >= 2).length;",
    "if (entitiesOk >= 3) geo += 10; else failures.push('Only ' + entitiesOk + '/4 entities 2+ times');",
    "const numbers = (allText.match(/\\b\\d+\\b/g) || []).length;",
    "if (numbers >= 8) geo += 10; else failures.push('Numbers=' + numbers + ' (min 8)');",
    "if (keywords.length >= 20) geo += 10; else failures.push('Keywords=' + keywords.length + ' (min 20)');",
    "",
    "const authorOk = article.author && article.author.name === '\\u05e6\\u05d5\\u05d5\\u05ea \\u05e4\\u05e8\\u05e4\\u05e7\\u05d8 \\u05d5\\u05d0\\u05d5\\u05df';",
    "if (!authorOk) { failures.push('Wrong author: ' + JSON.stringify(article.author)); hardFails.push('author'); }",
    "",
    "const score = seo + aeo + geo;",
    "const passed = hardFails.length === 0 && score >= 75;",
    "",
    "return [{",
    "  json: {",
    "    ...article,",
    "    idea_id: $('Build Article Prompt').first().json.idea_id,",
    "    gate: { score, passed, breakdown: { seo, aeo, geo }, failures, hardFails, wordCount }",
    "  }",
    "}];"
  ].join('\n');

  console.log('Fix 1: Quality Gate replaced');
  console.log('  New code has >= 1200:', gateNode.parameters.jsCode.includes('wordCount >= 1200'));
  console.log('  New code has hardFails:', gateNode.parameters.jsCode.includes('hardFails'));

  // ---- FIX 2: Build Article Prompt — prepend warning ----
  const buildNode = wf.nodes.find(n => n.id === 'build-prompt');
  if (!buildNode) { console.error('build-prompt not found'); process.exit(1); }

  const WARNING = '\u26a8\ufe0f \u05d7\u05e9\u05d5\u05d1 \u05de\u05d0\u05d5\u05d3: \u05de\u05d0\u05de\u05e8 \u05e7\u05e6\u05e8 \u05de-1200 \u05de\u05d9\u05dc\u05d9\u05dd \u05d9\u05d9\u05e4\u05e1\u05dc \u05d1\u05d0\u05d5\u05e4\u05df \u05de\u05d5\u05d7\u05dc\u05d8. \u05e1\u05e4\u05d5\u05e8 \u05d0\u05ea \u05d4\u05de\u05d9\u05dc\u05d9\u05dd \u05dc\u05e4\u05e0\u05d9 \u05e9\u05d0\u05ea\u05d4 \u05de\u05d7\u05d6\u05d9\u05e8.\n\u05db\u05dc section.content \u05d7\u05d9\u05d9\u05d1 \u05dc\u05d4\u05d9\u05d5\u05ea 150-220 \u05de\u05d9\u05dc\u05d9\u05dd. \u05d0\u05dd \u05db\u05ea\u05d1\u05ea section \u05e7\u05e6\u05e8 \u05de-150 \u05de\u05d9\u05dc\u05d9\u05dd \u2014 \u05d4\u05e8\u05d7\u05d1 \u05d0\u05d5\u05ea\u05d5.\n\u05d1\u05e4\u05d5\u05e2\u05dc \u05d6\u05d4 \u05d0\u05d5\u05de\u05e8: 10 sections \u00d7 180 \u05de\u05d9\u05dc\u05d9\u05dd \u05de\u05de\u05d5\u05e6\u05e2 = 1800 \u05de\u05d9\u05dc\u05d9\u05dd.\n\u05d0\u05dc \u05ea\u05d9\u05ea\u05df \u05ea\u05d5\u05db\u05df "\u05ea\u05de\u05e6\u05d9\u05ea\u05d9" \u05d0\u05d5 "\u05e7\u05e6\u05e8 \u05d5\u05dc\u05e2\u05e0\u05d9\u05d9\u05df" \u2014 \u05e4\u05e8\u05d5\u05e1, \u05d4\u05e1\u05d1\u05e8, \u05ea\u05df \u05d3\u05d5\u05d2\u05de\u05d0\u05d5\u05ea, \u05de\u05e1\u05e4\u05e8\u05d9\u05dd, \u05ea\u05d0\u05e8\u05d9\u05db\u05d9\u05dd.\n\n';

  const currentBuild = buildNode.parameters.jsCode;
  const SEARCH = 'const systemPrompt = `';
  const idx = currentBuild.indexOf(SEARCH);
  if (idx === -1) {
    console.log('Fix 2: systemPrompt not found in build-prompt, skipping');
  } else if (currentBuild.includes('\u26a8')) {
    console.log('Fix 2: Warning already present, skipping');
  } else {
    buildNode.parameters.jsCode = currentBuild.slice(0, idx + SEARCH.length) + WARNING + currentBuild.slice(idx + SEARCH.length);
    console.log('Fix 2: Warning prepended to systemPrompt');
  }

  // ---- FIX 3: Cron — set to +2 min for QA test ----
  const triggerNode = wf.nodes.find(n => n.id === 'trigger');
  if (triggerNode) {
    const now = new Date();
    // Israel = UTC+3 in April (IDT)
    const israelMs = now.getTime() + 3 * 3600000;
    const israelNow = new Date(israelMs);
    let qaMin = israelNow.getMinutes() + 2;
    let qaHour = israelNow.getHours();
    if (qaMin >= 60) { qaMin -= 60; qaHour = (qaHour + 1) % 24; }
    const qaCron = `0 ${qaMin} ${qaHour} * * *`;
    triggerNode.parameters.rule.interval[0].expression = qaCron;
    console.log(`Fix 3: Cron set to QA test at Israel ${qaHour}:${String(qaMin).padStart(2,'0')} (${qaCron})`);
  }

  // Push
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };

  console.log('\nPushing to n8n...');
  const result = await api('PUT', `/api/v1/workflows/${WF_ID}`, payload);
  if (result.id) {
    console.log('\nSUCCESS!');
    console.log('  versionId:', result.versionId);
    console.log('  active:', result.active);
    console.log('  versionCounter:', result.versionCounter);
  } else {
    console.error('FAILED:', JSON.stringify(result).slice(0,600));
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
