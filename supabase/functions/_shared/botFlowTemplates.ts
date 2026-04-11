// Bot Flow Templates — message templates per flow_type
// Based on docs/bot-flow-engine-spec.md sections 5-7

export interface BotButton {
  id: string;
  label: string;
  temperature_signal?: string;
  action?: string;
}

export interface BotStep {
  step_id: string;
  question: string;
  buttons: BotButton[];
  crm_field: string;
}

export interface BotFlow {
  flow_type: string;
  goal: string;
  tone: string;
  max_steps: number;
  steps: BotStep[];
}

// ============================================================================
// SERVICE COPY VARIANTS — שפת השירות לכל service_type
// ============================================================================
// במקום שלכל flow יהיה עותק נפרד, שומרים "וריאנט קופי" לפי service_type.
// buildServiceOpening() מחזיר פתיחה ייעודית לפי service_type כך שליד שהגיע
// מעמוד עוסק זעיר מקבל את כל ההודעות במינוח של זעיר, וליד מעוסק פטור מקבל
// פטור. כל ערך כאן הוא נקודת אמת יחידה לניסוחים של אותו מסלול.
// ============================================================================
export interface ServiceCopy {
  service_name: string;           // "עוסק פטור" / "עוסק זעיר"
  service_name_with_action: string; // "פתיחת עוסק פטור" / "פתיחת עוסק זעיר"
  opening_intro: string;          // פתיחה עם שם + ברכה
  opening_value: string;          // שורת ערך אחרי הפתיחה
  open_now_cta: string;           // כפתור "להתחיל עכשיו"
  callback_cta: string;           // כפתור "לדבר עם רואה חשבון"
  question_cta: string;           // כפתור "לשאול שאלה"
  payment_success: string;        // הודעה אחרי תשלום מוצלח
  payment_recovery: string;       // הודעת follow-up אחרי אי השלמת תשלום
  questionnaire_intro: string;    // פתיח שאלון אחרי תשלום
}

export const SERVICE_COPY: Record<string, ServiceCopy> = {
  open_osek_patur: {
    service_name: 'עוסק פטור',
    service_name_with_action: 'פתיחת עוסק פטור',
    opening_intro: 'ראיתי שהשארת פרטים לגבי פתיחת עוסק פטור.',
    opening_value: 'אני כאן לעזור לך להתחיל בצורה מסודרת מול מע״מ, מס הכנסה וביטוח לאומי. רק כמה שאלות קצרות כדי להתחיל.\n\nכבר מעל 5,000 עצמאים נעזרו בשירות.',
    open_now_cta: '🚀 לפתוח עוסק פטור עכשיו',
    callback_cta: '📞 לדבר עם רואה חשבון על עוסק פטור',
    question_cta: '❓ יש לי שאלה על עוסק פטור',
    payment_success: 'קיבלנו את התשלום עבור פתיחת עוסק פטור ✅\nמתחילים לטפל בתיק שלך. נחזור אליך בהקדם עם השלב הבא.',
    payment_recovery: 'ראיתי שהתחלת תהליך פתיחת עוסק פטור אבל לא סיימת את התשלום. רוצה שנשלח לך שוב את הקישור?',
    questionnaire_intro: 'כדי לפתוח את תיק העוסק הפטור שלך כמו שצריך, אשמח שתענה על כמה שאלות קצרות.',
  },
  open_osek_zeir: {
    service_name: 'עוסק זעיר',
    service_name_with_action: 'פתיחת עוסק זעיר',
    opening_intro: 'ראיתי שהשארת פרטים לגבי פתיחת עוסק זעיר.',
    opening_value: 'אני כאן לעזור לך להתחיל את המסלול הזעיר בצורה מסודרת — מסלול מוזל ופשוט לעצמאים קטנים בתחילת הדרך. רק כמה שאלות קצרות כדי להתחיל.',
    open_now_cta: '🚀 לפתוח עוסק זעיר עכשיו',
    callback_cta: '📞 לדבר עם רואה חשבון על עוסק זעיר',
    question_cta: '❓ יש לי שאלה על עוסק זעיר',
    payment_success: 'קיבלנו את התשלום עבור פתיחת עוסק זעיר ✅\nמתחילים לטפל במסלול הזעיר שלך. נחזור אליך בהקדם עם השלב הבא.',
    payment_recovery: 'ראיתי שהתחלת תהליך פתיחת עוסק זעיר אבל לא סיימת את התשלום. רוצה שנשלח לך שוב את הקישור למסלול הזעיר?',
    questionnaire_intro: 'כדי לפתוח את תיק העוסק הזעיר שלך כמו שצריך, אשמח שתענה על כמה שאלות קצרות.',
  },
};

