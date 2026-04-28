// Growth Mentor — High-Performance Revenue Engine for cold leads
// (pipeline_stage = not_interested / no_answer / nurture_alt / follow_up).
//
// Behavior model:
//   1. Pattern-based intent classifier (Hebrew)
//   2. Conversation-stage awareness (early / mid / late)
//   3. Memory: references prior pain points + topics from lead_events
//   4. 4-beat response structure: ack → insight → directional question → soft next step
//   5. Diagnostic micro-questions: present 2 options to surface the real bottleneck
//   6. Soft expert-handoff at engagement≥2 OR direct interest
//   7. Hard stop on negative intent
//
// Pattern-only on purpose — response time stays <2s, zero variable cost.
// Templates carry the quality. LLM upgrade is a future option behind a flag.

export type GrowthIntent =
  | 'lead_generation_problem'
  | 'marketing_question'
  | 'business_growth'
  | 'automation_interest'
  | 'closing_problem'      // NEW: trouble closing leads (vs bringing them)
  | 'pricing_problem'      // NEW: pricing / margin issues
  | 'time_problem'         // NEW: too busy, no time
  | 'direct_interest'
  | 'negative_stop'
  | 'confusion';

export type ConversationStage = 'early' | 'mid' | 'late';

export interface GrowthContext {
  engagementCount: number;
  leadScore: number;
  leadName?: string;
  businessType?: string;
  previousIntents: GrowthIntent[];
  previousTopics: string[];
}

export interface GrowthResponse {
  message: string;
  buttons: { id: string; label: string }[];
  escalate: boolean;
  intent: GrowthIntent;
  topic: string;
  stage: ConversationStage;
}

// ============================================================
// INTENT CLASSIFIER
// ============================================================
const STOP_PATTERNS = [
  /תפסיק/, /תפסיקו/, /די\b/, /עזוב/, /עזבו/, /לא רוצה/, /אל תפנו/,
  /מסיר/, /להסיר/, /הסר/, /unsubscribe/i, /stop/i,
];

const LEAD_GEN_PATTERNS = [
  /אין לי לקוחות/, /אין לקוחות/, /לא מגיעים לקוחות/, /אין פניות/,
  /חסר לי לקוחות/, /אין מי שיקנה/, /קשה למצוא לקוחות/, /לידים/,
];

const CLOSING_PATTERNS = [
  /לא סוגר/, /לא סגרתי/, /קשה לסגור/, /לא הופכים ללקוח/,
  /באים ובורחים/, /שואלים ולא קונים/, /המרה נמוכה/,
];

const MARKETING_PATTERNS = [
  /פרסום/, /פייסבוק/, /גוגל\b/, /אינסטגרם/, /טיקטוק/, /שיווק/,
  /מודעה/, /קמפיין/, /בלי תוצאות/, /לא עובד/, /מבזבז כסף/,
];

const AUTOMATION_PATTERNS = [
  /אוטומציה/, /אוטומטי/, /\bAI\b/i, /בוט\b/, /וואצאפ אוטומטי/,
  /chatbot/i, /צ'אט/, /צאט/,
];

const GROWTH_PATTERNS = [
  /להגדיל/, /לצמוח/, /לגדול/, /להרחיב/, /לפתח/, /צמיחה/,
  /יותר הכנסה/, /להכפיל/, /העסק שלי קטן/,
];

const PRICING_PATTERNS = [
  /יקר/, /מחיר/, /אין רווח/, /מרווח/, /מתמקח/, /מורידים מחיר/,
  /לא מרוויח/, /מחירים נמוכים/,
];

const TIME_PATTERNS = [
  /אין לי זמן/, /עמוס/, /טובע/, /לא מספיק/, /רץ כל היום/,
  /שעות מטורפות/, /burnout/i,
];

const INTEREST_PATTERNS = [
  /^כן\b/, /^מעניין/, /^ספר/, /^תראה/, /רוצה לראות/, /רוצה לשמוע/,
  /איך עושים/, /איך זה/, /איך אפשר/, /אשמח לשמוע/, /נשמע מעניין/,
];

export function classifyGrowthIntent(text: string): GrowthIntent {
  const t = (text || '').trim().toLowerCase();
  if (!t) return 'confusion';
  if (STOP_PATTERNS.some((r) => r.test(t))) return 'negative_stop';
  if (INTEREST_PATTERNS.some((r) => r.test(t))) return 'direct_interest';
  if (LEAD_GEN_PATTERNS.some((r) => r.test(t))) return 'lead_generation_problem';
  if (CLOSING_PATTERNS.some((r) => r.test(t))) return 'closing_problem';
  if (PRICING_PATTERNS.some((r) => r.test(t))) return 'pricing_problem';
  if (TIME_PATTERNS.some((r) => r.test(t))) return 'time_problem';
  if (AUTOMATION_PATTERNS.some((r) => r.test(t))) return 'automation_interest';
  if (MARKETING_PATTERNS.some((r) => r.test(t))) return 'marketing_question';
  if (GROWTH_PATTERNS.some((r) => r.test(t))) return 'business_growth';
  return 'confusion';
}

