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
          "text": "פתיחה לבד דרך ממלא מקום היא בחינם, אך דורשת ידע וזמן. רואה חשבון משכנע בדרך כלל ₪500–₪1,500. פתיחה אונליין עולה ₪199 בתשלום חד-פעמי."
        }
      },
      {
        "@type": "Question",
        "name": "האם פתיחת עוסק פטור אונליין זולה יותר מדרך רואה חשבון?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "כן, פתיחה אונליין בעלות ₪199 היא הזולה ביותר. זה תשלום חד-פעמי וברור מראש, ללא עמלות נוספות או הפתעות."
        }
      },
      {
        "@type": "Question",
        "name": "האם אפשר לפתוח עוסק פטור לבד בלי עזרה?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "כן, אפשר לפתוח לבד דרך אתר ממלא המקום בחינם. אך זה דורש הבנה של התהליך והמסמכים, וטעויות בבחירת סיווג עיסוק או בדיווחים עלולות להיות יקרות."
        }
      },
      {
        "@type": "Question",
        "name": "מה ההבדל בין פתיחה אונליין (₪199) לרואה חשבון (₪500–₪1,500)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "פתיחה אונליין: תהליך דיגיטלי מלא, מהיר (24–48 שעות), בלי יעוץ אישי. רואה חשבון: יעוץ אישי, אך יקר יותר ותהליך איטי יותר (1–2 שבועות)."
        }
      },
      {
        "@type": "Question",
        "name": "האם יש עלויות נוספות אחרי פתיחת עוסק פטור?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "פתיחה עצמה כוללת רישום במס הכנסה וביטוח לאומי בלבד. עלויות אחרות אפשריות: ליווי חודשי (אופציונלי) או דוח שנתי (הוגשים רק פעם בשנה)."
        }
      },
      {
        "@type": "Question",
        "name": "כמה זמן לוקח לפתוח עוסק פטור?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "פתיחה אונליין: 24–48 שעות. רואה חשבון: 1–2 שבועות. פתיחה לבד דרך ממלא המקום: מספר שעות, אך דורשת ידע."
        }
      },
      {
        "@type": "Question",
        "name": "האם פתיחה אונליין כוללת טיפול מול מס הכנסה וביטוח לאומי?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "כן, טיפול מלא כלול בתשלום של ₪199. הרישום במס הכנסה, הביטוח לאומי, ומע״מ בפטור מטופלים כחלק מהתהליך."
        }
      }
    ]
  };

  return (
    <>
      <SEOOptimized
        title="כמה עולה לפתוח עוסק פטור? | פירוט מחירים ואפשרויות 2026"
        description="השוואה מלאה של עלויות פתיחת עוסק פטור: לבד בחינם, דרך רואה חשבון (₪500–₪1,500), או אונליין (₪199). בחר את המסלול המתאים לך."
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
                השוואה ברורה וללא הפתעות. בחר את האפשרות המתאימה למצבך.
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
                  פתיחת עוסק פטור לבד דרך אתר ממלא המקום (בתחום מס הכנסה) היא בחינם. אתה יכול להירשם בעצמך ללא עלות כלכלית ישירה.
                </p>

                <p>
                  אולם, תהליך זה דורש הבנה של המסמכים, הטפסים, וההנחיות של מס הכנסה וביטוח לאומי. טעויות בתהליך עלולות להיות יקרות בעתיד – למשל, בחירת סיווג עיסוק שגוי, אי-הצהרה נכונה של הכנסות, או אי-הבנה של דיווח מע״מ בפטור.
                </p>

                <p>
                  <strong>זמן הדרוש:</strong> בדרך כלל 2–4 שעות, בתנאי שיש לך ידע קודם.
                </p>

                <p>
                  <strong>מתי זה משתלם:</strong> אם אתה בטוח בתהליך, יש לך זמן פנוי, ואתה רוצה לחסוך כל עלות כלכלית.
                </p>

                <p>
                  <strong>מתי זה לא משתלם:</strong> אם אתה לא בטוח בהנחיות, חוששת מטעויות, או עסקתך מעורבת יותר.
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
                <p>
                  <strong>עלות טיפוסית: ₪500–₪1,500</strong> (תלוי בעיר, במורכבות העיסוק, ובחוקה של רואה החשבון).
                </p>

                <p>
                  רואה חשבון מטפל בכל השלבים עבורך – רישום במס הכנסה, הרשמה בביטוח לאומי, טיפול במע״מ בפטור, והסבר על חובות דיווח. זה כולל ייעוץ אישי וברור על הבחירות הטובות ביותר עבור עיסוקך.
                </p>

                <p>
                  <strong>זמן הדרוש:</strong> בדרך כלל 1–2 שבועות, בהתאם לעומס של רואה החשבון.
                </p>

                <p>
                  <strong>מה כלול:</strong> רישום בהסמכויות הממשלתיות, הסברים על חובות, טיפול בכל הטפסים, ויעוץ אישי.
                </p>

                <p>
                  <strong>מה בדרך כלל לא כלול:</strong> ליווי חודשי מתמשך, דוח שנתי, או אפליקציה לניהול חשבונות. אלה בדרך כלל דורשים תשלום נוסף.
                </p>

                <p>
                  <strong>מתי זה משתלם:</strong> אם אתה לא בטוח בתהליך, רוצה ייעוץ אישי, או עסקתך דורשת שקול עמוק.
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
                <p>
                  <strong>עלות: ₪199 בתשלום חד-פעמי.</strong> זה מחיר קבוע וברור מראש – אין עמלות נוספות או הפתעות.
                </p>

                <p>
                  תהליך דיגיטלי מלא: אתה ממלא טופס מקוון, מוגשות הבקשות אוטומטית למס הכנסה וביטוח לאומי, ומקבל אישור תוך 24–48 שעות. אין צורך להיפגש עם מישהו, אין טלפונים ארוכים, הכל בסדר בעצמך בקצב שלך.
                </p>

                <p>
                  <strong>מה כלול:</strong> בדיקה של המידע שלך, הגשה למס הכנסה וביטוח לאומי, טיפול במע״מ בפטור, והנחיות בתהליך.
                </p>

                <p>
                  <strong>מה לא כלול:</strong> ליווי חודשי אחרי הפתיחה, דוח שנתי, או יעוץ מס מתמשך. אלה אופציונליים לחלוטין.
                </p>

                <p>
                  <strong>זמן הדרוש:</strong> בדרך כלל 24–48 שעות מרגע ההגשה.
                </p>

                <p>
                  <strong>מתי זה משתלם:</strong> אם אתה מחפש תהליך מהיר ולא יקר, בטוח במידה מסוימת בעיסוק שלך, ולא צריך ייעוץ אישי.
                </p>
              </div>
            </motion.div>

            {/* Comparison Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                השוואה מהירה
              </h2>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  <strong>פתיחה לבד:</strong> בחינם, אך דורשת ידע וזמן. סיכון לטעויות.
                </p>

                <p>
                  <strong>פתיחה דרך רואה חשבון:</strong> ₪500–₪1,500, יעוץ אישי, אך איטי יותר. מתאים למי שרוצה עזרה מלאה.
                </p>

                <p>
                  <strong>פתיחה אונליין:</strong> ₪199, מהיר (24–48 שעות), דיגיטלי מלא, אך ללא יעוץ אישי. מתאים למי שרוצה תהליך פשוט וברור.
                </p>
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
                    a: 'פתיחה לבד דרך ממלא המקום היא בחינם, אך דורשת ידע וזמן. דרך רואה חשבון: ₪500–₪1,500. אונליין: ₪199 בתשלום חד-פעמי.'
                  },
                  {
                    q: 'האם פתיחה אונליין בעלות ₪199 זולה יותר?',
                    a: 'כן, זה הפתרון הזול ביותר. תשלום חד-פעמי קבוע ללא עמלות נוספות. בניגוד לרואה חשבון, אתה חוסך עד ₪1,300, אך ללא יעוץ אישי.'
                  },
                  {
                    q: 'האם אפשר לפתוח עוסק פטור לבד?',
                    a: 'כן, ניתן דרך אתר ממלא המקום בחינם. אך זה דורש הבנה של תהליך הרישום וסיכון לטעויות. טעויות בבחירת סיווג או בדיווחים עלולות להיות יקרות בעתיד.'
                  },
                  {
                    q: 'מה ההבדל בין פתיחה אונליין (₪199) לרואה חשבון (₪500–₪1,500)?',
                    a: 'פתיחה אונליין: תהליך דיגיטלי מלא, מהיר (24–48 שעות), ללא יעוץ אישי. רואה חשבון: יעוץ אישי ישיר, אך יקר יותר ותהליך איטי יותר (1–2 שבועות).'
                  },
                  {
                    q: 'האם יש עלויות נוספות אחרי פתיחת עוסק פטור?',
                    a: 'תשלום הפתיחה (בכל אפשרות) כולל רישום וביטוח לאומי בלבד. עלויות אחרות אפשריות: ליווי חודשי (₪149, אופציונלי) או דוח שנתי (₪500+, בעת הצורך).'
                  },
                  {
                    q: 'כמה זמן לוקח לפתוח עוסק פטור?',
                    a: 'פתיחה אונליין: 24–48 שעות. רואה חשבון: 1–2 שבועות. פתיחה לבד דרך ממלא המקום: מספר שעות, אך דורשת ידע ודייקות.'
                  },
                  {
                    q: 'האם פתיחה אונליין כוללת טיפול מול מס הכנסה וביטוח לאומי?',
                    a: 'כן, טיפול מלא כלול בתשלום ₪199. הרישום במס הכנסה, הביטוח לאומי, ומע״מ בפטור מטופלים כחלק מהתהליך.'
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
                בחרת את המסלול שלך?
              </h2>
              <p className="mb-6 max-w-xl mx-auto">
                אם בחרת בתהליך אונליין, אתה יכול להתחיל כעת. אם אתה עדיין שוקל, שמור על קשר עם הצוות שלנו.
              </p>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-8 py-3 bg-white text-[#1E3A5F] rounded-lg font-bold hover:bg-gray-100 transition inline-block"
              >
                רוצה לדעת אם זה המסלול הנכון?
              </button>
            </motion.div>

          </div>
        </section>
      </main>
    </>
  );
}