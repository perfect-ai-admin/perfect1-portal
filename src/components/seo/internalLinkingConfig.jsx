// =====================================================
// Internal Linking Configuration
// מערכת קישורים פנימיים מתקדמת למניעת Cannibalization
// =====================================================

export const LINKING_CONFIG = {
  enabled: true,
  maxLinksPerPage: 3, // מקסימום קישורים אוטומטיים לדף
  maxLinksToSameTarget: 2, // מקסימום קישורים לאותו דף יעד מאותו עמוד
};

// =====================================================
// Keyword Mapping - ביטוי → דף יעד (חד משמעי)
// =====================================================

export const KEYWORD_MAPPING = [
  // ============ Primary Keywords ============
  {
    keywords: ['פתיחת עוסק פטור', 'לפתוח עוסק פטור', 'פותחים עוסק פטור'],
    target: {
      page: 'OsekPaturLanding',
      params: null
    },
    priority: 'primary',
    context: ['עצמאי', 'עסק', 'רישום', 'מס הכנסה']
  },
  {
    keywords: ['פתיחת תיק עוסק פטור', 'פתיחת תיק במס הכנסה'],
    target: {
      page: 'Home',
      params: null
    },
    priority: 'primary',
    context: ['תיק', 'מס', 'רישום']
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

  // ============ Profession Keywords (Long-tail) ============
  {
    keywords: ['צלם עוסק פטור', 'פתיחת עוסק פטור לצלם'],
    target: {
      page: 'ProfessionPage',
      params: 'slug=tzalam'
    },
    priority: 'long-tail',
    context: ['צילום', 'צלם', 'אירועים']
  },
  {
    keywords: ['מעצב גרפי עוסק פטור', 'פתיחת עוסק פטור למעצבים'],
    target: {
      page: 'ProfessionPage',
      params: 'slug=meatzev-grafi'
    },
    priority: 'long-tail',
    context: ['עיצוב', 'גרפיקה', 'לוגו']
  },
  {
    keywords: ['קופירייטר עוסק פטור', 'כותב תוכן עוסק פטור'],
    target: {
      page: 'ProfessionPage',
      params: 'slug=copywriter'
    },
    priority: 'long-tail',
    context: ['כתיבה', 'תוכן', 'קופירייטינג']
  },
  {
    keywords: ['מפתח אתרים עוסק פטור', 'פתיחת עוסק למפתח'],
    target: {
      page: 'ProfessionPage',
      params: 'slug=mefateach-atarim'
    },
    priority: 'long-tail',
    context: ['אתרים', 'פיתוח', 'קוד']
  },
  {
    keywords: ['מאמן כושר עוסק פטור', 'פתיחת עוסק למאמן כושר'],
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
  'Contact',
  'About',
  'Pricing',
  'Sitemap',
  'SitemapArticles',
  'SitemapFAQ',
  'SitemapGeo',
  'SitemapPages'
];

// =====================================================
// Priority Weights - משקלות לסדר עדיפות
// =====================================================
export const PRIORITY_WEIGHTS = {
  primary: 3,
  secondary: 2,
  'long-tail': 1
};