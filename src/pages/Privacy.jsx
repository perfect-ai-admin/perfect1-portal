import React from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';

export default function Privacy() {
  return (
    <>
      <SEOOptimized 
        title="מדיניות הפרטיות - פרפקט וואן"
        description="מדיניות הפרטיות של פרפקט וואן - כיצד אנחנו משתמשים ומנהלים את המידע שלך"
        canonical="https://perfect1.co.il/privacy"
      />
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'מדיניות פרטיות' }
          ]} />
        </div>

        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">מדיניות הפרטיות</h1>
            <p className="text-xl text-white/80">כיצד אנחנו משתמשים ומנהלים את המידע שלך</p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* מה אנחנו */}
              <div className="bg-blue-50 border-l-4 border-[#1E3A5F] rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-3">מי אנחנו</h2>
                <p className="text-gray-800">
                  <strong>פרפקט וואן</strong> היא חברה פרטית (ח.פ: 516309747) המספקת ייעוץ וליווי בתחום פתיחת עסקים בישראל.
                  <br />
                  <strong>אנחנו חברה פרטית וביעלות חזקה: האתר אינו אתר ממשלתי ואנחנו אינו מייצגים רשות כלשהי.</strong>
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">1. איזה מידע אנחנו אוספים?</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  כשאתה פונה אלינו דרך האתר, אנחנו אוספים:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    'שם מלא',
                    'מספר טלפון',
                    'כתובת דוא"ל (אם סופקה)',
                    'מידע על המקצוע או סוג העסק שלך',
                    'הערות או פרטים נוספים שאתה בוחר לשתף'
                  ].map((item, i) => (
                    <li key={i} className="text-gray-700 flex gap-3">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">2. למה אנחנו משתמשים בזה?</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  המידע שלך משמש ל:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    'ליצור קשר איתך בנוגע לשירותים שלנו',
                    'לתת לך ייעוץ וליווי בתהליך פתיחת העסק',
                    'לשלוח לך עדכונים וטיפים בנוגע לנושאים הרלוונטיים',
                    'לשפר את השירותים שלנו בהתאם למשוב',
                    'לדעת כמה מישהו הגיע אלינו וממה (לניתוח סטטיסטיקות)'
                  ].map((item, i) => (
                    <li key={i} className="text-gray-700 flex gap-3">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">3. האם אנחנו משתפים את המידע שלך?</h2>
                <p className="text-gray-700 leading-relaxed">
                  <strong>לא, אנחנו לא משתפים את המידע שלך עם גורמים חיצוניים.</strong>
                </p>
                <p className="text-gray-700 mt-4">
                  המידע שלך יישמר אצלנו בלבד וישמש אך ורק לתקשורת עם חברה שלנו.
                </p>
                <p className="text-gray-700 mt-4 text-sm">
                  <strong>חריגים:</strong> אנחנו עשויים לשתף מידע אם נדרשנו על פי חוק או להגן על זכויות משפטיות.
                </p>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">4. כמה זמן אנחנו שומרים את המידע?</h2>
                <p className="text-gray-700 leading-relaxed">
                  אנחנו שומרים את המידע שלך כל עוד אתה חוקק זקוק לשירותים שלנו, וגם לתקופה סבירה לאחר מכן כדי להמשיך להציע תמיכה ולהתייעץ.
                  <br />
                  אם אתה מבקש להסיר את המידע שלך, תוכל להשיג זאת בכל זמן.
                </p>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">5. אבטחת המידע שלך</h2>
                <p className="text-gray-700 leading-relaxed">
                  אנחנו שומרים את המידע שלך בצורה בטוחה. הנתונים מאוחסנים בשרתים מאובטחים וניתנים לגישה רק לאנשים שצריכים לגשת אליהם כדי להשיג את הדרישות שלך.
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">6. הזכויות שלך</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  יש לך את הזכות:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    'לגשת למידע שלך ולראות מה אנחנו שומרים עליך',
                    'לתקן מידע שגוי',
                    'למחוק את המידע שלך',
                    'לבקש לא לקבל עוד פניות דוא"ל או טלפוניות'
                  ].map((item, i) => (
                    <li key={i} className="text-gray-700 flex gap-3">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">7. עוגיות (Cookies)</h2>
                <p className="text-gray-700 leading-relaxed">
                  האתר שלנו משתמש בעוגיות כדי לשפר את החוויה שלך. עוגיות אלה עוזרות לנו להבין איך אתה משתמש באתר ולעדכן אותו.
                  <br />
                  אתה יכול להגדיר את הדפדפן שלך לדחיית עוגיות אם תרצה.
                </p>
              </div>

              {/* Section 8 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">8. שינויים למדיניות זו</h2>
                <p className="text-gray-700 leading-relaxed">
                  עלול להיות עדכונים למדיניות זו. שינויים יופרסמו באתר ותחיד לתוקף מיד.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-[#1E3A5F] rounded-lg p-6 mt-12">
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">שאלות בנוגע לפרטיות?</h3>
                <p className="text-gray-800 mb-4">
                  אנחנו כאן כדי לעזור! אתה יכול ליצור קשר איתנו בכל שאלה בנוגע למדיניות הפרטיות שלנו:
                </p>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-800 font-medium mb-2">
                    <strong>פרפקט וואן</strong>
                  </p>
                  <p className="text-gray-700 mb-1">
                    📞 <a href="tel:0502277087" className="text-[#1E3A5F] hover:underline">0502277087</a>
                  </p>
                  <p className="text-gray-700 mb-1">
                    💬 <a href="https://wa.me/972502277087" className="text-[#1E3A5F] hover:underline">וואטסאפ</a>
                  </p>
                  <p className="text-gray-700">
                    🏢 אנחנו זמינים בשעות: א'-ה' 9:00-18:00
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <p className="text-sm text-gray-500 text-center mt-8">
                עדכון אחרון: 11 בינואר 2026
              </p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}