/**
 * מחזיר את וריאנט הקופי של מסלול ספציפי. אם service_type לא מוכר —
 * מחזיר null (הקוד הקורא ייפול חזרה לניסוח ג'נרי מבוסס page_intent).
 */
export function getServiceCopy(serviceType?: string): ServiceCopy | null {
  if (!serviceType) return null;
  return SERVICE_COPY[serviceType] || null;
}

/**
 * בונה הודעת פתיחה מלאה לליד לפי service_type. שימוש נכון בפונקציה הזאת
 * מבטיח שליד שהגיע מעוסק פטור יקבל ניסוחי פטור, וליד מעוסק זעיר יקבל
 * ניסוחי זעיר — ללא ערבוב.
 */
export function buildServiceOpening(leadName: string, serviceType: string): string | null {
  const copy = getServiceCopy(serviceType);
  if (!copy) return null;
  return `שלום ${leadName} 👋\n${copy.opening_intro}\n${copy.opening_value}`;
}

// Context phrase by intent
const CONTEXT_PHRASES: Record<string, string> = {
  service: 'השארת פרטים לגבי {{page_title}}',
  comparison: 'התעניינת בנושא {{page_title}}',
  guide: 'השארת פרטים לגבי {{page_title}}',
  pricing: 'התעניינת ב-{{page_title}}',
  accounting_service: 'התעניינת בשירות {{page_title}}',
  osek_patur_lead: 'השארת פרטים לגבי פתיחת עוסק פטור',
};

// Value phrase by intent
const VALUE_PHRASES: Record<string, string> = {
  service: 'אני כאן כדי לעזור לך להתחיל בצורה מסודרת. נשאל 2 שאלות קצרות ונתקדם.',
  comparison: 'אני יכול לעזור לך להבין מה כנראה יותר מתאים לך בכמה שאלות קצרות.',
  guide: 'אם תרצה, אני יכול לעשות לך סדר קצר בנושא ולעזור לך להתקדם בלי טעויות.',
  pricing: 'אני יכול לתת לך כיוון למחיר ולעזור לך להבין מה בדיוק כלול.',
  accounting_service: 'אני יכול להסביר לך בקצרה מה השירות כולל ולעזור לך להבין איך הכי נכון להתקדם.',
  osek_patur_lead: 'אני כאן לעזור לך להתחיל בצורה מסודרת מול מע״מ, מס הכנסה וביטוח לאומי. רק כמה שאלות קצרות כדי להתחיל.',
};

/**
 * Build opening message for a lead
 */
export function buildOpeningMessage(
  leadName: string,
  pageIntent: string,
  pageTitle: string,
): string {
  const contextTemplate = CONTEXT_PHRASES[pageIntent] || CONTEXT_PHRASES.guide;
  const valuePhrase = VALUE_PHRASES[pageIntent] || VALUE_PHRASES.guide;
  const context = contextTemplate.replace('{{page_title}}', pageTitle || 'האתר שלנו');
  return `שלום ${leadName} 👋\nראיתי ש${context}.\n${valuePhrase}`;
}

/**
 * Build pricing message
 */