// ============================================================
// STAGE COMPUTATION
// ============================================================
export function computeStage(engagementCount: number, leadScore: number): ConversationStage {
  if (engagementCount >= 3 || leadScore >= 70) return 'late';
  if (engagementCount >= 1) return 'mid';
  return 'early';
}

function shouldEscalate(intent: GrowthIntent, ctx: GrowthContext, stage: ConversationStage): boolean {
  if (intent === 'direct_interest') return true;
  if (stage === 'late') return true;
  if (ctx.engagementCount >= 2 && intent !== 'confusion') return true;
  return false;
}

// Map an intent to a stable "topic" keyword stored on lead_events.
function topicFor(intent: GrowthIntent): string {
  const m: Record<GrowthIntent, string> = {
    lead_generation_problem: 'lead_generation',
    closing_problem: 'closing',
    marketing_question: 'marketing',
    automation_interest: 'automation',
    business_growth: 'growth',
    pricing_problem: 'pricing',
    time_problem: 'time',
    direct_interest: 'interest',
    negative_stop: 'opt_out',
    confusion: 'fallback',
  };
  return m[intent] || 'fallback';
}

// ============================================================
// RESPONSE GENERATOR
// ============================================================
export function generateGrowthResponse(intent: GrowthIntent, ctx: GrowthContext): GrowthResponse {
  const stage = computeStage(ctx.engagementCount, ctx.leadScore);
  const topic = topicFor(intent);
  const name = ctx.leadName ? ctx.leadName.split(' ')[0] : '';
  const greet = name ? `${name}, ` : '';
  const escalate = shouldEscalate(intent, ctx, stage);

  // ----- Stop intent (always honored) -----
  if (intent === 'negative_stop') {
    return {
      intent, topic, stage, escalate: false, buttons: [],
      message: `ברור 👍\nלא אשלח לך יותר הודעות.\nאם תרצה בעתיד — אני כאן.`,
    };
  }

  // ----- Late stage / explicit escalate -----
  if (escalate) {
    // Reference prior pain when handing off — feels human.
    const pastTopic = ctx.previousTopics.find((t) => t !== 'fallback' && t !== 'interest');
    const memory = pastTopic
      ? buildMemoryHook(pastTopic) + '\n\n'
      : '';
    return {
      intent, topic, stage, escalate: true,
      buttons: [
        { id: 'growth_consult_yes', label: 'כן, יחזרו אליי' },
        { id: 'growth_consult_later', label: 'לא עכשיו' },
      ],
      message: `${memory}${greet}נשמע שאתה בכיוון טוב 👌\n\nבמקום לנחש — מומחה שיווק ו-AI שלנו יוכל להראות לך *בדיוק* איך לבנות את זה בעסק שלך, בלי מחויבות.\n\nרוצה שנחבר אותך?`,
    };
  }

  // ----- Stage-aware diagnostic responses -----
  if (intent === 'lead_generation_problem') {
    if (stage === 'early') {
      return {
        intent, topic, stage, escalate: false,
        buttons: [
          { id: 'diag_bringing', label: 'להביא לקוחות' },
          { id: 'diag_closing', label: 'לסגור אותם' },
        ],
        message: `${greet}הבנתי אותך 👌\n\nיש 2 דברים שבדרך כלל חוסמים עסקים:\n*1. להביא פניות.*\n*2. לסגור אותן.*\n\nאיפה אתה מרגיש שזה נתקע יותר אצלך?`,
      };
    }
    return {
      intent, topic, stage, escalate: false,
      buttons: [
        { id: 'growth_show_me', label: 'כן, ספר לי' },
        { id: 'growth_not_now', label: 'לא עכשיו' },
      ],
      message: `${greet}אז המצב הוא לא חוסר פרסום — אלא חוסר *מנגנון*.\n\n💡 הטיפ הכי משתלם: לבנות מערכת שמטפלת בכל פנייה תוך 5 דקות (אוטומטית). הזמן הזה הוא ההבדל בין סגירה לאיבוד הליד.\n\nאצלך זה רץ אוטומטי או הכל ידני?`,
    };
  }

  if (intent === 'closing_problem') {
    if (stage === 'early') {
      return {
        intent, topic, stage, escalate: false,
        buttons: [
          { id: 'diag_objection', label: 'מתנגדים על מחיר' },
          { id: 'diag_silence', label: 'נעלמים בלי תשובה' },
        ],
        message: `${greet}המרה נמוכה זה כאב מוכר 👇\n\nשני דפוסים נפוצים:\n*1. הם מתמקחים על מחיר.*\n*2. שואלים, לא חוזרים.*\n\nאיזה יותר מוכר אצלך?`,
      };
    }
    return {
      intent, topic, stage, escalate: false,
      buttons: [
        { id: 'growth_show_me', label: 'אשמח להבין' },
        { id: 'growth_not_now', label: 'לא עכשיו' },
      ],
      message: `${greet}💡 רוב הסגירות "החמות" נופלות כי אין מעקב אחרי 24 שעות.\n\nתבנית פשוטה: 3 הודעות מעקב אוטומטיות (יום 1 / 3 / 7) — מעלה המרה ב-30-50%.\n\nרוצה לראות איך זה בנוי?`,
    };
  }

  if (intent === 'marketing_question') {
    if (stage === 'early') {
      return {
        intent, topic, stage, escalate: false,
        buttons: [
          { id: 'diag_no_results', label: 'מקבל קליקים בלי לקוחות' },
          { id: 'diag_too_expensive', label: 'יקר מדי' },
        ],
        message: `${greet}פרסום זה בדרך כלל לא הבעיה האמיתית 👇\n\nשני דפוסי כשל:\n*1. קליקים שלא הופכים לפניות.*\n*2. עלות גבוהה מהשולי רווח.*\n\nאיזה יותר הסיפור שלך?`,
      };
    }
    return {
      intent, topic, stage, escalate: false,
      buttons: [
        { id: 'growth_show_me', label: 'כן, אשמח' },
        { id: 'growth_not_now', label: 'לא עכשיו' },
      ],
      message: `${greet}💡 פרסום בלי "מערכת המשך" שורף תקציב.\n\nהקטע הוא להפוך כל קליק לפנייה כשירה — Landing page חכם + טופס קצר + תגובה מיידית בוואצאפ. עם זה אפשר להוריד עלות ליד ב-40-60%.\n\nאתה עובד עם דף נחיתה ייעודי או מפנה לאתר הראשי?`,
    };
  }

  if (intent === 'automation_interest') {
    return {
      intent, topic, stage, escalate: false,
      buttons: [
        { id: 'diag_whatsapp', label: 'שיחות עם לקוחות' },
        { id: 'diag_internal', label: 'תהליכים פנימיים' },
      ],
      message: `${greet}אוטומציה היא הסוד של עסקים שמכפילים בלי לגייס 👌\n\nאיפה היית רוצה להתחיל:\n*1. שיחות לקוחות (וואצאפ/אימייל)?*\n*2. תהליכי פנים (חשבוניות/דוחות)?*`,
    };
  }

  if (intent === 'pricing_problem') {
    return {
      intent, topic, stage, escalate: false,
      buttons: [
        { id: 'growth_show_me', label: 'כן ספר לי' },
        { id: 'growth_not_now', label: 'לא עכשיו' },
      ],
      message: `${greet}💡 מי שמתמקח ראשון — בדרך כלל לא הלקוח האידיאלי שלך.\n\nהפתרון הוא לא להוריד מחיר — אלא לבנות *הצעה שמצדיקה את המחיר* (חבילה ולא שעה, ערך ולא תוצר).\n\nאתה גובה לפי שעה או לפי פרויקט?`,
    };
  }

  if (intent === 'time_problem') {
    return {
      intent, topic, stage, escalate: false,
      buttons: [
        { id: 'growth_show_me', label: 'כן, רוצה לדעת' },
        { id: 'growth_not_now', label: 'לא עכשיו' },
      ],
      message: `${greet}אם אתה טובע — אתה לא לבד 🙏\n\n💡 מחקר פנימי שלנו: 70% מזמן עצמאי הוא תהליכים חוזרים שאפשר לאוטומט (תיאום, מעקב, הצעות מחיר).\n\nאתה יודע מה אוכל לך הכי הרבה זמן השבוע?`,
    };
  }

  if (intent === 'business_growth') {
    return {
      intent, topic, stage, escalate: false,
      buttons: [
        { id: 'diag_more_clients', label: 'יותר לקוחות' },
        { id: 'diag_higher_value', label: 'לקוחות גדולים יותר' },
      ],
      message: `${greet}אהבתי את החשיבה 👌\n\nשתי דרכים לצמיחה:\n*1. יותר לקוחות באותו גודל.*\n*2. אותו מספר לקוחות אבל גדולים יותר.*\n\nאיזה כיוון מדבר אליך יותר?`,
    };
  }

  if (intent === 'direct_interest') {
    // Already handled by escalate branch — fallback in case stage logic shifts.
    return {
      intent, topic, stage: 'late', escalate: true,
      buttons: [
        { id: 'growth_consult_yes', label: 'כן, יחזרו אליי' },
        { id: 'growth_consult_later', label: 'לא עכשיו' },
      ],
      message: `${greet}מצוין 🙌\nאני מחבר אותך עם מומחה שיוכל לתת תשובות מותאמות בדיוק לעסק שלך.\n\nרוצה שיחזרו אליך תוך כמה שעות?`,
    };
  }

  // ----- Confusion / unknown -----
  // First time confused → ask a sharp diagnostic
  if (stage === 'early') {
    return {
      intent, topic, stage, escalate: false,
      buttons: [
        { id: 'diag_leads', label: 'להביא לקוחות' },
        { id: 'diag_close', label: 'לסגור אותם' },
        { id: 'growth_consult_yes', label: 'לדבר עם מומחה' },
      ],
      message: `${greet}שאלה טובה 👍\n\nכדי שאוכל לתת לך תשובה מדויקת, ספר לי איפה אתה הכי תקוע:\n*1. להביא לקוחות?*\n*2. לסגור אותם?*\n*3. משהו אחר?*`,
    };
  }
  // Multiple confusion → soft escalate
  return {
    intent, topic, stage, escalate: false,
    buttons: [
      { id: 'growth_consult_yes', label: 'כן, חבר אותי למומחה' },
      { id: 'growth_not_now', label: 'לא עכשיו' },
    ],
    message: `${greet}אני רוצה לענות לך מדויק 👍\n\nאחבר אותך למומחה שייתן תשובה מותאמת לעסק שלך — קצרה ובלי מחויבות.`,
  };
}

