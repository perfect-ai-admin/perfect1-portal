/**
 * Fix workflow Yo18hwPWHGndxsZ3 — bug fixes per spec:
 * 1. mapTextToButton in Merge State
 * 2. Route Button Press — new button IDs
 * 3. Route Message Type fallback — free_text_unrecognized → Send: לא הבנתי
 * 4. Save steps after each node
 * 5. Send: Documents Request node added
 */
const https = require('https');
const fs = require('fs');

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

// ======== NODES ========

const MERGE_STATE_CODE = `const webhook = $('Extract Lead & Message').first().json;
const leads = $input.all();
const lead = leads.length > 0 ? leads[0].json : {};

// mapTextToButton: convert numeric text reply to button_id based on current state
function mapTextToButton(text, state) {
  const t = (text || '').trim();
  const stateMap = {
    cta_options: { '1': 'btn_send_id', '2': 'btn_book_call', '3': 'btn_ask_question', '4': 'btn_pricing' },
    greeting_sent: { '1': 'btn_start_now', '2': 'btn_start_soon', '3': 'btn_just_checking' },
    field_selection: { '1': 'btn_services', '2': 'btn_products', '3': 'btn_profession', '4': 'btn_other' },
    pricing_shown: { '1': 'btn_send_id', '2': 'btn_book_call_accountant', '3': 'btn_start_checkout' },
    ai_answered: { '1': 'btn_ask_question', '2': 'btn_start_checkout', '3': 'btn_book_call' }
  };
  const map = stateMap[state];
  if (map && map[t]) return map[t];
  return null;
}

let buttonId = webhook.button_id;
const currentStep = lead.bot_current_step || null;

// If no button_id but there is text — try to map it
if (!buttonId && webhook.message_text) {
  buttonId = mapTextToButton(webhook.message_text, currentStep);
}

return [{ json: {
  payload_type: webhook.payload_type || 'greenapi_reply',
  chat_id: webhook.chat_id,
  phone: webhook.phone,
  message_text: webhook.message_text,
  button_id: buttonId,
  lead_name: webhook.lead_name || null,
  lead_email: webhook.lead_email || null,
  page_slug: webhook.page_slug || null,
  lead_id: lead.lead_id || null,
  pipeline_stage: lead.pipeline_stage || 'new',
  message_count: lead.message_count || 0,
  bot_current_step: currentStep
} }];`;

function makeBtnRule(buttonIds, outputKey) {
  if (!Array.isArray(buttonIds)) buttonIds = [buttonIds];
  return buttonIds.map(btnId => ({
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
      conditions: [{
        leftValue: "={{ $(\"Merge State\").first().json.button_id }}",
        rightValue: btnId,
        operator: { type: 'string', operation: 'equals' }
      }],
      combinator: 'and'
    },
    renameOutput: true,
    outputKey
  }));
}

// Route Button Press rules — output indexes match connections
const ROUTE_BTN_RULES = [
  // output 0: service_details
  ...makeBtnRule(['btn_start_now', 'btn_start_soon', 'btn_just_checking'], 'service_details'),
  // output 3: action_buttons
  ...makeBtnRule(['btn_services', 'btn_products', 'btn_profession', 'btn_other'], 'action_buttons'),
  // output 7: documents_request
  ...makeBtnRule(['btn_send_id', 'btn_start_checkout'], 'documents_request'),
  // output 9: book_call
  ...makeBtnRule(['btn_book_call', 'btn_book_call_accountant'], 'book_call'),
  // output 11: ask_question
  ...makeBtnRule(['btn_ask_question'], 'ask_question'),
  // output 12: send_payment_link
  ...makeBtnRule(['btn_pricing'], 'send_payment_link')
];

