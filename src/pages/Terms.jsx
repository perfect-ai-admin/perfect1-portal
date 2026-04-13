import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-12 md:py-16 px-4 sm:px-6 bg-gray-50/50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              תקנון ותנאי שימוש
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
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. כללי</h2>
                <p className="text-gray-600 leading-relaxed">
                  אתר זה, הפועל בכתובת perfect1.co.il, מופעל על ידי חברת פרפקט וואן, ח.פ 516309747 (להלן: "החברה" או "הנהלת האתר"). השימוש באתר ובשירותיו כפוף לקריאת תקנון זה ולהסכמה לתנאיו. בעצם השימוש באתר, הגלישה בו, והזמנת שירותים או מוצרים באמצעותו, הנך מצהיר/ה כי קראת את התקנון, הבנת אותו ואת/ה מסכימ/ה לכל הוראותיו.
                </p>
                <p className="text-gray-600 leading-relaxed mt-3">
                  תקנון זה מנוסח בלשון זכר מטעמי נוחות בלבד, אך מיועד לכל המגדרים.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. פרטי החברה</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>שם החברה: פרפקט וואן</li>
                  <li>ח.פ: 516309747</li>
                  <li>טלפון: 050-227-7087</li>
                  <li>דוא"ל: yositaxes@gmail.com</li>
                  <li>אתר: perfect1.co.il</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. תיאור השירות והמוצרים</h2>
                <p className="text-gray-600 leading-relaxed">
                  האתר מציע שירותי SaaS לניהול עסקי (כולל מערכת CRM, ניהול לידים, כלים שיווקיים, כרטיסים דיגיטליים ועוד), וכן מוצרים דיגיטליים ופיזיים הנמכרים מעת לעת. תמונות המוצרים באתר נועדו להמחשה בלבד וייתכנו הבדלים בין התמונות לבין המוצר בפועל. החברה עושה מאמצים לוודא שהמידע באתר מדויק, אך ייתכנו טעויות בתום לב.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. הזמנת מוצרים ואספקה</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  רכישת מוצרים ושירותים באתר תתבצע באמצעות כרטיס אשראי או אמצעי תשלום אחר המקובל על החברה.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>החברה רשאית שלא לאשר הזמנה מסיבות שונות, כגון: מלאי שאזל, בעיה בפרטי אשראי, או כל סיבה אחרת לפי שיקול דעתה.</li>
                  <li>עבור מוצרים דיגיטליים, האספקה היא מיידית או תוך זמן קצר לכתובת הדוא"ל שהוזנה.</li>
                  <li>עבור מוצרים פיזיים (אם ישנם), זמני המשלוח יפורטו בעמוד המוצר. החברה לא תישא באחריות לעיכובים שאינם בשליטתה.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. מחירים ותשלומים</h2>
                <p className="text-gray-600 leading-relaxed">
                  כל המחירים המוצגים באתר כוללים מע"מ, אלא אם צוין אחרת במפורש. החברה שומרת לעצמה את הזכות לעדכן מחירים מעת לעת. מחיר שנקבע בעת השלמת ההזמנה הוא המחיר המחייב לאותה עסקה.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. מדיניות ביטולים והחזרים</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  אנו פועלים בהתאם לחוק הגנת הצרכן, התשמ"א-1981, ותקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010, לרבות תיקון 47 וכלל הוראות החוק.
                </p>

                <h3 className="font-bold text-gray-800 mt-4 mb-2">שירותים דיגיטליים ומנויים:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>ניתן לבטל עסקה לרכישת מנוי תוך 14 ימים ממועד ההתקשרות או ממועד קבלת מסמך הגילוי (המאוחר מביניהם), ובלבד שהביטול נעשה לפחות שני ימי עבודה לפני מועד תחילת השירות.</li>
                  <li>לאחר תחילת השימוש בפועל, ביטול מנוי מתחדש ייכנס לתוקף בתום תקופת החיוב הנוכחית.</li>
                  <li>במקרה של ביטול שלא עקב פגם או אי-התאמה, יחולו דמי ביטול בשיעור 5% מערך העסקה או 100 ש"ח, לפי הנמוך מביניהם.</li>
                </ul>

                <h3 className="font-bold text-gray-800 mt-4 mb-2">מוצרים דיגיטליים (קבצים, עיצובים, תבניות):</h3>
                <p className="text-gray-600 leading-relaxed">
                  עבור מוצרים דיגיטליים הניתנים להעתקה, שכפול או הורדה — לא ניתן לבטל את העסקה לאחר קבלת הגישה למוצר, בהתאם לסעיף 14ג(ד)(3) לחוק הגנת הצרכן.
                </p>

                <h3 className="font-bold text-gray-800 mt-4 mb-2">מוצרים פיזיים:</h3>
                <p className="text-gray-600 leading-relaxed">
                  ניתן לבטל עסקה תוך 14 יום מקבלת המוצר או ממועד קבלת מסמך הגילוי (המאוחר מביניהם). על הלקוח להחזיר את המוצר באריזתו המקורית וללא פגם.
                </p>

                <h3 className="font-bold text-gray-800 mt-4 mb-2">ביטול עקב פגם או אי-התאמה:</h3>
                <p className="text-gray-600 leading-relaxed">
                  במקרה של פגם במוצר או אי-התאמה בין המוצר לתיאורו, ניתן לבטל את העסקה תוך 14 ימים מגילוי הפגם, ללא חיוב דמי ביטול.
                </p>

                <h3 className="font-bold text-gray-800 mt-4 mb-2">אופן הביטול:</h3>
                <p className="text-gray-600 leading-relaxed">
                  הודעת ביטול תימסר באחד מהאמצעים הבאים: טלפון 050-227-7087, דוא"ל yositaxes@gmail.com, או בדואר רשום לכתובת החברה. ההחזר הכספי יבוצע תוך 14 ימי עסקים מקבלת הודעת הביטול.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. מסמך גילוי</h2>
                <p className="text-gray-600 leading-relaxed">
                  בהתאם לחוק הגנת הצרכן ולתקנות ביטול עסקה, פרטי העסקה המהותיים (לרבות מחיר, תיאור השירות, תנאי ביטול ופרטי החברה) מוצגים בעמוד הרכישה ונשלחים ללקוח בדוא"ל עם אישור ההזמנה. מסמך זה מהווה את "מסמך הגילוי" כנדרש בחוק.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. קניין רוחני</h2>
                <p className="text-gray-600 leading-relaxed">
                  כל זכויות הקניין הרוחני באתר, לרבות שם המותג "פרפקט וואן", עיצובים, תכנים, קוד מחשב וקבצים גרפיים, הינם רכושה הבלעדי של החברה. אין להעתיק, לשכפל, להפיץ או לעשות כל שימוש מסחרי בתכנים אלו ללא אישור מראש ובכתב.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">9. פרטיות ואבטחת מידע</h2>
                <p className="text-gray-600 leading-relaxed">
                  החברה פועלת בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, ולתיקון 13 לחוק. פרטי האשראי של המשתמשים אינם נשמרים במערכות החברה אלא מועברים ישירות לספקי סליקה מאובטחים בתקן PCI-DSS. לפרטים נוספים, עיין/י ב<a href="/Privacy" className="text-violet-600 hover:text-violet-700 underline">מדיניות הפרטיות</a> שלנו.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">10. הגבלת אחריות</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  השירותים והמוצרים באתר ניתנים לשימוש כמות שהם (AS IS). אין בתכנים באתר משום ייעוץ מקצועי (משפטי, חשבונאי או אחר), והם אינם מחליפים ייעוץ פרטני מאיש מקצוע מוסמך.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  החברה לא תישא באחריות לנזק ישיר או עקיף שייגרם כתוצאה משימוש באתר או במוצרים, מעבר לסכום ששולם בפועל עבור השירות או המוצר הרלוונטי. אין באמור כדי לגרוע מזכויות הצרכן על פי כל דין.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">11. נגישות</h2>
                <p className="text-gray-600 leading-relaxed">
                  החברה פועלת לשיפור הנגישות של האתר בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013. במידה ונתקלת בבעיית נגישות באתר, אנא פנה/י אלינו ונטפל בכך בהקדם.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">12. דין וסמכות שיפוט</h2>
                <p className="text-gray-600 leading-relaxed">
                  על תקנון זה ועל השימוש באתר יחולו דיני מדינת ישראל בלבד. סמכות השיפוט הבלעדית לכל עניין הנוגע לתקנון זה מוקנית לבתי המשפט המוסמכים במחוז תל אביב.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">13. יצירת קשר</h2>
                <p className="text-gray-600 leading-relaxed">
                  לכל שאלה, בירור, תלונה או הודעת ביטול, ניתן לפנות אלינו:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3">
                  <li>חברת פרפקט וואן, ח.פ 516309747</li>
                  <li>טלפון: 050-227-7087</li>
                  <li>דוא"ל: yositaxes@gmail.com</li>
                </ul>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