export function buildPricingMessage(pricing?: { setup?: string; monthly?: string; includes?: string[] }): string {
  if (!pricing) {
    return 'לגבי מחיר — זה תלוי בסוג השירות. אשמח לתת לך הצעה מותאמת.\nמה תרצה לעשות?';
  }
  let msg = 'ברוב המקרים השירות הוא סביב:\n';
  if (pricing.setup) msg += `💰 ${pricing.setup} (חד פעמי)\n`;
  if (pricing.monthly) msg += `💰 ${pricing.monthly} לחודש\n`;
  if (pricing.includes && pricing.includes.length > 0) {
    msg += '\nזה כולל:\n';
    msg += pricing.includes.map(i => `✅ ${i}`).join('\n');
  }
  msg += '\n\nמה היית רוצה עכשיו?';
  return msg;
}

// Global buttons (available at every step)
export const GLOBAL_BUTTONS: BotButton[] = [
  { id: 'global_agent', label: '💬 לדבר עם נציג', action: 'handoff' },
  { id: 'global_question', label: '❓ לשאול שאלה', action: 'handoff' },
  { id: 'global_pricing', label: '💰 כמה זה עולה', action: 'pricing' },
  { id: 'global_start', label: '🚀 להתחיל עכשיו', action: 'cta', temperature_signal: 'hot' },
];

// CTA buttons (end of flow)
export const CTA_BUTTONS: BotButton[] = [
  { id: 'cta_documents', label: '📄 לשלוח ת"ז ולהתחיל', action: 'cta', temperature_signal: 'hot' },
  { id: 'cta_call', label: '📞 לקבוע שיחה קצרה', action: 'cta' },
  { id: 'cta_question', label: '❓ לשאול שאלה', action: 'handoff' },
  { id: 'cta_pricing', label: '💰 כמה זה עולה', action: 'pricing' },
];

// ==============================
// FLOW DEFINITIONS
// ==============================

const SERVICE_FLOW: BotFlow = {
  flow_type: 'service_flow',
  goal: 'lead to action — send ID, call, or start process',
  tone: 'שירותי, ישיר, מקצועי',
  max_steps: 2,
  steps: [
    {
      step_id: 'step_1',
      question: 'איפה אתה נמצא בתהליך?',
      buttons: [
        { id: 'start_now', label: '🚀 רוצה להתחיל עכשיו', temperature_signal: 'hot' },
        { id: 'start_soon', label: '📅 מתחיל בקרוב', temperature_signal: 'warm' },
        { id: 'just_checking', label: '🔍 רק בודק מידע', temperature_signal: 'cold' },
      ],
      crm_field: 'bot_first_answer',
    },
    {
      step_id: 'step_2',
      question: 'מה תחום הפעילות שלך?',
      buttons: [
        { id: 'services', label: '💼 שירותים / פרילנס' },
        { id: 'products', label: '📦 מכירת מוצרים' },
        { id: 'profession', label: '🎓 מקצוע חופשי' },
        { id: 'other', label: '✏️ אחר' },
      ],
      crm_field: 'bot_second_answer',
    },
  ],
};

const COMPARISON_FLOW: BotFlow = {
  flow_type: 'comparison_flow',
  goal: 'advise, build trust, lead to consultation call',
  tone: 'ייעוצי, סבלני, לא דוחף',
  max_steps: 3,
  steps: [
    {
      step_id: 'step_1',
      question: 'מתי אתה מתכנן להתחיל את העסק?',
      buttons: [
        { id: 'weeks', label: '📅 בשבועות הקרובים', temperature_signal: 'hot' },
        { id: 'months', label: '🗓️ בחודשים הקרובים', temperature_signal: 'warm' },
        { id: 'checking', label: '🔍 רק בודק אפשרויות', temperature_signal: 'cold' },
      ],
      crm_field: 'bot_first_answer',
    },
    {
      step_id: 'step_2',
      question: 'מה תחום הפעילות שלך?',
      buttons: [
        { id: 'services', label: '💼 שירותים / פרילנס' },
        { id: 'products', label: '📦 מכירת מוצרים' },
        { id: 'profession', label: '🎓 מקצוע חופשי' },
        { id: 'not_sure', label: '❓ עדיין לא בטוח' },
      ],
      crm_field: 'bot_second_answer',
    },
    {
      step_id: 'step_3',
      question: 'כמה אתה מעריך שתכניס בשנה?',
      buttons: [
        { id: 'under_120k', label: '💰 עד 120,000 ₪' },
        { id: '120k_300k', label: '💰💰 120,000–300,000 ₪' },
        { id: 'over_300k', label: '💰💰💰 מעל 300,000 ₪' },
        { id: 'unknown', label: '🤷 עדיין לא יודע' },
      ],
      crm_field: 'bot_third_answer',
    },
  ],
};

