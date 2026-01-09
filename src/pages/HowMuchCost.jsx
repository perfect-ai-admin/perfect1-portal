import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import UnifiedLeadForm from '../components/forms/UnifiedLeadForm';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HowMuchCost() {
  const [showForm, setShowForm] = useState(false);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "כמה עולה לפתוח עוסק פטור בשנת 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "פתיחת עוסק פטור לבד בממלא מקום היא בחינם, אך רואה חשבון טיפול משלם 500-1500 שקל. פתיחה אונליין עולה 199 שקל בתשלום חד-פעמי."
        }
      },
      {
        "@type": "Question",
        "name": "האם פתיחת עוסק פטור אונליין זולה יותר?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "כן. פתיחה אונליין עולה 199 שקל בלבד, בתשלום חד-פעמי ללא עמלות נסתרות, בעוד רואה חשבון משכנע משמעותית יותר."
        }
      },
      {
        "@type": "Question",
        "name": "האם אפשר לפתוח עוסק פטור לבד בלי רואה חשבון?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "כן, אפשר לפתוח עוסק פטור לבד בממלא מקום. אך אם אתה לא בטוח בתהליך ויש סיכון לטעויות, עדיף להשיג עזרה מקצועית."
        }
      },
      {
        "@type": "Question",
        "name": "מה ההבדל בין פתיחה אונליין לפתיחה דרך רואה חשבון?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "אונליין: 199 שקל, חד-פעמי, דיגיטלי מלא, קצר. רואה חשבון: 500-1500 שקל, יעוץ אישי, אך יקר יותר ותלוי בזמינות."
        }
      },
      {
        "@type": "Question",
        "name": "האם יש עלויות נוספות אחרי פתיחת עוסק פטור?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "פתיחה עצמה כוללת בדיקה ממלא מקום בלבד. עלויות נוספות עשויות להיות דוח שנתי או ליווי חודשי אם תבחר."
        }
      },
      {
        "@type": "Question",
        "name": "כמה זמן לוקח לפתוח עוסק פטור?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "פתיחה אונליין לוקחת 24-48 שעות. רואה חשבון עשוי לקחת יותר זמן בהתאם לעומס."
        }
      },
      {
        "@type": "Question",
        "name": "האם פתיחת עוסק פטור אונליין כוללת טיפול מול מס הכנסה ומע״מ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "כן. בפתיחה אונליין אנו מטפלים בהרשמה במס הכנסה, במע״מ בפטור, וביטוח לאומי כחלק מהתהליך."
        }
      }
    ]
  };

  return (
    <>
      <SEOOptimized
        title="כמה עולה לפתוח עוסק פטור? | פירוט מחירים ואפשרויות 2026"
        description="מדריך שקוף על עלויות פתיחת עוסק פטור: לבד, דרך רואה חשבון, ואונליין. השווה מחירים וייעוץ חינמי."
        keywords={['כמה עולה לפתוח עוסק פטור', 'עלות פתיחת עוסק פטור', 'מחיר פתיחת עוסק פטור', 'פתיחת עוסק פטור אונליין מחיר']}
        canonical="https://perfect1.co.il/how-much-cost"
        schema={schema}
      />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                כמה עולה לפתוח עוסק פטור? פירוט מחירים ואפשרויות פתיחה
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                מדריך שקוף וללא הפתעות. בחר את המסלול המתאים לך.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

            {/* Section 1: פתיחה לבד */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור לבד?
              </h2>
              
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  <strong>התשובה הקצרה:</strong> לא עלות ישירה. אפשר להירשם בממלא מקום (אתר ממשלתי) בחינם, אך זה דורש ידע וזמן.
                </p>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-amber-900 mb-2">טעויות נפוצות שעלולות לעלות כסף:</h3>
                      <ul className="space-y-1 text-amber-900 text-sm">
                        <li>• בחירת סיווג עיסוק שגוי (עלול להשפיע על ליווי בעתיד)</li>
                        <li>• אי-הצהרת הכנסה מינימום (עלול לגרור בדיקה)</li>
                        <li>• שגיאות בטפסים שדורשות תיקון עד"ס</li>
                        <li>• אי-הבנה של דיווח VAT בפטור (חוקים משתנים)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p>
                  המטרה של הסכום הזה היא שתבין: עלות ישירה = אפס, אך <strong>עלות משתמנת</strong> (שגיאות, זמן, אי-ודאות) יכולה להיות משמעותית.
                </p>
              </div>
            </motion.div>

            {/* Section 2: דרך רואה חשבון */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור דרך רואה חשבון?
              </h2>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-baseline gap-2 mb-4">
                    <DollarSign className="w-6 h-6 text-[#1E3A5F]" />
                    <span className="text-3xl font-bold text-[#1E3A5F]">₪500 - ₪1,500</span>
                  </div>
                  <p className="text-sm text-gray-600">טווח מחירים מקובל בישראל (2026)</p>
                </div>

                <h3 className="font-bold text-gray-800 mt-6">מה בדרך כלל כלול:</h3>
                <ul className="space-y-2">
                  {['רישום כעוסק פטור בתיקייה אישית', 'הכנת טפסים וטיפול במס הכנסה', 'הרשמה בביטוח לאומי', 'הסברים ויעוץ אישי'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="font-bold text-gray-800 mt-6">מה בדרך כלל לא כלול:</h3>
                <ul className="space-y-2 text-gray-600">
                  {['ליווי חודשי מתמשך', 'דוח שנתי', 'ייעוץ מס אישי', 'אפליקציה לניהול חשבונות'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-lg">×</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-gray-600 mt-4">
                  <strong>מתי זה משתלם:</strong> אם אתה לא בטוח בתהליך, רוצה ייעוץ אישי, או עסקת שלך מעורבת יותר.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>מתי זה פחות משתלם:</strong> אם אתה עצמאי קטן, בטוח בתהליך, ומעדיף פתרון זול.
                </p>
              </div>
            </motion.div>

            {/* Section 3: אונליין */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור אונליין?
              </h2>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-[#27AE60]">199 ₪</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">תשלום חד-פעמי, ללא עמלות נוספות</p>
                  <ul className="space-y-2 text-sm">
                    {['מחיר קבוע וברור מראש', 'ללא הפתעות סתרות', 'טיפול דיגיטלי מלא'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <h3 className="font-bold text-gray-800">מה כלול בתהליך:</h3>
                <ul className="space-y-2">
                  {['מילוי טפסים מוקדמים על-ידיך', 'בדיקת כל המידע שלך', 'הגשה אוטומטית למס הכנסה', 'הרשמה בביטוח לאומי', 'טיפול מע״מ בפטור', 'אישור וסיום תוך 24-48 שעות'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm bg-gray-50 p-4 rounded-lg mt-6">
                   <strong>למי זה מתאים:</strong> למי שמחפש תהליך דיגיטלי מלא, מהיר, וללא התחייבות לליווי ארוך טווח. לא צריך לפגוש רואה חשבון, הכל מתנהל בטלפון או דסקטופ. אם אתה מחפש בדיוק את זה, אתה יכול{' '}
                  <Link to={createPageUrl('OsekPaturOnline')} className="text-[#1E3A5F] font-semibold hover:underline">
                    לפתוח עוסק פטור אונליין בצורה פשוטה ומהירה
                  </Link>
                  .
                </p>
              </div>
            </motion.div>

            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                השוואה מהירה
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#1E3A5F]">
                      <th className="text-right p-3 font-bold">קריטריון</th>
                      <th className="text-center p-3 font-bold">לבד</th>
                      <th className="text-center p-3 font-bold">רואה חשבון</th>
                      <th className="text-center p-3 font-bold bg-green-50 font-bold">אונליין (199₪)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['עלות', '₪0', '₪500-1,500', '₪199'],
                      ['זמן', '2-4 שעות', '1-2 שבועות', '24-48 שעות'],
                      ['מורכבות', 'גבוהה', 'נמוכה', 'נמוכה'],
                      ['יעוץ אישי', 'לא', 'כן', 'לא'],
                      ['ליווי חודשי', 'לא', 'אופציה', 'לא'],
                      ['דיגיטלי מלא', 'לא', 'לא', 'כן']
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="p-3 font-medium">{row[0]}</td>
                        <td className="p-3 text-center">{row[1]}</td>
                        <td className="p-3 text-center">{row[2]}</td>
                        <td className="p-3 text-center bg-green-50">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* CTA - Soft */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-50 rounded-xl p-8 text-center border border-blue-200"
            >
              <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3">
                עדיין לא בטוח איזה מסלול בחר?
              </h3>
              <p className="text-gray-700 mb-6 max-w-xl mx-auto">
                אנחנו יכולים לעזור לך להבין מה מתאים למצבך בדיוק.
              </p>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-block px-8 py-3 bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#2C5282] transition"
              >
                השאר פרטים ונבדוק עבורך
              </button>
            </motion.div>

            {/* Form */}
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-[#1E3A5F] rounded-xl p-8"
              >
                <UnifiedLeadForm 
                  title="בדיקה מהירה"
                  subtitle="השאר פרטים ונחזור אליך עם המלצה ממוקדת"
                  fields={['name', 'phone', 'email', 'profession']}
                />
              </motion.div>
            )}

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-8">
                שאלות נפוצות על פתיחת עוסק פטור ועלויות
              </h2>

              <Accordion type="single" collapsible className="space-y-3">
                {[
                  {
                    q: 'כמה עולה לפתוח עוסק פטור בשנת 2026?',
                    a: 'פתיחה לבד בחינם דרך ממלא מקום (אך דורשת ידע). דרך רואה חשבון: ₪500-1,500. אונליין: ₪199 בתשלום חד-פעמי.'
                  },
                  {
                    q: 'האם פתיחת עוסק פטור אונליין זולה יותר?',
                    a: 'כן. בפתיחה אונליין אתה משלם ₪199 בלבד, זה הפתרון הזול ביותר. בניגוד לרואה חשבון, זה תהליך דיגיטלי מלא ללא התחייבות לליווי נוסף.'
                  },
                  {
                    q: 'האם אפשר לפתוח עוסק פטור לבד בלי רואה חשבון?',
                    a: 'כן, אפשר לפתוח לבד דרך ממלא מקום בחינם. אך אם אתה לא בטוח בתהליך או בחירת סיווג, זה עלול להוביל לטעויות יקרות בעתיד.'
                  },
                  {
                    q: 'מה ההבדל בין פתיחה אונליין לפתיחה דרך רואה חשבון?',
                    a: 'אונליין: דיגיטלי מלא, ₪199, ללא יעוץ אישי. רואה חשבון: יעוץ אישי, ₪500-1,500, אך תהליך איטי יותר. בחר לפי העדפתך לדיגיטל או יעוץ אישי.'
                  },
                  {
                    q: 'האם יש עלויות נוספות אחרי פתיחת עוסק פטור?',
                    a: 'פתיחה עצמה כוללת בדיקה בלבד. עלויות נוספות יכולות להיות דוח שנתי (₪500+) או ליווי חודשי (₪149), אך אלה אופציונליים.'
                  },
                  {
                    q: 'כמה זמן לוקח לפתוח עוסק פטור?',
                    a: 'פתיחה אונליין: 24-48 שעות. רואה חשבון: 1-2 שבועות. פתיחה לבד: 2-4 שעות, אך דורשת ידע.'
                  },
                  {
                    q: 'האם פתיחת עוסק פטור אונליין כוללת טיפול מול מס הכנסה ומע״מ?',
                    a: 'כן, זה כלול מלא. אנו מטפלים בהרשמה במס הכנסה, מע"מ בפטור, וביטוח לאומי כחלק מהתהליך בתמלוג ₪199.'
                  }
                ].map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-gray-200 rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <span className="text-right font-medium text-gray-800">{item.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold mb-4">
                מוכנים להתחיל?
              </h2>
              <p className="mb-6 max-w-xl mx-auto">
                אם בחרת בתהליך אונליין, אתה יכול{' '}
                <Link to={createPageUrl('OsekPaturOnline')} className="underline hover:text-yellow-300">
                  לפתוח עוסק פטור אונליין עכשיו
                </Link>
                {' '}או לשמור על שיח עם הצוות שלנו.
              </p>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-8 py-3 bg-white text-[#1E3A5F] rounded-lg font-bold hover:bg-gray-100 transition inline-block"
              >
                רוצה לשוחח קודם?
              </button>
            </motion.div>

          </div>
        </section>
      </main>
    </>
  );
}