/**
 * Creates a complete Sales Bot workflow in N8N.
 * Separate from the Mentor bot (bot-v5).
 * Handles: opening message with buttons → response handling → CTA → CRM update
 */
const fs = require('fs');

const GREENAPI_CREDS = {
  greenApiAuthApi: { id: '2gdsusfuyKaYssFU', name: 'Green-API account' }
};

const SUPABASE_URL = 'https://fnsnnezhikgqajdbtwoa.supabase.co/rest/v1';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc25uZXpoaWtncWFqZGJ0d29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk3ODkwMCwiZXhwIjoyMDg0NTU0OTAwfQ.ncDeHwwY3lD88i3dS98-7ETV4als0pzFn7Cz6UXC_RM';

// ========================================
// NODES
// ========================================

const nodes = [
  // 1. Webhook - receives from CRM Bot when new lead
  {
    id: 'sb-webhook',
    name: 'Sales Bot Webhook',
    type: 'n8n-nodes-base.webhook',
    typeVersion: 2,
    position: [200, 300],
    webhookId: 'sales-bot-entry',
    parameters: {
      httpMethod: 'POST',
      path: 'sales-bot-entry',
      options: {}
    }
  },

  // 2. Classify Intent + Build Message with Buttons
  {
    id: 'sb-classify',
    name: 'Classify & Build Flow',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [440, 300],
    parameters: {
      jsCode: `
const body = $input.first().json.body || $input.first().json;
const name = body.name || '';
const phone = body.phone || '';
const chatId = body.chat_id || ('972' + phone.replace(/^0/, '') + '@c.us');
const pageIntent = body.page_intent || '';
const serviceType = body.service_type || body.category || '';
const sourcePage = body.source_page || '';
const leadId = body.lead_id || '';

// Intent classifier fallback
function classify(sp, pi) {
  if (pi) return pi;
  const s = (sp || '').toLowerCase();
  if (s.includes('open-osek') || s.includes('steps-osek') || s.includes('landing-osek-patur')) return 'service';
  if (s.includes('patur-vs-murshe') || s.includes('compare') || s.includes('quiz')) return 'comparison';
  if (s.includes('accountant') || s.includes('management')) return 'accounting_service';
  if (s.includes('cost') || s.includes('pricing')) return 'pricing';
  if (s.includes('close-') || s.includes('sgirat')) return 'service';
  return 'guide';
}

const intent = classify(sourcePage, pageIntent);
const flowMap = {
  service: 'service_flow',
  comparison: 'comparison_flow',
  guide: 'guide_flow',
  pricing: 'pricing_flow',
  accounting_service: 'accounting_svc_flow'
};
const flowType = flowMap[intent] || 'generic_flow';

// Opening messages by intent
const openings = {
  service: {
    body: 'שלום ' + name + ' 👋\\nראיתי שהשארת פרטים לגבי פתיחת עוסק פטור.\\nאני כאן כדי לעזור לך להתחיל בצורה מסודרת מול מע״מ, מס הכנסה וביטוח לאומי.\\n\\nאיפה אתה נמצא בתהליך?',
    buttons: [
      { id: 'start_now', text: '🚀 רוצה להתחיל עכשיו' },
      { id: 'start_soon', text: '📅 מתחיל בקרוב' },
      { id: 'just_checking', text: '🔍 רק בודק מידע' }
    ]
  },
  comparison: {
    body: 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בנושא עוסק פטור או מורשה.\\nאני יכול לעזור לך להבין מה יותר מתאים לך בכמה שאלות קצרות.\\n\\nמתי אתה מתכנן להתחיל את העסק?',
    buttons: [
      { id: 'weeks', text: '📅 בשבועות הקרובים' },
      { id: 'months', text: '🗓️ בחודשים הקרובים' },
      { id: 'just_checking', text: '🔍 רק בודק אפשרויות' }
    ]
  },
  guide: {
    body: 'שלום ' + name + ' 👋\\nראיתי שהשארת פרטים ונתעניינת במידע.\\nאם תרצה, אני יכול לעשות לך סדר קצר ולעזור לך להתקדם.\\n\\nמה היית רוצה עכשיו?',
    buttons: [
      { id: 'understand_steps', text: '📋 להבין את השלבים' },
      { id: 'talk_accountant', text: '📞 לדבר עם רואה חשבון' },
      { id: 'start_opening', text: '🚀 להתחיל פתיחה' }
    ]
  },
  pricing: {
    body: 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בנושא המחיר.\\n\\nברוב המקרים השירות הוא סביב:\\n💰 200 ₪ + מע״מ לחודש\\n💰 250 ₪ + מע״מ חד פעמי (פתיחת תיק)\\n\\nזה כולל: דוח שנתי, ליווי וייעוץ, אפליקציה להוצאת קבלות ומנהלת תיק.\\n\\nמה היית רוצה עכשיו?',
    buttons: [
      { id: 'get_quote', text: '📝 הצעת מחיר מדויקת' },
      { id: 'talk_accountant', text: '📞 לדבר עם רואה חשבון' },
      { id: 'start_opening', text: '🚀 להתחיל פתיחה' }
    ]
  },
  accounting_service: {
    body: 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בשירות רואה חשבון.\\nאני יכול להסביר בקצרה מה כלול ולעזור לך להתקדם.\\n\\nמה הכי חשוב לך כרגע?',
    buttons: [
      { id: 'price', text: '💰 מחיר' },
      { id: 'ongoing_support', text: '🤝 ליווי שוטף' },
      { id: 'peace_of_mind', text: '😌 שקט נפשי' }
    ]
  }
};

// Service-specific overrides
const serviceOverrides = {
  close_osek_patur: {
    body: 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בסגירת עוסק פטור.\\nהתהליך כולל סגירה מול מע״מ, מס הכנסה וביטוח לאומי — אנחנו מטפלים בהכל.\\n\\nאיפה אתה בתהליך?',
    buttons: [
      { id: 'start_now', text: '🚀 רוצה לסגור עכשיו' },
      { id: 'start_soon', text: '📅 מתכנן בקרוב' },
      { id: 'just_checking', text: '🔍 רק בודק' }
    ]
  },
  close_osek_murshe: {
    body: 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בסגירת עוסק מורשה.\\nאנחנו מטפלים בכל התהליך.\\n\\nאיפה אתה בתהליך?',
    buttons: [
      { id: 'start_now', text: '🚀 רוצה לסגור עכשיו' },
      { id: 'start_soon', text: '📅 מתכנן בקרוב' },
      { id: 'talk_accountant', text: '📞 לדבר עם רואה חשבון' }
    ]
  },
  open_osek_murshe: {
    body: 'שלום ' + name + ' 👋\\nראיתי שהשארת פרטים לגבי פתיחת עוסק מורשה.\\nאני כאן לעזור לך להתחיל בצורה מסודרת.\\n\\nאיפה אתה בתהליך?',
    buttons: [
      { id: 'start_now', text: '🚀 רוצה להתחיל עכשיו' },
      { id: 'start_soon', text: '📅 מתחיל בקרוב' },
      { id: 'just_checking', text: '🔍 רק בודק מידע' }
    ]
  }
};

const flow = serviceOverrides[serviceType] || openings[intent] || openings.guide;

return [{ json: {
  name, phone, chatId, leadId,
  page_intent: intent,
  flow_type: flowType,
  service_type: serviceType,
  source_page: sourcePage,
  step: 'opening',
  opening_body: flow.body,
  buttons: flow.buttons
}}];
`
    }
  },

  // 3. Send Opening Message with Buttons
  {
    id: 'sb-send-buttons',
    name: 'Send Opening Buttons',
    type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
    typeVersion: 1,
    position: [700, 300],
    credentials: GREENAPI_CREDS,
    parameters: {
      resource: 'sending',
      operation: 'sendButtons',
      chatId: '={{ $json.chatId }}',
      message: '={{ $json.opening_body }}',
      footer: 'פרפקט וואן | perfect-1.co.il',
      buttons: '={{ JSON.stringify($json.buttons) }}'
    }
  },

  // 4. Save Bot Session to Supabase
  {
    id: 'sb-save-session',
    name: 'Save Bot Session',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [700, 500],
    onError: 'continueRegularOutput',
    parameters: {
      method: 'PATCH',
      url: '=https://fnsnnezhikgqajdbtwoa.supabase.co/rest/v1/leads?phone=eq.{{ encodeURIComponent($json.phone) }}&order=created_at.desc&limit=1',
      authentication: 'none',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: {
        parameters: [
          { name: 'apikey', value: SERVICE_KEY },
          { name: 'Authorization', value: 'Bearer ' + SERVICE_KEY },
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Prefer', value: 'return=minimal' }
        ]
      },
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ page_intent: $json.page_intent, flow_type: $json.flow_type, bot_started_at: new Date().toISOString(), bot_current_step: "opening_sent", bot_messages_count: 1, bot_last_message_at: new Date().toISOString() }) }}',
      options: { timeout: 10000 }
    }
  },

  // 5. Response Webhook - receives button clicks from WhatsApp
  {
    id: 'sb-response-webhook',
    name: 'Response Webhook',
    type: 'n8n-nodes-base.webhook',
    typeVersion: 2,
    position: [200, 700],
    webhookId: 'sales-bot-response',
    parameters: {
      httpMethod: 'POST',
      path: 'sales-bot-response',
      options: {}
    }
  },

  // 6. Parse Response
  {
    id: 'sb-parse-response',
    name: 'Parse Response',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [440, 700],
    parameters: {
      jsCode: `
const body = $input.first().json.body || $input.first().json;
const msgData = body.messageData || {};
const phone = (body.senderData?.sender || '').split('@')[0];
const chatId = body.senderData?.chatId || '';

// Extract button click or text
let buttonId = '';
let userText = '';
if (msgData.buttonsResponseMessage) {
  buttonId = msgData.buttonsResponseMessage.selectedButtonId || '';
  userText = msgData.buttonsResponseMessage.selectedButtonText || '';
} else if (msgData.listResponseMessage) {
  buttonId = msgData.listResponseMessage.singleSelectReply?.selectedRowId || '';
  userText = msgData.listResponseMessage.title || '';
} else {
  userText = msgData.textMessageData?.textMessage
    || msgData.extendedTextMessageData?.text
    || body.unifiedMessageText
    || '';
}

// Classify temperature from button/text
let temperature = 'warm';
const hotSignals = ['start_now', 'start_opening', 'get_quote', 'price', 'peace_of_mind', 'ongoing_support'];
const coldSignals = ['just_checking'];
const text = (userText + ' ' + buttonId).toLowerCase();

if (hotSignals.includes(buttonId) || text.includes('רוצה להתחיל') || text.includes('מחיר') || text.includes('ת"ז')) {
  temperature = 'hot';
} else if (coldSignals.includes(buttonId) || text.includes('רק בודק')) {
  temperature = 'cold';
}

// Desired next action
let nextAction = 'continue_flow';
if (buttonId === 'start_now' || buttonId === 'start_opening') nextAction = 'collect_documents';
if (buttonId === 'talk_accountant') nextAction = 'book_call';
if (buttonId === 'get_quote' || buttonId === 'price') nextAction = 'send_quote';
if (buttonId === 'understand_steps') nextAction = 'explain_steps';
if (buttonId === 'weeks' || buttonId === 'start_soon') nextAction = 'ask_field';
if (buttonId === 'months' || buttonId === 'just_checking') nextAction = 'nurture';

return [{ json: {
  phone, chatId, buttonId, userText, temperature, nextAction,
  is_button: !!buttonId,
  source: 'sales_bot'
}}];
`
    }
  },

  // 7. Route by Next Action
  {
    id: 'sb-route',
    name: 'Route Action',
    type: 'n8n-nodes-base.switch',
    typeVersion: 3,
    position: [700, 700],
    parameters: {
      rules: {
        values: [
          {
            conditions: { conditions: [{ leftValue: '={{ $json.nextAction }}', rightValue: 'collect_documents', operator: { type: 'string', operation: 'equals' } }], combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' } },
            renameOutput: true, outputLabel: 'Collect Docs'
          },
          {
            conditions: { conditions: [{ leftValue: '={{ $json.nextAction }}', rightValue: 'book_call', operator: { type: 'string', operation: 'equals' } }], combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' } },
            renameOutput: true, outputLabel: 'Book Call'
          },
          {
            conditions: { conditions: [{ leftValue: '={{ $json.nextAction }}', rightValue: 'send_quote', operator: { type: 'string', operation: 'equals' } }], combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' } },
            renameOutput: true, outputLabel: 'Send Quote'
          },
          {
            conditions: { conditions: [{ leftValue: '={{ $json.nextAction }}', rightValue: 'explain_steps', operator: { type: 'string', operation: 'equals' } }], combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' } },
            renameOutput: true, outputLabel: 'Explain Steps'
          }
        ],
        fallbackOutput: 'extra'
      },
      options: { fallbackOutput: 'extra' }
    }
  },

  // 8a. Send CTA - Collect Documents
  {
    id: 'sb-cta-docs',
    name: 'CTA - Collect Docs',
    type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
    typeVersion: 1,
    position: [1000, 500],
    credentials: GREENAPI_CREDS,
    parameters: {
      resource: 'sending',
      operation: 'sendButtons',
      chatId: '={{ $json.chatId }}',
      message: 'מעולה! 👍\nכדי להתחיל, נצטרך צילום תעודת זהות (שני צדדים).\nאפשר לשלוח כאן או בשיחה קצרה.\n\nמה מתאים לך?',
      footer: 'פרפקט וואן',
      buttons: '=[{"id":"send_id","text":"📄 לשלוח ת\\"ז עכשיו"},{"id":"book_call","text":"📞 שיחה קצרה"},{"id":"how_much","text":"💰 כמה זה עולה"}]'
    }
  },

  // 8b. Send CTA - Book Call
  {
    id: 'sb-cta-call',
    name: 'CTA - Book Call',
    type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
    typeVersion: 1,
    position: [1000, 650],
    credentials: GREENAPI_CREDS,
    parameters: {
      resource: 'sending',
      operation: 'sendMessage',
      chatId: '={{ $json.chatId }}',
      message: 'מצוין! 📞\nנציג שלנו יחזור אליך בהקדם לשיחה קצרה.\nאם תרצה, אפשר גם לשלוח הודעה ישירות ל-WhatsApp:\nhttps://wa.me/972502277087'
    }
  },

  // 8c. Send CTA - Price Quote
  {
    id: 'sb-cta-quote',
    name: 'CTA - Send Quote',
    type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
    typeVersion: 1,
    position: [1000, 800],
    credentials: GREENAPI_CREDS,
    parameters: {
      resource: 'sending',
      operation: 'sendButtons',
      chatId: '={{ $json.chatId }}',
      message: 'ברוב המקרים השירות הוא סביב:\n💰 200 ₪ + מע״מ לחודש\n💰 250 ₪ + מע״מ חד פעמי (פתיחת תיק)\n\nכולל: דוח שנתי, ליווי וייעוץ, אפליקציה להוצאת קבלות ומנהלת תיק זמינה.\n\nמה תרצה לעשות?',
      footer: 'פרפקט וואן',
      buttons: '=[{"id":"send_id","text":"📄 לשלוח ת\\"ז ולהתחיל"},{"id":"book_call","text":"📞 לדבר עם רואה חשבון"},{"id":"start_now","text":"🚀 להתחיל עכשיו"}]'
    }
  },

  // 8d. Send CTA - Explain Steps
  {
    id: 'sb-cta-steps',
    name: 'CTA - Explain Steps',
    type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
    typeVersion: 1,
    position: [1000, 950],
    credentials: GREENAPI_CREDS,
    parameters: {
      resource: 'sending',
      operation: 'sendButtons',
      chatId: '={{ $json.chatId }}',
      message: 'בגדול התהליך כולל פתיחה מול:\n• מע״מ\n• מס הכנסה\n• ביטוח לאומי\n\nאנחנו מלווים אותך בכל השלבים כדי שלא יהיו טעויות או עיכובים.',
      footer: 'פרפקט וואן',
      buttons: '=[{"id":"book_call","text":"📞 לדבר עם רואה חשבון"},{"id":"send_id","text":"📄 להתחיל פתיחת תיק"},{"id":"how_much","text":"💰 כמה זה עולה"}]'
    }
  },

  // 8e. Nurture / Default
  {
    id: 'sb-cta-nurture',
    name: 'CTA - Nurture',
    type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
    typeVersion: 1,
    position: [1000, 1100],
    credentials: GREENAPI_CREDS,
    parameters: {
      resource: 'sending',
      operation: 'sendButtons',
      chatId: '={{ $json.chatId }}',
      message: 'אני כאן אם תצטרך עזרה 🙂\nאפשר תמיד לחזור ולשאול.',
      footer: 'פרפקט וואן',
      buttons: '=[{"id":"book_call","text":"📞 לדבר עם מומחה"},{"id":"how_much","text":"💰 לשמוע מחיר"},{"id":"start_now","text":"🚀 להתחיל עכשיו"}]'
    }
  },

  // 9. Update CRM after response
  {
    id: 'sb-update-crm',
    name: 'Update CRM',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1300, 700],
    onError: 'continueRegularOutput',
    parameters: {
      method: 'PATCH',
      url: '=https://fnsnnezhikgqajdbtwoa.supabase.co/rest/v1/leads?phone=eq.{{ encodeURIComponent($json.phone) }}&order=created_at.desc&limit=1',
      authentication: 'none',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: {
        parameters: [
          { name: 'apikey', value: SERVICE_KEY },
          { name: 'Authorization', value: 'Bearer ' + SERVICE_KEY },
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Prefer', value: 'return=minimal' }
        ]
      },
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ temperature: $json.temperature, bot_first_answer: $json.buttonId || $json.userText, bot_desired_action: $json.nextAction, bot_current_step: $json.nextAction, bot_messages_count: 2, bot_last_message_at: new Date().toISOString() }) }}',
      options: { timeout: 10000 }
    }
  }
];