const GUIDE_FLOW: BotFlow = {
  flow_type: 'guide_flow',
  goal: 'transition from information consumption to action',
  tone: 'עוזר, מסביר, נעים',
  max_steps: 2,
  steps: [
    {
      step_id: 'step_1',
      question: 'מה הכי חשוב לך עכשיו?',
      buttons: [
        { id: 'advance_now', label: '🚀 רוצה להתקדם עכשיו', temperature_signal: 'hot' },
        { id: 'talk_expert', label: '📞 לדבר עם מומחה', temperature_signal: 'warm' },
        { id: 'info_only', label: '🔍 רק מחפש מידע', temperature_signal: 'cold' },
      ],
      crm_field: 'bot_first_answer',
    },
    {
      step_id: 'step_2',
      question: 'מה היית רוצה עכשיו?',
      buttons: [
        { id: 'understand_steps', label: '📋 להבין את השלבים' },
        { id: 'talk_accountant', label: '📞 לדבר עם רואה חשבון' },
        { id: 'start_opening', label: '🚀 להתחיל פתיחה' },
        { id: 'ask_question', label: '❓ לשאול שאלה' },
      ],
      crm_field: 'bot_second_answer',
    },
  ],
};

const PRICING_FLOW: BotFlow = {
  flow_type: 'pricing_flow',
  goal: 'quick price answer then CTA',
  tone: 'ישיר, שקוף',
  max_steps: 1,
  steps: [
    {
      step_id: 'step_1',
      question: 'מה היית רוצה עכשיו?',
      buttons: [
        { id: 'get_quote', label: '📝 לקבל הצעת מחיר מדויקת' },
        { id: 'talk_accountant', label: '📞 לדבר עם רואה חשבון' },
        { id: 'start_now', label: '🚀 להתחיל פתיחה', temperature_signal: 'hot' },
        { id: 'ask_question', label: '❓ לשאול שאלה' },
      ],
      crm_field: 'bot_first_answer',
    },
  ],
};

const ACCOUNTING_SVC_FLOW: BotFlow = {
  flow_type: 'accounting_svc_flow',
  goal: 'lead to quote, call, or signup',
  tone: 'מקצועי, מציע ערך',
  max_steps: 2,
  steps: [
    {
      step_id: 'step_1',
      question: 'מה הכי חשוב לך כרגע?',
      buttons: [
        { id: 'price', label: '💰 מחיר', action: 'pricing' },
        { id: 'ongoing_support', label: '🤝 ליווי שוטף', temperature_signal: 'warm' },
        { id: 'annual_report', label: '📊 דוח שנתי', temperature_signal: 'warm' },
        { id: 'peace_of_mind', label: '😌 שקט נפשי', temperature_signal: 'hot' },
      ],
      crm_field: 'bot_first_answer',
    },
    {
      step_id: 'step_2',
      question: 'יש לך כבר עוסק פטור פעיל?',
      buttons: [
        { id: 'yes_active', label: '✅ כן' },
        { id: 'not_yet', label: '❌ עדיין לא' },
        { id: 'in_process', label: '🔄 בתהליך פתיחה' },
      ],
      crm_field: 'bot_second_answer',
    },
  ],
};

