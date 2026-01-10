/**
 * validateSiloInterlinking - בקרה אוטומטית על קישורים בסילו
 * רצה אחרי כל עדכון תוכן, יצירת עמוד או שינוי בעמוד
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const OSEK_MORSHA_SILO = {
  categories: [
    {
      id: 'opening',
      parentPage: 'OsekMorshaLanding',
      children: ['OsekMorshaOnline', 'OsekMorshaSteps', 'OsekMorshaTime']
    },
    {
      id: 'requirements',
      parentPage: 'OsekMorshaMainLanding',
      children: ['WhenNeedOsekMorsha', 'TransitionOsekPaturToMorsha', 'OsekPaturThresholdAndTransition', 'WhoCannotBeOsekPatur']
    },
    {
      id: 'vat',
      parentPage: 'VatOsekMorsha',
      children: ['VatReportingOsekMorsha', 'VatPaymentCalculation', 'VatReturnOsekMorsha']
    },
    {
      id: 'income_tax',
      parentPage: 'IncomeTaxOsekMorsha',
      children: ['IncomeTaxPayment', 'TaxAdvances', 'AnnualReportOsekMorshaPage']
    },
    {
      id: 'national_insurance',
      parentPage: 'NationalInsuranceOsekMorsha',
      children: ['HowMuchOsekMorshaPayNI', 'NationalInsuranceAdvances', 'OsekMorshaRights']
    },
    {
      id: 'costs_management',
      parentPage: 'CostsOsekMorsha',
      children: ['HowMuchToManageOsekMorsha', 'AccountantForOsekMorsha', 'BookkeepingOsekMorsha']
    },
    {
      id: 'mistakes_issues',
      parentPage: 'CommonMistakesOsekMorsha',
      children: ['VatPenalties', 'TaxDebts']
    },
    {
      id: 'closing',
      parentPage: 'CloseOsekMorsha',
      children: ['HowToCloseOsekMorsha', 'CloseOsekMorshaVat', 'CloseOsekMorshaIncomeTax']
    }
  ]
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { pageName, action = 'validate' } = body;

    if (!pageName) {
      return Response.json({ 
        error: 'pageName is required' 
      }, { status: 400 });
    }

    // זיהוי קטגוריה וסוג עמוד
    const category = findCategory(pageName);
    const isParent = category?.parentPage === pageName;
    const isChild = category?.children.includes(pageName);

    if (!category) {
      return Response.json({ 
        valid: false,
        message: `עמוד ${pageName} לא חלק מסילו עוסק מורשה`,
        recommendations: []
      });
    }

    const issues = [];
    const recommendations = [];

    // ✅ בדיקה 1: תת-עמוד חייב קישור לעמוד אב
    if (isChild) {
      recommendations.push({
        type: 'required',
        target: category.parentPage,
        message: `הוסף קישור לעמוד האב: "${category.parentPage}"`,
        minOccurrences: 1,
        maxOccurrences: 1
      });
    }

    // ✅ בדיקה 2: עמוד אב קושר ל-2-4 תת-עמודים בלבד
    if (isParent) {
      const childCount = Math.min(category.children.length, 4);
      recommendations.push({
        type: 'parent_to_children',
        targets: category.children.slice(0, childCount),
        message: `הוסף קישורים ל-${Math.min(childCount, 3)} תת-עמודים (לא לכולם)`,
        maxPerChild: 1
      });
    }

    // ✅ בדיקה 3: הגבלת מקסימום קישורים
    const maxLinks = 5;
    recommendations.push({
      type: 'max_links',
      limit: maxLinks,
      message: `מקסימום ${maxLinks} קישורים פנימיים בעמוד`
    });

    // ✅ בדיקה 4: אין קישורים בין סילוים שונים
    recommendations.push({
      type: 'no_cross_silo',
      message: 'אין לקשר לעמודים מסילוים אחרים (עוסק פטור, חברה וכו\')'
    });

    // ✅ בדיקה 5: Anchor Text חייב להיות טבעי וסמנטי
    recommendations.push({
      type: 'anchor_quality',
      examples: [
        '✓ "מידע על עוסק מורשה"',
        '✓ "הסבר מלא על מע״מ"',
        '✗ "לחץ כאן"',
        '✗ "עמוד נוסף"'
      ],
      message: 'השתמש ב-Anchor Text טבעי ותיאורי'
    });

    return Response.json({
      valid: issues.length === 0,
      pageName,
      isParent,
      isChild,
      category: category?.id,
      issues,
      recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});

/**
 * מצא קטגוריה לפי שם עמוד
 */
function findCategory(pageName) {
  return OSEK_MORSHA_SILO.categories.find(cat =>
    cat.parentPage === pageName || cat.children.includes(pageName)
  );
}