// Route Message Type rules — order matters
const ROUTE_TYPE_RULES = [
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
      conditions: [{ leftValue: '={{ $json.payload_type }}', rightValue: 'supabase_new_lead', operator: { type: 'string', operation: 'equals' } }],
      combinator: 'and'
    },
    renameOutput: true, outputKey: 'supabase_new_lead'
  },
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
      conditions: [
        { leftValue: '={{ $json.payload_type }}', rightValue: 'greenapi_text', operator: { type: 'string', operation: 'equals' } },
        { leftValue: '={{ $json.bot_current_step }}', rightValue: 'awaiting_question', operator: { type: 'string', operation: 'equals' } }
      ],
      combinator: 'and'
    },
    renameOutput: true, outputKey: 'awaiting_question'
  },
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
      conditions: [{ leftValue: '={{ $json.button_id }}', rightValue: '', operator: { type: 'string', operation: 'exists' } }],
      combinator: 'and'
    },
    renameOutput: true, outputKey: 'button_press'
  },
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
      conditions: [
        { leftValue: '={{ $json.payload_type }}', rightValue: 'greenapi_text', operator: { type: 'string', operation: 'equals' } },
        { leftValue: '={{ $json.message_count }}', rightValue: 0, operator: { type: 'number', operation: 'equals' } }
      ],
      combinator: 'and'
    },
    renameOutput: true, outputKey: 'first_message'
  },
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
      conditions: [
        { leftValue: '={{ $json.payload_type }}', rightValue: 'greenapi_text', operator: { type: 'string', operation: 'equals' } },
        { leftValue: '={{ $json.message_count }}', rightValue: 0, operator: { type: 'number', operation: 'gt' } }
      ],
      combinator: 'and'
    },
    renameOutput: true, outputKey: 'free_text_unrecognized'
  }
];

// Map button output keys to target node names and output indexes
// output order for Route Button Press:
// 0,1,2 = service_details (btn_start_now, btn_start_soon, btn_just_checking)
// 3,4,5,6 = action_buttons (btn_services, btn_products, btn_profession, btn_other)
// 7,8 = documents_request (btn_send_id, btn_start_checkout)
// 9,10 = book_call (btn_book_call, btn_book_call_accountant)
// 11 = ask_question (btn_ask_question)
// 12 = send_payment_link (btn_pricing)
// 13 = fallback → Send: לא הבנתי

const ROUTE_BTN_CONNECTIONS_MAIN = [
  [{ node: 'S1: Send Service Details', type: 'main', index: 0 }],   // 0 btn_start_now
  [{ node: 'S1: Send Service Details', type: 'main', index: 0 }],   // 1 btn_start_soon
  [{ node: 'S1: Send Service Details', type: 'main', index: 0 }],   // 2 btn_just_checking
  [{ node: 'S1: Send Action Buttons', type: 'main', index: 0 }],    // 3 btn_services
  [{ node: 'S1: Send Action Buttons', type: 'main', index: 0 }],    // 4 btn_products
  [{ node: 'S1: Send Action Buttons', type: 'main', index: 0 }],    // 5 btn_profession
  [{ node: 'S1: Send Action Buttons', type: 'main', index: 0 }],    // 6 btn_other
  [{ node: 'Send: Documents Request', type: 'main', index: 0 }],    // 7 btn_send_id
  [{ node: 'Send: Documents Request', type: 'main', index: 0 }],    // 8 btn_start_checkout
  [{ node: 'S2: Send Initial Message', type: 'main', index: 0 }],   // 9 btn_book_call
  [{ node: 'S2: Send Initial Message', type: 'main', index: 0 }],   // 10 btn_book_call_accountant
  [{ node: 'S3: Send Question Mode', type: 'main', index: 0 }],     // 11 btn_ask_question
  [{ node: 'S1: Send Payment Link', type: 'main', index: 0 }],      // 12 btn_pricing
  [{ node: "Send: \u05dc\u05d0 \u05d4\u05d1\u05e0\u05ea\u05d9", type: 'main', index: 0 }] // fallback
];

