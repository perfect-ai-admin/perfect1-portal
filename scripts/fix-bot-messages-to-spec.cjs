/**
 * Fix bot messages to match the original spec exactly.
 * - No "כמה זה עולה" in opening questions (only in CTA stage)
 * - Each intent reflects what the user was looking at on the page
 * - Follow exact flows from bot-flow-engine-spec.md
 */
const https = require('https');

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'n8n.perfect-1.one', path: '/api/v1' + path, method,
      headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' }
    }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// =====================================================
// 1. NEW OPENING MESSAGES — matching spec exactly
// =====================================================
const OPENING_CODE = `
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

// ========== OPENING MESSAGES BY INTENT ==========
// Spec: שלב 1 בלבד. בלי "כמה זה עולה" — זה מופיע רק ב-CTA.

const msgs = {

  // FLOW A: service_flow — דפי שירות ישיר
  // שלב 1: "איפה אתה נמצא בתהליך?" — 3 אפשרויות
  service: \`שלום \${name} 👋
ראיתי שהשארת פרטים לגבי פתיחת עוסק פטור.
אני כאן כדי לעזור לך להתחיל בצורה מסודרת מול מע״מ, מס הכנסה וביטוח לאומי.
נשאל 2 שאלות קצרות ונתקדם.

איפה אתה נמצא בתהליך?

1️⃣ רוצה להתחיל עכשיו
2️⃣ מתחיל בקרוב
3️⃣ רק בודק מידע\`,

  // FLOW B: comparison_flow — דפי השוואה / התלבטות
  // שלב 1: "מתי מתכנן להתחיל?" — 3 אפשרויות
  comparison: \`שלום \${name} 👋
ראיתי שהתעניינת בנושא עוסק פטור או מורשה.
אני יכול לעזור לך להבין מה כנראה יותר מתאים לך בכמה שאלות קצרות.

מתי אתה מתכנן להתחיל את העסק?

1️⃣ בשבועות הקרובים
2️⃣ בחודשים הקרובים
3️⃣ רק בודק אפשרויות\`,

  // FLOW C: guide_flow — דפי מדריך / מידע
  // שלב 1: "כבר התחלת או בתכנון?" — 3 אפשרויות
  guide: \`שלום \${name} 👋
ראיתי שהשארת פרטים לגבי איך פותחים עוסק.
אם תרצה, אני יכול לעשות לך סדר קצר בתהליך ולעזור לך להתקדם בלי טעויות.

כבר התחלת לעבוד או שזה עדיין בתכנון?

1️⃣ כבר התחלתי
2️⃣ מתחיל בקרוב
3️⃣ עדיין רק בודק\`,

  // FLOW D: pricing_flow — דפי מחיר
  // נותן מחיר מיד! אחרי זה CTA.
  pricing: \`שלום \${name} 👋
ראיתי שהתעניינת בנושא המחיר.

ברוב המקרים:
💰 ליווי חודשי: 200 ₪ + מע״מ
💰 פתיחת תיק: 250 ₪ + מע״מ (חד פעמי)

כולל דוח שנתי, ליווי וייעוץ, אפליקציה להוצאת קבלות ומנהלת תיק זמינה.

מה היית רוצה עכשיו?

1️⃣ לשלוח ת"ז ולהתחיל
2️⃣ לדבר עם רואה חשבון
3️⃣ לקבל הצעת מחיר מדויקת
4️⃣ לשאול שאלה\`,

  // FLOW E: accounting_svc_flow — שירות רואה חשבון
  // שלב 1: "מה הכי חשוב לך?" — 4 אפשרויות
  accounting_service: \`שלום \${name} 👋
ראיתי שהתעניינת בשירות רואה חשבון.
אני יכול להסביר לך בקצרה מה השירות כולל ולעזור לך להבין איך הכי נכון להתקדם.

מה הכי חשוב לך כרגע?

1️⃣ מחיר
2️⃣ ליווי שוטף
3️⃣ דוח שנתי
4️⃣ שקט נפשי\`
};

// ========== SERVICE-SPECIFIC OVERRIDES ==========
const serviceOverrides = {

  // סגירת עוסק פטור
  close_osek_patur: \`שלום \${name} 👋
ראיתי שהתעניינת בסגירת עוסק פטור.
התהליך כולל סגירה מול מע״מ, מס הכנסה וביטוח לאומי — ואנחנו יכולים לטפל בהכל בשבילך.

איפה אתה נמצא בתהליך?

1️⃣ רוצה לסגור עכשיו
2️⃣ מתכנן לסגור בקרוב
3️⃣ רק בודק מה צריך\`,

  // סגירת עוסק מורשה
  close_osek_murshe: \`שלום \${name} 👋
ראיתי שהתעניינת בסגירת עוסק מורשה.
אנחנו יכולים לטפל בכל התהליך — מע״מ, מס הכנסה וביטוח לאומי.

איפה אתה נמצא בתהליך?

1️⃣ רוצה לסגור עכשיו
2️⃣ מתכנן לסגור בקרוב
3️⃣ רק בודק מה צריך\`,

  // סגירת חברה
  close_company: \`שלום \${name} 👋
ראיתי שהתעניינת בסגירת חברה.
התהליך כולל סגירה מול רשם החברות, מע״מ, מס הכנסה וביטוח לאומי.

1️⃣ רוצה לסגור עכשיו
2️⃣ מתכנן בקרוב
3️⃣ רק בודק מה צריך\`,

  // פתיחת עוסק מורשה
  open_osek_murshe: \`שלום \${name} 👋
ראיתי שהשארת פרטים לגבי פתיחת עוסק מורשה.
אני כאן כדי לעזור לך להתחיל בצורה מסודרת מול הרשויות.
נשאל 2 שאלות קצרות ונתקדם.

איפה אתה נמצא בתהליך?

1️⃣ רוצה להתחיל עכשיו
2️⃣ מתחיל בקרוב
3️⃣ רק בודק מידע\`,

  // הקמת חברה
  open_hevra: \`שלום \${name} 👋
ראיתי שהתעניינת בהקמת חברה בע״מ.
אני כאן כדי לעזור לך להבין את התהליך ולהתקדם.

איפה אתה נמצא בתהליך?

1️⃣ רוצה להתחיל עכשיו
2️⃣ מתחיל בקרוב
3️⃣ רק בודק מידע\`,

  // שינוי סטטוס
  status_change: \`שלום \${name} 👋
ראיתי שהתעניינת בשינוי סטטוס עסק.
נשמח לעזור לך להתקדם בצורה מסודרת.

איפה אתה נמצא בתהליך?

1️⃣ רוצה להתחיל עכשיו
2️⃣ מתחיל בקרוב
3️⃣ רק בודק מידע\`,

  // מעבר לחברה
  transition_hevra: \`שלום \${name} 👋
ראיתי שהתעניינת במעבר לחברה בע״מ.
נשמח לעזור לך להבין את התהליך ולעשות את זה נכון.

איפה אתה נמצא בתהליך?

1️⃣ רוצה להתחיל עכשיו
2️⃣ מתחיל בקרוב
3️⃣ רק בודק מידע\`
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

// =====================================================
// 2. NEW RESPONSE HANDLER — matching spec step 2
// =====================================================
const RESPONSE_CODE = `
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
const pageIntent = session.page_intent || 'guide';
const sessionId = session.id;
const leadId = session.lead_id;

