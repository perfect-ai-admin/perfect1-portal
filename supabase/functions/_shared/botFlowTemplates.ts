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

// Flow map
const FLOW_MAP: Record<string, BotFlow> = {
  osek_patur_universal_flow: OSEK_PATUR_UNIVERSAL_FLOW,
  service_flow: SERVICE_FLOW,
  comparison_flow: COMPARISON_FLOW,
  guide_flow: GUIDE_FLOW,
  pricing_flow: PRICING_FLOW,
  accounting_svc_flow: ACCOUNTING_SVC_FLOW,
  generic_flow: GENERIC_FLOW,
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
