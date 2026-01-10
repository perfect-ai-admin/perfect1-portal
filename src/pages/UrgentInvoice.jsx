import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import FAQSchema from '../components/seo/FAQSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import PageTracker from '../components/seo/PageTracker';
import RelatedContent from '../components/seo/RelatedContent';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import UnifiedLeadForm from '../components/forms/UnifiedLeadForm';
import { Phone, MessageCircle, ChevronDown, ArrowRight, CheckCircle, TrendingUp, BarChart3, Shield, Zap, Clock, FileText, AlertCircle } from 'lucide-react';

export default function UrgentInvoice() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "האם עוסק פטור צריך להוציא חשבונית?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "זה תלוי בסוג הפעילות. אם אתה קוף עם מע״מ - כן. אם אתה פטור ממע״מ - זה תלוי בתנאים ובסוג הלקוח."
        }
      }
    ]
  };

  return (
    <>
      <LocalBusinessSchema />
      <SEOOptimized
        title="האם עוסק פטור צריך להוציא חשבונית? מדריך מלא 2026"
        description="האם עוסק פטור חייב להוציא חשבונית? כל התשובות על חשבוניות, קבלות, דרישות חוקיות ודוחות."
        keywords="עוסק פטור חשבונית, האם צריך להוציא חשבונית, דרישות חשבוניות עוסק פטור"
        canonical="https://perfect1.co.il/urgent-invoice"
        schema={faqSchema}
      />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Breadcrumbs 
              items={[
                { label: 'דף הבית', url: 'Home' },
                { label: 'עלויות והחלטות' },
                { label: 'האם עוסק פטור צריך להוציא חשבונית?' }
              ]}
            />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                האם עוסק פטור צריך להוציא חשבונית?
              </h1>
              <p className="text-xl text-white/80">
                מדריך מלא על דרישות חשבוניות, קבלות, ודוחות עבור עוסקים פטורים
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
                  <h2 className="text-lg font-bold text-blue-900 mb-2">תשובה קצרה</h2>
                  <p className="text-gray-800">
                    זה תלוי בסוג הפעילות שלך. אם אתה רשום למע״מ - כן, חובה להוציא חשבונית. אם אתה פטור ממע״מ - זה תלוי בתנאים, בסוג הלקוח (פרטי או עסקי), והחוקים החלים על ענפך.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Section 1: What's Required */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                מה הדרישה החוקית?
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg">
                  לעוסק פטור יש חובה <strong>תיעוד של כל עסקה</strong> - זה יכול להיות חשבונית מלאה, קבלה פשוטה, או אפילו רשומה בגיליון אלקטרוני - בתנאי שיש בה את כל הפרטים הדרושים.
                </p>

                <div className="bg-green-50 border-r-4 border-green-600 rounded-xl p-6">
                  <h3 className="font-bold text-green-900 mb-4">אם אתה רשום למע״מ:</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>חובה מלאה</strong> להוציא חשבונית עבור כל עסקה</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>החשבונית חייבת לכלול מע״מ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>יש לשמור על כל החשבוניות 3-4 שנים</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-xl p-6">
                  <h3 className="font-bold text-yellow-900 mb-4">אם אתה פטור ממע״מ:</h3>
                  <ul className="space-y-2 text-gray-800">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span><strong>זה מורכב יותר</strong> - תלוי בסוג הלקוח (פרטי או עסקי)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span>עדיין צריך <strong>תיעוד של כל עסקה</strong> - קבלה או חשבונית</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span>אם הלקוח עסקי - הוא כנראה יצפה לחשבונית</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Section 2: Invoice vs Receipt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                ההבדל בין חשבונית וקבלה
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-6 border-r-4 border-blue-600">
                  <h3 className="font-bold text-blue-900 mb-3">חשבונית:</h3>
                  <ul className="space-y-1 text-gray-800">
                    <li>• מסמך רשמי המייצג עסקה עסקית</li>
                    <li>• מכילה את כל פרטי הספק והלקוח</li>
                    <li>• עבור עסקים בחוזה עם מע״מ - חובה</li>
                    <li>• אפשר להוציא לעצמך או ללקוח</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border-r-4 border-green-600">
                  <h3 className="font-bold text-green-900 mb-3">קבלה פשוטה:</h3>
                  <ul className="space-y-1 text-gray-800">
                    <li>• מסמך קל ופשוט של תשלום</li>
                    <li>• יכולה להיות גם בעלמא או דיגיטלית</li>
                    <li>• מתאימה לעסקאות קטנות עם לקוחות פרטיים</li>
                    <li>• צריכה לעזור לשמירה על תיעוד</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Section 3: What Makes a Valid Document */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                מה צריך להיות בחשבונית/קבלה?
              </h2>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-r-4 border-indigo-600">
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>שם וכתובת הספק</strong> (אתה)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>מספר ארגון עוסק פטור</strong> שלך</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>שם וכתובת הלקוח</strong> (אם זה עסקי)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>תיאור השירות או המוצר</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>סכום התשלום</strong> (עם או בלי מע״מ)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>תאריך</strong> של העסקה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>מספר סידור</strong> (עוקבות)</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Section 4: Common Scenarios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                תרחישים נפוצים - מה לעשות?
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-xl border-r-4 border-gray-300 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">עוסק פטור לקוח פרטי (למשל, צילום לחתונה)</h3>
                  <p className="text-gray-700">קבלה פשוטה עם הפרטים הבסיסיים מספיקה. חיוב להוציא אם הסכום גדול (חוקי).</p>
                </div>

                <div className="bg-white rounded-xl border-r-4 border-gray-300 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">עוסק פטור לקוח עסקי (B2B)</h3>
                  <p className="text-gray-700">הלקוח כנראה ידרוש חשבונית רשמית. גם אם אתה פטור ממע״מ - תוציא חשבונית בלי מע״מ.</p>
                </div>

                <div className="bg-white rounded-xl border-r-4 border-gray-300 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">עוסק פטור רשום למע״מ</h3>
                  <p className="text-gray-700">חובה חד משמעית להוציא חשבונית עם מע״מ בכל עסקה. זה חוק.</p>
                </div>

                <div className="bg-white rounded-xl border-r-4 border-gray-300 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">עוסק פטור בעבודה בחו״ל</h3>
                  <p className="text-gray-700">תלוי במדינה. באופן כללי, יש להוציא חשבונית בשפה המקומית ובמטבע המקומי.</p>
                </div>
              </div>
            </motion.div>

            {/* Section 5: Record Keeping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                שמירת רישומים וחשבוניות
              </h2>
              <div className="bg-red-50 border-r-4 border-red-500 rounded-xl p-6">
                <h3 className="font-bold text-red-900 mb-4">חובה חוקית:</h3>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>שמור על <strong>כל החשבוניות ב-מס הכנסה</strong> למשך <strong>3 שנים</strong> מתאריך ההנפקה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>עבור מע״מ - שמור למשך <strong>4-5 שנים</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>אם נבדקת בבדיקה כספית - תצטרך להציג את כל הרישומים</span>
                  </li>
                </ul>
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
                שאלות נפוצות
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "האם אפשר להוציא חשבונית בעכשיו דיגיטלית?",
                    a: "כן, חשבוניות דיגיטליות מוכרות לחלוטין. אפשר להשתמש בתוכנות כמו Wix, Square, או אפליקציות ניהול עסק. כל עוד יש בהן את כל הפרטים הדרושים - זה חוקי."
                  },
                  {
                    q: "מה קורה אם לא הוצאתי חשבונית וביקשו?",
                    a: "אם לא יש רישום של העסקה - זה בעיה. אם יש לך רישום אחר (מחברת, סכום בנק) אתה יכול לתמחות שקרה עסקה וגם להוציא חשבונית בדיעבד. אך זה לא אידיאלי."
                  },
                  {
                    q: "האם צריך להדפיס חשבוניות או אפשר דיגיטלי?",
                    a: "דיגיטלי זה בסדר. אבל אם אתה משדר לרשויות - יש צורך בחתימה דיגיטלית או בחותמת."
                  },
                  {
                    q: "האם עוסק פטור יכול להוציא חשבונית בדיעבד?",
                    a: "לא מומלץ. אבל אם יש לך רישום של העסקה (מחברת, עדות, הוכחת תשלום) - אתה יכול להצדיק אותה."
                  },
                  {
                    q: "מה אם הלקוח לא רוצה חשבונית?",
                    a: "אתה עדיין צריך לרשום את העסקה בתיעוד שלך (גם אם הלקוח לא רוצה חשבונית רשמית). זה עבור שמירה על תיעוד חוקי שלך."
                  },
                  {
                    q: "האם צריך מספר חשבון בנק עבור חשבוניות?",
                    a: "לא חובה, אבל זה עוזר. לקוחות עסקיים בדרך כלל רוצים מספר חשבון בשביל להעביר כסף ישירות."
                  }
                ].map((faq, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <HelpCircle className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-1" />
                      <h3 className="font-bold text-gray-900">{faq.q}</h3>
                    </div>
                    <p className="text-gray-700 ml-8">{faq.a}</p>
                  </div>
                ))}
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
                עדיין לא בטוח בדרישות לעוסק שלך?
              </h2>
              <p className="text-white/80 mb-6 text-lg">
                אנחנו כאן כדי לעזור
              </p>
              <button 
                onClick={() => document.querySelector('[data-lead-form]')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 px-8 text-lg font-bold rounded-full bg-white text-[#1E3A5F] hover:bg-gray-100 transition-all"
              >
                קבל ייעוץ מומחה
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
                  אתה עוסק פטור וזקוק להכוונה בנושא חשבוניות?
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  החוקים עלול להיות מבלבלים, אך זה חשוב. השאר פרטים ואנחנו נעזור לך להבין בדיוק מה צריך לעשות במצבך.
                </p>
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-28" data-lead-form>
                  <LeadForm 
                    title="רוצה הבהרה?"
                    subtitle="השאר פרטים ונחזור אליך"
                    sourcePage="עמוד חשבוניות - האם עוסק פטור צריך חשבונית"
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