const OSEK_PATUR_UNIVERSAL_FLOW: BotFlow = {
  flow_type: 'osek_patur_universal_flow',
  goal: 'lead new osek patur prospects to action with proven conversion flow',
  tone: 'שירותי, ישיר, תומך',
  max_steps: 3,
  steps: [
    {
      step_id: 'step_1',
      question: 'איפה אתה נמצא בתהליך?',
      buttons: [
        { id: 'already_working', label: '✅ כבר עובד ורוצה לפתוח תיק', temperature_signal: 'hot' },
        { id: 'starting_soon', label: '📅 מתחיל בקרוב', temperature_signal: 'warm' },
        { id: 'just_checking', label: '🔍 רק בודק מידע', temperature_signal: 'cold' },
      ],
      crm_field: 'bot_first_answer',
    },
    {
      step_id: 'step_2',
      question: 'מה תחום הפעילות שלך?',
      buttons: [
        { id: 'services', label: '💼 שירותים / פרילנס' },
        { id: 'products', label: '📦 מכירת מוצרים' },
        { id: 'profession', label: '🎓 מקצוע חופשי' },
        { id: 'other', label: '✏️ אחר' },
      ],
      crm_field: 'bot_second_answer',
    },
    {
      step_id: 'step_3',
      question: 'איך תרצה להתקדם?',
      buttons: [
        { id: 'talk_accountant', label: '📞 לדבר עם רואה חשבון', temperature_signal: 'warm' },
        { id: 'start_process', label: '📄 להתחיל פתיחת תיק', temperature_signal: 'hot' },
        { id: 'ask_question', label: '❓ לשאול שאלה', temperature_signal: 'cold' },
      ],
      crm_field: 'bot_third_answer',
    },
  ],
};

const GENERIC_FLOW: BotFlow = {
  flow_type: 'generic_flow',
  goal: 'identify need and route to appropriate flow',
  tone: 'ידידותי, פתוח',
  max_steps: 1,
  steps: [
    {
      step_id: 'step_1',
      question: 'במה אוכל לסייע?',
      buttons: [
        { id: 'open_business', label: '🏢 פתיחת עסק' },
        { id: 'not_sure', label: '🤔 לא יודע מה מתאים לי' },
        { id: 'talk_expert', label: '📞 לדבר עם מומחה' },
        { id: 'hear_price', label: '💰 לשמוע מחיר' },
      ],
      crm_field: 'bot_first_answer',
    },
  ],
};

// Accountant callback flow — triggered after lead picks "talk to accountant"
// 5 free-text questions to profile the lead before the real call
export const SERVICES_PDF_URL = 'https://rtlpqjqdmomyptcdkmrq.supabase.co/storage/v1/object/public/public-assets/perfect-one-services.pdf';

export const ACCOUNTANT_CALLBACK_FLOW: BotFlow = {
  flow_type: 'accountant_callback_flow',
  goal: 'Keep the lead engaged + collect profile info before accountant calls back',
  tone: 'מנומס, אנושי, קצר',
  max_steps: 4,
  steps: [
    {
      step_id: 'ac_q1',
      question: 'באיזה תחום העסק שאתה רוצה לפתוח? 🎯\n\nלדוגמה: שיווק, בנייה, קוסמטיקה, אונליין, ייעוץ, קמעונאות...',
      buttons: [],
      crm_field: 'business_field',
    },
    {
      step_id: 'ac_q2',
      question: 'איך חשבת להביא לקוחות לעסק? 🚀\n\nלדוגמה:\n• פרסום בגוגל / פייסבוק\n• אינסטגרם / טיקטוק\n• המלצות מחברים\n• עבודה מול חברות',
      buttons: [],
      crm_field: 'lead_gen_plan',
    },
    {
      step_id: 'ac_q3',
      question: 'מה המטרה העסקית שלך בשנה הקרובה? 💼\n\nלדוגמה:\n• הכנסה נוספת לצד העבודה\n• עסק עיקרי / עצמאי במשרה מלאה\n• להגיע להכנסה חודשית מסוימת',
      buttons: [],
      crm_field: 'yearly_goal',
    },
    {
      step_id: 'ac_q4',
      question: 'איך חשבת להגיע למטרה הזו? 🛤️\n\nאפשר לשתף בקצרה — איזה צעדים תכננת לקחת?',
      buttons: [],
      crm_field: 'goal_plan',
    },
  ],
};

