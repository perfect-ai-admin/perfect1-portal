/**
 * Updates bot-v5 to route sales bot responses separately from mentor.
 * Adds: Normalize Input → Check Sales Bot → [if sales] → Handle Sales Response → Send WA
 *                                           [if not]  → Start Audit Run (original flow)
 */
const fs = require('fs');

const TMPDIR = 'c:/Users/USER/Desktop/קלואד קוד/פרפקט וואן - מכירות/docs';
const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc25uZXpoaWtncWFqZGJ0d29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODk3ODkwMCwiZXhwIjoyMDg0NTU0OTAwfQ.ncDeHwwY3lD88i3dS98-7ETV4als0pzFn7Cz6UXC_RM';
const SUPABASE_URL = 'https://fnsnnezhikgqajdbtwoa.supabase.co/rest/v1';

async function main() {
  // Fetch current bot-v5
  const res = await fetch('https://n8n.perfect-1.one/api/v1/workflows/1OxdM_TyMM44VATmedDUn', {
    headers: { 'X-N8N-API-KEY': N8N_KEY }
  });
  const w = await res.json();

  // 1. Add "Check Sales Bot Session" HTTP node - queries bot_sessions
  const checkSalesBot = {
    id: 'check-sales-bot',
    name: 'Check Sales Bot',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [w.nodes.find(n => n.name === 'Normalize Input').position[0] + 250, w.nodes.find(n => n.name === 'Normalize Input').position[1]],
    onError: 'continueRegularOutput',
    parameters: {
      method: 'GET',
      url: `=${SUPABASE_URL}/bot_sessions?phone=eq.{{ $json.phone.replace('+','') }}&completed_at=is.null&order=created_at.desc&limit=1&select=id,lead_id,flow_type,page_intent,current_step`,
      authentication: 'none',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: {
        parameters: [
          { name: 'apikey', value: SERVICE_KEY },
          { name: 'Authorization', value: `Bearer ${SERVICE_KEY}` },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      options: { timeout: 5000 }
    }
  };

  // 2. Add "Is Sales Bot?" IF node
  const isSalesBot = {
    id: 'is-sales-bot',
    name: 'Is Sales Bot?',
    type: 'n8n-nodes-base.if',
    typeVersion: 2,
    position: [checkSalesBot.position[0] + 250, checkSalesBot.position[1]],
    parameters: {
      conditions: {
        options: { version: 2, leftValue: '', caseSensitive: true, typeValidation: 'loose' },
        conditions: [{
          id: 'sales-bot-check',
          leftValue: '={{ Array.isArray($json) ? $json.length : 0 }}',
          rightValue: '0',
          operator: { type: 'number', operation: 'gt' }
        }],
        combinator: 'and'
      }
    }
  };

  // 3. Add "Handle Sales Response" Code node
  const handleSalesResponse = {
    id: 'handle-sales-response',
    name: 'Handle Sales Response',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [isSalesBot.position[0] + 250, isSalesBot.position[1] - 100],
    parameters: {
      jsCode: `
// Get sales bot session and user text
const sessionData = $('Check Sales Bot').first().json;
const session = Array.isArray(sessionData) ? sessionData[0] : sessionData;
const normalized = $('Normalize Input').first().json;
const userText = (normalized.user_text || '').trim();
const phone = normalized.phone || '';
const chatId = normalized.chat_id || '';

if (!session || !session.id) {
  return [{ json: { ...normalized, is_sales: false } }];
}

const currentStep = session.current_step || 'opening_sent';
const flowType = session.flow_type || 'generic_flow';
const sessionId = session.id;
const leadId = session.lead_id;

// Parse user response (number or text)
let choice = '';
let temperature = 'warm';
let nextAction = '';
let responseMessage = '';

const num = parseInt(userText);
const textLower = userText.toLowerCase();

if (currentStep === 'opening_sent') {
  // First response after opening message
  if (num === 1 || textLower.includes('להתחיל') || textLower.includes('רוצה') || textLower.includes('עכשיו') || textLower.includes('לסגור')) {
    choice = 'start_now';
    temperature = 'hot';
    nextAction = 'collect_documents';
    responseMessage = 'מעולה! 👍\\nכדי להתחיל, נצטרך צילום תעודת זהות (שני צדדים).\\nאפשר לשלוח כאן או לקבוע שיחה קצרה.\\n\\n1️⃣ לשלוח ת"ז עכשיו\\n2️⃣ לקבוע שיחה\\n3️⃣ כמה זה עולה?';
  } else if (num === 2 || textLower.includes('בקרוב') || textLower.includes('חודש') || textLower.includes('שבוע')) {
    choice = 'start_soon';
    temperature = 'warm';
    nextAction = 'ask_field';
    responseMessage = 'מצוין! 📅\\nמה תחום הפעילות שלך?\\n\\n1️⃣ שירותים / פרילנס\\n2️⃣ מכירת מוצרים\\n3️⃣ מקצוע חופשי\\n4️⃣ אחר';
  } else if (num === 3 || textLower.includes('בודק') || textLower.includes('מידע')) {
    choice = 'just_checking';
    temperature = 'cold';
    nextAction = 'nurture';
    responseMessage = 'אני כאן אם תצטרך עזרה 🙂\\nאפשר תמיד לחזור.\\n\\n1️⃣ לדבר עם רואה חשבון\\n2️⃣ כמה זה עולה?\\n3️⃣ להתחיל כשמוכן';
  } else if (num === 4 || textLower.includes('מחיר') || textLower.includes('עולה') || textLower.includes('כמה')) {
    choice = 'pricing';
    temperature = 'warm';
    nextAction = 'send_quote';
    responseMessage = 'ברוב המקרים:\\n💰 ליווי חודשי: 200 ₪ + מע״מ\\n💰 פתיחת תיק: 250 ₪ + מע״מ (חד פעמי)\\n\\nכולל דוח שנתי, ליווי, אפליקציה ומנהלת תיק.\\n\\n1️⃣ לשלוח ת"ז ולהתחיל\\n2️⃣ לדבר עם רואה חשבון\\n3️⃣ הצעת מחיר מדויקת';
  } else if (num === 5 || textLower.includes('נציג') || textLower.includes('לדבר') || textLower.includes('שאלה')) {
    choice = 'talk_agent';
    temperature = 'warm';
    nextAction = 'handoff';
    responseMessage = 'בהחלט! 📞\\nנציג שלנו יחזור אליך בהקדם.\\nאם תרצה, אפשר גם לשלוח הודעה ישירות:\\nhttps://wa.me/972502277087';
  } else {
    // Free text - treat as question
    choice = 'free_text';
    temperature = 'warm';
    nextAction = 'handoff';
    responseMessage = 'תודה על ההודעה! 🙂\\nנציג שלנו יחזור אליך בהקדם עם תשובה.\\n\\nאם בינתיים תרצה:\\n1️⃣ לשמוע מחיר\\n2️⃣ להתחיל עכשיו\\n3️⃣ לדבר עם רואה חשבון';
  }
} else if (currentStep === 'collect_documents' || currentStep === 'send_quote' || currentStep === 'ask_field') {
  // Second round responses
  if (num === 1 || textLower.includes('ת"ז') || textLower.includes('תז') || textLower.includes('תעודת')) {
    choice = 'send_docs';
    temperature = 'hot';
    nextAction = 'awaiting_docs';
    responseMessage = 'מעולה! 📄\\nאפשר לשלוח צילום ת"ז (שני צדדים) כאן בצ\\'אט.\\nברגע שנקבל, נתחיל מיד בתהליך!';
  } else if (num === 2 || textLower.includes('שיחה') || textLower.includes('לדבר') || textLower.includes('רואה חשבון')) {
    choice = 'book_call';
    temperature = 'hot';
    nextAction = 'booked_call';
    responseMessage = 'מצוין! 📞\\nנציג שלנו יחזור אליך בהקדם.';
  } else if (num === 3 || textLower.includes('מחיר') || textLower.includes('עולה') || textLower.includes('הצעה')) {
    choice = 'get_quote';
    temperature = 'warm';
    nextAction = 'requested_quote';
    responseMessage = 'נשלח לך הצעת מחיר מפורטת בהקדם! 📝';
  } else {
    choice = 'other';
    temperature = 'warm';
    nextAction = 'handoff';
    responseMessage = 'תודה! נציג יחזור אליך בהקדם 🙂';
  }
}

// Determine outcome_state
let outcomeState = null;
if (['booked_call', 'handoff'].includes(nextAction)) outcomeState = nextAction === 'handoff' ? 'handoff_to_agent' : 'booked_call';
if (nextAction === 'awaiting_docs') outcomeState = 'sent_documents';
if (nextAction === 'requested_quote') outcomeState = 'requested_quote';

return [{ json: {
  is_sales: true,
  phone, chatId, sessionId, leadId,
  choice, temperature, nextAction, responseMessage, outcomeState,
  current_step: nextAction || currentStep,
  user_text: userText
}}];
`
    }
  };

  // 4. Add "Send Sales Response" GreenAPI node
  const sendSalesResponse = {
    id: 'send-sales-response',
    name: 'Send Sales Response',
    type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
    typeVersion: 1,
    position: [handleSalesResponse.position[0] + 250, handleSalesResponse.position[1]],
    credentials: { greenApiAuthApi: { id: '2gdsusfuyKaYssFU', name: 'Green-API account' } },
    parameters: {
      message: '={{ $json.responseMessage }}',
      chatId: '={{ $json.chatId }}',
      typingTime: 0
    }
  };

  // 5. Add "Update Sales CRM" HTTP node
  const updateSalesCRM = {
    id: 'update-sales-crm',
    name: 'Update Sales CRM',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [sendSalesResponse.position[0] + 250, sendSalesResponse.position[1]],
    onError: 'continueRegularOutput',
    parameters: {
      method: 'PATCH',
      url: `=${SUPABASE_URL}/leads?phone=eq.{{ encodeURIComponent($json.phone) }}&order=created_at.desc&limit=1`,
      authentication: 'none',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: {
        parameters: [
          { name: 'apikey', value: SERVICE_KEY },
          { name: 'Authorization', value: `Bearer ${SERVICE_KEY}` },
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Prefer', value: 'return=minimal' }
        ]
      },
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ temperature: $json.temperature, bot_first_answer: $json.choice, bot_desired_action: $json.nextAction, bot_current_step: $json.current_step, bot_outcome_state: $json.outcomeState, bot_messages_count: 2, bot_last_message_at: new Date().toISOString() }) }}',
      options: { timeout: 10000 }
    }
  };

  // 6. Add "Update Sales Session" HTTP node
  const updateSalesSession = {
    id: 'update-sales-session',
    name: 'Update Sales Session',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [updateSalesCRM.position[0], updateSalesCRM.position[1] + 150],
    onError: 'continueRegularOutput',
    parameters: {
      method: 'PATCH',
      url: `=${SUPABASE_URL}/bot_sessions?id=eq.{{ $json.sessionId }}`,
      authentication: 'none',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: {
        parameters: [
          { name: 'apikey', value: SERVICE_KEY },
          { name: 'Authorization', value: `Bearer ${SERVICE_KEY}` },
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Prefer', value: 'return=minimal' }
        ]
      },
      sendBody: true,
      contentType: 'json',
      specifyBody: 'json',
      jsonBody: '={{ JSON.stringify({ current_step: $json.current_step, temperature: $json.temperature, outcome_state: $json.outcomeState, answers: { step1: $json.choice, text: $json.user_text }, messages_count: 2, last_message_at: new Date().toISOString(), completed_at: ["handoff","booked_call","awaiting_docs","requested_quote"].includes($json.nextAction) ? new Date().toISOString() : null }) }}',
      options: { timeout: 10000 }
    }
  };

  // Add all new nodes
  w.nodes.push(checkSalesBot, isSalesBot, handleSalesResponse, sendSalesResponse, updateSalesCRM, updateSalesSession);

  // Update connections:
  // Normalize Input → Check Sales Bot (instead of Start Audit Run)
  w.connections['Normalize Input'] = {
    main: [[{ node: 'Check Sales Bot', type: 'main', index: 0 }]]
  };

  // Check Sales Bot → Is Sales Bot?
  w.connections['Check Sales Bot'] = {
    main: [[{ node: 'Is Sales Bot?', type: 'main', index: 0 }]]
  };

  // Is Sales Bot? → true (index 0) → Handle Sales Response
  //              → false (index 1) → Start Audit Run (original flow)
  w.connections['Is Sales Bot?'] = {
    main: [
      [{ node: 'Handle Sales Response', type: 'main', index: 0 }],
      [{ node: 'Start Audit Run', type: 'main', index: 0 }]
    ]
  };

  // Handle Sales Response → Send Sales Response → Update Sales CRM + Update Sales Session
  w.connections['Handle Sales Response'] = {
    main: [[{ node: 'Send Sales Response', type: 'main', index: 0 }]]
  };

  w.connections['Send Sales Response'] = {
    main: [[
      { node: 'Update Sales CRM', type: 'main', index: 0 },
      { node: 'Update Sales Session', type: 'main', index: 0 }
    ]]
  };

  // Save
  const payload = { name: w.name, nodes: w.nodes, connections: w.connections, settings: w.settings };
  fs.writeFileSync(`${TMPDIR}/bot-v5-updated.json`, JSON.stringify(payload));
  console.log('bot-v5 updated. Nodes:', payload.nodes.length);
  console.log('New nodes:', ['Check Sales Bot', 'Is Sales Bot?', 'Handle Sales Response', 'Send Sales Response', 'Update Sales CRM', 'Update Sales Session'].join(', '));
}

main().catch(console.error);
