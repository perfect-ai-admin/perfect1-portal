import React from 'react';
import { Helmet } from 'react-helmet-async';
import PortalHeader from '@/portal/components/PortalHeader';
import PortalFooter from '@/portal/components/PortalFooter';

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Helmet>
        <title>הצהרת נגישות | פרפקט וואן</title>
        <meta name="description" content="הצהרת נגישות אתר פרפקט וואן — מחויבות לנגישות דיגיטלית לפי תקנות שוויון זכויות לאנשים עם מוגבלות." />
      </Helmet>

      <PortalHeader />

      <main className="pt-20">
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-gray-50/50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              הצהרת נגישות
            </h1>
            <p className="text-gray-600">עדכון אחרון: אפריל 2026</p>
          </div>
        </section>

        <section className="py-12 md:py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto prose prose-lg prose-gray">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 space-y-8">

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. מחויבות לנגישות</h2>
                <p className="text-gray-600 leading-relaxed">
                  פרפקט וואן בע"מ מחויבת להנגשת האתר והשירותים הדיגיטליים לכלל האוכלוסייה,
                  לרבות אנשים עם מוגבלויות, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות,
                  התשנ"ח-1998, ותקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות),
                  התשע"ג-2013.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. תקן הנגישות</h2>
                <p className="text-gray-600 leading-relaxed">
                  האתר עומד בדרישות תקן ישראלי 5568 המבוסס על הנחיות WCAG 2.1 ברמת AA.
                  אנו עובדים באופן שוטף לשיפור רמת הנגישות באתר.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. התאמות נגישות שבוצעו</h2>
                <ul className="text-gray-600 space-y-2 list-disc list-inside">
                  <li>התאמה למקלדת — ניתן לנווט באתר באמצעות מקלדת בלבד</li>
                  <li>מבנה כותרות היררכי (H1-H6) לניווט קל עם קורא מסך</li>
                  <li>תיאור טקסטואלי חלופי (alt) לתמונות</li>
                  <li>ניגודיות צבעים מספקת בין טקסט לרקע</li>
                  <li>אזורי לחיצה בגודל מינימלי של 44px</li>
                  <li>תמיכה בהגדלת טקסט עד 200% ללא אובדן תוכן</li>
                  <li>תמיכה בהעדפת הפחתת תנועה (prefers-reduced-motion)</li>
                  <li>תמיכה בניגודיות גבוהה (prefers-contrast)</li>
                  <li>תצוגה תקינה בכיוון RTL</li>
                  <li>תפריט נגישות באתר לשינוי ניגודיות, גופן קריא, הדגשת קישורים ועצירת אנימציות</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. טכנולוגיות</h2>
                <p className="text-gray-600 leading-relaxed">
                  האתר בנוי בטכנולוגיית React ומותאם לדפדפנים Chrome, Firefox, Safari ו-Edge
                  בגרסאותיהם העדכניות. האתר מותאם לצפייה במובייל, טאבלט ומחשב שולחני.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. רכיבים שאינם נגישים</h2>
                <p className="text-gray-600 leading-relaxed">
                  ייתכן שחלק מהתכנים באתר אינם נגישים במלואם. אנו פועלים לתקן ליקויים
                  שמתגלים באופן שוטף. אם נתקלתם בבעיית נגישות, נשמח לשמוע ולטפל.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. פנייה בנושא נגישות</h2>
                <p className="text-gray-600 leading-relaxed">
                  אם נתקלתם בבעיית נגישות באתר או זקוקים לסיוע, ניתן לפנות אלינו:
                </p>
                <ul className="text-gray-600 space-y-2 mt-3 list-none">
                  <li><strong>רכז נגישות:</strong> פרפקט וואן בע"מ</li>
                  <li><strong>דוא"ל:</strong>{' '}
                    <a href="mailto:info@perfect1.co.il" className="text-blue-600 underline hover:text-blue-800">
                      info@perfect1.co.il
                    </a>
                  </li>
                  <li><strong>טלפון:</strong>{' '}
                    <a href="tel:+972547001100" className="text-blue-600 underline hover:text-blue-800" dir="ltr">
                      054-700-1100
                    </a>
                  </li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  פניות בנושא נגישות יטופלו תוך 14 ימי עסקים.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. תאריך עדכון</h2>
                <p className="text-gray-600 leading-relaxed">
                  הצהרת נגישות זו עודכנה לאחרונה באפריל 2026.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <PortalFooter />
    </div>
  );
}