/**
 * Pre-payment recovery flow — triggered 7 min after lead clicks pay link
 * but hasn't completed payment. 5 free-text questions to keep them engaged.
 */
export const PRE_PAYMENT_RECOVERY_FLOW: BotFlow = {
  flow_type: 'pre_payment_recovery_flow',
  goal: 'Re-engage abandoned checkout + collect qualifying info',
  tone: 'אמפתי, לא לוחץ, אנושי',
  max_steps: 5,
  steps: [
    { step_id: 'pp_q1', question: 'באיזה תחום העסק שאתה רוצה לפתוח? 🎯', buttons: [], crm_field: 'business_field' },
    { step_id: 'pp_q2', question: 'מה השירות או המוצר שאתה מתכנן למכור? 🛍️', buttons: [], crm_field: 'offer_type' },
    { step_id: 'pp_q3', question: 'איך חשבת להביא לקוחות לעסק? 🚀', buttons: [], crm_field: 'lead_gen_plan' },
    { step_id: 'pp_q4', question: 'מה המטרה שלך בחודשים הקרובים? 💼', buttons: [], crm_field: 'near_term_goal' },
    { step_id: 'pp_q5', question: 'יש משהו שחשוב לנו לדעת מראש כדי לעזור לך נכון? 💡', buttons: [], crm_field: 'important_notes' },
  ],
};

export function buildPrePaymentRecoveryOpening(leadName: string): string {
  const name = leadName || '';
  return `שלום ${name} 👋\n\nראיתי שהתחלת את התהליך לפתיחת תיק אונליין אבל עדיין לא הושלם התשלום.\n\nבינתיים, כדי שנוכל להכיר את העסק שלך טוב יותר ולהתקדם מהר יותר, אשמח לשאול אותך כמה שאלות קצרות 👇`;
}

export function buildPrePaymentRecoveryClosing(): string {
  return `תודה רבה על השיתוף 🙏\n\nכשתהיה מוכן, הנה שוב הקישור לפתיחת התיק:\n👉 https://perfect1.co.il/open-osek-patur-online\n\nאם יש לך שאלה — אני כאן 💬`;
}

/**
 * Post-payment onboarding flow — triggered 7 min after successful payment
 * to deeply understand the business for better service delivery.
 */
export const POST_PAYMENT_ONBOARDING_FLOW: BotFlow = {
  flow_type: 'post_payment_onboarding_flow',
  goal: 'Deep-dive into business profile after payment for service delivery',
  tone: 'ברוך הבא, מקצועי, מעניין',
  max_steps: 5,
  steps: [
    { step_id: 'po_q1', question: 'מה תחום הפעילות שלך? 🎯', buttons: [], crm_field: 'business_field' },
    { step_id: 'po_q2', question: 'מה בדיוק אתה מתכנן למכור או איזה שירות לתת? 🛍️', buttons: [], crm_field: 'offer_type' },
    { step_id: 'po_q3', question: 'האם כבר התחלת לפעול או שאתה רק בתחילת הדרך? 🏁', buttons: [], crm_field: 'business_stage' },
    { step_id: 'po_q4', question: 'איך אתה מתכנן להביא לקוחות? 🚀', buttons: [], crm_field: 'lead_gen_plan' },
    { step_id: 'po_q5', question: 'מה המטרה שלך מהעסק בתקופה הקרובה? 💼', buttons: [], crm_field: 'short_term_goal' },
  ],
};

