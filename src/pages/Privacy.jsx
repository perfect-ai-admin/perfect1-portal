import React from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';

export default function Privacy() {
  return (
    <>
      <SEOOptimized 
        title="מדיניות פרטיות - Perfect One"
        description="מדיניות הפרטיות של Perfect One - כיצד אנחנו משתמשים במידע שלך"
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
              {/* Section 1 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">1. איזה מידע אנחנו אוספים?</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  כשאתה משתמש באתר שלנו או מוודע את הטופס, אנחנו אוספים:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    'שם מלא',
                    'מספר טלפון',
                    'כתובת דוא"ל (אם סופקה)',
                    'מידע על המקצוע שלך',
                    'כל מידע נוסף שאתה בוחר לשתף'
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
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">2. איך אנחנו משתמשים בזה?</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  המידע שלך משמש ל:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    'ליצור קשר איתך בנוגע לשירותים שלנו',
                    'לספק ייעוץ וליווי',
                    'לשלוח עדכונים וטיפים בנוגע לעוסקים בישראל',
                    'לשיפור השירותים שלנו',
                    'לניתוח דוחות וסטטיסטיקות (בצורה אנונימית)'
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
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">3. האם אנחנו משתפים מידע?</h2>
                <p className="text-gray-700 leading-relaxed">
                  אנחנו <strong>לא</strong> משתפים את המידע שלך עם צדדים שלישיים, אלא:
                </p>
                <ul className="space-y-2 ml-6 mt-4">
                  {[
                    'כשנדרוש על פי דין',
                    'כדי למנוע הונאה או אבטחה',
                    'עם בעלי הרשות בהסכמתך'
                  ].map((item, i) => (
                    <li key={i} className="text-gray-700 flex gap-3">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">4. עמידה בחוקים</h2>
                <p className="text-gray-700 leading-relaxed">
                  אנחנו עומדים בתנאי חוק הגנת הנתונים בישראל וכל ההסדרים הרלוונטיים. 
                  המידע שלך מאוחסן בצורה בטוחה עם הצפנה.
                </p>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">5. זכויותיך</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  יש לך את הזכות:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    'לגשת למידע שלך',
                    'לתקן מידע שגוי',
                    'למחוק את המידע שלך',
                    'לבקש לא לקבל פניות'
                  ].map((item, i) => (
                    <li key={i} className="text-gray-700 flex gap-3">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">6. Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  האתר שלנו עשוי להשתמש ב-cookies לשיפור החוויה. אתה יכול להגדיר את הדפדפן שלך לדחיית cookies.
                </p>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">7. שינויים למדיניות</h2>
                <p className="text-gray-700 leading-relaxed">
                  עלול להיות עדכונים למדיניות זו. שינויים יופרסמו באתר.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-blue-50 border-l-4 border-[#1E3A5F] rounded-lg p-6 mt-12">
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-2">שאלות בנוגע לפרטיות?</h3>
                <p className="text-gray-800 font-medium mt-3">
                  📧 <a href="mailto:info@perfect1.co.il" className="text-[#1E3A5F] hover:underline">info@perfect1.co.il</a>
                  <br />
                  📱 <a href="tel:0502277087" className="text-[#1E3A5F] hover:underline">0502277087</a>
                </p>
              </div>

              {/* Last Updated */}
              <p className="text-sm text-gray-500 text-center mt-8">
                עדכון אחרון: 2026-01-11
              </p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}