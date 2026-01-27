import React from 'react';
import { Accessibility, Mail, Phone } from 'lucide-react';

export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* כותרת */}
          <div className="flex items-center gap-4 mb-8">
            <Accessibility className="w-12 h-12 text-[#1E3A5F]" />
            <h1 className="text-4xl font-bold text-[#1E3A5F]">הצהרת נגישות</h1>
          </div>

          {/* תוכן */}
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">מחויבות לנגישות</h2>
              <p>
                <strong>Perfect One</strong> מחויבת להנגיש את שירותיה לכלל האוכלוסייה, לרבות אנשים עם מוגבלויות.
                אנו משקיעים משאבים רבים בשיפור נגישות האתר כדי להבטיח שימוש נוח, קל ופשוט לכולם.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">תקנים ועמידה בדרישות</h2>
              <p>
                האתר עומד בדרישות <strong>תיקון 13 לחוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח-1998</strong> 
                וברמת התאימות <strong>AA</strong> של תקן <strong>WCAG 2.1</strong> (Web Content Accessibility Guidelines).
              </p>
              <p className="mt-3">
                הנגשת האתר בוצעה על פי המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">שירותי נגישות באתר</h2>
              <ul className="list-disc pr-6 space-y-2">
                <li>תפריט נגישות מקיף עם כפתור צף בצד שמאל של המסך</li>
                <li>שינוי גודל הטקסט (80%-150%)</li>
                <li>מצב ניגודיות גבוהה</li>
                <li>הדגשת קישורים לניווט קל יותר</li>
                <li>עצירת אנימציות להפחתת הסחת דעת</li>
                <li>מעבר לגופן קריא יותר</li>
                <li>תמיכה מלאה בניווט מקלדת</li>
                <li>תיוג ARIA מקיף לקוראי מסך</li>
                <li>כפתור "דלג לתוכן הראשי"</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">טכנולוגיות מסייעות</h2>
              <p>
                האתר נבדק ונמצא תואם לשימוש עם טכנולוגיות מסייעות כגון:
              </p>
              <ul className="list-disc pr-6 space-y-2 mt-3">
                <li>קוראי מסך: NVDA, JAWS, VoiceOver, TalkBack</li>
                <li>תוכנות הגדלת מסך</li>
                <li>תוכנות הכתבה קולית</li>
                <li>ניווט באמצעות מקלדת בלבד</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">דפדפנים נתמכים</h2>
              <p>האתר נבדק ועובד בצורה מיטבית בדפדפנים הבאים:</p>
              <ul className="list-disc pr-6 space-y-2 mt-3">
                <li>Google Chrome (גרסה אחרונה)</li>
                <li>Mozilla Firefox (גרסה אחרונה)</li>
                <li>Safari (גרסה אחרונה)</li>
                <li>Microsoft Edge (גרסה אחרונה)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">חלקים לא נגישים</h2>
              <p>
                למרות מאמצנו להנגיש את כלל האתר, יתכן שחלקים מסוימים עדיין אינם נגישים באופן מלא.
                אנו עובדים באופן שוטף לשיפור והרחבת הנגישות באתר.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">תאריך עדכון אחרון</h2>
              <p>
                הצהרת נגישות זו עודכנה בתאריך: <strong>27 בינואר 2026</strong>
              </p>
            </section>

            <section className="bg-blue-50 p-6 rounded-lg mt-8">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                <Mail className="inline-block w-6 h-6 ml-2" />
                צור קשר בנושאי נגישות
              </h2>
              <p className="mb-4">
                אם נתקלת בבעיית נגישות באתר, או אם ברצונך לקבל מידע נוסף על הנגשת האתר, 
                אנו מזמינים אותך ליצור עמנו קשר:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#1E3A5F]" />
                  <a href="mailto:accessibility@perfectone.co.il" className="text-blue-600 hover:underline">
                    accessibility@perfectone.co.il
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#1E3A5F]" />
                  <a href="tel:0559700641" className="text-blue-600 hover:underline">
                    055-970-0641
                  </a>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                אנו נעשה את מירב המאמצים לטפל בפנייתך בהקדם האפשרי.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">רכז נגישות</h2>
              <p>
                רכז הנגישות מטעם Perfect One עומד לרשותכם לכל שאלה או בקשה הקשורה לנגישות האתר.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}