export function buildPostPaymentOnboardingOpening(leadName: string): string {
  const name = leadName || '';
  return `שלום ${name} 👋\n\nכדי שנפתח עבורך את התיק בצורה מדויקת ונכיר את הפעילות שלך טוב יותר, אשמח לשאול אותך כמה שאלות קצרות 👇`;
}

export function buildPostPaymentOnboardingClosing(): string {
  return `מעולה, תודה על כל המידע 🙏\n\nאנחנו כבר מתחילים לטפל בפתיחת התיק שלך.\nתוך 72 שעות התיק יהיה פתוח ומוכן לעבודה 🚀\n\nאם יש לך שאלה בדרך — אני כאן 💬`;
}

/**
 * Free Question Mode — lead asks free-text questions, bot answers,
 * then (after 1-2 answers) gently offers a next action.
 */
export const FREE_QUESTION_FLOW: BotFlow = {
  flow_type: 'free_question_flow',
  goal: 'Answer questions + recover the sale. Never dead-end.',
  tone: 'אנושי, עוזר, לא אגרסיבי',
  max_steps: 999,
  steps: [],
};

// Sales-recovery menu shown periodically in free_question_mode
export const SALES_RECOVERY_BUTTONS: BotButton[] = [
  { id: 'recovery_pay', label: '💳 לפתוח תיק אונליין', action: 'cta', temperature_signal: 'hot' },
  { id: 'recovery_call', label: '📞 לדבר עם רואה חשבון', action: 'cta' },
  { id: 'recovery_keep_asking', label: '❓ להמשיך לשאול כאן' },
];

/**
 * Build a sales-recovery follow-up after answering a free question.
 */
export function buildSalesRecoveryMessage(): string {
  return `כדי שאוכל לכוון אותך הכי נכון, אשמח להבין מה הכי רלוונטי לך כרגע 👇`;
}

/**
 * Generic helpful fallback answer when we can't match the question.
 */
export function buildGenericAnswer(): string {
  return `שאלה מצוינת 👍\nאני כאן לענות על כל שאלה לגבי פתיחת עוסק פטור, מיסוי, הנהלת חשבונות, ועוד.\nאפשר לשאול אותי בחופשיות — או לעבור ישר לפעולה:`;
}

/**
 * Map recovery button → next action
 */
export function recoveryButtonToAction(buttonId: string): 'pay' | 'accountant' | 'keep_asking' | null {
  switch (buttonId) {
    case 'recovery_pay': return 'pay';
    case 'recovery_call': return 'accountant';
    case 'recovery_keep_asking': return 'keep_asking';
    default: return null;
  }
}

// Flow map
const FLOW_MAP: Record<string, BotFlow> = {
  osek_patur_universal_flow: OSEK_PATUR_UNIVERSAL_FLOW,
  service_flow: SERVICE_FLOW,
  comparison_flow: COMPARISON_FLOW,
  guide_flow: GUIDE_FLOW,
  pricing_flow: PRICING_FLOW,
  accounting_svc_flow: ACCOUNTING_SVC_FLOW,
  generic_flow: GENERIC_FLOW,
  accountant_callback_flow: ACCOUNTANT_CALLBACK_FLOW,
  free_question_flow: FREE_QUESTION_FLOW,
  pre_payment_recovery_flow: PRE_PAYMENT_RECOVERY_FLOW,
  post_payment_onboarding_flow: POST_PAYMENT_ONBOARDING_FLOW,
};

/**
 * Get flow definition by flow_type
 */
export function getFlow(flowType: string): BotFlow {
  return FLOW_MAP[flowType] || GENERIC_FLOW;
}

/**
 * Get step from flow by step_id
 */
export function getStep(flowType: string, stepId: string): BotStep | undefined {
  const flow = getFlow(flowType);
  return flow.steps.find(s => s.step_id === stepId);
}

/**
 * Get next step ID (or 'cta' if no more steps)
 */