async function run() {
  console.log('1. Loading workflow...');
  const wf = await api('GET', `/workflows/${WORKFLOW_ID}`);
  if (wf.message) { console.error('Error loading:', wf.message); process.exit(1); }
  console.log(`   Loaded: ${wf.name} (${wf.nodes.length} nodes)`);

  const nodeMap = {};
  wf.nodes.forEach(n => { nodeMap[n.id] = n; });

  // ---- Fix 1: Merge State — add mapTextToButton ----
  console.log('2. Fixing Merge State (mapTextToButton)...');
  nodeMap['code-merge-state'].parameters.jsCode = MERGE_STATE_CODE;

  // ---- Fix 2: Route Button Press — new button IDs ----
  console.log('3. Fixing Route Button Press (new button IDs)...');
  nodeMap['sw-route-btn'].parameters.rules.values = ROUTE_BTN_RULES;

  // ---- Fix 3: Route Message Type — fix fallback ----
  console.log('4. Fixing Route Message Type (free_text_unrecognized)...');
  nodeMap['sw-route-type'].parameters.rules.values = ROUTE_TYPE_RULES;

  // ---- Fix 4: Add missing nodes ----
  console.log('5. Adding missing nodes...');
  const nodesToAdd = [
    {
      id: 'http-send-documents',
      name: 'Send: Documents Request',
      type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
      typeVersion: 1,
      position: [1840, 600],
      parameters: {
        chatId: "={{ $('Merge State').item.json.chat_id }}",
        message: "מעולה! 📋\n\nלסיום הפתיחה אנחנו צריכים:\n1. תמונת תעודת זהות (צד קדמי)\n2. אישור ניהול חשבון בנק (או פרטי חשבון)\n\nשלח אותם כאן ישירות בוואטסאפ ונמשיך מיד 🙌",
        typingTime: 1
      },
      credentials: { greenApiAuthApi: { id: '2gdsusfuyKaYssFU', name: 'Green-API account' } }
    },
    {
      id: 'pg-save-documents-requested',
      name: 'Save: Documents Requested Step',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.6,
      position: [2080, 600],
      credentials: { postgres: { id: 'f7uLzc1fb15UnScl', name: 'Postgres account 2' } },
      parameters: {
        operation: 'executeQuery',
        query: "=UPDATE leads SET bot_current_step = 'documents_requested' WHERE phone = '{{ $(\"Merge State\").item.json.phone }}';",
        options: {}
      }
    },
    {
      id: 'pg-save-field-selection',
      name: 'Save: Field Selection Step',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.6,
      position: [2080, 140],
      credentials: { postgres: { id: 'f7uLzc1fb15UnScl', name: 'Postgres account 2' } },
      parameters: {
        operation: 'executeQuery',
        query: "=UPDATE leads SET bot_current_step = 'field_selection' WHERE phone = '{{ $(\"Merge State\").item.json.phone }}';",
        options: {}
      }
    },
    {
      id: 'pg-save-cta-options',
      name: 'Save: CTA Options Step',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.6,
      position: [2080, 300],
      credentials: { postgres: { id: 'f7uLzc1fb15UnScl', name: 'Postgres account 2' } },
      parameters: {
        operation: 'executeQuery',
        query: "=UPDATE leads SET bot_current_step = 'cta_options' WHERE phone = '{{ $(\"Merge State\").item.json.phone }}';",
        options: {}
      }
    },
    {
      id: 'pg-save-pricing-shown',
      name: 'Save: Pricing Shown Step',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.6,
      position: [2080, 460],
      credentials: { postgres: { id: 'f7uLzc1fb15UnScl', name: 'Postgres account 2' } },
      parameters: {
        operation: 'executeQuery',
        query: "=UPDATE leads SET pipeline_stage = 'payment_pending', bot_current_step = 'pricing_shown' WHERE phone = '{{ $(\"Merge State\").item.json.phone }}';",
        options: {}
      }
    },
    {
      id: 'pg-save-ai-answered',
      name: 'Save: AI Answered Step',
      type: 'n8n-nodes-base.postgres',
      typeVersion: 2.6,
      position: [3520, 980],
      credentials: { postgres: { id: 'f7uLzc1fb15UnScl', name: 'Postgres account 2' } },
      parameters: {
        operation: 'executeQuery',
        query: "=UPDATE leads SET bot_current_step = 'ai_answered' WHERE phone = '{{ $(\"Merge State\").item.json.phone }}';",
        options: {}
      }
    }
  ];

  const existingIds = new Set(wf.nodes.map(n => n.id));
  for (const node of nodesToAdd) {
    if (!existingIds.has(node.id)) {
      wf.nodes.push(node);
      nodeMap[node.id] = node;
      console.log(`   Added node: ${node.name}`);
    } else {
      // Update existing
      Object.assign(nodeMap[node.id].parameters, node.parameters);
      console.log(`   Updated node: ${node.name}`);
    }
  }

  // ---- Fix 5: Update connections ----
  console.log('6. Fixing connections...');

  // Route Button Press connections
  wf.connections['Route Button Press'] = { main: ROUTE_BTN_CONNECTIONS_MAIN };

  // Route Message Type: output 4 (free_text_unrecognized) → Send: לא הבנתי
  wf.connections['Route Message Type'] = {
    main: [
      [{ node: 'Greeting Trigger', type: 'main', index: 0 }],              // 0 supabase_new_lead
      [{ node: 'S3: Receive User Question', type: 'main', index: 0 }],     // 1 awaiting_question
      [{ node: 'Save Button Click', type: 'main', index: 0 }],             // 2 button_press
      [{ node: 'First Message Trigger', type: 'main', index: 0 }],         // 3 first_message
      [{ node: "Send: \u05dc\u05d0 \u05d4\u05d1\u05e0\u05ea\u05d9", type: 'main', index: 0 }]  // 4 free_text_unrecognized
    ]
  };

  // S1: Send Service Details → Save: Field Selection Step
  wf.connections['S1: Send Service Details'] = {
    main: [[{ node: 'Save: Field Selection Step', type: 'main', index: 0 }]]
  };

  // S1: Send Action Buttons → Save: CTA Options Step
  wf.connections['S1: Send Action Buttons'] = {
    main: [[{ node: 'Save: CTA Options Step', type: 'main', index: 0 }]]
  };

  // S1: Send Payment Link → Save: Pricing Shown Step
  wf.connections['S1: Send Payment Link'] = {
    main: [[{ node: 'Save: Pricing Shown Step', type: 'main', index: 0 }]]
  };

  // Send: Documents Request → Save: Documents Requested Step
  wf.connections['Send: Documents Request'] = {
    main: [[{ node: 'Save: Documents Requested Step', type: 'main', index: 0 }]]
  };

  // S2: Send Initial Message → Save: Advisor Requested Step (already pg-s2-status, just fix name)
  // The existing pg-s2-status already updates advisor_requested — ensure connection
  wf.connections['S2: Send Initial Message'] = {
    main: [[{ node: 'S2: Update Status', type: 'main', index: 0 }]]
  };

  // S3: Send Next Steps → Save: AI Answered Step
  wf.connections['S3: Send Next Steps'] = {
    main: [[{ node: 'Save: AI Answered Step', type: 'main', index: 0 }]]
  };

  // S3: Send Question Mode → S3: Update Status (already exists, confirm name)
  // existing pg-s3-status sets awaiting_question — keep it

  // ---- Save ----
  console.log('7. Saving workflow...');
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };

  const result = await api('PUT', `/workflows/${WORKFLOW_ID}`, payload);
  if (result.id) {
    console.log(`✅ Workflow saved successfully. Version: ${result.versionId}`);
  } else {
    console.error('❌ Save failed:', JSON.stringify(result).slice(0, 500));
    process.exit(1);
  }

  // ---- Activate ----
  console.log('8. Activating workflow...');
  const activated = await api('PATCH', `/workflows/${WORKFLOW_ID}/activate`);
  console.log('   Activate result:', activated.active !== undefined ? `active=${activated.active}` : JSON.stringify(activated).slice(0, 200));

  console.log('\n=== DONE ===');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
