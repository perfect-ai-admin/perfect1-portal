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
              תנאי שימוש
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
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. כללי</h2>
                <p className="text-gray-600 leading-relaxed">
                  אתר זה מופעל על ידי חברת פרפקט וואן, ח.פ 516309747 (להלן: "החברה" או "הנהלת האתר"). השימוש באתר ובשירותיו כפוף לקריאת תקנון זה ולהסכמה לתנאיו. בעצם השימוש באתר, הגלישה בו, והזמנת שירותים או מוצרים באמצעותו, אתה מצהיר כי קראת את התקנון, הבנת אותו ואתה מסכים לכל הוראותיו.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. תיאור השירות והמוצרים</h2>
                <p className="text-gray-600 leading-relaxed">
                  האתר מציע שירותי SaaS לניהול עסקי (ClientDashboard), וכן מוצרים דיגיטליים ופיזיים הנמכרים מעת לעת. תמונות המוצרים באתר נועדו להמחשה בלבד וייתכנו הבדלים בין התמונות לבין המוצר בפועל. החברה עושה מאמצים לוודא שהמידע באתר מדויק, אך ייתכנו טעויות בתום לב.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. הזמנת מוצרים ואספקה</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  רכישת מוצרים באתר תתבצע באמצעות כרטיס אשראי או אמצעי תשלום אחר המקובל על החברה.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>החברה רשאית לא לאשר הזמנה מסיבות שונות כגון: מלאי שאזל, בעיה בפרטי האשראי, או כל סיבה אחרת לשיקול דעתה.</li>
                  <li>עבור מוצרים דיגיטליים, האספקה היא מיידית או תוך זמן קצר לכתובת המייל שהוזנה.</li>
                  <li>עבור מוצרים פיזיים (אם ישנם), זמני המשלוח יפורטו בעמוד המוצר. החברה לא תישא באחריות לעיכובים שאינם בשליטתה (כגון שביתות דואר, כוח עליון).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. מדיניות ביטולים והחזרים</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  אנו פועלים בהתאם לחוק הגנת הצרכן, התשמ"א-1981.
                </p>
                
                <h3 className="font-bold text-gray-800 mt-4 mb-2">מוצרים פיזיים:</h3>
                <p className="text-gray-600 leading-relaxed">
                  ניתן לבטל עסקה תוך 14 יום מקבלת המוצר או מסמך הגילוי (המאוחר מביניהם). הודעת הביטול תימסר לחברה בדוא"ל או בדואר רשום. במקרה של ביטול שלא עקב פגם, יחולו דמי ביטול בשיעור 5% מערך העסקה או 100 ש"ח, לפי הנמוך מביניהם. על הלקוח להחזיר את המוצר באריזתו המקורית וללא פגם.
                </p>

                <h3 className="font-bold text-gray-800 mt-4 mb-2">מוצרים דיגיטליים ושירותי מידע:</h3>
                <p className="text-gray-600 leading-relaxed">
                  עבור מוצרים הניתנים להקלטה, שעתוק או שכפול (כגון קבצים דיגיטליים, קורסים לצפייה מיידית, תוכנות), לא ניתן לבטל את העסקה לאחר קבלת הגישה למוצר, בהתאם לחוק הגנת הצרכן.
                </p>

                <h3 className="font-bold text-gray-800 mt-4 mb-2">מנויים מתחדשים:</h3>
                <p className="text-gray-600 leading-relaxed">
                  ניתן לבטל מנוי מתחדש בכל עת. הביטול ייכנס לתוקף בסיום מחזור החיוב הנוכחי. לא יינתנו החזרים כספיים רטרואקטיביים עבור תקופות שלא נוצלו במלואן, אלא אם נקבע אחרת בחוק.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. קניין רוחני</h2>
                <p className="text-gray-600 leading-relaxed">
                  כל זכויות הקניין הרוחני באתר, לרבות שם המותג, עיצובים, תכנים, קוד מחשב וקבצים גרפיים, הינם רכושה הבלעדי של חברת פרפקט וואן. אין להעתיק, לשכפל, להפיץ או לעשות כל שימוש מסחרי בתכנים אלו ללא אישור מראש ובכתב.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. פרטיות ואבטחת מידע</h2>
                <p className="text-gray-600 leading-relaxed">
                  החברה נוקטת באמצעי זהירות מקובלים על מנת לשמור, ככל האפשר, על סודיות המידע. פרטי האשראי של המשתמשים אינם נשמרים במערכות החברה אלא מסופקים ישירות לספקי סליקה מאובטחים. השימוש במידע שנאסף ייעשה רק על פי מדיניות הפרטיות של האתר ועל פי הוראות כל דין.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. הגבלת אחריות</h2>
                <p className="text-gray-600 leading-relaxed">
                  השירותים והמוצרים באתר ניתנים לשימוש כמות שהם (AS IS). החברה לא תישא באחריות לכל נזק, ישיר או עקיף, שייגרם למשתמש או לצד שלישי כתוצאה משימוש באתר או במוצרים, מעבר לעלות המוצר שנרכש בפועל.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. דין וסמכות שיפוט</h2>
                <p className="text-gray-600 leading-relaxed">
                  על תקנון זה ועל השימוש באתר יחולו דיני מדינת ישראל בלבד. סמכות השיפוט הבלעדית לכל עניין הנוגע לתקנון זה מוקנית לבתי המשפט המוסמכים במחוז תל אביב.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">9. יצירת קשר</h2>
                <p className="text-gray-600 leading-relaxed">
                  לכל שאלה, בירור או הודעת ביטול, ניתן לפנות אלינו בפרטים הבאים:<br/>
                  חברת פרפקט וואן (ח.פ 516309747)<br/>
                  דוא"ל: legal@clientdashboard.co.il
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