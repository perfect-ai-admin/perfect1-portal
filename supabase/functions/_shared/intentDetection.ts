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
  const t = text.trim();

  // === מחיר ===
  if (/כמה (זה )?עולה|מחיר|עלות|price|cost|תשלום/i.test(t)) {
    return 'פתיחת עוסק פטור אונליין עולה ₪299 תשלום חד-פעמי.\nזה כולל את כל התהליך מול מע״מ, מס הכנסה וביטוח לאומי 💰';
  }
  // === זמן ===
  if (/כמה זמן|תוך כמה|מתי (יהיה|זה)|how long|כמה ימים/i.test(t)) {
    return 'תוך 72 שעות מהתשלום ומקבלת המסמכים — התיק שלך פתוח ומוכן לעבודה ⏱️';
  }
  // === מה צריך ===
  if (/מה צריך|מה נדרש|מה אני צריך|מה צריך להביא|what.*need|מסמכים/i.test(t)) {
    return 'רק שם מלא, ת.ז., כתובת מייל, ופרטי העסק.\nבסוף נבקש צילום ת.ז./רישיון/דרכון 📄';
  }
  // === איך זה עובד / תהליך ===
  if (/איך (זה )?עובד|מה התהליך|process|שלבים|steps/i.test(t)) {
    return 'ממלאים טופס קצר (2 דק׳) → משלמים ₪299 → שולחים מסמך מזהה → אנחנו פותחים לך את התיק ברשויות תוך 72 שעות 🚀';
  }
  // === שכיר + עוסק פטור ===
  if (/שכיר|עובד.*פטור|פטור.*עובד|שכיר.*פטור|עובד.*עוסק/i.test(t)) {
    return 'כן, אפשר להיות גם שכיר וגם עוסק פטור במקביל! זה בדיוק המצב של רוב הלקוחות שלנו 💼';
  }
  // === מס / מיסוי ===
  if (/כמה מס|מס הכנסה|מיסוי|מס.*משלם|אחוז מס|מע.?מ|ביטוח לאומי|דמי ביטוח/i.test(t)) {
    return 'בתור עוסק פטור בתחילת הדרך, אתה לא משלם מע״מ.\nמס הכנסה — תלוי בהכנסה, אבל בשנה הראשונה עם הכנסות נמוכות זה בדרך כלל מינימלי.\nביטוח לאומי — כ-170 ₪ לחודש (מינימום).\nרואה החשבון שלנו יכול לתת לך תחשיב מדויק 📊';
  }
  // === תקרה / הכנסה מקסימלית ===
  if (/תקרה|מקסימום|הכנסה.*מותר|כמה מותר להרוויח|limit|maximum|גבול/i.test(t)) {
    return 'התקרה לעוסק פטור בשנת 2025 היא כ-120,000 ₪ לשנה (כ-10,000 ₪ לחודש).\nאם תעבור את התקרה — תצטרך לעבור לעוסק מורשה. אנחנו נעזור לך גם עם זה 📈';
  }
  // === חשבונית / קבלה ===
  if (/חשבונית|קבלה|invoice|receipt|איך מוציאים/i.test(t)) {
    return 'בתור עוסק פטור אתה מוציא *קבלה* (לא חשבונית מס).\nיש אפליקציות פשוטות שעושות את זה בקליק — נעזור לך להתחיל 🧾';
  }
  // === הבדל פטור/מורשה ===
  if (/מה ההבדל|פטור.*מורשה|מורשה.*פטור|הבדל.*פטור|difference/i.test(t)) {
    return 'עוסק פטור — פשוט יותר, בלי מע״מ, מתאים להכנסה עד ~120K ₪ לשנה.\nעוסק מורשה — חייב לגבות מע״מ, מתאים להכנסה גבוהה יותר.\nאם אתה בתחילת הדרך — פטור זה בדרך כלל הבחירה הנכונה ✅';
  }
  // === עוסק זעיר ===
  if (/עוסק זעיר|זעיר|osek zeir/i.test(t)) {
    return 'עוסק זעיר הוא מסלול מוזל ופשוט לעצמאים קטנים בתחילת הדרך.\nדיווח פשוט יותר ותשלומי ביטוח לאומי מופחתים.\nנשמח לעזור לך להבין אם זה מתאים לך 🙂';
  }
  // === האם צריך רואה חשבון ===
  if (/צריך רואה חשבון|חייב רו.?ח|בלי רואה חשבון|need accountant/i.test(t)) {
    return 'חוקית — לא חייבים רואה חשבון לעוסק פטור.\nאבל בפרקטיקה, רו״ח חוסך לך הרבה כאב ראש — דיווחים, מקדמות, ביטוח לאומי.\nאנחנו מציעים ליווי שוטף מ-200 ₪ לחודש 🤝';
  }
  // === סגירת תיק ===
  if (/סגירת|לסגור|סוגר.*עסק|close.*business/i.test(t)) {
    return 'אפשר לסגור תיק של עוסק פטור בכל עת.\nצריך להודיע לרשויות (מע״מ, מס הכנסה, ביטוח לאומי).\nאנחנו יכולים לעזור גם עם זה — פנה אלינו ונטפל 📋';
  }
  // === כללי — catchall עם תשובה מועילה ===
  // אם לא מצאנו match ספציפי, נענה תשובה כללית שעדיין מועילה
  return `שאלה טובה! 👍\n\nאני לא בטוח שיש לי תשובה מדויקת כרגע, אבל רואה החשבון שלנו בטוח יוכל לעזור.\n\nבינתיים — אם יש לך שאלות נוספות אני כאן.`;
}
