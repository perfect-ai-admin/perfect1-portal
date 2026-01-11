import React from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';

export default function Terms() {
  return (
    <>
      <SEOOptimized 
        title="תנאי שימוש - פרפקט וואן"
        description="תנאי השימוש באתר פרפקט וואן - הבהרה על טבע השירות, אחריויות וחוקים"
        canonical="https://perfect1.co.il/terms"
      />
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'תנאי שימוש' }
          ]} />
        </div>

        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">תנאי השימוש</h1>
            <p className="text-xl text-white/80">הבהרה על טבע השירות, אחריויות וחוקים</p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Important Notice */}
              <div className="bg-red-50 border-4 border-red-400 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">⚠️ הבהרה חשובה ביותר</h2>
                <div className="space-y-3 text-lg text-gray-800">
                  <p>
                    <strong>פרפקט וואן</strong> (ח.פ: 516309747) היא חברה פרטית.
                  </p>
                  <p>
                    <strong>👉 האתר אינו אתר ממשלתי</strong>
                  </p>
                  <p>
                    <strong>👉 אנחנו אינם מייצגים רשות כלשהי</strong>
                  </p>
                  <p>
                    <strong>👉 זה ייעוץ וליווי פרטי בלבד - אתה מבצע את הפעולות בעצמך מול הרשויות</strong>
                  </p>
                  <p>
                    <strong>👉 אנחנו לא נותנים ייעוץ משפטי או חשבונאי רשמי</strong>
                  </p>
                </div>
              </div>

              {/* Section 1 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">1. טבע השירות</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  השירותים שאנחנו מספקים הם:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    'ייעוץ פרטי בנושא פתיחת עסקים בישראל',
                    'הדרכה וליווי בתהליך הפתיחה',
                    'עזרה בהבנת דרישות הרשויות',
                    'אישור בהכנת מסמכים'
                  ].map((item, i) => (
                    <li key={i} className="text-gray-700 flex gap-3">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700 mt-6 font-bold bg-yellow-50 p-4 rounded-lg">
                  ❌ השירותים אינם כוללים: ביצוע פעולות משפטיות, ייעוץ חשבונאי רשמי, או כל התחייבות להשלים תהליכים בשם הלקוח.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">2. אחריות הלקוח</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  הלקוח אחראי אישית:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    'ביצוע כל הפעולות מול הרשויות (מס הכנסה, ביטוח לאומי וכו\')',
                    'לוידוא שהמידע שסיפק הוא נכון ותקין',
                    'להקפדה על כל החוקים הרלוונטיים',
                    'לביצוע פעולות משפטיות או חשבונאיות בהנחיית אנשי מקצוע רשמיים'
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
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">3. חוקים וחוקיות</h2>
                <p className="text-gray-700 leading-relaxed">
                  כל החוקים של מדינת ישראל חלים על פתיחת עסק. אנחנו מספקים ייעוץ על סמך ידע שלנו, אך <strong>אנחנו אינו מבטיחים דיוק מלא בכל מקרה</strong> ו<strong>אנחנו אינו אחראים לטעויות משלנו או לשינויים בחוקים</strong>.
                </p>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">4. אי-אחריות מוגבלת</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  פרפקט וואן לא אחראית לנזקים או הפסדים הנוצרים מ:
                </p>
                <ul className="space-y-2 ml-6">
                  {[
                    'שגיאות או השמטות בהנחיות שלנו',
                    'שינויים בחוקים לאחר קבלת השירות',
                    'החלטות אישיות של הלקוח',
                    'אי-ציות של הרשויות לבקשות',
                    'השימוש באתר או השירותים שלנו בדרך כלשהי'
                  ].map((item, i) => (
                    <li key={i} className="text-gray-700 flex gap-3">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">5. מידע אישי וחוקיות</h2>
                <p className="text-gray-700 leading-relaxed">
                  כשאתה משתמש בשירותים שלנו, אתה מספק מידע אישי. מידע זה משומר בהתאם לחוקי הגנת הנתונים בישראל ולמדיניות הפרטיות שלנו.
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">6. זכויות יוצרים</h2>
                <p className="text-gray-700 leading-relaxed">
                  כל התוכן באתר (טקסטים, עיצובים, תמונות וכו') הוא בעלות פרפקט וואן. אתה לא רשאי להעתיק, להפיץ או להשתמש בתוכן ללא הסכמה בכתב.
                </p>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">7. שינויים לתנאים</h2>
                <p className="text-gray-700 leading-relaxed">
                  פרפקט וואן שומרת לעצמה את הזכות לשנות תנאים אלו בכל עת. שינויים יהיו בתוקף מיד לאחר פרסום באתר.
                </p>
              </div>

              {/* Section 8 - Contact */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">8. פרטי החברה</h2>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-[#1E3A5F]">
                  <p className="text-gray-800 font-bold mb-3">פרפקט וואן</p>
                  <p className="text-gray-700 mb-2">
                    <strong>מספר חברה:</strong> 516309747
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>טלפון:</strong> <a href="tel:0502277087" className="text-[#1E3A5F] hover:underline">0502277087</a>
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>וואטסאפ:</strong> <a href="https://wa.me/972502277087" className="text-[#1E3A5F] hover:underline">צור קשר</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>שעות פעילות:</strong> א'-ה' 9:00-18:00
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