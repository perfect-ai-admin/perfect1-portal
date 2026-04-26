/**
 * Update V2 workflow — full spec update per product specification.
 * Workflow ID: Yo18hwPWHGndxsZ3
 */
const https = require('https');

const N8N_KEY = 'ROTATED_KEY_PLACEHOLDER';
const WORKFLOW_ID = 'Yo18hwPWHGndxsZ3';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'n8n.perfect-1.one',
      path: '/api/v1' + path,
      method,
      headers: {
        'X-N8N-API-KEY': N8N_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { resolve({ raw: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ============================================================
// NODE MESSAGES — exact per specification
// ============================================================

// Greeting message (Step 1 — process position)
const MSG_GREETING = `=שלום {{ $('Merge State').item.json.lead_name || $('Merge State').item.json.name || 'שם' }} 👋
ראיתי שהשארת פרטים לגבי פתיחת עוסק פטור.
אני כאן כדי לעזור לך להתחיל בצורה מסודרת מול מע"מ, מס הכנסה וביטוח לאומי.

איפה אתה נמצא בתהליך?

1. 🚀 רוצה להתחיל עכשיו
2. 📅 מתחיל בקרוב
3. 🔍 רק בודק מידע`;

// Step 2 — service area question (replaces S1: Send Service Details)
const MSG_SERVICE_AREA = `מה תחום הפעילות שלך?

1. 💼 שירותים / פרילנס
2. 📦 מכירת מוצרים
3. 🎓 מקצוע חופשי
4. ✏️ אחר`;

// CTA (replaces S1: Send Action Buttons)
const MSG_CTA = `מעולה 👍
אפשר להתקדם עכשיו באחת מהדרכים הבאות:

1. 📄 לשלוח ת"ז ולהתחיל
2. 📞 לקבוע שיחה קצרה
3. ❓ לשאול שאלה
4. 💰 כמה זה עולה`;

// Pricing message (replaces S1: Send Payment Link)
const MSG_PRICING = `פתיחת תיק: 250 ₪ + מע"מ (חד פעמי)
ליווי חודשי: 200 ₪ + מע"מ

כולל: דוח שנתי, ליווי שוטף, אפליקציה להוצאת קבלות, ומנהלת תיק זמינה.

מה תרצה לעשות?

1. 📄 לשלוח ת"ז ולהתחיל
2. 📞 לדבר עם רואה חשבון
3. 🚀 להתחיל עכשיו`;

// Documents message (btn_send_id)
const MSG_DOCUMENTS = `מעולה! כדי להתחיל, שלח לי צילום של תעודת הזהות שלך (קדימה + אחורה) ואנחנו מתחילים לטפל מיד 📄`;

// Advisor/call message (btn_book_call → S2: Send Initial Message)
const MSG_ADVISOR = `תודה! 🙏
רואה חשבון מטעמנו יתקשר אליך בזמן הקרוב כדי להמשיך את הטיפול.
בינתיים, אם יש לך שאלות — פשוט כתוב כאן ואשמח לעזור 😊`;

// Admin notify message (S2: Notify Admin)
const MSG_ADMIN = `=📋 ליד חדש מבקש שיחה עם יועץ!

שם: {{ $('Merge State').item.json.lead_name || $('Merge State').item.json.name || 'לא צוין' }}
טלפון: {{ $('Merge State').item.json.phone || $('Merge State').item.json.chat_id }}

יש לחזור אליו בהקדם.`;

// Question mode message (btn_ask_question → S3: Send Question Mode)
const MSG_QUESTION_MODE = `בטח! שאל את השאלה שלך ואחזור אליך עם תשובה 😊`;

// AI answer (S3: Send Answer) — kept as expression
const MSG_AI_ANSWER = `={{ $json.answer_text }}`;

// Next steps after AI answer (S3: Send Next Steps)
const MSG_NEXT_STEPS = `רוצה לשאול עוד שאלה?

1. ❓ כן, יש לי עוד שאלה
2. 🚀 רוצה להתחיל פתיחת עוסק
3. 📞 רוצה לדבר עם רואה חשבון`;

// Fallback (Send: לא הבנתי)
const MSG_FALLBACK = `לא הצלחתי להבין את הבחירה 🤔

איפה אתה נמצא בתהליך?

1. 🚀 רוצה להתחיל עכשיו
2. 📅 מתחיל בקרוב
3. 🔍 רק בודק מידע`;

// ============================================================
// ROUTING — all button IDs per specification
// ============================================================

function buildSwitchRule(buttonId, outputKey) {
  return {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
      conditions: [{
        leftValue: '={{ $("Merge State").first().json.button_id }}',
        rightValue: buttonId,
        operator: { type: 'string', operation: 'equals' }
      }],
      combinator: 'and'
    },
    renameOutput: true,
    outputKey
  };
}

// New Route Button Press rules — all 11 button IDs
const ROUTE_BTN_RULES = [
  // Step 1 → Step 2 (service area question)
  buildSwitchRule('btn_start_now', 'step2_service'),
  buildSwitchRule('btn_start_soon', 'step2_service'),
  buildSwitchRule('btn_just_checking', 'step2_service'),
  // Step 2 → CTA
  buildSwitchRule('btn_services', 'cta'),
  buildSwitchRule('btn_products', 'cta'),
  buildSwitchRule('btn_profession', 'cta'),
  buildSwitchRule('btn_other', 'cta'),
  // CTA branches
  buildSwitchRule('btn_send_id', 'send_id'),
  buildSwitchRule('btn_book_call', 'book_call'),
  buildSwitchRule('btn_ask_question', 'ask_question'),
  buildSwitchRule('btn_pricing', 'pricing'),
  // Post-pricing
  buildSwitchRule('btn_book_call_accountant', 'book_call'),
  buildSwitchRule('btn_start_checkout', 'send_id'),
];

// ============================================================
// NODES TO ADD — new nodes required by spec
// (S1: Send Service Details → becomes Step 2 service area question)
// We need: node for documents (btn_send_id response)
// ============================================================

const NEW_NODE_DOCUMENTS = {
  id: 'http-send-id',
  name: 'Send: Documents Request',
  type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
  typeVersion: 1,
  position: [2080, 600],
  parameters: {
    chatId: "={{ $('Merge State').item.json.chat_id }}",
    message: MSG_DOCUMENTS,
    typingTime: 1
  },
  credentials: {
    greenApiAuthApi: {
      id: '2gdsusfuyKaYssFU',
      name: 'Green-API account'
    }
  }
};

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('Fetching workflow...');
  const wf = await api('GET', `/workflows/${WORKFLOW_ID}`);

  if (!wf.nodes) {
    console.error('Failed to fetch workflow:', JSON.stringify(wf));
    process.exit(1);
  }

  console.log(`Got workflow: ${wf.name} — ${wf.nodes.length} nodes`);

  // ---- 1. Update existing node messages ----
  const updates = {
    'code-greeting': { message: MSG_GREETING },
    'http-s1-details': { message: MSG_SERVICE_AREA, chatId: "={{ $('Merge State').item.json.chat_id }}" },
    'code-s1-buttons': { message: MSG_CTA },
    'http-s1-payment': { message: MSG_PRICING },
    'http-s2-init': { message: MSG_ADVISOR },
    'http-s2-admin': { message: MSG_ADMIN, chatId: '972502277087@c.us' },
    'http-s3-mode': { message: MSG_QUESTION_MODE },
    'http-s3-answer': { message: MSG_AI_ANSWER },
    'code-s3-next': { message: MSG_NEXT_STEPS },
    'http-not-understood': { message: MSG_FALLBACK }
  };

  for (const node of wf.nodes) {
    const upd = updates[node.id];
    if (!upd) continue;
    console.log(`  Updating node: ${node.id} (${node.name})`);
    if (upd.message !== undefined) node.parameters.message = upd.message;
    if (upd.chatId !== undefined) node.parameters.chatId = upd.chatId;
    node.parameters.typingTime = node.parameters.typingTime || 1;
  }

  // ---- 2. Update Route Button Press switch ----
  const routeBtn = wf.nodes.find(n => n.id === 'sw-route-btn');
  if (routeBtn) {
    console.log('  Updating Route Button Press rules...');
    routeBtn.parameters.rules = { values: ROUTE_BTN_RULES };
    routeBtn.parameters.fallbackOutput = 'extra';
  }

  // ---- 3. Add new Documents node if not already present ----
  const existingDocNode = wf.nodes.find(n => n.id === 'http-send-id');
  if (!existingDocNode) {
    console.log('  Adding new node: Send: Documents Request');
    wf.nodes.push(NEW_NODE_DOCUMENTS);
  }

  // ---- 4. Update connections — Route Button Press outputs ----
  // Output indices (0-based) matching ROUTE_BTN_RULES order:
  // 0,1,2 → step2_service (S1: Send Service Details)
  // 3,4,5,6 → cta (S1: Send Action Buttons)
  // 7,12 → send_id (new documents node)
  // 8,11 → book_call (S2: Send Initial Message)
  // 9 → ask_question (S3: Send Question Mode)
  // 10 → pricing (S1: Send Payment Link)
  // fallback → Send: לא הבנתי

  // The switch outputs are positional in connections array
  // n8n switch: each output index corresponds to a rule index
  wf.connections['Route Button Press'] = {
    main: [
      // 0: btn_start_now → S1: Send Service Details (step2)
      [{ node: 'S1: Send Service Details', type: 'main', index: 0 }],
      // 1: btn_start_soon → S1: Send Service Details (step2)
      [{ node: 'S1: Send Service Details', type: 'main', index: 0 }],
      // 2: btn_just_checking → S1: Send Service Details (step2)
      [{ node: 'S1: Send Service Details', type: 'main', index: 0 }],
      // 3: btn_services → S1: Send Action Buttons (CTA)
      [{ node: 'S1: Send Action Buttons', type: 'main', index: 0 }],
      // 4: btn_products → S1: Send Action Buttons (CTA)
      [{ node: 'S1: Send Action Buttons', type: 'main', index: 0 }],
      // 5: btn_profession → S1: Send Action Buttons (CTA)
      [{ node: 'S1: Send Action Buttons', type: 'main', index: 0 }],
      // 6: btn_other → S1: Send Action Buttons (CTA)
      [{ node: 'S1: Send Action Buttons', type: 'main', index: 0 }],
      // 7: btn_send_id → Send: Documents Request
      [{ node: 'Send: Documents Request', type: 'main', index: 0 }],
      // 8: btn_book_call → S2: Send Initial Message
      [{ node: 'S2: Send Initial Message', type: 'main', index: 0 }],
      // 9: btn_ask_question → S3: Send Question Mode
      [{ node: 'S3: Send Question Mode', type: 'main', index: 0 }],
      // 10: btn_pricing → S1: Send Payment Link
      [{ node: 'S1: Send Payment Link', type: 'main', index: 0 }],
      // 11: btn_book_call_accountant → S2: Send Initial Message
      [{ node: 'S2: Send Initial Message', type: 'main', index: 0 }],
      // 12: btn_start_checkout → Send: Documents Request
      [{ node: 'Send: Documents Request', type: 'main', index: 0 }],
    ]
  };

  // Preserve S1: Send Service Details → S1: Send Action Buttons chain
  if (!wf.connections['S1: Send Service Details']) {
    wf.connections['S1: Send Service Details'] = {
      main: [[{ node: 'S1: Send Action Buttons', type: 'main', index: 0 }]]
    };
  }

  // S3: Send Next Steps buttons also route: btn_ask_question, btn_start_checkout, btn_book_call
  // These are handled by the same Route Button Press switch via Save Button Click

  // ---- 5. Save ----
  console.log('\nSaving workflow...');
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };

  const result = await api('PUT', `/workflows/${WORKFLOW_ID}`, payload);

  if (result.id) {
    console.log('Workflow saved! ID:', result.id, '| Version:', result.versionCounter);
  } else {
    console.error('Save failed:', JSON.stringify(result).slice(0, 500));
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
