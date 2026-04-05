/**
 * Script to update the CRM Bot workflow with dynamic bot messages.
 * Replaces generic WA messages with intent-based dynamic messages.
 */
const fs = require('fs');

const w = JSON.parse(fs.readFileSync('c:/Users/USER/Desktop/קלואד קוד/פרפקט וואן - מכירות/docs/crm-bot-current.json', 'utf8'));

// 1. Add page_intent and service_type to Edit Fields
const editFields = w.nodes.find(n => n.name === 'Edit Fields');
editFields.parameters.assignments.assignments.push(
  {
    id: 'f18',
    name: 'page_intent',
    value: '={{ $json.body?.page_intent || $json.page_intent || "" }}',
    type: 'string'
  },
  {
    id: 'f19',
    name: 'service_type',
    value: '={{ $json.body?.service_type || $json.service_type || $json.body?.category || $json.category || "" }}',
    type: 'string'
  }
);

// 2. Remove old nodes: 'Is Osek Patur?', 'Send WA - Osek Patur', 'Send WA - Other'
const removeNames = ['Is Osek Patur?', 'Send WA - Osek Patur', 'Send WA - Other'];
w.nodes = w.nodes.filter(n => !removeNames.includes(n.name));

// Clean connections from removed nodes
for (const key of removeNames) {
  delete w.connections[key];
}

// 3. Build Dynamic Bot Message Code node
const botMessageCode = `
const data = $input.first().json;
const name = data.name || '';
const chatId = data.chat_id || '';
const pageIntent = data.page_intent || '';
const serviceType = data.service_type || data.category || '';
const sourcePage = data.source_page || '';

// Intent classifier fallback (if page_intent not set from frontend)
function classifyIntent(sp) {
  if (pageIntent) return pageIntent;
  sp = (sp || '').toLowerCase();
  if (sp.includes('open-osek') || sp.includes('steps-osek') || sp.includes('landing-osek-patur')) return 'service';
  if (sp.includes('patur-vs-murshe') || sp.includes('compare') || sp.includes('quiz')) return 'comparison';
  if (sp.includes('accountant') || sp.includes('management')) return 'accounting_service';
  if (sp.includes('cost') || sp.includes('pricing') || sp.includes('price')) return 'pricing';
  if (sp.includes('how-to') || sp.includes('guide') || sp.includes('faq')) return 'guide';
  if (sp.includes('close-') || sp.includes('sgirat')) return 'service';
  return 'guide';
}

const intent = classifyIntent(sourcePage);

const flowTypes = {
  'service': 'service_flow',
  'comparison': 'comparison_flow',
  'guide': 'guide_flow',
  'pricing': 'pricing_flow',
  'accounting_service': 'accounting_svc_flow'
};
const flowType = flowTypes[intent] || 'generic_flow';

// Service-specific messages (override intent-level)
const serviceMessages = {
  'close_osek_patur': 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בסגירת עוסק פטור.\\nהתהליך כולל סגירה מול מע״מ, מס הכנסה וביטוח לאומי — אנחנו יכולים לטפל בהכל בשבילך.\\n\\nאיפה אתה נמצא בתהליך?\\n🚀 רוצה לסגור עכשיו\\n📅 מתכנן לסגור בקרוב\\n🔍 רק בודק מה צריך\\n\\n💬 תמיד אפשר לדבר עם נציג.',
  'close_osek_murshe': 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בסגירת עוסק מורשה.\\nאנחנו יכולים לטפל בכל התהליך.\\n\\n🚀 רוצה לסגור עכשיו\\n📅 מתכנן בקרוב\\n📞 לדבר עם רואה חשבון',
  'close_company': 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בסגירת חברה.\\nהתהליך כולל סגירה מול רשם החברות, מע״מ, מס הכנסה וביטוח לאומי.\\n\\n🚀 רוצה לסגור עכשיו\\n📅 מתכנן בקרוב\\n📞 לדבר עם רואה חשבון',
  'open_osek_murshe': 'שלום ' + name + ' 👋\\nראיתי שהשארת פרטים לגבי פתיחת עוסק מורשה.\\nאני כאן כדי לעזור לך להתחיל בצורה מסודרת.\\n\\nאיפה אתה נמצא בתהליך?\\n🚀 רוצה להתחיל עכשיו\\n📅 מתחיל בקרוב\\n🔍 רק בודק מידע\\n\\n💬 תמיד אפשר לדבר עם נציג, לשאול שאלה, או לשמוע כמה זה עולה.',
  'open_hevra': 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בהקמת חברה בע״מ.\\nאני כאן כדי לעזור לך להבין את התהליך ולהתקדם.\\n\\n🚀 רוצה להתחיל עכשיו\\n📅 מתחיל בקרוב\\n📞 לדבר עם רואה חשבון\\n💰 כמה זה עולה',
  'status_change': 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בשינוי סטטוס עסק.\\nנשמח לעזור לך להתקדם בצורה מסודרת.\\n\\n📞 לדבר עם רואה חשבון\\n❓ לשאול שאלה\\n🚀 להתחיל עכשיו',
  'transition_hevra': 'שלום ' + name + ' 👋\\nראיתי שהתעניינת במעבר לחברה בע״מ.\\nנשמח לעזור לך להבין את התהליך ולעשות את זה נכון.\\n\\n📞 לדבר עם רואה חשבון\\n💰 כמה זה עולה\\n❓ לשאול שאלה'
};

// Intent-level messages
const intentMessages = {
  'service': 'שלום ' + name + ' 👋\\nראיתי שהשארת פרטים לגבי פתיחת עוסק פטור.\\nאני כאן כדי לעזור לך להתחיל בצורה מסודרת מול מע״מ, מס הכנסה וביטוח לאומי.\\n\\nאיפה אתה נמצא בתהליך?\\n🚀 רוצה להתחיל עכשיו\\n📅 מתחיל בקרוב\\n🔍 רק בודק מידע\\n\\n💬 תמיד אפשר לדבר עם נציג, לשאול שאלה, או לשמוע כמה זה עולה.',
  'comparison': 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בנושא עוסק פטור או מורשה.\\nאני יכול לעזור לך להבין מה כנראה יותר מתאים לך בכמה שאלות קצרות.\\n\\nמתי אתה מתכנן להתחיל את העסק?\\n📅 בשבועות הקרובים\\n🗓️ בחודשים הקרובים\\n🔍 רק בודק אפשרויות\\n\\n💬 תמיד אפשר לדבר עם נציג או לשאול שאלה.',
  'guide': 'שלום ' + name + ' 👋\\nראיתי שהשארת פרטים ונתעניינת במידע.\\nאם תרצה, אני יכול לעשות לך סדר קצר ולעזור לך להתקדם בלי טעויות.\\n\\nמה היית רוצה עכשיו?\\n📋 להבין את השלבים\\n📞 לדבר עם רואה חשבון\\n🚀 להתחיל פתיחה\\n❓ לשאול שאלה',
  'pricing': 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בנושא המחיר.\\n\\nברוב המקרים השירות הוא סביב:\\n💰 200 ₪ + מע״מ לחודש\\n💰 250 ₪ + מע״מ חד פעמי (פתיחת תיק)\\n\\nזה כולל: דוח שנתי, ליווי וייעוץ, התנהלות מול הרשויות, אפליקציה להוצאת קבלות ומנהלת תיק זמינה.\\n\\nמה היית רוצה עכשיו?\\n📝 לקבל הצעת מחיר מדויקת\\n📞 לדבר עם רואה חשבון\\n🚀 להתחיל פתיחה\\n❓ לשאול שאלה',
  'accounting_service': 'שלום ' + name + ' 👋\\nראיתי שהתעניינת בשירות רואה חשבון.\\nאני יכול להסביר לך בקצרה מה השירות כולל ולעזור לך להבין איך הכי נכון להתקדם.\\n\\nמה הכי חשוב לך כרגע?\\n💰 מחיר\\n🤝 ליווי שוטף\\n📊 דוח שנתי\\n😌 שקט נפשי\\n\\n💬 תמיד אפשר לדבר עם נציג או לשאול שאלה.'
};

// Choose message: service-specific > intent-level > fallback
let message = serviceMessages[serviceType] || intentMessages[intent];

if (!message) {
  message = 'שלום ' + name + ' 👋\\nתודה שהשארת פרטים.\\nאני כאן כדי לעזור — במה אוכל לסייע?\\n\\n🏢 פתיחת עסק\\n📞 לדבר עם מומחה\\n💰 לשמוע מחיר\\n❓ לשאול שאלה';
}

return [{ json: {
  ...data,
  page_intent: intent,
  flow_type: flowType,
  service_type: serviceType,
  bot_message: message,
  chat_id: chatId
}}];
`;

