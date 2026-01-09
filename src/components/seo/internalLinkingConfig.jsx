// =====================================================
// Internal Linking Configuration
// מערכת קישורים פנימיים מתקדמת למניעת Cannibalization
// =====================================================

export const LINKING_CONFIG = {
  enabled: true,
  maxLinksPerPage: 1, // מקסימום 1 קישור אוטומטי בלבד לדף
  maxLinksToSameTarget: 1, // רק קישור אחד לכל דף יעד (מניעת קניבליזציה)
};

// =====================================================
// Keyword Mapping - ביטוי → דף יעד (חד משמעי)
// =====================================================

export const KEYWORD_MAPPING = [
  // ============ Primary Keywords ============
  {
    keywords: ['פתיחת עוסק פטור', 'לפתוח עוסק פטור', 'איך פותחים עוסק פטור', 'תהליך פתיחת עוסק פטור'],
    target: {
      page: 'OsekPaturLanding',
      params: null
    },
    priority: 'primary',
    context: ['עצמאי', 'עסק', 'רישום', 'מס הכנסה']
  },
  {
    keywords: ['מדריך פתיחת עוסק פטור', 'מדריך לפתיחת עוסק', 'מדריך עוסק פטור מלא'],
    target: {
      page: 'OsekPaturLanding',
      params: null
    },
    priority: 'primary',
    context: ['מדריך', 'הסבר', 'שלבים']
  },
  {
    keywords: ['פתיחת עוסק פטור אונליין', 'עוסק פטור אונליין', 'פתיחת עוסק אונליין'],
    target: {
      page: 'OsekPaturOnlineLanding',
      params: null
    },
    priority: 'primary',
    context: ['דיגיטלי', 'מקוון', 'אינטרנט']
  },
  {
    keywords: ['פתיחת עוסק פטור מחיר', 'כמה עולה לפתוח עוסק', 'מחיר פתיחת עוסק', 'עלות עוסק פטור'],
    target: {
      page: 'PricingLanding',
      params: null
    },
    priority: 'primary',
    context: ['מחיר', 'עלות', 'כסף', 'תשלום']
  },

  // ============ Service Keywords ============
  {
    keywords: ['ליווי חודשי', 'ליווי שוטף לעוסק פטור'],
    target: {
      page: 'ServicePage',
      params: 'service=livui-chodshi'
    },
    priority: 'secondary',
    context: ['חודשי', 'רו"ח', 'חשבונאי']
  },
  {
    keywords: ['דוח שנתי', 'הגשת דוח שנתי', 'דוח למס הכנסה'],
    target: {
      page: 'ServicePage',
      params: 'service=doch-shnati'
    },
    priority: 'secondary',
    context: ['שנתי', 'דיווח', 'מס הכנסה']
  },

  // ============ Category Page ============
  {
    keywords: ['פתיחת עוסק פטור לפי מקצוע', 'עוסק פטור למקצועות שונים'],
    target: {
      page: 'Professions',
      params: null
    },
    priority: 'secondary',
    context: ['מקצוע', 'מקצועות', 'תחום']
  },

  // ============ Profession Keywords (Long-tail) ============
  {
    keywords: ['עוסק פטור לצלם', 'פתיחת עוסק פטור לצלם'],
    target: {
      page: 'ProfessionPage',
      params: 'slug=tzalam'
    },
    priority: 'long-tail',
    context: ['צילום', 'צלם', 'אירועים']
  },
  {
    keywords: ['עוסק פטור למעצב גרפי', 'פתיחת עוסק פטור למעצב גרפי'],
    target: {
      page: 'ProfessionPage',
      params: 'slug=meatzev-grafi'
    },
    priority: 'long-tail',
    context: ['עיצוב', 'גרפיקה', 'לוגו']
  },
  {
    keywords: ['עוסק פטור לקופירייטר', 'פתיחת עוסק פטור לקופירייטר'],
    target: {
      page: 'ProfessionPage',
      params: 'slug=copywriter'
    },
    priority: 'long-tail',
    context: ['כתיבה', 'תוכן', 'קופירייטינג']
  },
  {
    keywords: ['עוסק פטור למפתח אתרים', 'פתיחת עוסק פטור למפתח'],
    target: {
      page: 'ProfessionPage',
      params: 'slug=mefateach-atarim'
    },
    priority: 'long-tail',
    context: ['אתרים', 'פיתוח', 'קוד']
  },
  {
    keywords: ['עוסק פטור למאמן כושר', 'פתיחת עוסק פטור למאמן כושר'],
    target: {
      page: 'ProfessionPage',
      params: 'slug=meamen-kosher'
    },
    priority: 'long-tail',
    context: ['כושר', 'אימון', 'ספורט']
  },

  // ============ Urgent / Special ============
  {
    keywords: ['חשבונית דחופה', 'צריך חשבונית מיד', 'חשבונית בדחיפות'],
    target: {
      page: 'UrgentInvoice',
      params: null
    },
    priority: 'secondary',
    context: ['דחוף', 'מהיר', 'חשבונית']
  },

  // ============ Blog / Content ============
  {
    keywords: ['בלוג עוסק פטור', 'מאמרים על עוסק פטור'],
    target: {
      page: 'Blog',
      params: null
    },
    priority: 'secondary',
    context: ['מאמר', 'מידע', 'טיפים']
  }
];

// =====================================================
// Excluded Pages - דפים שלא מבצעים בהם קישור אוטומטי
// =====================================================
export const EXCLUDED_PAGES = [
  'Sitemap',
  'SitemapArticles',
  'SitemapFAQ',
  'SitemapGeo',
  'SitemapPages',
  'ThankYou'
];

// =====================================================
// Priority Weights - משקלות לסדר עדיפות
// =====================================================
export const PRIORITY_WEIGHTS = {
  primary: 3,
  secondary: 2,
  'long-tail': 1
};