const num = parseInt(userText);
const text = userText.toLowerCase();

let choice = '';
let temperature = 'warm';
let nextAction = '';
let responseMessage = '';
let newStep = currentStep;

// ========== STEP 1 RESPONSES ==========
if (currentStep === 'opening_sent') {

  if (flowType === 'service_flow') {
    // Spec: 1=רוצה להתחיל, 2=בקרוב, 3=בודק
    if (num === 1 || text.includes('להתחיל') || text.includes('רוצה') || text.includes('עכשיו')) {
      choice = 'start_now'; temperature = 'hot'; newStep = 'step2_field';
      responseMessage = 'מעולה! 👍\\nמה תחום הפעילות שלך?\\n\\n1️⃣ שירותים / פרילנס\\n2️⃣ מכירת מוצרים\\n3️⃣ מקצוע חופשי\\n4️⃣ אחר';
    } else if (num === 2 || text.includes('בקרוב') || text.includes('חודש') || text.includes('שבוע')) {
      choice = 'start_soon'; temperature = 'warm'; newStep = 'step2_field';
      responseMessage = 'מצוין! 📅\\nמה תחום הפעילות שלך?\\n\\n1️⃣ שירותים / פרילנס\\n2️⃣ מכירת מוצרים\\n3️⃣ מקצוע חופשי\\n4️⃣ אחר';
    } else if (num === 3 || text.includes('בודק') || text.includes('מידע')) {
      choice = 'just_checking'; temperature = 'cold'; newStep = 'step2_field';
      responseMessage = 'בסדר גמור 🙂\\nמה תחום הפעילות שלך?\\n\\n1️⃣ שירותים / פרילנס\\n2️⃣ מכירת מוצרים\\n3️⃣ מקצוע חופשי\\n4️⃣ אחר';
    } else {
      choice = 'free_text'; temperature = 'warm'; newStep = 'handoff';
      responseMessage = 'תודה! 🙂 נציג שלנו יחזור אליך בהקדם.';
    }

  } else if (flowType === 'comparison_flow') {
    // Spec: 1=שבועות, 2=חודשים, 3=בודק
    if (num === 1 || text.includes('שבוע')) {
      choice = 'weeks'; temperature = 'hot'; newStep = 'step2_field';
      responseMessage = 'מעולה! 👍\\nמה תחום הפעילות שלך?\\n\\n1️⃣ שירותים / פרילנס\\n2️⃣ מכירת מוצרים\\n3️⃣ מקצוע חופשי\\n4️⃣ עדיין לא בטוח';
    } else if (num === 2 || text.includes('חודש')) {
      choice = 'months'; temperature = 'warm'; newStep = 'step2_field';
      responseMessage = 'מה תחום הפעילות שלך?\\n\\n1️⃣ שירותים / פרילנס\\n2️⃣ מכירת מוצרים\\n3️⃣ מקצוע חופשי\\n4️⃣ עדיין לא בטוח';
    } else if (num === 3 || text.includes('בודק')) {
      choice = 'just_checking'; temperature = 'cold'; newStep = 'step2_field';
      responseMessage = 'בסדר 🙂\\nמה תחום הפעילות שלך?\\n\\n1️⃣ שירותים / פרילנס\\n2️⃣ מכירת מוצרים\\n3️⃣ מקצוע חופשי\\n4️⃣ עדיין לא בטוח';
    } else {
      choice = 'free_text'; temperature = 'warm'; newStep = 'handoff';
      responseMessage = 'תודה! 🙂 נציג שלנו יחזור אליך בהקדם.';
    }

  } else if (flowType === 'guide_flow') {
    // Spec: 1=כבר התחלתי, 2=מתחיל בקרוב, 3=עדיין בודק
    if (num === 1 || text.includes('התחלתי')) {
      choice = 'already_started'; temperature = 'hot'; newStep = 'step2_want';
      responseMessage = 'מה היית רוצה עכשיו?\\n\\n1️⃣ להבין את השלבים\\n2️⃣ לדבר עם רואה חשבון\\n3️⃣ להתחיל פתיחה\\n4️⃣ לשאול שאלה';
    } else if (num === 2 || text.includes('בקרוב')) {
      choice = 'start_soon'; temperature = 'warm'; newStep = 'step2_want';
      responseMessage = 'מה היית רוצה עכשיו?\\n\\n1️⃣ להבין את השלבים\\n2️⃣ לדבר עם רואה חשבון\\n3️⃣ להתחיל פתיחה\\n4️⃣ לשאול שאלה';
    } else if (num === 3 || text.includes('בודק')) {
      choice = 'just_checking'; temperature = 'cold'; newStep = 'step2_want';
      responseMessage = 'מה היית רוצה עכשיו?\\n\\n1️⃣ להבין את השלבים\\n2️⃣ לדבר עם רואה חשבון\\n3️⃣ להתחיל פתיחה\\n4️⃣ לשאול שאלה';
    } else {
      choice = 'free_text'; temperature = 'warm'; newStep = 'handoff';
      responseMessage = 'תודה! 🙂 נציג שלנו יחזור אליך בהקדם.';
    }

  } else if (flowType === 'pricing_flow') {
    // Spec: מחיר כבר ניתן בפתיחה. כאן זה CTA.
    // 1=ת"ז, 2=רו"ח, 3=הצעת מחיר, 4=שאלה
    if (num === 1 || text.includes('ת"ז') || text.includes('תז') || text.includes('להתחיל')) {
      choice = 'send_docs'; temperature = 'hot'; newStep = 'collect_documents';
      responseMessage = 'מעולה! 📄\\nאפשר לשלוח צילום ת"ז (שני צדדים) כאן בצ\\'אט.\\nברגע שנקבל, נתחיל מיד בתהליך!';
    } else if (num === 2 || text.includes('לדבר') || text.includes('רואה חשבון')) {
      choice = 'talk_accountant'; temperature = 'hot'; newStep = 'booked_call';
      responseMessage = 'מצוין! 📞\\nנציג שלנו יחזור אליך בהקדם לשיחה קצרה.';
    } else if (num === 3 || text.includes('הצעת מחיר') || text.includes('הצעה')) {
      choice = 'get_quote'; temperature = 'warm'; newStep = 'requested_quote';
      responseMessage = 'נשלח לך הצעת מחיר מפורטת בהקדם! 📝';
    } else if (num === 4 || text.includes('שאלה')) {
      choice = 'ask_question'; temperature = 'warm'; newStep = 'handoff';
      responseMessage = 'בטח! שאל ונציג יחזור אליך עם תשובה 🙂';
    } else {
      choice = 'free_text'; temperature = 'warm'; newStep = 'handoff';
      responseMessage = 'תודה! 🙂 נציג שלנו יחזור אליך בהקדם.';
    }

  } else if (flowType === 'accounting_svc_flow') {
    // Spec: 1=מחיר, 2=ליווי שוטף, 3=דוח שנתי, 4=שקט נפשי
    if (num === 1 || text.includes('מחיר')) {
      choice = 'price'; temperature = 'warm'; newStep = 'step2_pricing';
      responseMessage = 'השירות כולל ליווי מול מס הכנסה, מע״מ וביטוח לאומי, דוח שנתי, מענה שוטף ואפליקציה להוצאת קבלות.\\n\\n💰 ליווי חודשי: 200 ₪ + מע״מ\\n💰 פתיחת תיק: 250 ₪ + מע״מ\\n\\n1️⃣ לשלוח ת"ז ולהתחיל\\n2️⃣ לדבר עם רואה חשבון\\n3️⃣ לקבל הצעת מחיר מדויקת';
    } else if (num === 2 || text.includes('ליווי')) {
      choice = 'ongoing_support'; temperature = 'warm'; newStep = 'step2_value';
      responseMessage = 'השירות כולל ליווי מול מס הכנסה, מע״מ וביטוח לאומי, דוח שנתי, מענה שוטף ואפליקציה להוצאת קבלות.\\n\\n1️⃣ לקבל הצעת מחיר\\n2️⃣ לדבר עם רואה חשבון\\n3️⃣ להצטרף עכשיו';
    } else if (num === 3 || text.includes('דוח')) {
      choice = 'annual_report'; temperature = 'warm'; newStep = 'step2_value';
      responseMessage = 'השירות כולל דוח שנתי מלא, ליווי שוטף ומענה לכל שאלה.\\n\\n1️⃣ לקבל הצעת מחיר\\n2️⃣ לדבר עם רואה חשבון\\n3️⃣ להצטרף עכשיו';
    } else if (num === 4 || text.includes('שקט') || text.includes('נפשי')) {
      choice = 'peace_of_mind'; temperature = 'hot'; newStep = 'step2_value';
      responseMessage = 'אנחנו מטפלים בהכל — מע״מ, מס הכנסה, ביטוח לאומי, דוח שנתי ומענה שוטף. אתה יכול להתרכז בעסק.\\n\\n1️⃣ לקבל הצעת מחיר\\n2️⃣ לדבר עם רואה חשבון\\n3️⃣ להצטרף עכשיו';
    } else {
      choice = 'free_text'; temperature = 'warm'; newStep = 'handoff';
      responseMessage = 'תודה! 🙂 נציג שלנו יחזור אליך בהקדם.';
    }
  }
}