const buildMessageNode = {
  parameters: {
    jsCode: botMessageCode
  },
  id: 'bot-msg-builder',
  name: 'Build Dynamic Bot Message',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [860, 300]
};

// 4. Copy credentials from existing WA node
const existingWaNode = w.nodes.find(n =>
  n.type === '@green-api/n8n-nodes-whatsapp-greenapi.greenapi' && n.credentials
);

const sendWaDynamic = {
  parameters: {
    message: '={{ $json.bot_message }}',
    chatId: '={{ $json.chat_id }}',
    typingTime: 2
  },
  id: 'bot-wa-send',
  name: 'Send WA - Dynamic Bot',
  type: '@green-api/n8n-nodes-whatsapp-greenapi.greenapi',
  typeVersion: 1,
  position: [1080, 300],
  credentials: existingWaNode ? existingWaNode.credentials : {}
};

w.nodes.push(buildMessageNode, sendWaDynamic);

// 5. Update connections
// Is New Lead? → true → Build Dynamic Bot Message
if (w.connections['Is New Lead?']) {
  w.connections['Is New Lead?'].main[0] = [
    { node: 'Build Dynamic Bot Message', type: 'main', index: 0 }
  ];
}

w.connections['Build Dynamic Bot Message'] = {
  main: [[{ node: 'Send WA - Dynamic Bot', type: 'main', index: 0 }]]
};

w.connections['Send WA - Dynamic Bot'] = {
  main: [[
    { node: 'Alert Owner - New Lead', type: 'main', index: 0 },
    { node: 'Check Send Errors', type: 'main', index: 0 },
    { node: 'Route to Followup', type: 'main', index: 0 }
  ]]
};

// 6. Update Parse CRM Event to include page_intent and service_type
const parseCRM = w.nodes.find(n => n.name === 'Parse CRM Event');
if (parseCRM) {
  parseCRM.parameters.jsCode = parseCRM.parameters.jsCode.replace(
    "lead_id: body.lead_id || '',",
    "lead_id: body.lead_id || '',\n    page_intent: body.page_intent || '',\n    service_type: body.service_type || body.category || '',"
  );
}

// Save
fs.writeFileSync(
  'c:/Users/USER/Desktop/קלואד קוד/פרפקט וואן - מכירות/docs/crm-bot-updated.json',
  JSON.stringify(w, null, 2)
);

console.log('Updated workflow saved.');
console.log('Nodes:', w.nodes.map(n => n.name).join(', '));
console.log('Connections:', Object.keys(w.connections).join(', '));
