// mega-patch-daily-email-f33-claude.cjs
// Part 1: Add Fetch Today's Articles node + update Build Daily Email + cron 11:30
// Part 2: Disconnect Send Publish Notification Email from F33
// Part 3: Switch F33 from OpenAI to Claude Opus
// QA: Add idea with status=new if none exist

const N8N_BASE = 'https://n8n.perfect-1.one';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const DAILY_WF_ID = 'pP0LzSvFURy3BCBd';
const F33_WF_ID = 'F33CbVflx4aApT71';
const SUPA_URL = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';

async function api(method, path, body) {
  const res = await fetch(N8N_BASE + path, {
    method,
    headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch(e) { return text; }
}

async function supaPost(path, body) {
  const res = await fetch(SUPA_URL + path, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + SUPA_KEY,
      'apikey': SUPA_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function supaGet(path) {
  const res = await fetch(SUPA_URL + path, {
    headers: { 'Authorization': 'Bearer ' + SUPA_KEY, 'apikey': SUPA_KEY }
  });
  return res.json();
}

// ===== PART 1: Update Daily Email Workflow =====
async function patchDailyEmail() {
  console.log('\n=== PART 1: Patching Daily Email Workflow ===');
  const wf = await api('GET', `/api/v1/workflows/${DAILY_WF_ID}`);
  if (!wf.nodes) { console.error('Failed to fetch daily WF:', JSON.stringify(wf).slice(0,200)); process.exit(1); }

  // 1b. Update cron to 11:30 Israel = 08:30 UTC
  const trigger = wf.nodes.find(n => n.id === 'seo-daily-trigger');
  const oldCron = trigger.parameters.rule.interval[0].expression;
  trigger.parameters.rule.interval[0].expression = '0 30 8 * * *';
  console.log(`Cron: ${oldCron} => 0 30 8 * * * (11:30 Israel)`);

  // 1c. Add "Fetch Today's Articles" node between Fetch Daily Summary and Build Daily Email
  const fetchNode = {
    id: 'fetch-today-articles',
    name: "Fetch Today's Articles",
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [840, 300],
    parameters: {
      method: 'GET',
      url: "=https://rtlpqjqdmomyptcdkmrq.supabase.co/rest/v1/seo_published_articles?created_at=gte.{{ new Date().toISOString().split('T')[0] }}T00:00:00&select=*&order=created_at.desc",
      authentication: 'none',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: {
        parameters: [
          { name: 'apikey', value: SUPA_KEY },
          { name: 'Authorization', value: 'Bearer ' + SUPA_KEY }
        ]
      },
      options: { response: { response: { responseFormat: 'json' } } }
    }
  };

  // Shift existing nodes to the right to make room
  wf.nodes.find(n => n.id === 'ga4-daily-jwt').position = [1080, 300];
  wf.nodes.find(n => n.id === 'ga4-daily-token').position = [1300, 300];
  wf.nodes.find(n => n.id === 'ga4-daily-query').position = [1520, 300];
  wf.nodes.find(n => n.id === 'seo-daily-build').position = [1740, 300];
  wf.nodes.find(n => n.id === 'seo-daily-send').position = [1960, 300];

  wf.nodes.push(fetchNode);

  // 1d. Update Build Daily Email code to add articles section
  const buildNode = wf.nodes.find(n => n.id === 'seo-daily-build');
  const articlesSection = `
// === סקשן: מאמרים שעלו היום ===
try {
  const articlesRaw = $("Fetch Today's Articles").first().json;
  const articles = Array.isArray(articlesRaw) ? articlesRaw : (articlesRaw.body || []);
  if (articles.length > 0) {
    let t = '';
    articles.forEach(art => {
      const liveUrl = \`https://www.perfect1.co.il/\${art.category}/\${art.slug}\`;
      const ghUrl = \`https://github.com/perfect-ai-admin/perfect1-portal/blob/main/\${art.file_path}\`;
      t += '<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin-bottom:12px;">';
      t += '<div style="color:#059669;font-size:12px;font-weight:bold;margin-bottom:6px;">✅ מאמר חדש פורסם היום</div>';
      t += \`<h3 style="margin:0 0 10px;color:#1a1a1a;font-size:18px;">\${art.title}</h3>\`;
      t += '<div style="color:#6b7280;font-size:13px;margin-bottom:12px;">';
      t += \`\${art.word_count || 0} מילים • קטגוריה: \${art.category}\`;
      t += '</div>';
      t += \`<a href="\${liveUrl}" style="display:inline-block;background:#1a56db;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;margin-left:8px;">🔗 פתח באתר</a>\`;
      t += \`<a href="\${ghUrl}" style="display:inline-block;color:#6b7280;padding:10px 12px;font-size:12px;text-decoration:none;">GitHub</a>\`;
      t += '</div>';
    });
    body += sec('📝 מאמרים שעלו היום', t);
  } else {
    body += sec('📝 מאמרים שעלו היום', '<p style="color:#9ca3af;font-style:italic;">לא פורסם מאמר חדש היום.</p>');
  }
} catch(e) {
  body += \`<!-- articles section error: \${e.message} -->\`;
}
`;

  // Insert articles section right after the date line in the existing code
  const oldCode = buildNode.parameters.jsCode;
  const insertPoint = `body += \`<p style="color:#6b7280;margin:0 0 24px;">\${today}</p>\`;`;
  if (!oldCode.includes(insertPoint)) {
    console.error('ERROR: Cannot find insert point in Build Daily Email code!');
    console.log('Looking for:', insertPoint);
    process.exit(1);
  }
  buildNode.parameters.jsCode = oldCode.replace(
    insertPoint,
    insertPoint + '\n' + articlesSection
  );
  console.log('Build Daily Email code updated with articles section');

  // Update connections: Fetch Daily Summary -> Fetch Today's Articles -> Build Daily Email
  // GA4 chain stays connected to Fetch Daily Summary (parallel) but Build Daily Email reads from both
  wf.connections['Fetch Daily Summary'] = {
    main: [[
      { node: "Fetch Today's Articles", type: 'main', index: 0 },
      { node: 'GA4 - Create JWT Daily', type: 'main', index: 0 }
    ]]
  };
  wf.connections["Fetch Today's Articles"] = {
    main: [[{ node: 'Build Daily Email', type: 'main', index: 0 }]]
  };
  // GA4 chain connects into Build Daily Email via node references (Build Daily Email reads $() directly)
  // We keep GA4 chain but it needs to also feed into Build Daily Email
  // Actually in n8n, Build Daily Email uses $('GA4 - Fetch Page Data Daily') directly via node name
  // The main chain triggers it — let's keep Fetch Today's Articles as the main trigger for Build Daily Email
  // and GA4 chain is parallel (Build Daily Email references it via $())
  wf.connections['GA4 - Create JWT Daily'] = {
    main: [[{ node: 'GA4 - Get Access Token Daily', type: 'main', index: 0 }]]
  };
  wf.connections['GA4 - Get Access Token Daily'] = {
    main: [[{ node: 'GA4 - Fetch Page Data Daily', type: 'main', index: 0 }]]
  };
  // GA4 - Fetch Page Data Daily does NOT connect to Build Daily Email (Build Daily Email reads it via $())
  // but Build Daily Email needs to run AFTER GA4. We need GA4 to also trigger Build Daily Email.
  // Better: Chain everything sequentially: Fetch Today's Articles -> GA4 JWT -> GA4 Token -> GA4 Data -> Build Daily Email
  // This is simpler and ensures all data is ready.
  wf.connections["Fetch Today's Articles"] = {
    main: [[{ node: 'GA4 - Create JWT Daily', type: 'main', index: 0 }]]
  };
  wf.connections['GA4 - Fetch Page Data Daily'] = {
    main: [[{ node: 'Build Daily Email', type: 'main', index: 0 }]]
  };

  const result = await api('PUT', `/api/v1/workflows/${DAILY_WF_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  });

  if (result.id) {
    console.log('SUCCESS! Daily Email versionId:', result.versionId);
  } else {
    console.error('FAILED:', JSON.stringify(result).slice(0,400));
    process.exit(1);
  }
}

// ===== PART 2: Disconnect notify-email from F33 =====
// ===== PART 3: Switch F33 Call OpenAI -> Claude Opus =====
async function patchF33() {
  console.log('\n=== PART 2+3: Patching F33 ===');
  const wf = await api('GET', `/api/v1/workflows/${F33_WF_ID}`);
  if (!wf.nodes) { console.error('Failed to fetch F33:', JSON.stringify(wf).slice(0,200)); process.exit(1); }

  // PART 2: Disconnect notify-email from connections
  // Find what connects TO notify-email and what notify-email connects to
  const connsBefore = JSON.stringify(wf.connections);
  for (const [nodeName, conns] of Object.entries(wf.connections)) {
    if (conns.main) {
      conns.main = conns.main.map(outputs =>
        (outputs || []).filter(c => c.node !== 'Send Publish Notification Email')
      );
    }
  }
  // Remove notify-email's own outgoing connections
  delete wf.connections['Send Publish Notification Email'];
  console.log('Send Publish Notification Email disconnected from connections');

  // PART 3: Switch Call OpenAI -> Claude Opus
  const openaiNode = wf.nodes.find(n => n.id === 'openai-call');
  openaiNode.parameters.url = 'https://api.anthropic.com/v1/messages';
  openaiNode.parameters.authentication = 'predefinedCredentialType';
  openaiNode.parameters.nodeCredentialType = 'anthropicApi';
  openaiNode.credentials = {
    anthropicApi: { id: 'PZ5oiiyauwMneffD', name: 'Anthropic API' }
  };
  openaiNode.parameters.headerParameters = {
    parameters: [
      { name: 'anthropic-version', value: '2023-06-01' },
      { name: 'Content-Type', value: 'application/json' }
    ]
  };
  openaiNode.parameters.jsonBody = JSON.stringify({
    model: 'claude-opus-4-5',
    max_tokens: 16000,
    messages: [
      { role: 'user', content: '={{ $json.prompt }}' }
    ]
  });
  console.log('Call OpenAI switched to Claude Opus claude-opus-4-5');

  // PART 3b: Fix Parse Article JSON - replace choices[0].message.content with content[0].text
  const parseNode = wf.nodes.find(n => n.id === 'parse-article');
  parseNode.parameters.jsCode = parseNode.parameters.jsCode.replace(
    'openaiResp.choices[0].message.content',
    'openaiResp.content[0].text'
  );
  console.log('Parse Article JSON updated: choices[0].message.content -> content[0].text');

  const result = await api('PUT', `/api/v1/workflows/${F33_WF_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  });

  if (result.id) {
    console.log('SUCCESS! F33 versionId:', result.versionId);
  } else {
    console.error('FAILED:', JSON.stringify(result).slice(0,400));
    process.exit(1);
  }
}

// ===== QA: Add idea with status=new if none =====
async function ensureNewIdea() {
  console.log('\n=== QA: Checking for ideas with status=new ===');
  const existing = await supaGet('/rest/v1/seo_content_ideas?status=eq.new&select=id,target_query&limit=3');
  if (existing.length > 0) {
    console.log('Found', existing.length, 'ideas with status=new:', existing.map(i => i.target_query).join(', '));
    return existing[0];
  }

  console.log('No new ideas found. Inserting test idea...');
  const newIdea = await supaPost('/rest/v1/seo_content_ideas', {
    parent_page_url: 'https://www.perfect1.co.il/osek-patur',
    target_query: 'כמה עולה לפתוח עוסק פטור',
    suggested_article_title: 'כמה עולה לפתוח עוסק פטור: כל העלויות והאגרות',
    search_intent: 'informational',
    suggested_angle: 'מדריך מקיף על כל עלויות פתיחת עוסק פטור כולל אגרות, רואה חשבון ועלויות נלוות',
    why_it_matters: 'ביטוי בעל נפח חיפוש גבוה - אנשים רוצים לדעת אם זה כדאי לפתוח עסק',
    priority_score: 85,
    status: 'new',
    source_page_url: 'https://www.perfect1.co.il/osek-patur',
    internal_links: []
  });

  if (Array.isArray(newIdea) && newIdea[0]) {
    console.log('New idea inserted! ID:', newIdea[0].id, '| Query:', newIdea[0].target_query);
    return newIdea[0];
  } else {
    console.error('Failed to insert idea:', JSON.stringify(newIdea).slice(0, 200));
    return null;
  }
}

async function main() {
  await patchDailyEmail();
  await patchF33();
  const idea = await ensureNewIdea();
  console.log('\n=== ALL DONE ===');
  console.log('Next steps:');
  console.log('1. Run F33 QA script (set cron +2 min, wait, check execution)');
  console.log('2. Run Daily Email QA script (set cron +2 min, wait, check email)');
  if (idea) console.log('Test idea ready: ID=' + idea.id + ' | ' + idea.target_query);
}

main().catch(e => { console.error('Fatal:', e.message, e.stack); process.exit(1); });
