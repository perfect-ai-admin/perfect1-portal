import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import InternalLinker from '../components/seo/InternalLinker';
import MicroCTA from '../components/cro/MicroCTA';
import LeadForm from '../components/forms/LeadForm';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';

function FAQAccordion({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-50 rounded-xl p-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIsOpen(!isOpen)}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-right flex-1">{question}</h3>
        <ChevronDown className={`w-5 h-5 text-[#1E3A5F] transition-transform ml-4 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <p className="text-gray-700">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function PricingCost() {
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "כמה עולה לפתוח עוסק פטור?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "עלות פתיחת עוסק פטור משתנה: לבד - בחינם אך עם סיכונים גבוהים, דרך רואה חשבון - 500-1,500 ₪, ודרך פתרון אונליין - 249 ₪ במחיר קבוע."
        }
      },
      {
        "@type": "Question",
        "name": "האם אפשר לפתוח עוסק פטור בעצמי בחינם?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "כן, אך ללא ליווי מקצועי יש סיכונים של טעויות בטפסים, חוסר ידע על דוחות ודיווחים, ואי-בדיקה של זכאות."
        }
      }
    ]
  };

  return (
    <>
      <LocalBusinessSchema />
      <SEOOptimized
        title="כמה עולה לפתוח עוסק פטור? פירוט מחירים ואפשרויות פתיחה 2026"
        description="השוואת עלויות פתיחת עוסק פטור: לבד, דרך רואה חשבון, או אונליין ב-249 ₪. מידע מלא ללא התחייבות."
        keywords="כמה עולה לפתוח עוסק פטור, עלות פתיחת עוסק פטור, מחיר פתיחת עוסק פטור, פתיחת עוסק פטור אונליין מחיר, עוסק פטור אונליין"
        canonical="https://perfect1.co.il/pricing-cost"
        schema={pricingSchema}
      />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Breadcrumbs 
              items={[
                { label: 'דף הבית', path: createPageUrl('Home') },
                { label: 'מחיר פתיחת עוסק פטור' }
              ]}
            />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                כמה עולה לפתוח עוסק פטור? פירוט מחירים ואפשרויות פתיחה
              </h1>
              <p className="text-xl text-white/80">
                השוואה מלאה של מחירים ואפשרויות פתיחה לעצמאים בישראל
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Quick Answer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-50 border-r-4 border-blue-600 rounded-xl p-6 mb-12"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-bold text-blue-900 mb-2">כמה עולה לפתוח עוסק פטור? פירוט מחירים ואפשרויות פתיחה</h2>
                  <p className="text-gray-800 mb-4">
                    אם אתה שואל את עצמך כמה עולה לפתוח עוסק פטור, הגעת למקום הנכון. בעמוד הזה נסביר לך בדיוק מה העלויות האמיתיות, מה כלול בכל אפשרות, ונעזור לך להבין מה הכי מתאים לך.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Option 1: DIY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 border-4 border-gray-200 rounded-2xl p-8 bg-white"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור לבד?
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-6 mb-4">
                  <p className="text-green-900 font-bold text-lg">העלות: 0 ₪ (ללא עלות ישירה)</p>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">
                  פתיחת עוסק פטור באופן עצמאי היא חינמית לחלוטין. אתה יכול להגיע למשרדי הרשויות (מס הכנסה, מע״מ, ביטוח לאומי), למלא את הטפסים ולפתוח את התיק בעצמך.
                </p>

                <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-3">טעויות נפוצות שעלולות לעלות לך יקר:</h3>
                      <ul className="space-y-2 text-gray-800">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span><strong>בחירת סיווג שגוי</strong> - קוד עיסוק לא נכון יכול להשפיע על שיעור המס שלך</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span><strong>תיאום מס לא נכון</strong> - יכול לגרום לתשלום יותר מדי או פחות מדי במקדמות</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span><strong>הצהרות שגויות</strong> - טעויות בטפסים יכולות להסתבך אותך עם הרשויות בהמשך</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span><strong>אי הבנת ההשלכות</strong> - בחירות שאתה עושה היום משפיעות על המיסוי שלך לשנים</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg pt-4">
                  <strong>חשוב לדעת:</strong> אמנם אין עלות כספית ישירה, אבל טעויות בתהליך יכולות לעלות לך הרבה יותר בהמשך. אם אתה לא בטוח במה שאתה עושה, כדאי לשקול ליווי מקצועי.
                </p>
              </div>
            </motion.div>

            {/* Option 2: Accountant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 border-4 border-orange-200 rounded-2xl p-8 bg-white"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור דרך רואה חשבון?
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-6 mb-4">
                  <p className="text-green-900 font-bold text-lg">טווח מחירים: 500-1,500 ₪ בממוצע*</p>
                  <p className="text-green-800 text-sm mt-2">*המחיר משתנה בהתאם לרואה החשבון הנבחר ולטווח השירותים</p>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">
                  המחיר משתנה בהתאם למשרד, למיקום הגיאוגרפי, ולרמת השירות. יש רואי חשבון שמציעים פתיחה במחיר נמוך כחלק מחבילת ליווי שנתית, ויש כאלה שגובים מחיר נפרד. כדאי לברר מראש מה בדיוק כלול במחיר ולא לאחריו.
                </p>

                <div className="bg-green-50 border-r-4 border-green-600 rounded-xl p-6">
                  <h3 className="font-bold text-green-900 mb-4">מה כלול בדרך כלל:</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>פתיחת תיק במס הכנסה</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>רישום כפטור במע״מ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>פתיחת תיק בביטוח לאומי</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>ייעוץ ראשוני</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>הסבר על חובות דיווח</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border-r-4 border-red-500 rounded-xl p-6 mt-4">
                  <h3 className="font-bold text-red-900 mb-4">מה בדרך כלל לא כלול:</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span>ליווי חודשי (תוסף נפרד)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span>הגשת דוחות (תוסף נפרד)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span>תמיכה שוטפת (תוסף נפרד)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span>שירותים נוספים (תוסף נפרד)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-r-4 border-blue-600 rounded-xl p-6 mt-4">
                  <h3 className="font-bold text-blue-900 mb-3">מתי זה משתלם?</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>אם אתה צריך ייעוץ אישי ופגישה פנים אל פנים</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>אם המצב שלך מורכב (מספר מקורות הכנסה, שותפים, וכו')</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>אם אתה מעדיף קשר אישי עם בן אדם שמכיר אותך</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <MicroCTA 
              text="עדיין בתהליך ההחלטה?" 
              cta="בדוק אם זה מתאים לך" 
              variant="subtle" 
            />

            {/* Option 3: Online */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 border-4 border-green-500 rounded-2xl p-8 bg-gradient-to-br from-white to-green-50"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור אונליין?
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-6 mb-4">
                  <p className="text-green-900 font-bold text-lg">מחיר קבוע: 249 ₪ (תשלום חד-פעמי)*</p>
                  <p className="text-green-800 text-sm mt-2">*המחיר כולל את כל הדרוש לפתיחה וללא הפתעות נוספות</p>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">
                  למי שמעדיף לעשות הכל דיגיטלי וללא פגישות, קיימת אפשרות לפתוח עוסק פטור אונליין במחיר קבוע של 249 ₪. זה מחיר שקוף וידוע מראש, ללא תוספות או הפתעות נוספות בהמשך.
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-r-4 border-indigo-600 rounded-xl p-6">
                  <h3 className="font-bold text-indigo-900 mb-4">מה כלול במחיר:</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>פתיחת תיק עוסק פטור במלואו</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>טיפול מול מס הכנסה</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>רישום במע״מ כפטור</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>פתיחת תיק בביטוח לאומי</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>הדרכה מלאה על השלבים הבאים</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>תמיכה במהלך התהליך</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 border-r-4 border-purple-600 rounded-xl p-6 mt-4">
                  <h3 className="font-bold text-purple-900 mb-3">למה זה נוח?</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span><strong>מהיר:</strong> התהליך בדרך כלל מסתיים תוך עד 48 שעות*</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span><strong>בטוח:</strong> הכל נעשה נכון, מקצועי ומאובטח</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span><strong>חסכוני:</strong> מחיר נמוך משמעותית מרואה חשבון</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span><strong>פשוט:</strong> ללא צורך בפגישות או ריצות</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg pt-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6">
                  אם אתה מחפש דרך פשוטה, מהירה וחסכונית לפתוח עוסק פטור, אפשר גם לפתוח עוסק פטור אונליין בצורה דיגיטלית מלאה.
                </p>
              </div>
            </motion.div>

            {/* Lead Form CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border-4 border-green-500 shadow-lg"
            >
              <div className="text-center mb-6">
                <div className="mb-4 inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  הצעה מיוחדת 🎁
                </div>
                <h2 className="text-3xl font-black text-green-900 mb-4">
                  הדרך הכי פשוטה ומהירה? 
                </h2>
                <p className="text-xl text-green-800 mb-2 font-bold">
                  תפתח עוסק פטור אונליין ב-249 ₪ בלבד - בדרך כלל תוך עד 48 שעות*
                </p>
                <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
                  אל תבזבז זמן על טפסים מורכבים או פגישות. אנחנו נטפל בהכל עבורך: מס הכנסה, ביטוח לאומי, מע"מ - הכל כלול במחיר קבוע של 249 ₪.
                </p>
              </div>
              
              <div className="max-w-md mx-auto">
                <LeadForm 
                  title=""
                  subtitle=""
                  sourcePage="עמוד מחיר - CTA ירוק"
                  variant="inline"
                  showConsent={true}
                  submitButtonText="✅ פתח עוסק פטור אונליין עכשיו"
                  submitButtonClass="w-full h-14 text-lg font-black bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                />
              </div>
            </motion.div>

            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                טבלת השוואה
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1E3A5F] text-white">
                      <th className="border border-gray-300 px-4 py-3 text-right">שיטה</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">מחיר</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">זמן</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">סיכונים</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-bold text-[#1E3A5F]">לבד</td>
                      <td className="border border-gray-300 px-4 py-3">₪ 0</td>
                      <td className="border border-gray-300 px-4 py-3">שבועות</td>
                      <td className="border border-gray-300 px-4 py-3 text-red-600">גבוהים מאוד</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-bold text-[#1E3A5F]">רואה חשבון</td>
                      <td className="border border-gray-300 px-4 py-3">₪ 200-500</td>
                      <td className="border border-gray-300 px-4 py-3">כמה ימים</td>
                      <td className="border border-gray-300 px-4 py-3 text-green-600">נמוכים</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-bold text-[#1E3A5F]">אונליין</td>
                      <td className="border border-gray-300 px-4 py-3 text-indigo-600 font-bold">₪ 249</td>
                      <td className="border border-gray-300 px-4 py-3">בדרך כלל עד 48 שעות*</td>
                      <td className="border border-gray-300 px-4 py-3 text-green-600">נמוכים</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                שאלות נפוצות על פתיחת עוסק פטור ועלויות
              </h2>
              <div className="space-y-3">
                <FAQAccordion question="כמה עולה לפתוח עוסק פטור בשנת 2026?" answer="עלות פתיחת עוסק פטור משתנה לפי השיטה: לבד ללא עלות כספית (אך עם סיכונים), דרך רואה חשבון 500-1,500 ₪, ודרך פתרון אונליין 249 ₪ במחיר קבוע." />
                <FAQAccordion question="האם פתיחת עוסק פטור אונליין זולה יותר?" answer="כן, 249 ₪ היא בדרך כלל זולה משמעותית משיטות אחרות, ובמיוחד בהשוואה ליווי מלא דרך רואה חשבון. בנוסף, זה מחיר שקוף ללא הפתעות נוספות." />
                <FAQAccordion question="האם אפשר לפתוח עוסק פטור לבד?" answer="כן, אפשר לפתוח לבד בחינם, אך זה דורש ידע במילוי טפסים, בדיקה של זכאות, והבנת דוחות דיווח. רוב העצמאים מעדיפים ליווי כדי להימנע מטעויות יקרות." />
                <FAQAccordion question="מה שונה בין פתיחה אונליין לפתיחה דרך רואה חשבון?" answer="פתיחה אונליין היא תהליך דיגיטלי מלא, מהנייד שלך. רואה חשבון בדרך כלל מציע גם ליווי שוטף וייעוץ מתמשך, אך זה עלות נוספת. לכל אחת יתרונות משלה בהתאם לצרכים שלך." />
                <FAQAccordion question="האם יש עלויות נוספות אחרי פתיחת עוסק פטור?" answer="פתיחת עוסק פטור עצמה אינה כוללת עלויות ממשלתיות. אך יש שירותים נוספים אופציונליים כמו דוח שנתי, רישום למע״מ, או ליווי שוטף - כל אלה בחיובים נפרדים." />
                <FAQAccordion question="כמה זמן לוקח לפתוח עוסק פטור?" answer="כאשר פותחים דרך רואה חשבון, בדרך כלל לוקח כמה ימים. דרך פתרון אונליין, התהליך בדרך כלל מסתיים תוך עד 48 שעות, בהתאם למקרה הספציפי." />
                <FAQAccordion question="האם פתיחת עוסק פטור אונליין כוללת טיפול מול מס הכנסה וביטוח לאומי?" answer="כן, הפתיחה כוללת טיפול ממלא מול מס הכנסה וביטוח לאומי. פטור ממע״מ הוא אוטומטי לעוסקים הזכאים. שירותים נוספים כמו רישום למע״מ מטופלים בנפרד." />
              </div>
            </motion.div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-6 md:p-8 text-white text-center"
            >
              <h2 className="text-2xl md:text-3xl font-black mb-4 text-white">
                אתה כבר יודע איזו דרך מתאימה לך?
              </h2>
              <p className="text-white/90 mb-6 md:mb-8 text-base md:text-lg">
                אם אתה עדיין בספקות, אנחנו כאן כדי לעזור
              </p>
              <button 
                onClick={() => document.querySelector('[data-lead-form]')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full md:w-auto h-14 px-6 md:px-10 text-base md:text-lg font-black rounded-full bg-white text-[#1E3A5F] hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                רוצה לדעת אם זה המסלול הנכון?
                <ArrowLeft className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Side Form */}
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
                  בואו נמצא לך את הפתרון הנכון
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  כל עוסק פטור שונה. לכן, במקום לזרוק לך מחיר כללי, אנחנו רוצים להבין את המצב שלך ולהציע בדיוק מה שמתאים.
                </p>
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-28" data-lead-form>
                  <LeadForm 
                    title="רוצה ייעוץ אישי?"
                    subtitle="השאר פרטים ונבחן מה מתאים לך"
                    sourcePage="עמוד מחיר - כמה עולה לפתוח עוסק פטור"
                    variant="card"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}