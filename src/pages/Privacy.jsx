import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-gray-50/50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              מדיניות פרטיות
            </h1>
            <p className="text-gray-600">
              עדכון אחרון: ינואר 2025
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto prose prose-lg prose-gray">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 space-y-8">
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. מבוא</h2>
                <p className="text-gray-600 leading-relaxed">
                  ב-ClientDashboard אנחנו מכבדים את הפרטיות שלך ומחויבים להגנה על המידע האישי שלך. מדיניות פרטיות זו מסבירה כיצד אנחנו אוספים, משתמשים ומגנים על המידע שלך כאשר אתה משתמש בשירותים שלנו.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. המידע שאנחנו אוספים</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  אנחנו אוספים את סוגי המידע הבאים:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>מידע שאתה מספק לנו ישירות (שם, כתובת מייל, פרטי עסק)</li>
                  <li>מידע על השימוש שלך במערכת (פעולות, העדפות, נתונים עסקיים שאתה מזין)</li>
                  <li>מידע טכני (כתובת IP, סוג דפדפן, מכשיר)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. כיצד אנחנו משתמשים במידע</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  אנחנו משתמשים במידע שלך כדי:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>לספק ולשפר את השירותים שלנו</li>
                  <li>להתאים אישית את החוויה שלך</li>
                  <li>לשלוח עדכונים והודעות חשובות</li>
                  <li>לנתח ולשפר את המוצר שלנו</li>
                  <li>לעמוד בדרישות חוק</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. שיתוף מידע</h2>
                <p className="text-gray-600 leading-relaxed">
                  אנחנו לא מוכרים או משכירים את המידע האישי שלך לצדדים שלישיים. אנחנו עשויים לשתף מידע עם ספקי שירותים שעוזרים לנו לתפעל את המערכת, תוך הקפדה על סודיות ואבטחה.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. אבטחת מידע</h2>
                <p className="text-gray-600 leading-relaxed">
                  אנחנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלך, כולל הצפנה, גיבויים שוטפים, ובקרת גישה מחמירה. עם זאת, אין שיטה להעברת נתונים באינטרנט שהיא מאובטחת ב-100%.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. הזכויות שלך</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  יש לך את הזכויות הבאות בנוגע למידע שלך:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>גישה למידע שאנחנו מחזיקים עליך</li>
                  <li>תיקון מידע לא מדויק</li>
                  <li>מחיקת המידע שלך (בכפוף להגבלות חוקיות)</li>
                  <li>התנגדות לעיבוד מסוים של המידע</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. עוגיות (Cookies)</h2>
                <p className="text-gray-600 leading-relaxed">
                  אנחנו משתמשים בעוגיות כדי לשפר את חוויית השימוש שלך. עוגיות אלה עוזרות לנו לזכור את ההעדפות שלך ולנתח את השימוש באתר. אתה יכול לשלוט בהגדרות העוגיות דרך הדפדפן שלך.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. שינויים במדיניות</h2>
                <p className="text-gray-600 leading-relaxed">
                  אנחנו עשויים לעדכן מדיניות זו מעת לעת. נודיע לך על שינויים משמעותיים באמצעות הודעה במערכת או במייל.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">9. יצירת קשר</h2>
                <p className="text-gray-600 leading-relaxed">
                  אם יש לך שאלות לגבי מדיניות הפרטיות, אנא צור איתנו קשר בכתובת: privacy@clientdashboard.co.il
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}