// ========================================
// CONNECTIONS
// ========================================
const connections = {
  'Sales Bot Webhook': { main: [[{ node: 'Classify & Build Flow', type: 'main', index: 0 }]] },
  'Classify & Build Flow': { main: [[
    { node: 'Send Opening Buttons', type: 'main', index: 0 },
    { node: 'Save Bot Session', type: 'main', index: 0 }
  ]] },
  'Response Webhook': { main: [[{ node: 'Parse Response', type: 'main', index: 0 }]] },
  'Parse Response': { main: [[
    { node: 'Route Action', type: 'main', index: 0 },
    { node: 'Update CRM', type: 'main', index: 0 }
  ]] },
  'Route Action': { main: [
    [{ node: 'CTA - Collect Docs', type: 'main', index: 0 }],    // Collect Docs
    [{ node: 'CTA - Book Call', type: 'main', index: 0 }],       // Book Call
    [{ node: 'CTA - Send Quote', type: 'main', index: 0 }],      // Send Quote
    [{ node: 'CTA - Explain Steps', type: 'main', index: 0 }],   // Explain Steps
    [{ node: 'CTA - Nurture', type: 'main', index: 0 }]          // Default/Nurture
  ] }
};

const workflow = {
  name: 'Perfect-1 Sales Bot',
  nodes,
  connections,
  settings: {
    executionOrder: 'v1'
  }
};

fs.writeFileSync(
  'c:/Users/USER/Desktop/קלואד קוד/פרפקט וואן - מכירות/docs/sales-bot-workflow.json',
  JSON.stringify(workflow, null, 2)
);

console.log('Sales Bot workflow created.');
console.log('Nodes:', nodes.length);
console.log('Connections:', Object.keys(connections).length);