// ========== STEP 2 RESPONSES ==========
else if (currentStep === 'step2_field') {
  // Spec: שלב 2 — תחום פעילות
  // 1=שירותים, 2=מוצרים, 3=מקצוע חופשי, 4=אחר/לא בטוח
  if (num === 1) choice = 'services';
  else if (num === 2) choice = 'products';
  else if (num === 3) choice = 'profession';
  else choice = 'other';
  temperature = temperature || 'warm';
  newStep = 'cta';

  // CTA — הודעת מעבר
  responseMessage = 'מעולה 👍\\nאפשר להתקדם עכשיו:\\n\\n1️⃣ 📄 לשלוח ת"ז ולהתחיל\\n2️⃣ 📞 לקבוע שיחה קצרה\\n3️⃣ ❓ לשאול שאלה';
}

else if (currentStep === 'step2_want') {
  // guide_flow שלב 2: "מה היית רוצה?"
  // 1=להבין שלבים, 2=לדבר רו"ח, 3=להתחיל, 4=שאלה
  if (num === 1 || text.includes('שלבים') || text.includes('להבין')) {
    choice = 'understand_steps'; newStep = 'explained';
    responseMessage = 'בגדול התהליך כולל פתיחה מול:\\n• מע״מ\\n• מס הכנסה\\n• ביטוח לאומי\\n\\nאנחנו יכולים ללוות אותך בכל השלבים כדי שלא יהיו טעויות או עיכובים.\\n\\n1️⃣ 📞 לדבר עם רואה חשבון\\n2️⃣ 📄 להתחיל פתיחת תיק\\n3️⃣ ❓ לשאול שאלה';
  } else if (num === 2 || text.includes('לדבר') || text.includes('רואה חשבון')) {
    choice = 'talk_accountant'; temperature = 'hot'; newStep = 'booked_call';
    responseMessage = 'מצוין! 📞\\nנציג שלנו יחזור אליך בהקדם לשיחה קצרה.';
  } else if (num === 3 || text.includes('להתחיל') || text.includes('פתיחה')) {
    choice = 'start_opening'; temperature = 'hot'; newStep = 'collect_documents';
    responseMessage = 'מעולה! 📄\\nכדי להתחיל, נצטרך צילום תעודת זהות (שני צדדים).\\nאפשר לשלוח כאן בצ\\'אט.';
  } else if (num === 4 || text.includes('שאלה')) {
    choice = 'ask_question'; newStep = 'handoff';
    responseMessage = 'בטח! שאל ונציג יחזור אליך עם תשובה 🙂';
  } else {
    choice = 'free_text'; newStep = 'handoff';
    responseMessage = 'תודה! 🙂 נציג שלנו יחזור אליך בהקדם.';
  }
}