export function getNextStepId(flowType: string, currentStepId: string): string {
  const flow = getFlow(flowType);
  const idx = flow.steps.findIndex(s => s.step_id === currentStepId);
  if (idx < 0 || idx >= flow.steps.length - 1) return 'cta';
  return flow.steps[idx + 1].step_id;
}

/**
 * Build CTA message based on temperature
 */
export function buildCtaMessage(temperature: string): { text: string; buttons: BotButton[] } {
  if (temperature === 'hot') {
    return {
      text: 'מעולה 👍\nאפשר להתקדם עכשיו באחת מהדרכים הבאות:',
      buttons: [
        { id: 'cta_documents', label: '📄 לשלוח ת"ז ולהתחיל', action: 'cta', temperature_signal: 'hot' },
        { id: 'cta_call', label: '📞 לקבוע שיחה קצרה', action: 'cta' },
        { id: 'cta_question', label: '❓ לשאול שאלה', action: 'handoff' },
      ],
    };
  }
  if (temperature === 'warm') {
    return {
      text: 'אשמח לעזור! מה מתאים לך?',
      buttons: [
        { id: 'cta_call', label: '📞 שיחה עם מומחה', action: 'cta' },
        { id: 'cta_quote', label: '💰 הצעת מחיר', action: 'pricing' },
        { id: 'cta_question', label: '❓ לשאול שאלה', action: 'handoff' },
      ],
    };
  }
  // cold
  return {
    text: 'אני כאן אם תצטרך עזרה 🙂',
    buttons: [
      { id: 'cta_call', label: '📞 לדבר עם מומחה', action: 'cta' },
      { id: 'cta_question', label: '❓ לשאול שאלה', action: 'handoff' },
    ],
  };
}

/**
 * Build accountant-callback opening message (sent immediately after lead picks "talk to accountant")
 * Includes the services PDF link so they can see what we offer while waiting.
 */
export function buildAccountantCallbackOpening(leadName: string): string {
  const name = leadName || '';
  return `שלום ${name} 👋\n\nמצוין, רואה חשבון מהמשרד יחזור אליך בהקדם לשיחה קצרה.\n\nבינתיים כדי שתכיר אותנו קצת יותר — כאן תוכל לראות את כל השירותים שלנו:\n👉 ${SERVICES_PDF_URL}\n\nוכדי שנוכל לעזור לך בצורה הכי מדויקת בשיחה עם רואה החשבון, אשמח להכיר קצת את התוכנית שלך. אפשר לענות כאן בכמה מילים 👇`;
}

/**
 * Optional conversion tip after first question (shared by social proof)
 */
export function buildAccountantQ1Followup(): string {
  return `אגב — הרבה אנשים שפותחים עוסק פטור עושים את זה כי הם רוצים להתחיל להכניס כסף כבר בחודשים הקרובים 💰\nמעניין לשמוע מה הכיוון שלך.`;
}

/**
 * Build final thank-you message after all 4 questions
 */
export function buildAccountantCallbackClosing(): string {
  return `מעולה, תודה על השיתוף 🙏\n\nזה יעזור לרואה החשבון להבין בדיוק איך לעזור לך.\nנעדכן אותו בפרטים ששלחת והוא יחזור אליך בהקדם.\n\nאם יש לך שאלה בינתיים — אפשר לשאול כאן 💬`;
}

/**
 * Map button click to outcome_state
 */
export function buttonToOutcome(buttonId: string): string | null {
  const map: Record<string, string> = {
    cta_documents: 'sent_documents',
    cta_call: 'booked_call',
    cta_question: 'asked_question',
    cta_quote: 'requested_quote',
    cta_pricing: 'requested_quote',
    global_agent: 'handoff_to_agent',
    global_question: 'asked_question',
    global_start: 'started_checkout',
    start_now: 'started_checkout',
    start_process: 'started_checkout',
    talk_accountant: 'booked_call',
    talk_expert: 'booked_call',
    ask_question: 'asked_question',
    get_quote: 'requested_quote',
  };
  return map[buttonId] || null;
}
