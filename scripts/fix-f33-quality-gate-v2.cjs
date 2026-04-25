// fix-f33-quality-gate-v2.cjs
// Adds Quality Gate node + retry logic + updates OpenAI prompt in F33
// Run: node scripts/fix-f33-quality-gate-v2.cjs

const N8N_BASE = 'https://n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const WORKFLOW_ID = 'F33CbVflx4aApT71';

async function apiFetch(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${N8N_BASE}${path}`, opts);
  const text = await r.text();
  try { return JSON.parse(text); } catch { return text; }
}

// Updated systemPrompt with strict Hub pages + word count requirements
const NEW_SYSTEM_PROMPT = `You are an SEO writer for perfect1.co.il, an Israeli business portal focused on עוסק פטור, עוסק מורשה, חברה בע"מ, מיסוי, and guides for self-employed in Israel.

You must output a COMPLETE valid JSON article file (Hebrew, RTL) matching this exact schema:

{
  "slug": "kebab-case-slug",
  "category": "one of: misui, maam, miktzoa, osek-patur, osek-murshe, hevra-bam, sgirat-tikim, guides",
  "metaTitle": "SEO title EXACTLY 55-60 chars, ending with | פרפקט וואן",
  "metaDescription": "EXACTLY 145-155 chars with CTA like → קרא עכשיו",
  "keywords": ["5-8 Hebrew keywords"],
  "heroTitle": "strong Hebrew H1",
  "heroSubtitle": "1-2 sentences explaining the article value",
  "publishDate": "2026-04-25",
  "updatedDate": "2026-04-25",
  "author": {"name": "צוות פרפקט וואן", "role": "מומחי מיסוי ועסקים"},
  "readTime": 10,
  "toc": [{"id": "...", "title": "..."}],
  "sections": [
    {
      "id": "intro",
      "type": "text",
      "title": "...",
      "answerBlock": "1-2 sentences direct answer for AI citation",
      "content": "long paragraph (200+ words) with [internal links](/category/slug) in markdown"
    },
    {"id": "list-section", "type": "list", "title": "...", "description": "...", "items": [{"title": "...", "description": "..."}]},
    {"id": "steps", "type": "steps", "title": "...", "answerBlock": "...", "steps": [{"number": 1, "title": "...", "description": "..."}]},
    {"id": "callout", "type": "callout", "variant": "tip", "title": "...", "content": "..."},
    {"id": "comparison", "type": "comparison", "title": "...", "content": "markdown table"}
  ],
  "faq": [{"question": "...", "answer": "..."}],
  "relatedArticles": [{"category": "...", "slug": "...", "title": "...", "url": "/category/slug"}]
}

MANDATORY RULES — article will be REJECTED if violated:
1. MINIMUM 1500 words total across all sections + FAQ (count carefully — each section content must be 150+ words)
2. relatedArticles MUST include EXACTLY 4 links
3. AT LEAST 2 of the 4 relatedArticles must be from this Hub pages list:
   - /osek-patur/how-to-open (flagship — highest priority)
   - /osek-murshe/how-to-open
   - /hevra-bam/how-to-open
   - /osek-patur/cost
   - /osek-patur/taxes
   - /osek-patur/income-ceiling
4. AT LEAST 1 of the 4 relatedArticles must be a "how-to-open" page (highest conversion):
   - /osek-patur/how-to-open
   - /osek-murshe/how-to-open
   - /hevra-bam/how-to-open
5. relatedArticles must use "url" field with full path like "/osek-patur/how-to-open"
6. metaTitle: EXACTLY 55-60 characters (count the chars!)
7. metaDescription: EXACTLY 145-155 characters (count the chars!)
8. Add at least 3 inline markdown links to Hub pages within section "content" fields
9. 8-12 sections minimum
10. 6-10 FAQ questions
11. answerBlock on every major text section (for AEO)
12. All Hebrew, RTL
13. Year 2026 facts only
14. Commercial intent (CTA section in the middle)
15. Return ONLY the JSON, no markdown fences, no explanation`;

// Quality Gate Code node JS
const QUALITY_GATE_CODE = `const item = $input.first().json;

// If upstream parse failed, pass through the error
if (item.error) return [{ json: item }];

// Extract full text for word count
const article = JSON.parse(item.file_content);

const sectionText = (article.sections || []).map(s => {
  const parts = [s.answerBlock || '', s.content || '', s.description || ''];
  if (s.items) parts.push(s.items.map(i => (i.title || '') + ' ' + (i.description || '')).join(' '));
  if (s.steps) parts.push(s.steps.map(i => (i.title || '') + ' ' + (i.description || '')).join(' '));
  return parts.join(' ');
}).join(' ');

const faqText = (article.faq || []).map(q => (q.question || '') + ' ' + (q.answer || '')).join(' ');
const wordCount = (sectionText + ' ' + faqText).split(/\\s+/).filter(Boolean).length;

const errors = [];

if (wordCount < 1400) {
  errors.push(\`Article too short: \${wordCount} words (need 1400+)\`);
}

const related = article.relatedArticles || [];
if (related.length < 3) {
  errors.push(\`Need 3+ relatedArticles (got \${related.length})\`);
}

const validUrls = related.filter(r => r.url && r.url.startsWith('/'));
if (validUrls.length < 3) {
  errors.push(\`relatedArticles must have valid /path URLs (got \${validUrls.length})\`);
}

const HUB_PAGES = [
  '/osek-patur/how-to-open',
  '/osek-murshe/how-to-open',
  '/hevra-bam/how-to-open',
  '/osek-patur/cost',
  '/osek-patur/taxes',
  '/osek-patur/income-ceiling'
];
const hubCount = related.filter(r => HUB_PAGES.includes(r.url)).length;
if (hubCount < 2) {
  errors.push(\`Must link to 2+ Hub pages (found \${hubCount}). Hub pages: \${HUB_PAGES.join(', ')}\`);
}

const HOW_TO_OPEN = ['/osek-patur/how-to-open', '/osek-murshe/how-to-open', '/hevra-bam/how-to-open'];
if (!related.some(r => HOW_TO_OPEN.includes(r.url))) {
  errors.push('Must link to at least 1 how-to-open page (highest conversion)');
}

if (!article.metaTitle || article.metaTitle.length < 50) {
  errors.push(\`metaTitle too short (\${(article.metaTitle || '').length} chars, need 50+)\`);
}
if (!article.metaDescription || article.metaDescription.length < 140) {
  errors.push(\`metaDescription too short (\${(article.metaDescription || '').length} chars, need 140+)\`);
}

if (errors.length > 0) {
  // Pass errors forward for retry logic
  return [{
    json: {
      ...item,
      qa_failed: true,
      qa_errors: errors,
      qa_word_count: wordCount,
      retry_count: (item.retry_count || 0)
    }
  }];
}

return [{
  json: {
    ...item,
    qa_passed: true,
    qa_word_count: wordCount
  }
}];`;

// Retry check IF node
const RETRY_CHECK_CODE = `// Check if QA failed and decide: retry or skip
const item = $input.first().json;
const shouldRetry = item.qa_failed && (item.retry_count || 0) < 2;
return shouldRetry;`;

async function main() {
  console.log('Fetching current F33 workflow...');
  const wf = await apiFetch(`/api/v1/workflows/${WORKFLOW_ID}`);

  // 1. Update Build Article Prompt node with new system prompt
  const buildNode = wf.nodes.find(n => n.id === 'build-prompt');
  if (!buildNode) throw new Error('build-prompt node not found');

  const oldCode = buildNode.parameters.jsCode;
  // Replace the systemPrompt string inside the code
  const newCode = oldCode.replace(
    /const systemPrompt = `[\s\S]*?`;/,
    `const systemPrompt = \`${NEW_SYSTEM_PROMPT.replace(/`/g, '\\`')}\`;`
  );

  if (newCode === oldCode) {
    console.warn('WARNING: systemPrompt replacement did not change anything — check regex');
  } else {
    buildNode.parameters.jsCode = newCode;
    console.log('Updated Build Article Prompt node');
  }

  // 2. Add Quality Gate node after Parse Article JSON
  const parseNode = wf.nodes.find(n => n.id === 'parse-article');
  const githubNode = wf.nodes.find(n => n.id === 'github-commit');

  const qaNodeId = 'quality-gate';
  const retryCheckId = 'retry-check';
  const retryBuildId = 'retry-build-prompt';

  // Position QA node between parse (1880,220) and github (2120,220)
  const qaNode = {
    id: qaNodeId,
    name: 'Quality Gate',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [2050, 220],
    parameters: { jsCode: QUALITY_GATE_CODE }
  };

  // IF node: qa_failed AND retry_count < 2
  const retryCheckNode = {
    id: retryCheckId,
    name: 'Should Retry?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.2,
    position: [2280, 220],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
        conditions: [
          {
            id: 'qa-failed-check',
            leftValue: '={{ $json.qa_failed }}',
            rightValue: true,
            operator: { type: 'boolean', operation: 'equals' }
          },
          {
            id: 'retry-count-check',
            leftValue: '={{ $json.retry_count || 0 }}',
            rightValue: 2,
            operator: { type: 'number', operation: 'lt' }
          }
        ],
        combinator: 'and'
      },
      options: {}
    }
  };

  // Build retry prompt node (re-calls OpenAI with failure context)
  const retryBuildNode = {
    id: retryBuildId,
    name: 'Build Retry Prompt',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [2510, 120],
    parameters: {
      jsCode: `const item = $input.first().json;
const article = JSON.parse(item.file_content);
const errors = item.qa_errors || [];

const retrySystemPrompt = \`${NEW_SYSTEM_PROMPT.replace(/`/g, '\\`')}\`;

const retryUserPrompt = \`The previous article failed quality checks. Fix ALL the following issues and rewrite the article:

FAILURES:
\${errors.map((e, i) => \`\${i+1}. \${e}\`).join('\\n')}

Original article data:
- Category: \${article.category}
- Slug: \${article.slug}
- Target topic: \${article.heroTitle || article.metaTitle}

Rewrite the ENTIRE article JSON fixing all issues above. Return only valid JSON.\`;

return [{
  json: {
    ...item,
    retry_count: (item.retry_count || 0) + 1,
    messages: [
      { role: 'system', content: retrySystemPrompt },
      { role: 'user', content: retryUserPrompt }
    ]
  }
}];`
    }
  };

  // Mark failed node (when retry_count >= 2 and still failing)
  const markFailedNode = {
    id: 'mark-failed-qa',
    name: 'Mark Failed Quality',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [2510, 320],
    parameters: {
      jsCode: `const item = $input.first().json;
console.log('Article failed QA after retries:', item.qa_errors);
// Do NOT mark as published — idea stays available for next run
return [{ json: { ...item, status: 'failed_quality', skipped: true } }];`
    }
  };

  // Remove existing nodes with same IDs if present (idempotent)
  const existingIds = [qaNodeId, retryCheckId, retryBuildId, 'mark-failed-qa'];
  wf.nodes = wf.nodes.filter(n => !existingIds.includes(n.id));

  // Add new nodes
  wf.nodes.push(qaNode, retryCheckNode, retryBuildNode, markFailedNode);

  // Move github node to the right
  githubNode.position = [2740, 220];
  wf.nodes.find(n => n.id === 'mark-published').position = [2980, 220];
  wf.nodes.find(n => n.id === 'notify-email').position = [3220, 220];

  // 3. Rewire connections
  // Parse → QA
  wf.connections['Parse Article JSON'] = { main: [[{ node: 'Quality Gate', type: 'main', index: 0 }]] };
  // QA → Should Retry?
  wf.connections['Quality Gate'] = { main: [[{ node: 'Should Retry?', type: 'main', index: 0 }]] };
  // Should Retry? → true branch → Build Retry Prompt
  //               → false branch → GitHub (qa_passed) or Mark Failed
  wf.connections['Should Retry?'] = {
    main: [
      // true branch (index 0): retry
      [{ node: 'Build Retry Prompt', type: 'main', index: 0 }],
      // false branch (index 1): check if qa_passed
      [{ node: 'Mark Failed Quality', type: 'main', index: 0 }, { node: 'GitHub - Create File', type: 'main', index: 0 }]
    ]
  };
  // Build Retry Prompt → Call OpenAI (re-use existing)
  wf.connections['Build Retry Prompt'] = { main: [[{ node: 'Call OpenAI', type: 'main', index: 0 }]] };
  // Mark Failed Quality → end (no further connections)
  wf.connections['Mark Failed Quality'] = { main: [[]] };

  // 4. Push updated workflow
  console.log('Pushing updated workflow to n8n...');

  // Deactivate first
  await apiFetch(`/api/v1/workflows/${WORKFLOW_ID}/deactivate`, 'POST');

  // Update
  const updated = await apiFetch(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData
  });

  // Reactivate
  await apiFetch(`/api/v1/workflows/${WORKFLOW_ID}/activate`, 'POST');

  console.log('Done! Workflow updated and reactivated.');
  console.log('Nodes added: Quality Gate, Should Retry?, Build Retry Prompt, Mark Failed Quality');
  console.log('Build Article Prompt: system prompt updated with strict Hub pages rules');
}

main().catch(e => { console.error(e); process.exit(1); });