// ========== CTA / STEP 3 RESPONSES ==========
else if (['cta', 'step2_pricing', 'step2_value', 'explained'].includes(currentStep)) {
  if (num === 1 || text.includes('ת"ז') || text.includes('תז') || text.includes('לשלוח') || text.includes('להתחיל') || text.includes('להצטרף')) {
    choice = 'send_docs'; temperature = 'hot'; newStep = 'collect_documents';
    responseMessage = 'מעולה! 📄\\nאפשר לשלוח צילום ת"ז (שני צדדים) כאן בצ\\'אט.\\nברגע שנקבל, נתחיל מיד!';
  } else if (num === 2 || text.includes('שיחה') || text.includes('לדבר') || text.includes('רואה חשבון') || text.includes('לקבוע')) {
    choice = 'book_call'; temperature = 'hot'; newStep = 'booked_call';
    responseMessage = 'מצוין! 📞\\nנציג שלנו יחזור אליך בהקדם לשיחה קצרה.';
  } else if (num === 3 || text.includes('שאלה') || text.includes('הצעה') || text.includes('הצעת מחיר')) {
    choice = 'ask_or_quote'; newStep = 'handoff';
    responseMessage = 'בהחלט! נציג יחזור אליך בהקדם 🙂';
  } else {
    choice = 'free_text'; newStep = 'handoff';
    responseMessage = 'תודה! 🙂 נציג שלנו יחזור אליך בהקדם.';
  }
}

