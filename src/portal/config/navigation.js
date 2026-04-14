export const PORTAL_CATEGORIES = [
  {
    id: 'osek-patur',
    title: 'עוסק פטור',
    href: '/osek-patur',
    icon: 'FileText',
    description: 'מדריכים לפתיחה, ניהול ומיסוי עוסק פטור',
    color: 'teal',
    subcategories: [
      { title: 'פתיחת עוסק פטור', href: '/osek-patur/how-to-open', description: 'שלב אחר שלב — רישום, מסמכים נדרשים ופתיחת תיקים ברשויות' },
      { title: 'ניהול עוסק פטור', href: '/osek-patur/management', description: 'ניהול ספרים, הוצאת קבלות, חשבון בנק ותפעול שוטף' },
      { title: 'מיסים ודיווחים', href: '/osek-patur/taxes', description: 'מס הכנסה, ביטוח לאומי, דיווח שנתי וחובות תשלום' },
      { title: 'זכויות וחובות', href: '/osek-patur/rights', description: 'תקרת הכנסות, פטור ממע"מ, וחובות חוקיות שחשוב להכיר' },
      { title: 'שינוי סטטוס', href: '/osek-patur/status-change', description: 'מתי ואיך לעבור לעוסק מורשה או חברה בע"מ' },
      { title: 'שאלות נפוצות', href: '/osek-patur/faq', description: 'תשובות מהירות לשאלות הכי נפוצות על עוסק פטור' },
    ]
  },
  {
    id: 'osek-murshe',
    title: 'עוסק מורשה',
    href: '/osek-murshe',
    icon: 'Briefcase',
    description: 'כל מה שצריך לדעת על עוסק מורשה',
    color: 'blue',
    subcategories: [
      { title: 'פתיחת עוסק מורשה', href: '/osek-murshe/how-to-open', description: 'הליך הרישום, עלויות, ומה צריך להכין לפני הפתיחה' },
      { title: 'ניהול שוטף', href: '/osek-murshe/management', description: 'הנהלת חשבונות, חשבוניות מס, וניהול ספרים תקין' },
      { title: 'מע"מ ומסים', href: '/osek-murshe/taxes', description: 'דיווחי מע"מ, מקדמות מס הכנסה, וקיזוז הוצאות' },
      { title: 'דוחות וחשבוניות', href: '/osek-murshe/reports', description: 'סוגי חשבוניות, דוחות שנתיים, ודרישות ניהול ספרים' },
      { title: 'מעבר בין סטטוסים', href: '/osek-murshe/status-change', description: 'מעבר מפטור למורשה או התאגדות כחברה בע"מ' },
      { title: 'שאלות נפוצות', href: '/osek-murshe/faq', description: 'תשובות לשאלות נפוצות על ניהול עוסק מורשה' },
    ]
  },
  {
    id: 'hevra-bam',
    title: 'חברה בע"מ',
    href: '/hevra-bam',
    icon: 'Building2',
    description: 'הקמה וניהול חברה בע"מ',
    color: 'indigo',
    subcategories: [
      { title: 'פתיחת חברה בע"מ', href: '/hevra-bam/how-to-open', description: 'רישום ברשם החברות, תקנון, הון מניות ומסמכים נדרשים' },
      { title: 'ניהול חברה', href: '/hevra-bam/management', description: 'חובות דיווח, ישיבות דירקטוריון, ואגרות שנתיות' },
      { title: 'דוחות והנה"ח', href: '/hevra-bam/reports', description: 'הנהלת חשבונות כפולה, דוחות כספיים ודוח שנתי לרשם' },
      { title: 'בעלי מניות ושכר', href: '/hevra-bam/shareholders', description: 'חלוקת מניות, הסכם מייסדים, משכורת בעלים ודיבידנד' },
      { title: 'מעבר לחברה', href: '/hevra-bam/transition', description: 'מתי כדאי לעבור מעצמאי לחברה ואיך עושים את זה נכון' },
      { title: 'שאלות נפוצות', href: '/hevra-bam/faq', description: 'תשובות לשאלות נפוצות על הקמה וניהול חברה' },
    ]
  },
  {
    id: 'osek-zeir',
    title: 'עוסק זעיר',
    href: '/osek-zeir',
    icon: 'Sparkles',
    description: 'מדריכים על עוסק זעיר — פתיחה, מיסוי, ניהול והשוואות',
    color: 'amber',
    subcategories: [
      { title: 'מה זה עוסק זעיר?', href: '/osek-zeir/what-is', description: 'הגדרה, תנאי זכאות, יתרונות וחסרונות — כל מה שצריך לדעת' },
      { title: 'פתיחת עוסק זעיר', href: '/osek-zeir/how-to-open', description: 'מדריך שלב אחר שלב — מסמכים, רישום, עלויות ולוחות זמנים' },
      { title: 'עוסק זעיר מול עוסק פטור', href: '/osek-zeir/zeir-vs-patur', description: 'טבלת השוואה מלאה, יתרונות וחסרונות, ומי בוחר מה' },
      { title: 'מיסוי עוסק זעיר', href: '/osek-zeir/taxes', description: 'מס הכנסה, ביטוח לאומי, מקדמות ודיווחים' },
      { title: 'ניהול יומיומי', href: '/osek-zeir/management', description: 'קבלות, ניהול ספרים, חשבון בנק וכלים דיגיטליים' },
      { title: 'שאלות נפוצות', href: '/osek-zeir/faq', description: '20+ תשובות לשאלות הנפוצות ביותר על עוסק זעיר' },
    ]
  },
  {
    id: 'sgirat-tikim',
    title: 'סגירת תיקים',
    href: '/sgirat-tikim',
    icon: 'FolderX',
    description: 'סגירת עסק, תיקים ומול רשויות',
    color: 'red',
    subcategories: [
      { title: 'סגירת עוסק פטור', href: '/sgirat-tikim/close-osek-patur', description: 'ביטול תיק עוסק פטור — מול מס הכנסה וביטוח לאומי' },
      { title: 'סגירת עוסק מורשה', href: '/sgirat-tikim/close-osek-murshe', description: 'סגירת תיק מע"מ, מס הכנסה וביטוח לאומי לעוסק מורשה' },
      { title: 'סגירת חברה', href: '/sgirat-tikim/close-company', description: 'פירוק חברה ברשם החברות — הליך, עלויות ולוחות זמנים' },
      { title: 'סגירה מול רשויות', href: '/sgirat-tikim/authorities', description: 'טפסים, מועדים וטיפים לסגירה חלקה מול כל הרשויות' },
      { title: 'חובות והשלכות', href: '/sgirat-tikim/consequences', description: 'מה קורה עם חובות פתוחים, קנסות, והשלכות מיסוי' },
      { title: 'שאלות נפוצות', href: '/sgirat-tikim/faq', description: 'תשובות לשאלות נפוצות על סגירת עסק ותיקים' },
    ]
  },
  {
    id: 'misui',
    title: 'מיסוי לעצמאים',
    href: '/misui',
    icon: 'Calculator',
    description: 'מדרגות מס, מקדמות, ניכויים ותכנון מס לעצמאים',
    color: 'purple',
    subcategories: [
      { title: 'מדרגות מס הכנסה 2026', href: '/misui/tax-brackets', description: 'טבלת מדרגות מס, חישוב לדוגמה, נקודות זיכוי וטיפים להפחתת מס' },
      { title: 'מקדמות מס הכנסה', href: '/misui/advance-payments', description: 'איך נקבעות מקדמות, הפחתה, קנסות ומה עושים בשנה הראשונה' },
      { title: 'מס על 10,000 ₪', href: '/misui/tax-10000', description: 'כמה מס משלם עצמאי שמרוויח 10,000 ₪ — חישוב מלא' },
      { title: 'מס על 20,000 ₪', href: '/misui/tax-20000', description: 'כמה מס משלם עצמאי שמרוויח 20,000 ₪ — חישוב מלא' },
      { title: 'מס על 30,000 ₪', href: '/misui/tax-30000', description: 'כמה מס משלם עצמאי שמרוויח 30,000 ₪ — חישוב מלא' },
      { title: 'מס על 50,000 ₪', href: '/misui/tax-50000', description: 'כמה מס משלם עצמאי שמרוויח 50,000 ₪ — חישוב מלא' },
    ]
  },
  {
    id: 'maam',
    title: 'מע"מ',
    href: '/maam',
    icon: 'Receipt',
    description: 'דיווח מע"מ, חשבוניות, קיזוז תשומות והחזרים',
    color: 'orange',
    subcategories: [
      { title: 'מה זה מע"מ?', href: '/maam/what-is-vat', description: 'הסבר מלא: שיעור מע"מ, מי חייב, חשבוניות, דיווח וקיזוז' },
    ]
  },
  {
    id: 'miktzoa',
    title: 'מדריכים לפי מקצוע',
    href: '/miktzoa',
    icon: 'Briefcase',
    description: 'מדריכים מותאמים לפתיחת עסק לפי תחום',
    color: 'cyan',
    subcategories: [
      { title: 'מאמן כושר', href: '/miktzoa/fitness-trainer', description: 'עוסק פטור למאמן כושר — רישום, מיסוי, ביטוח והוצאות מוכרות' },
      { title: 'מעצב גרפי', href: '/miktzoa/graphic-designer', description: 'עוסק פטור למעצב גרפי — פרילנס, תמחור, הוצאות ולקוחות בחו"ל' },
      { title: 'מורה פרטי', href: '/miktzoa/private-tutor', description: 'עוסק פטור למורה פרטי — רישום, קבלות, הוצאות ודיווח' },
      { title: 'שליח וולט', href: '/miktzoa/wolt-courier', description: 'עוסק פטור לשליח Wolt — רישום, מיסוי, הוצאות מוכרות וקבלות' },
    ]
  },
  {
    id: 'guides',
    title: 'מידע ומדריכים',
    href: '/guides',
    icon: 'BookOpen',
    description: 'מדריכים, השוואות וכלים לעסקים',
    color: 'amber',
    subcategories: [
      { title: 'מדריכים לפתיחת עסק', href: '/guides/opening-business', description: 'כל מה שצריך לדעת לפני שפותחים עסק בישראל' },
      { title: 'השוואות', href: '/guides/comparisons', description: 'טבלאות השוואה — עוסק פטור מול מורשה, תוכנות, שירותים' },
      { title: 'מיסוי וחשבונאות', href: '/guides/taxation', description: 'מדריכי מס הכנסה, מע"מ, ביטוח לאומי ורואה חשבון' },
      { title: 'מדריכים לעצמאים', href: '/guides/freelancers', description: 'טיפים לפרילנסרים — תמחור, לקוחות, חוזים וביטוח' },
      { title: 'שאלות נפוצות', href: '/guides/faq', description: 'תשובות לשאלות כלליות על עסקים בישראל' },
    ]
  },
  {
    id: 'calculators',
    title: 'מחשבונים',
    href: '/calculators',
    icon: 'Calculator',
    description: 'מחשבונים חינמיים לעצמאים ולעסקים',
    color: 'emerald',
    subcategories: [
      { title: 'מחשבון נטו לעצמאי', href: '/calculators/net-income', description: 'כמה נשאר נטו אחרי מס הכנסה, ביטוח לאומי והוצאות' },
      { title: 'מחשבון נקודות זיכוי', href: '/calculators/credit-points', description: 'כמה נקודות זיכוי מגיעות לכם וכמה מס תחסכו' },
      { title: 'מחשבון מס לעצמאי', href: '/calculators', description: 'חישוב מס הכנסה לפי מדרגות מס (בקרוב)' },
      { title: 'מחשבון תקרת עוסק פטור', href: '/calculators', description: 'בדיקת תקרת ההכנסות השנתית לעוסק פטור (בקרוב)' },
      { title: 'פטור או מורשה?', href: '/calculators', description: 'כלי החלטה בין עוסק פטור לעוסק מורשה (בקרוב)' },
    ]
  }
];

export const PORTAL_CTA = {
  phone: '050-227-7087',
  whatsapp: 'https://wa.me/972502277087',
  email: 'yositaxes@gmail.com',
};

export const PORTAL_BRAND = {
  name: 'פרפקט וואן',
  tagline: 'פתיחת עסק בישראל — מדריכים, מידע וליווי אישי',
  logo: '/logo.png',
};
