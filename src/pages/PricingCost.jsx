import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import InternalLinker from '../components/seo/InternalLinker';
import MicroCTA from '../components/cro/MicroCTA';
import LeadForm from '../components/forms/LeadForm';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';

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
          "text": "עלות פתיחת עוסק פטור משתנה: לבד - בחינם אך עם סיכונים גבוהים, דרך רואה חשבון - 200-500 ₪, ודרך פתרון אונליין - 199 ₪ במחיר קבוע."
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
        description="השוואת עלויות פתיחת עוסק פטור: לבד, דרך רואה חשבון, או אונליין ב-199 ₪. מידע מלא ללא התחייבות."
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
                  <h2 className="text-lg font-bold text-blue-900 mb-2">תשובה מהירה</h2>
                  <p className="text-gray-800">
                    עלות פתיחת עוסק פטור משתנה בין אפס שקלים (אם תפתח לבד) ועד כמה מאות שקלים דרך מקצוע. ישנה אופציה אונליין בעלות קבועה של 199 ₪ שמכסה את כל התהליך מ-ה-א עד ה-ת.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Option 1: DIY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור לבד?
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg">
                  מבחינת עלות כספית - <strong>אפס שקלים</strong>. פתיחת עוסק פטור למס הכנסה, רישום בביטוח לאומי, והגדרת פטור ממע"מ הם שירותים ממשלתיים שלא כוללים עמלות רשמיות.
                </p>

                <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-3">אך יש סיכונים משמעותיים:</h3>
                      <ul className="space-y-2 text-gray-800">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span><strong>טעויות בטפסים</strong> - מילוי לא נכון של בקשות למס הכנסה או ביטוח לאומי</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span><strong>חוסר ידע בחובות</strong> - לא לדעת מה צריך להדווח בדוחות שנתיים או חודשיים</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span><strong>בדיקה לא מעמיקה של זכאות</strong> - הנחת כל זכאותך בטעות בגלל אי-בדיקה</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span><strong>בעיות עם הרשויות</strong> - פניות ממס הכנסה או ביטוח לאומי בגלל אי-התאמות</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 font-bold">•</span>
                          <span><strong>זמן רב וקשה</strong> - חיפוש מידע, הבנת טפסים, וטיפול בבירוקרטיה</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg pt-4">
                  <InternalLinker 
                    content="לכן, אם אתה בחירים בלא לקחת סיכונים - זה לא המסלול המומלץ לרוב העצמאים."
                    currentPage="PricingCost"
                  />
                </p>
              </div>
            </motion.div>

            {/* Option 2: Accountant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור דרך רואה חשבון?
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg">
                  טווח המחירים הריאלי: <strong>200 עד 500 שקל</strong> (וחלקם אפילו יותר בקצה הגבוה של השוק). זה תלוי בעיר שלך, בשם המשרד, ובמצב של פתיחה מול ליווי שוטף.
                </p>

                <div className="bg-green-50 border-r-4 border-green-600 rounded-xl p-6">
                  <h3 className="font-bold text-green-900 mb-4">מה בדרך כלל כלול:</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>איסוף מסמכים (תעודת זהות, אישור בנק)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>מילוי בקשות למס הכנסה וביטוח לאומי</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>הגשת הבקשות לרשויות</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>קבלת אישורים מהרשויות</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border-r-4 border-red-500 rounded-xl p-6 mt-4">
                  <h3 className="font-bold text-red-900 mb-4">מה בדרך כלל לא כלול (וחשוב לשאול):</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span>ליווי חודשי או שנתי (לעיתים זה תוספת נוספת)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span>הגשת דוח שנתי (שירות נפרד, לעיתים 1000-1500 ₪)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span>יועצי מס לשאלות מתמשכות</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg pt-4">
                  <strong>תשלום בודד וסגור</strong> - הרוב של רואי חשבון נוטים להציע מחיר כולל לפתיחה בלבד, ולא כחלק מחוזה שוטף.
                </p>
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
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור אונליין?
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg">
                  <strong>199 שקל - מחיר קבוע ללא הפתעות</strong>. למי שמעדיף תהליך דיגיטלי מלא ללא צורך להגיע למשרדים, קיימת אפשרות של <Link to={createPageUrl('OsekPaturOnlineLanding')} className="text-[#1E3A5F] font-bold hover:underline">פתיחת עוסק פטור אונליין</Link> שמכסה את כל התהליך במחיר קבוע.
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-r-4 border-indigo-600 rounded-xl p-6">
                  <h3 className="font-bold text-indigo-900 mb-4">מה כלול ב-199 ₪:</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span>תהליך מקוון מלא - ללא יציאה מהבית</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span>העלאת מסמכים מהנייד (תעודת זהות, אישור בנק)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span>חתימה דיגיטלית מאובטחת</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span>הגשת בקשות לרשויות בשמך</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span>מעקב סטטוס בזמן אמת</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span>תמיכה בוואטסאפ לשאלות</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg pt-4">
                  <strong>מחיר שקוף</strong> - אין עמלות נוספות, אין הפתעות, אין בדיקות שקר.
                </p>
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
                      <td className="border border-gray-300 px-4 py-3 text-indigo-600 font-bold">₪ 199</td>
                      <td className="border border-gray-300 px-4 py-3">24-72 שעות</td>
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
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-gray-900">כמה עולה לפתוח עוסק פטור בשנת 2025?</h3>
                  </div>
                  <p className="text-gray-700 ml-8">עלות פתיחת עוסק פטור משתנה לפי השיטה: לבד ללא עלות כספית (אך עם סיכונים), דרך רואה חשבון 200-500 ₪, ודרך פתרון אונליין 199 ₪ במחיר קבוע.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-gray-900">האם פתיחת עוסק פטור אונליין זולה יותר?</h3>
                  </div>
                  <p className="text-gray-700 ml-8">כן, 199 ₪ היא בדרך כלל זולה משיטות אחרות, ובמיוחד בהשוואה ליווי רובה מלא דרך רואה חשבון. בנוסף, זה מחיר שקוף ללא הפתעות.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-gray-900">האם אפשר לפתוח עוסק פטור לבד בלי רואה חשבון?</h3>
                  </div>
                  <p className="text-gray-700 ml-8">כן, אפשר לפתוח לבד בחינם, אך זה דורש ידע במילוי טפסים, בדיקה של זכאות, והבנת דוחות דיווח. רוב העצמאים מעדיפים ליווי כדי להימנע מטעויות.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-gray-900">מה ההבדל בין פתיחה אונליין לפתיחה דרך רואה חשבון?</h3>
                  </div>
                  <p className="text-gray-700 ml-8">פתיחה אונליין היא תהליך דיגיטלי גרידא, מהנייד שלך. רואה חשבון בדרך כלל מציע גם ליווי שוטף וייעוץ מתמשך, אך זה עלות נוספת. לכל אחת יתרונות משלה בהתאם לצרכים שלך.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-gray-900">האם יש עלויות נוספות אחרי פתיחת עוסק פטור?</h3>
                  </div>
                  <p className="text-gray-700 ml-8">פתיחת עוסק פטור עצמה אינה כוללת עלויות ממשלתיות. אך יש שירותים נוספים אופציונליים כמו דוח שנתי, רישום למע"מ, או ליווי שוטף - כל אלה בחיובים נפרדים.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-gray-900">כמה זמן לוקח לפתוח עוסק פטור?</h3>
                  </div>
                  <p className="text-gray-700 ml-8">כאשר פותחים דרך רואה חשבון, בדרך כלל לוקח כמה ימים עד שנה אחת. דרך פתרון אונליין, התהליך בדרך כלל מסתיים תוך 24-72 שעות.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-gray-900">האם פתיחת עוסק פטור אונליין כוללת טיפול מול מס הכנסה ומע״מ?</h3>
                  </div>
                  <p className="text-gray-700 ml-8">כן, הפתיחה כוללת טיפול ממלא ומול מס הכנסה וביטוח לאומי. פטור ממע"מ הוא אוטומטי לעוסקים הזכאים. שירותים נוספים כמו רישום למע"מ מטופלים בנפרד.</p>
                </div>
              </div>
            </motion.div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-8 text-white text-center"
            >
              <h2 className="text-2xl font-bold mb-4">
                אתה כבר יודע איזו דרך מתאימה לך?
              </h2>
              <p className="text-white/80 mb-6 text-lg">
                אם אתה עדיין בספקות, אנחנו כאן כדי לעזור
              </p>
              <button 
                onClick={() => document.querySelector('[data-lead-form]')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 px-8 text-lg font-bold rounded-full bg-white text-[#1E3A5F] hover:bg-gray-100 transition-all"
              >
                רוצה לדעת אם זה המסלול הנכון?
                <ArrowLeft className="mr-2 w-5 h-5 inline" />
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