// ========== DEFAULT ==========
else {
  choice = 'free_text'; newStep = 'handoff';
  responseMessage = 'תודה! 🙂 נציג שלנו יחזור אליך בהקדם.';
}

// Outcome state
let outcomeState = null;
if (newStep === 'booked_call') outcomeState = 'booked_call';
if (newStep === 'collect_documents') outcomeState = 'sent_documents';
if (newStep === 'requested_quote') outcomeState = 'requested_quote';
if (newStep === 'handoff') outcomeState = 'handoff_to_agent';

return [{ json: {
  is_sales: true,
  phone, chatId, sessionId, leadId,
  choice, temperature, nextAction: newStep, responseMessage, outcomeState,
  current_step: newStep,
  user_text: userText,
  flow_type: flowType
}}];
`;

async function main() {
  // ===== Update CRM Bot =====
  console.log('Updating CRM Bot...');
  const crm = await api('GET', '/workflows/PfVBnM3Ds3I_pz9ekkYAN');
  const botNode = crm.nodes.find(n => n.name === 'Build Dynamic Bot Message');
  botNode.parameters.jsCode = OPENING_CODE;

  const crmPayload = {
    name: crm.name, nodes: crm.nodes, connections: crm.connections,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner' }
  };
  const crmResult = await api('PUT', '/workflows/PfVBnM3Ds3I_pz9ekkYAN', crmPayload);
  console.log('CRM Bot:', crmResult.active ? 'active' : 'error', '| Nodes:', crmResult.nodes?.length);

  // ===== Update bot-v5 Handle Sales Response =====
  console.log('Updating bot-v5...');
  const v5 = await api('GET', '/workflows/1OxdM_TyMM44VATmedDUn');
  const handleNode = v5.nodes.find(n => n.name === 'Handle Sales Response');
  handleNode.parameters.jsCode = RESPONSE_CODE;

  const v5Payload = {
    name: v5.name, nodes: v5.nodes, connections: v5.connections,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner' }
  };
  const v5Result = await api('PUT', '/workflows/1OxdM_TyMM44VATmedDUn', v5Payload);
  console.log('bot-v5:', v5Result.active ? 'active' : 'error', '| Nodes:', v5Result.nodes?.length);

  console.log('Done!');
}

main().catch(console.error);
