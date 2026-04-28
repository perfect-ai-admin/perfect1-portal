// Growth Mentor — AI-style conversational layer for cold leads
// (pipeline_stage = not_interested / no_answer / nurture_alt). Replies to
// free text with short, value-first answers + soft expert-handoff. Pattern-
// based classifier (Hebrew). LLM call NOT used — keeps response time <2s
// and cost zero. The few-shot quality lives in the response templates.
//
// Public API (used by botHandleReply):
//   classifyGrowthIntent(text)     → GrowthIntent
//   generateGrowthResponse(intent) → { message, buttons, escalate, intent }
//   shouldEngageGrowthMentor(lead) → boolean

export type GrowthIntent =
  | 'lead_generation_problem'
  | 'marketing_question'
  | 'business_growth'
  | 'automation_interest'
  | 'direct_interest'
  | 'negative_stop'
  | 'confusion';

export interface GrowthResponse {
  message: string;
  buttons: { id: string; label: string }[];
  escalate: boolean;
  intent: GrowthIntent;
  topic: string;
}

const STOP_PATTERNS = [
  /תפסיק/, /תפסיקו/, /די\b/, /עזוב/, /עזבו/, /לא רוצה/, /אל תפנו/,
  /מסיר/, /להסיר/, /הסר/, /unsubscribe/i, /stop/i,
];

const LEAD_GEN_PATTERNS = [
  /אין לי לקוחות/, /אין לקוחות/, /לא מגיעים לקוחות/, /אין פניות/,
  /חסר לי לקוחות/, /אין מי שיקנה/, /קשה למצוא לקוחות/,
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
  if (AUTOMATION_PATTERNS.some((r) => r.test(t))) return 'automation_interest';
  if (MARKETING_PATTERNS.some((r) => r.test(t))) return 'marketing_question';
  if (GROWTH_PATTERNS.some((r) => r.test(t))) return 'business_growth';
  return 'confusion';
}

// Engagement-based escalation — caller passes the lead's current score and
// engagement count. Escalation happens at score >= 80 OR engagement >= 2.
export function generateGrowthResponse(
  intent: GrowthIntent,
  ctx: { engagementCount: number; leadScore: number; leadName?: string },
): GrowthResponse {
  const shouldEscalate = ctx.engagementCount >= 2 || ctx.leadScore >= 80 || intent === 'direct_interest';
  const name = ctx.leadName ? ctx.leadName.split(' ')[0] : '';
  const greet = name ? name + ', ' : '';

  if (intent === 'negative_stop') {
    return {
      intent,
      topic: 'opt_out',
      escalate: false,
      buttons: [],
      message: `ברור 👍\nלא אשלח לך יותר הודעות.\nאם תרצה בעתיד לקבל טיפים על שיווק, AI ואוטומציה לעצמאיים — אני כאן.`,
    };
  }

  if (shouldEscalate) {
    return {
      intent,
      topic: 'escalate',
      escalate: true,
      buttons: [
        { id: 'growth_consult_yes', label: 'כן, אשמח שיחזרו אליי' },
        { id: 'growth_consult_later', label: 'לא עכשיו' },
      ],
      message: `${greet}נשמע שאתה בכיוון הנכון 👌\n\nאני יכול לחבר אותך למומחה שיווק ו-AI שיראה לך איך זה מתבצע בעסק שלך — בלי מחויבות.\n\nרוצה שיחזרו אליך?`,
    };
  }

  switch (intent) {
    case 'lead_generation_problem':
      return {
        intent, topic: 'lead_generation', escalate: false,
        buttons: [
          { id: 'growth_show_me', label: 'כן תראה לי' },
          { id: 'growth_not_now', label: 'לא עכשיו' },
        ],
        message: `הבנתי אותך 👌\nזה בדרך כלל לא בעיה של פרסום — אלא שאין מערכת שמביאה פניות באופן קבוע.\n\nיש היום דרכים לבנות זרימת לידים שבועית עם אוטומציות פשוטות. רוצה שאסביר איך זה עובד אצל עסקים דומים?`,
      };

    case 'marketing_question':
      return {
        intent, topic: 'marketing', escalate: false,
        buttons: [
          { id: 'growth_show_me', label: 'כן תראה לי' },
          { id: 'growth_not_now', label: 'לא עכשיו' },
        ],
        message: `הרבה עסקים נופלים בדיוק שם 👇\nפרסום בלי מערכת המרה זה כמו לשפוך כסף בלי שליטה.\n\nמה שעובד באמת זה חיבור של פרסום + אוטומציה שסוגרת את הליד. רוצה שאסביר איך לבנות את זה?`,
      };

    case 'automation_interest':
      return {
        intent, topic: 'automation', escalate: false,
        buttons: [
          { id: 'growth_show_me', label: 'כן רוצה לראות דוגמה' },
          { id: 'growth_not_now', label: 'לא עכשיו' },
        ],
        message: `שאלה מצוינת 👌\nאוטומציה טובה היא לא רק "בוט שעונה" — היא מערכת שלמה שמסננת לידים ושומרת לך את הרציניים בלבד.\n\nאצלנו עצמאיים מקבלים פי 3 פניות עם חצי מהזמן. רוצה לראות דוגמה?`,
      };

    case 'business_growth':
      return {
        intent, topic: 'growth', escalate: false,
        buttons: [
          { id: 'growth_show_me', label: 'כן רוצה לשמוע' },
          { id: 'growth_not_now', label: 'לא עכשיו' },
        ],
        message: `אהבתי את החשיבה 👌\nרוב העצמאיים תקועים כי הם עובדים *בעסק* ולא *על העסק* — אין להם מערכת שמביאה צמיחה אוטומטית.\n\nיש כמה צעדים פשוטים שאפשר ליישם בשבועיים. רוצה שאספר?`,
      };

    case 'direct_interest':
      // Already covered by escalate branch above, but as fallback:
      return {
        intent, topic: 'interest', escalate: true,
        buttons: [
          { id: 'growth_consult_yes', label: 'כן, יחזרו אליי' },
          { id: 'growth_consult_later', label: 'לא עכשיו' },
        ],
        message: `מעולה 🙌\nאני מחבר אותך עכשיו עם מומחה אצלנו שיוכל לתת לך תשובות מותאמות בדיוק לעסק שלך.\n\nרוצה שיחזרו אליך תוך כמה שעות?`,
      };

    case 'confusion':
    default:
      return {
        intent, topic: 'fallback', escalate: false,
        buttons: [
          { id: 'growth_consult_yes', label: 'כן חבר אותי למומחה' },
          { id: 'growth_not_now', label: 'לא עכשיו' },
        ],
        message: `אני רוצה לענות לך מדויק 👍\nאוכל לחבר אותך למומחה שלנו שייתן לך תשובה מותאמת לעסק שלך — קצרה ובלי מחויבות.`,
      };
  }
}

// Eligible if lead is in a "cold but recoverable" stage and not opted-out.
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
