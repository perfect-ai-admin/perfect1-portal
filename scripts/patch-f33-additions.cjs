/**
 * Patch F33 — 2 additions:
 * 1. Priority hubs in Build Article Prompt
 * 2. Wait for Deploy + Verify Live URL + QA Result between GitHub commit and Mark as Published
 */
const fs = require('fs');

const parentDir = 'C:/Users/USER/Desktop/\u05e7\u05dc\u05d5\u05d0\u05d3 \u05e7\u05d5\u05d3';
const dirs = fs.readdirSync(parentDir);
const salesDir = dirs.find(d => d.includes('\u05de\u05db\u05d9\u05e8\u05d5\u05ea'));
const BASE = parentDir + '/' + salesDir;
const filePath = BASE + '/docs/f33-live.json';

const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// ================================================================
// PATCH 1: priority hubs in build-prompt jsCode
// ================================================================
const bp = wf.nodes.find(n => n.id === 'build-prompt');
if (!bp) { console.error('FAIL: build-prompt node not found'); process.exit(1); }

// The marker is the beginning of the JSON schema section
// The jsCode is stored with REAL newlines (not escaped \n)
const MARKER = '\n\n## \u05d4\u05d7\u05d6\u05e8 ONLY JSON (\u05dc\u05dc\u05d0 markdown fences, \u05dc\u05dc\u05d0 \u05d8\u05e7\u05e1\u05d8 \u05de\u05e1\u05d1\u05d9\u05d1):';

if (bp.parameters.jsCode.indexOf(MARKER) === -1) {
  // Try alternate form
  const alt = bp.parameters.jsCode.lastIndexOf('relatedArticles');
  console.error('FAIL: MARKER not found. Last relatedArticles context:');
  console.error(bp.parameters.jsCode.substring(Math.max(0, alt - 100), alt + 300));
  process.exit(1);
}

// Hub section — inserted as text inside the template literal
// Uses \\n to represent actual newline in the running template literal (stored as \n in JSON)
const HUB_LINES = [
  '',
  '',
  '## \u05e2\u05de\u05d5\u05d3\u05d9 Hub \u05de\u05e8\u05db\u05d6\u05d9\u05d9\u05dd \u2014 \u05d7\u05d5\u05d1\u05d4 \u05d1-relatedArticles',
  '',
  '\u05d7\u05d5\u05d1\u05d4 \u05dc\u05db\u05dc\u05d5\u05dc \u05d1-relatedArticles **\u05dc\u05e4\u05d7\u05d5\u05ea 2** \u05de\u05ea\u05d5\u05da \u05d4\u05dc\u05d9\u05e0\u05e7\u05d9\u05dd \u05d4\u05d1\u05d0\u05d9\u05dd (\u05d4\u05dd \u05e2\u05de\u05d5\u05d3\u05d9 hub \u05de\u05e8\u05db\u05d6\u05d9\u05d9\u05dd, \u05de\u05e7\u05d3\u05de\u05d9\u05dd SEO \u05e9\u05dc \u05d4\u05d0\u05ea\u05e8):',
  '',
  '[',
  '  {"category": "osek-patur", "slug": "how-to-open", "title": "\u05d0\u05d9\u05da \u05e4\u05d5\u05ea\u05d7\u05d9\u05dd \u05e2\u05d5\u05e1\u05e7 \u05e4\u05d8\u05d5\u05e8 \u2014 \u05de\u05d3\u05e8\u05d9\u05da \u05de\u05dc\u05d0"},',
  '  {"category": "osek-murshe", "slug": "how-to-open", "title": "\u05e4\u05ea\u05d9\u05d7\u05ea \u05e2\u05d5\u05e1\u05e7 \u05de\u05d5\u05e8\u05e9\u05d4 \u2014 \u05de\u05d3\u05e8\u05d9\u05da \u05de\u05dc\u05d0"},',
  '  {"category": "hevra-bam", "slug": "how-to-open", "title": "\u05e4\u05ea\u05d9\u05d7\u05ea \u05d7\u05d1\u05e8\u05d4 \u05d1\u05e2\\"\\u05de \u2014 \u05de\u05d3\u05e8\u05d9\u05da"},',
  '  {"category": "osek-patur", "slug": "cost", "title": "\u05db\u05de\u05d4 \u05e2\u05d5\u05dc\u05d4 \u05e2\u05d5\u05e1\u05e7 \u05e4\u05d8\u05d5\u05e8"},',
  '  {"category": "osek-patur", "slug": "taxes", "title": "\u05de\u05d9\u05e1\u05d5\u05d9 \u05e2\u05d5\u05e1\u05e7 \u05e4\u05d8\u05d5\u05e8"},',
  '  {"category": "osek-patur", "slug": "income-ceiling", "title": "\u05ea\u05e7\u05e8\u05ea \u05d4\u05db\u05e0\u05e1\u05d5\u05ea \u05e2\u05d5\u05e1\u05e7 \u05e4\u05d8\u05d5\u05e8"}',
  ']',
  '',
  'relatedArticles \u05e1\u05d5\u05e4\u05d9 \u05d7\u05d9\u05d9\u05d1 \u05dc\u05d4\u05d9\u05d5\u05ea 4 \u05e4\u05e8\u05d9\u05d8\u05d9\u05dd: 2-3 hubs \u05de\u05d4\u05e8\u05e9\u05d9\u05de\u05d4 \u05dc\u05de\u05e2\u05dc\u05d4 + 1-2 \u05de\u05d0\u05de\u05e8\u05d9\u05dd \u05e8\u05dc\u05d5\u05d5\u05e0\u05d8\u05d9\u05d9\u05dd \u05dc\u05e0\u05d5\u05e9\u05d0.'
];

