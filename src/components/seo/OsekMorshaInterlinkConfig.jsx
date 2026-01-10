/**
 * סילו עוסק מורשה - תצורת קישורים פנימיים
 * מגדיר היררכיה, כללי קישור וברירות ברירת מחדל
 */

export const OSEK_MORSHA_SILO = {
  name: 'עוסק מורשה',
  mainPage: 'OsekMorshaLanding',
  
  categories: [
    {
      id: 'opening',
      name: 'פתיחת עוסק מורשה',
      parentPage: 'OsekMorshaLanding',
      children: [
        { page: 'OsekMorshaOnline', intent: 'online' },
        { page: 'OsekMorshaSteps', intent: 'steps' },
        { page: 'OsekMorshaTime', intent: 'timeline' }
      ],
      keywords: ['פתיחת', 'הקמה', 'הרישום']
    },
    {
      id: 'requirements',
      name: 'מתי צריך להיות עוסק מורשה',
      parentPage: 'OsekMorshaMainLanding',
      children: [
        { page: 'WhenNeedOsekMorsha', intent: 'requirements' },
        { page: 'TransitionOsekPaturToMorsha', intent: 'transition' },
        { page: 'OsekPaturThresholdAndTransition', intent: 'threshold' },
        { page: 'WhoCannotBeOsekPatur', intent: 'restrictions' }
      ],
      keywords: ['חוקי', 'דרישות', 'תנאים', 'מתי']
    },
    {
      id: 'vat',
      name: 'מע״מ לעוסק מורשה',
      parentPage: 'VatOsekMorsha',
      children: [
        { page: 'VatReportingOsekMorsha', intent: 'reporting' },
        { page: 'VatPaymentCalculation', intent: 'payment' },
        { page: 'VatReturnOsekMorsha', intent: 'returns' }
      ],
      keywords: ['מע״מ', 'מס ערך מוסף', 'דיווח', 'תשלום']
    },
    {
      id: 'income_tax',
      name: 'מס הכנסה לעוסק מורשה',
      parentPage: 'IncomeTaxOsekMorsha',
      children: [
        { page: 'IncomeTaxPayment', intent: 'payment' },
        { page: 'TaxAdvances', intent: 'advances' },
        { page: 'AnnualReportOsekMorshaPage', intent: 'reporting' }
      ],
      keywords: ['מס הכנסה', 'תשלומים', 'מקדמות', 'דוח שנתי']
    },
    {
      id: 'national_insurance',
      name: 'ביטוח לאומי לעוסק מורשה',
      parentPage: 'NationalInsuranceOsekMorsha',
      children: [
        { page: 'HowMuchOsekMorshaPayNI', intent: 'amounts' },
        { page: 'NationalInsuranceAdvances', intent: 'advances' },
        { page: 'OsekMorshaRights', intent: 'rights' }
      ],
      keywords: ['ביטוח לאומי', 'תשלומים', 'זכויות', 'מקדמות']
    },
    {
      id: 'costs_management',
      name: 'עלויות וניהול שוטף',
      parentPage: 'CostsOsekMorsha',
      children: [
        { page: 'HowMuchToManageOsekMorsha', intent: 'costs' },
        { page: 'AccountantForOsekMorsha', intent: 'accounting' },
        { page: 'BookkeepingOsekMorsha', intent: 'bookkeeping' }
      ],
      keywords: ['עלויות', 'הנהלת חשבונות', 'רואה חשבון', 'ניהול']
    },
    {
      id: 'mistakes_issues',
      name: 'טעויות ובעיות נפוצות',
      parentPage: 'CommonMistakesOsekMorsha',
      children: [
        { page: 'VatPenalties', intent: 'penalties' },
        { page: 'TaxDebts', intent: 'debts' }
      ],
      keywords: ['טעויות', 'בעיות', 'קנסות', 'חובות']
    },
    {
      id: 'closing',
      name: 'סגירת עוסק מורשה',
      parentPage: 'CloseOsekMorsha',
      children: [
        { page: 'HowToCloseOsekMorsha', intent: 'process' },
        { page: 'CloseOsekMorshaVat', intent: 'vat' },
        { page: 'CloseOsekMorshaIncomeTax', intent: 'income_tax' }
      ],
      keywords: ['סגירה', 'הסגרת', 'סגור']
    }
  ]
};

/**
 * כללי Anchor Text - וריאציות טבעיות לקישורים
 */
export const ANCHOR_VARIATIONS = {
  parent: [
    'מידע על {page}',
    'הסבר מלא על {page}',
    'כל מה שצריך לדעת על {page}',
    'למידע נוסף על {page}',
    'לקריאה נוספת בנושא {page}',
    '{page} בפירוט',
    'עוד על {page}'
  ],
  sibling: [
    'ראה גם: {page}',
    'בקשר לנושא זה גם {page}',
    'קריאה משלימה: {page}',
    'נושא קשור: {page}'
  ],
  contextual: [
    'יותר מידע על {keyword}',
    'הסבר מפורט על {keyword}',
    'למידע כללי על {keyword}'
  ]
};

/**
 * כללי בקרה עצמית
 */
export const VALIDATION_RULES = {
  MAX_LINKS_PER_PAGE: 5,
  MIN_PARENT_LINK: 1,
  MAX_PARENT_CHILDREN_LINKS: 4,
  MIN_ANCHOR_LENGTH: 5,
  MAX_ANCHOR_LENGTH: 80,
  AVOID_DUPLICATE_ANCHORS: true,
  PREVENT_CIRCULAR_LINKS: true,
  CONTENT_POSITION: {
    preferBody: true,
    avoidHeader: true,
    avoidFooter: true,
    avoidNav: true
  }
};

/**
 * מצא את הקטגוריה של עמוד
 */
export function findPageCategory(pageName) {
  for (const category of OSEK_MORSHA_SILO.categories) {
    if (category.parentPage === pageName) {
      return { category, isParent: true };
    }
    const child = category.children.find(c => c.page === pageName);
    if (child) {
      return { category, child, isParent: false };
    }
  }
  return null;
}

/**
 * קבל קישורים מומלצים לעמוד
 */
export function getRecommendedLinks(pageName) {
  const pageInfo = findPageCategory(pageName);
  if (!pageInfo) return [];

  const recommendations = [];

  if (pageInfo.isParent) {
    // עמוד אב - קשור לתת-עמודים (2-4 בלבד)
    const children = pageInfo.category.children.slice(0, 3);
    recommendations.push(...children.map(child => ({
      type: 'child',
      targetPage: child.page,
      intent: child.intent,
      position: 'body'
    })));
  } else {
    // תת-עמוד - חייב קישור לעמוד אב
    recommendations.push({
      type: 'parent',
      targetPage: pageInfo.category.parentPage,
      position: 'body',
      priority: 'required'
    });

    // קישור משלים לתת-עמוד אחר מאותה קטגוריה (אם יש)
    const siblings = pageInfo.category.children.filter(c => c.page !== pageName);
    if (siblings.length > 0) {
      recommendations.push({
        type: 'sibling',
        targetPage: siblings[0].page,
        intent: siblings[0].intent,
        position: 'body',
        optional: true
      });
    }
  }

  return recommendations;
}

/**
 * בחר Anchor Text אקראי וטבעי
 */
export function selectAnchor(type, pageName = null) {
  const variations = ANCHOR_VARIATIONS[type] || ANCHOR_VARIATIONS.contextual;
  const anchor = variations[Math.floor(Math.random() * variations.length)];
  
  if (pageName && anchor.includes('{page}')) {
    return anchor.replace('{page}', pageName);
  }
  return anchor;
}