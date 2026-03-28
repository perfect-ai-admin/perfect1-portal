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
              עדכון אחרון: מרץ 2026
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
                  מדיניות פרטיות זו מתארת את האופן שבו חברת פרפקט וואן, ח.פ 516309747 (להלן: "החברה", "אנחנו") אוספת, משתמשת, מאחסנת ומגנה על מידע אישי של המשתמשים באתר perfect-dashboard.com ובשירותיה. מדיניות זו מנוסחת בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, ובפרט בהתאם לתיקון מס' 13 לחוק (2025), ולתקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017.
                </p>
                <p className="text-gray-600 leading-relaxed mt-3">
                  בעצם השימוש באתר ובשירותיו, את/ה מסכימ/ה למדיניות פרטיות זו. אם אינך מסכימ/ה לתנאיה, אנא הימנע/י משימוש באתר.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. זהות בעל מאגר המידע</h2>
                <p className="text-gray-600 leading-relaxed">
                  בעל מאגר המידע ומנהלו הינה חברת פרפקט וואן, ח.פ 516309747.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
                  <li>טלפון: 050-227-7087</li>
                  <li>דוא"ל: yositaxes@gmail.com</li>
                  <li>אתר: perfect-dashboard.com</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. סוגי המידע הנאסף</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  אנו אוספים את סוגי המידע הבאים:
                </p>

                <h3 className="font-bold text-gray-800 mt-4 mb-2">מידע שנמסר על ידך במישרין:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>שם מלא, כתובת דוא"ל, מספר טלפון</li>
                  <li>פרטי עסק: שם העסק, מספר עוסק/ח.פ, סוג העסק</li>
                  <li>מידע פיננסי הנדרש לצורך מתן השירות (כגון נתוני הכנסות)</li>
                  <li>כל מידע נוסף שתבחר/י למסור דרך טפסי יצירת קשר, צ'אט או שיחות טלפון</li>
                </ul>

                <h3 className="font-bold text-gray-800 mt-4 mb-2">מידע הנאסף באופן אוטומטי:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>כתובת IP, סוג דפדפן, מערכת הפעלה, רזולוציית מסך</li>
                  <li>עמודים שנצפו, משך שהייה, מקור הגלישה</li>
                  <li>עוגיות (Cookies) ומזהים טכנולוגיים דומים</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. מטרות השימוש במידע</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  המידע שנאסף ישמש אותנו למטרות הבאות בלבד:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>אספקת השירותים שהוזמנו ותפעולם השוטף</li>
                  <li>יצירת קשר עמך בנוגע לשירותים, עדכונים ותמיכה</li>
                  <li>שיפור השירותים, התאמה אישית וניתוח סטטיסטי מצרפי</li>
                  <li>עמידה בדרישות חוק, לרבות דיני מס ורגולציה</li>
                  <li>שליחת דיוור שיווקי — אך ורק בכפוף להסכמתך המפורשת, ובהתאם לתיקון 40 לחוק התקשורת (בזק ושידורים)</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  לא נעשה שימוש במידע שלך למטרות שאינן מפורטות לעיל, ולא נעביר מידע לצדדים שלישיים שלא לצורך אספקת השירות, אלא אם קיבלנו את הסכמתך המפורשת או שאנו מחויבים לכך על פי דין.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. שיתוף מידע עם צדדים שלישיים</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  אנו לא מוכרים, משכירים או סוחרים במידע האישי שלך. מידע עשוי להיות משותף אך ורק:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>ספקי שירותים חיוניים</strong> — ספקי אחסון ענן, סליקת תשלומים, שליחת דוא"ל — המחויבים בהסכמי סודיות ואבטחת מידע</li>
                  <li><strong>רשויות מוסמכות</strong> — כאשר נדרש על פי חוק, צו שיפוטי או דרישה חוקית מחייבת</li>
                  <li><strong>בהסכמתך</strong> — לאחר קבלת הסכמתך המפורשת לכל שיתוף חריג</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. אבטחת מידע</h2>
                <p className="text-gray-600 leading-relaxed">
                  בהתאם לתקנות הגנת הפרטיות (אבטחת מידע) ולדרישות תיקון 13, אנו מיישמים אמצעי אבטחה מתקדמים לשמירה על המידע שלך, לרבות:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
                  <li>הצפנת תקשורת בפרוטוקול SSL/TLS</li>
                  <li>אחסון מידע בשרתים מאובטחים עם בקרת גישה</li>
                  <li>גיבויים שוטפים</li>
                  <li>הגבלת גישה לעובדים מורשים בלבד</li>
                  <li>פרטי אשראי אינם נשמרים אצלנו אלא אצל ספק סליקה מאובטח בתקן PCI-DSS</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  עם זאת, אין שיטת אבטחה שמבטיחה חסינות מוחלטת, ואנו פועלים בהתאם לסטנדרט הסביר המקובל בתעשייה.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. אירוע אבטחת מידע (הודעה על דליפת מידע)</h2>
                <p className="text-gray-600 leading-relaxed">
                  בהתאם לתיקון 13 לחוק הגנת הפרטיות, במקרה של אירוע אבטחה חמור שבו נחשף מידע אישי באופן בלתי מורשה, נפעל כדלקמן:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
                  <li>נודיע לרשות להגנת הפרטיות בהתאם ללוחות הזמנים הקבועים בחוק</li>
                  <li>נודיע לנושאי המידע שנפגעו, ככל שהאירוע עלול לגרום להם נזק ממשי</li>
                  <li>ננקוט בפעולות לצמצום הנזק ולמניעת הישנות האירוע</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. זכויותיך בנוגע למידע (בהתאם לתיקון 13)</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  בהתאם לחוק הגנת הפרטיות ולתיקון 13, עומדות לך הזכויות הבאות:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>זכות עיון</strong> — הזכות לעיין במידע השמור אודותיך במאגרי המידע שלנו</li>
                  <li><strong>זכות תיקון</strong> — הזכות לדרוש תיקון מידע שגוי או לא מדויק</li>
                  <li><strong>זכות מחיקה</strong> — הזכות לדרוש מחיקת מידע אישי שאינו נדרש עוד למטרה שלשמה נאסף, בכפוף לחריגים הקבועים בחוק (כגון חובת שמירה לפי דיני מס)</li>
                  <li><strong>זכות הגבלת עיבוד</strong> — הזכות לדרוש הגבלת השימוש במידע שלך</li>
                  <li><strong>הזכות להתנגד</strong> — הזכות להתנגד לעיבוד מידע למטרות שיווק ישיר</li>
                  <li><strong>ניוד מידע</strong> — הזכות לקבל את המידע שלך בפורמט מובנה, לצורך העברתו לגורם אחר</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  לצורך מימוש זכויותיך, ניתן לפנות אלינו בדוא"ל: yositaxes@gmail.com. נשיב לפנייתך תוך 30 ימים כנדרש בחוק.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">9. עוגיות (Cookies)</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  האתר משתמש בעוגיות למטרות הבאות:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>עוגיות הכרחיות</strong> — נדרשות לתפקוד בסיסי של האתר (כגון התחברות, שמירת הגדרות)</li>
                  <li><strong>עוגיות ניתוח</strong> — לצורך הבנת דפוסי שימוש ושיפור האתר (כגון Google Analytics)</li>
                  <li><strong>עוגיות שיווקיות</strong> — לצורך הצגת תוכן מותאם (רק בהסכמתך)</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  ניתן לשלוט בהגדרות העוגיות דרך הגדרות הדפדפן שלך. חסימת עוגיות הכרחיות עלולה לפגוע בתפקוד האתר.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">10. תקופת שמירת המידע</h2>
                <p className="text-gray-600 leading-relaxed">
                  אנו שומרים את המידע האישי שלך כל עוד חשבונך פעיל או כנדרש לצורך מתן השירות. לאחר סיום השירות, מידע יישמר לתקופה הנדרשת על פי דין (לרבות דיני מס ושמירת מסמכים), ולאחר מכן יימחק באופן מאובטח.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">11. העברת מידע אל מחוץ לישראל</h2>
                <p className="text-gray-600 leading-relaxed">
                  חלק מספקי השירותים שלנו (כגון שירותי ענן) פועלים מחוץ לישראל. העברת מידע כזו מתבצעת בהתאם לדרישות תיקון 13 ולתקנות הגנת הפרטיות, תוך הקפדה על רמת הגנה נאותה למידע המועבר.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">12. שינויים במדיניות</h2>
                <p className="text-gray-600 leading-relaxed">
                  אנו עשויים לעדכן מדיניות זו מעת לעת. על שינויים מהותיים נודיע באמצעות הודעה בולטת באתר ו/או בדוא"ל. המשך השימוש באתר לאחר פרסום השינויים מהווה הסכמה למדיניות המעודכנת.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">13. יצירת קשר</h2>
                <p className="text-gray-600 leading-relaxed">
                  לכל שאלה, בקשה או תלונה בנוגע למדיניות הפרטיות או לשימוש במידע האישי שלך, ניתן לפנות אלינו:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
                  <li>חברת פרפקט וואן, ח.פ 516309747</li>
                  <li>טלפון: 050-227-7087</li>
                  <li>דוא"ל: yositaxes@gmail.com</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-3">
                  כמו כן, ניתן להגיש תלונה לרשות להגנת הפרטיות בכתובת: www.gov.il/he/departments/the_privacy_protection_authority
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