// The jsCode uses real newlines, so we join with actual newline char
const HUB_INSERTION = HUB_LINES.join('\n');

bp.parameters.jsCode = bp.parameters.jsCode.replace(MARKER, HUB_INSERTION + MARKER);
console.log('Patch 1 OK');

// ================================================================
// PATCH 2: QA nodes
// ================================================================
// Move existing downstream nodes right
wf.nodes.forEach(n => {
  if (n.id === 'mark-published') n.position = [3560, 220];
  if (n.id === 'notify-email') n.position = [3800, 220];
});

// Wait for Deploy
wf.nodes.push({
  id: 'wait-deploy',
  name: 'Wait for Deploy',
  type: 'n8n-nodes-base.wait',
  typeVersion: 1.1,
  position: [2840, 220],
  parameters: { amount: 4, unit: 'minutes' }
});

// Verify Live URL
wf.nodes.push({
  id: 'verify-live-url',
  name: 'Verify Live URL',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [3080, 220],
  parameters: {
    method: 'GET',
    url: "={{ 'https://www.perfect1.co.il/' + $('Parse Article JSON').item.json.category + '/' + $('Parse Article JSON').item.json.slug }}",
    options: {
      response: { response: { responseFormat: 'text' } },
      redirect: { redirect: { followRedirects: true, maxRedirects: 5 } }
    },
    sendHeaders: true,
    specifyHeaders: 'keypair',
    headerParameters: {
      parameters: [{ name: 'User-Agent', value: 'Mozilla/5.0 PerfectOneBot' }]
    }
  }
});

// QA Result - jsCode using single quotes to avoid backtick issues in this file
const qaCode = [
  "const html = $json.data || $json.body || '';",
  "const size = typeof html === 'string' ? html.length : 0;",
  "const articleTitle = $('Parse Article JSON').item.json.title || '';",
  "const hasContent = size > 20000;",
  "const hasTitle = articleTitle ? html.includes(articleTitle.substring(0, 20)) : false;",
  "",
  "const qa = {",
  "  live: hasContent,",
  "  pageSize: size,",
  "  titleFound: hasTitle,",
  "  url: 'https://www.perfect1.co.il/' + $('Parse Article JSON').item.json.category + '/' + $('Parse Article JSON').item.json.slug",
  "};",
  "",
  "return [{",
  "  json: {",
  "    ...$('Parse Article JSON').item.json,",
  "    idea_id: $('Parse Article JSON').item.json.idea_id,",
  "    commit: $('GitHub - Create File').item.json.commit,",
  "    qa",
  "  }",
  "}];"
].join('\n');

wf.nodes.push({
  id: 'qa-result',
  name: 'QA Result',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [3320, 220],
  parameters: { jsCode: qaCode }
});

// Rewire connections
wf.connections['GitHub - Create File'] = {
  main: [[{ node: 'Wait for Deploy', type: 'main', index: 0 }]]
};
wf.connections['Wait for Deploy'] = {
  main: [[{ node: 'Verify Live URL', type: 'main', index: 0 }]]
};
wf.connections['Verify Live URL'] = {
  main: [[{ node: 'QA Result', type: 'main', index: 0 }]]
};
wf.connections['QA Result'] = {
  main: [[{ node: 'Mark as Published', type: 'main', index: 0 }]]
};

console.log('Patch 2 OK — total nodes:', wf.nodes.length);

// Write
fs.writeFileSync(filePath, JSON.stringify(wf, null, 2), 'utf8');
console.log('Written:', filePath);

// === VERIFY ===
const v = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const bpV = v.nodes.find(n => n.id === 'build-prompt');
console.log('\n=== VERIFY ===');
console.log('hubs in prompt:', bpV.parameters.jsCode.includes('\u05e2\u05de\u05d5\u05d3\u05d9 Hub'));
console.log('wait-deploy node:', v.nodes.some(n => n.id === 'wait-deploy'));
console.log('verify-live-url node:', v.nodes.some(n => n.id === 'verify-live-url'));
console.log('qa-result node:', v.nodes.some(n => n.id === 'qa-result'));
console.log('GitHub->:', v.connections['GitHub - Create File'].main[0][0].node);
console.log('Wait->:', v.connections['Wait for Deploy'] && v.connections['Wait for Deploy'].main[0][0].node);
console.log('Verify->:', v.connections['Verify Live URL'] && v.connections['Verify Live URL'].main[0][0].node);
console.log('QA->:', v.connections['QA Result'] && v.connections['QA Result'].main[0][0].node);
