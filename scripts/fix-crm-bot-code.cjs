const fs = require('fs');
const https = require('https');

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'n8n.perfect-1.one',
      path: '/api/v1' + path,
      method,
      headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const w = await apiCall('GET', '/workflows/PfVBnM3Ds3I_pz9ekkYAN');

  const botNode = w.nodes.find(n => n.name === 'Build Dynamic Bot Message');

  // Fix the code - $input was stripped by bash
  botNode.parameters.jsCode = `
const data = $input.first().json;
const name = data.name || '';
const chatId = data.chat_id || '';
const pageIntent = data.page_intent || '';
const serviceType = data.service_type || data.category || '';
const sourcePage = data.source_page || '';

function classifyIntent(sp) {
  if (pageIntent) return pageIntent;
  const s = (sp || '').toLowerCase();
  if (s.includes('open-osek') || s.includes('steps-osek') || s.includes('landing-osek-patur')) return 'service';
  if (s.includes('patur-vs-murshe') || s.includes('compare') || s.includes('quiz')) return 'comparison';
  if (s.includes('accountant') || s.includes('management')) return 'accounting_service';
  if (s.includes('cost') || s.includes('pricing') || s.includes('price')) return 'pricing';
  if (s.includes('close-') || s.includes('sgirat')) return 'service';
  return 'guide';
}

const intent = classifyIntent(sourcePage);
const flowTypes = { service: 'service_flow', comparison: 'comparison_flow', guide: 'guide_flow', pricing: 'pricing_flow', accounting_service: 'accounting_svc_flow' };
const flowType = flowTypes[intent] || 'generic_flow';

const msgs = {
  service: \`שלום \${name} 👋
ראיתי שהשארת פרטים לגבי פתיחת עוסק פטור.
אני כאן כדי לעזור לך להתחיל בצורה מסודרת מול מע״מ, מס הכנסה וביטוח לאומי.

איפה אתה נמצא בתהליך?

1️⃣ רוצה להתחיל עכשיו
2️⃣ מתחיל בקרוב
3️⃣ רק בודק מידע
4️⃣ כמה זה עולה?
5️⃣ לדבר עם נציג\`,

  comparison: \`שלום \${name} 👋
ראיתי שהתעניינת בנושא עוסק פטור או מורשה.
אני יכול לעזור לך להבין מה יותר מתאים לך.

מתי אתה מתכנן להתחיל?

1️⃣ בשבועות הקרובים
2️⃣ בחודשים הקרובים
3️⃣ רק בודק אפשרויות
4️⃣ לדבר עם רואה חשבון
5️⃣ כמה זה עולה?\`,

  guide: \`שלום \${name} 👋
ראיתי שהשארת פרטים ונתעניינת במידע.
אני יכול לעזור לך להתקדם.

מה היית רוצה עכשיו?

1️⃣ להבין את השלבים
2️⃣ לדבר עם רואה חשבון
3️⃣ להתחיל פתיחת עסק
4️⃣ כמה זה עולה?
5️⃣ לשאול שאלה\`,

  pricing: \`שלום \${name} 👋
ראיתי שהתעניינת בנושא המחיר.

ברוב המקרים:
💰 ליווי חודשי: 200 ₪ + מע״מ
💰 פתיחת תיק: 250 ₪ + מע״מ (חד פעמי)

כולל דוח שנתי, ליווי, אפליקציה להוצאת קבלות ומנהלת תיק.

מה תרצה?

1️⃣ הצעת מחיר מדויקת
2️⃣ לדבר עם רואה חשבון
3️⃣ לשלוח ת"ז ולהתחיל
4️⃣ לשאול שאלה\`,

  accounting_service: \`שלום \${name} 👋
ראיתי שהתעניינת בשירות רואה חשבון.

מה הכי חשוב לך כרגע?

1️⃣ מחיר
2️⃣ ליווי שוטף
3️⃣ שקט נפשי
4️⃣ לדבר עם רואה חשבון
5️⃣ להתחיל עכשיו\`
};

const serviceOverrides = {
  close_osek_patur: \`שלום \${name} 👋
ראיתי שהתעניינת בסגירת עוסק פטור.
אנחנו מטפלים בכל התהליך מול הרשויות.

1️⃣ רוצה לסגור עכשיו
2️⃣ מתכנן לסגור בקרוב
3️⃣ רק בודק מה צריך
4️⃣ כמה זה עולה?
5️⃣ לדבר עם נציג\`,
  close_osek_murshe: \`שלום \${name} 👋
ראיתי שהתעניינת בסגירת עוסק מורשה.

1️⃣ רוצה לסגור עכשיו
2️⃣ מתכנן בקרוב
3️⃣ לדבר עם רואה חשבון
4️⃣ כמה זה עולה?\`,
  open_osek_murshe: \`שלום \${name} 👋
ראיתי שהשארת פרטים לגבי פתיחת עוסק מורשה.

1️⃣ רוצה להתחיל עכשיו
2️⃣ מתחיל בקרוב
3️⃣ רק בודק מידע
4️⃣ כמה זה עולה?
5️⃣ לדבר עם נציג\`
};

const message = serviceOverrides[serviceType] || msgs[intent] || msgs.guide;

return [{ json: {
  ...data,
  page_intent: intent,
  flow_type: flowType,
  service_type: serviceType,
  bot_message: message,
  chat_id: chatId
}}];
`;

  // Also fix the Save Bot Session Code node to use $('Build Dynamic Bot Message')
  const saveNode = w.nodes.find(n => n.name === 'Save Bot Session');
  if (saveNode && saveNode.type === 'n8n-nodes-base.code') {
    saveNode.parameters.jsCode = saveNode.parameters.jsCode
      .replace('$http.request', 'fetch')  // shouldn't be needed but just in case
      .replace(/\$\('Build Dynamic Bot Message'\)/g, "$('Build Dynamic Bot Message')");
  }

  const payload = {
    name: w.name,
    nodes: w.nodes,
    connections: w.connections,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner' }
  };

  const result = await apiCall('PUT', '/workflows/PfVBnM3Ds3I_pz9ekkYAN', payload);
  console.log('Active:', result.active, '| Nodes:', result.nodes?.length);
}

main().catch(console.error);
