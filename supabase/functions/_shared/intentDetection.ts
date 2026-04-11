// Keyword-based intent detection for free-text user messages
// Maps free text → one of: pay_online / talk_accountant / ask_question / identity_document / other

export type DetectedIntent =
  | 'pay_online'
  | 'talk_accountant'
  | 'ask_question'
  | 'identity_document'
  | 'positive_confirmation'
  | 'negative_decline'
  | 'other';

interface IntentRule {
  intent: DetectedIntent;
  keywords: string[];
  priority: number; // higher = checked first
}

const INTENT_RULES: IntentRule[] = [
  // Payment intent — HIGHEST priority (user explicitly wants to pay)
  {
    intent: 'pay_online',
    keywords: [
      'לשלם', 'שלם', 'תשלום', 'לפתוח תיק', 'פתיחת תיק', 'להתחיל', 'רוצה להתחיל',
      'pay', 'payment', 'checkout', 'לקנות', 'מעוניין לשלם',
      'איפה משלמים', 'איך משלמים', 'קישור לתשלום',
    ],
    priority: 100,
  },
  // Accountant callback intent
  {
    intent: 'talk_accountant',
    keywords: [
      'רואה חשבון', 'רוח', 'רו"ח', 'רו״ח', 'יועץ',
      'לדבר עם', 'שיחה', 'להתייעץ', 'ייעוץ',
      'נציג', 'להתקשר', 'תחזור אלי', 'שיחזור אלי',
      'accountant', 'consultant', 'call me', 'callback',
    ],
    priority: 90,
  },
  // Identity document intent — user mentions sending ID
  {
    intent: 'identity_document',
    keywords: [
      'תעודת זהות', 'ת.ז', 'ת"ז', 'ת״ז', 'תז',
      'רישיון', 'רישיון נהיגה',
      'דרכון', 'passport',
      'מזהה', 'זיהוי', 'לשלוח תעודה',
    ],
    priority: 80,
  },
  // Positive confirmation (yes / ok / sure)
  {
    intent: 'positive_confirmation',
    keywords: [
      'כן', 'אוקיי', 'בסדר', 'מעולה', 'אני רוצה', 'בטח', 'בוודאי',
      'yes', 'ok', 'okay', 'sure', 'yep', '👍', '✅',
    ],
    priority: 60,
  },
  // Negative decline
  {
    intent: 'negative_decline',
    keywords: [
      'לא', 'לא עכשיו', 'אין לי', 'עזוב', 'לא מעוניין', 'תודה לא',
      'no', 'not now', 'skip', 'later', '❌',
    ],
    priority: 50,
  },
];

/**
 * Detect the primary intent from a free-text message.
 * Returns 'ask_question' as default if text is a question (contains '?' or ה-words).
 * Returns 'other' as catch-all.
 */
export function detectIntent(text: string): DetectedIntent {
  if (!text || typeof text !== 'string') return 'other';
  const normalized = text.trim().toLowerCase();

  // Sort rules by priority DESC and check
  const sorted = [...INTENT_RULES].sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return rule.intent;
      }
    }
  }

  // Fallback: if contains '?' or question words → ask_question
  const questionMarkers = ['?', 'מה ', 'איך ', 'כמה ', 'מתי ', 'למה ', 'האם ', 'איפה '];
  if (questionMarkers.some(m => text.includes(m))) {
    return 'ask_question';
  }

  return 'other';
}

/**
 * Check if a message looks like an ID number (8-10 digits, optionally formatted)
 */
export function looksLikeIdNumber(text: string): string | null {
  const cleaned = (text || '').replace(/[^0-9]/g, '');
  if (cleaned.length >= 8 && cleaned.length <= 10) {
    return cleaned;
  }
  return null;
}

/**
 * Simple FAQ-style answers for common questions.
 * Returns null if no match — caller should use a smarter engine.
 */
export function getSimpleFAQAnswer(text: string): string | null {
  const normalized = text.trim().toLowerCase();

  if (/כמה (זה )?עולה|מחיר|price|cost/i.test(normalized)) {
    return 'פתיחת עוסק פטור אונליין עולה ₪299 תשלום חד-פעמי, כולל את כל התהליך מול מע״מ, מס הכנסה וביטוח לאומי 💰';
  }
  if (/כמה זמן|תוך כמה|מתי|how long/i.test(normalized)) {
    return 'תוך 72 שעות מהתשלום ומקבלת המסמכים — התיק שלך פתוח ומוכן לעבודה ⏱️';
  }
  if (/מה צריך|מה נדרש|מה אני צריך|what.*need/i.test(normalized)) {
    return 'רק שם מלא, ת.ז., כתובת מייל, ופרטי העסק. בסוף נבקש צילום ת.ז./רישיון/דרכון 📄';
  }
  if (/איפה|how|איך זה עובד|process/i.test(normalized)) {
    return 'ממלאים טופס קצר (2 דק׳) → משלמים → שולחים מסמך מזהה → אנחנו פותחים לך את התיק ברשויות תוך 72 שעות 🚀';
  }
  if (/שכיר|עובד/i.test(normalized)) {
    return 'כן, אפשר להיות גם שכיר וגם עוסק פטור במקביל! זה בדיוק המצב של רוב הלקוחות שלנו 💼';
  }

  return null;
}