// Build a "remember when you said..." opening that references the prior topic.
function buildMemoryHook(topic: string): string {
  const hooks: Record<string, string> = {
    lead_generation: 'אם קודם הזכרת שקשה להביא לקוחות —',
    closing: 'אם קודם דיברת על קושי בסגירה —',
    marketing: 'אם הפרסום שלך לא מביא תוצאות —',
    automation: 'אם אתה רוצה לאוטומט תהליכים —',
    growth: 'אם המטרה שלך לצמוח —',
    pricing: 'אם המחיר שלך נשחק —',
    time: 'אם אתה מרגיש עמוס מדי —',
  };
  return hooks[topic] || 'מההיסטוריה שלנו —';
}

// ============================================================
// HELPERS
// ============================================================
export function shouldEngageGrowthMentor(lead: {
  pipeline_stage?: string | null;
  followup_paused?: boolean | null;
  do_not_contact?: boolean | null;
}): boolean {
  if (!lead) return false;
  if (lead.do_not_contact) return false;
  if (lead.followup_paused) return false;
  const eligibleStages = new Set(['not_interested', 'no_answer', 'nurture_alt', 'follow_up']);
  return eligibleStages.has(lead.pipeline_stage || '');
}

// Score adjustment: higher for engaged, modest for short, big for escalation.
export function scoreDelta(opts: {
  intent: GrowthIntent;
  escalate: boolean;
  textLength: number;
}): number {
  if (opts.escalate) return 30;
  if (opts.intent === 'negative_stop') return -20;
  if (opts.intent === 'confusion' && opts.textLength < 5) return 5;
  return 20;
}

// ============================================================
// DIAGNOSTIC BUTTON ROUTER
// User clicks one of the diag_* buttons → we treat it as a refined intent
// and continue the conversation with stage = 'mid'.
// ============================================================
export function diagnosticButtonToIntent(buttonId: string): GrowthIntent | null {
  const map: Record<string, GrowthIntent> = {
    diag_bringing: 'lead_generation_problem',
    diag_closing: 'closing_problem',
    diag_objection: 'pricing_problem',
    diag_silence: 'closing_problem',
    diag_no_results: 'marketing_question',
    diag_too_expensive: 'pricing_problem',
    diag_whatsapp: 'automation_interest',
    diag_internal: 'automation_interest',
    diag_more_clients: 'lead_generation_problem',
    diag_higher_value: 'business_growth',
    diag_leads: 'lead_generation_problem',
    diag_close: 'closing_problem',
  };
  return map[buttonId] || null;
}
