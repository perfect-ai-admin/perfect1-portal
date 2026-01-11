import React from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';

export default function Terms() {
  return (
    <>
      <SEOOptimized 
        title="תנאי השימוש - Perfect One"
        description="תנאי השימוש באתר Perfect One - הבהרה על טבע השירות, אחריויות וחוקים"
        canonical="https://perfect1.co.il/terms"
      />
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'תנאי השימוש' }
          ]} />
        </div>

        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">תנאי השימוש</h1>
            <p className="text-xl text-white/80">הבהרה על טבע השירות וההתחייבויות</p>
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
              <div className="bg-yellow-50 border-4 border-yellow-400 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">⚠️ הבהרה חיוני</h2>
                <p className="text-lg text-gray-800 leading-relaxed font-medium">
                  <strong>Perfect One</strong> היא חברה פרטית המספקת ייעוץ וליווי בתחום פתיחת עסקים בישראל.
                  <br />
                  <strong>האתר אינו אתר ממשלתי, אינו אתר רשמי של משרד או רשות כלשהי, וזה לא ייעוץ משפטי או חשבונאי רשמי.</strong>
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">1. טבע השירות</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  השירותים שאנחנו מספקים הם:
                </p>
                <ul className="space-y-3 ml-6">
                  {[
                    'ייעוץ פרטי בנושא פתיחת עוסקים בישראל',
                    'הדרכה וליווי בתהליך פתיחה',
                    'עזרה בהבנת הדרישות של הרשויות',
                    'אשור במילוי טפסים ובהכנת מסמכים'
                  ].map((item, i) => (
                    <li key={i} className="text-gray-700 flex gap-3">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700 mt-6 font-medium">
                  <strong>השירותים אינם כוללים:</strong> ביצוע פעולות בשם הלקוח, ייעוץ חשבונאי רשמי, או ייעוץ משפטי רשמי.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">2. אחריויות הלקוח</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  הלקוח אחראי אישית:
                </p>
                <ul className="space-y-3 ml-6">
                  {[
                    'לביצוע הנתונים עם הרשויות (מס הכנסה, ביטוח לאומי, מע"מ)',
                    'לוידוא כי כל המידע שסופק הוא נכון ותקין',
                    'להקפדה על דרישות חוקיות בתחום עוסקים',
                    'לייעוץ משפטי או חשבונאי במקומות בהם נדרוש'
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
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">3. חוקים והסדרים</h2>
                <p className="text-gray-700 leading-relaxed">
                  כל החוקים החלים על פתיחת עוסקים בישראל חלים על הלקוח. ייעוצנו מבוסס על חוקים שנכונים כפי שידוע לנו, 
                  אך חוקים עשויים להשתנות. אנחנו אחראים להידע שלנו אבל לא מבטיחים דיוק מלא בכל מקרה.
                </p>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">4. אי אחריות מוגבלת</h2>
                <p className="text-gray-700 leading-relaxed">
                  Perfect One לא אחראית לכל נזק או הפסד שנוצר מ:
                </p>
                <ul className="space-y-3 ml-6 mt-4">
                  {[
                    'שגיאות או השמטות בהנחיות שלנו',
                    'שינויים בחוקים לאחר תאריך השירות',
                    'החלטות אישיות של הלקוח',
                    'אי ציות של הרשויות'
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
                  בעת שימוש בשירותים שלנו, אתה מספק מידע אישי. מידע זה משומר בהתאם לחוקי הגנת הנתונים בישראל.
                  אנחנו לא משתפים מידע עם צדדים שלישיים, אלא אם נדרוש על פי דין.
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">6. זכויות יוצרים</h2>
                <p className="text-gray-700 leading-relaxed">
                  כל התוכן באתר, כולל טקסטים, עיצובים ותמונות, הוא זכות יוצרים של Perfect One. 
                  אינך רשאי להעתיק או להפיץ תוכן ללא הסכמה בכתב.
                </p>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">7. שינויים לתנאים</h2>
                <p className="text-gray-700 leading-relaxed">
                  Perfect One שומרת לעצמה את הזכות לשנות תנאים אלו בכל זמן. שינויים יהיו בתוקף מיד לאחר פרסום באתר.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-blue-50 border-l-4 border-[#1E3A5F] rounded-lg p-6 mt-12">
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-2">יצירת קשר לשאלות</h3>
                <p className="text-gray-700">
                  לכל שאלה או הערה בנוגע לתנאים אלו:
                </p>
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