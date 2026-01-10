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
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      question: 'האם עוסק פטור חייב להוציא חשבונית?',
      answer: 'זה תלוי בתנאים: אם אתה רשום למע״מ - כן, חובה מלאה. אם אתה פטור ממע״מ - זה תלוי בסוג הלקוח (עסקי או פרטי) ובנושא הפעילות. עם לקוח עסקי - הם כנראה יצפו לחשבונית.'
    },
    {
      question: 'מה ההבדל בין חשבונית וקבלה?',
      answer: 'חשבונית היא מסמך רשמי עם כל הפרטים (שם, כתובת, מע״מ). קבלה היא אישור פשוט של קבלת כסף. לעוסק פטור בעסקאות קטנות - קבלה מספיקה. בעסקאות עם מע״מ - צריך חשבונית.'
    },
    {
      question: 'אני עוסק פטור - מה בדיוק צריך להיות בחשבונית שלי?',
      answer: 'שם וכתובת הספק (אתה), מספר עוסק פטור, שם הלקוח (אם עסקי), תיאור השירות/מוצר, סכום התשלום, תאריך, ומספר סידור (עוקבות). אם אתה רשום למע״מ - גם צריך להוסיף מע״מ.'
    },
    {
      question: 'צריך להדפיס חשבוניות או אפשר דיגיטלי?',
      answer: 'דיגיטלי בהחלט בסדר. חשבוניות דיגיטליות חוקיות לחלוטין - אפליקציות, Wix, Square, או תוכנות אחרות. כל עוד יש בהן את כל הפרטים הנדרשים - זה חוקי.'
    },
    {
      question: 'כמה זמן צריך לשמור על חשבוניות?',
      answer: 'לפחות 3 שנים מתאריך ההנפקה (דרישה של מס הכנסה). עבור מע״מ - 4-5 שנים. אם נבדקת בבדיקה - תצטרך להציג את כל הרישומים.'
    },
    {
      question: 'מה אם לא הוצאתי חשבונית וביקשו אחת?',
      answer: 'אתה יכול להוציא בדיעבד אם יש לך רישום של העסקה (הוכחה בנק, מחברת, עדות). אך זה לא אידיאלי - עדיף להוציא חשבונית מיד בעת העסקה.'
    },
    {
      question: 'עוסק פטור לקוח עסקי - מה עושים?',
      answer: 'הלקוח העסקי כנראה ידרוש חשבונית רשמית. גם אם אתה פטור ממע״מ - תוציא חשבונית בלי מע״מ עם כל הפרטים הנדרשים.'
    },
    {
      question: 'מה אם הלקוח לא רוצה חשבונית?',
      answer: 'אתה עדיין צריך לרשום את העסקה בתיעוד שלך כדי להישאר בחוק - גם אם הלקוח לא רוצה חשבונית רשמית. זה עבור שמירה על תיעוד משפטי שלך.'
    },
    {
      question: 'האם צריך מספר חשבון בנק בחשבונית?',
      answer: 'לא חובה חוקית, אבל זה עוזר. לקוחות עסקיים בדרך כלל רוצים מספר חשבון כדי להעביר כסף ישירות. זה מאיץ את התהליך.'
    },
    {
      question: 'אני עובד בחו״ל - צריך חשבונית?',
      answer: 'תלוי במדינה. באופן כללי - כן, צריך להוציא חשבונית בשפה המקומית ובמטבע המקומי. בדוק עם רשויות המס של המדינה בה אתה עובד.'
    }
  ];

  return (
    <>
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs.map(faq => ({ question: faq.question, answer: faq.answer }))} />
      <PageTracker pageUrl="/urgent-invoice" pageType="landing" />
      <SEOOptimized
        title="חשבוניות לעוסק פטור | דרישות משפטיות וצעדים | Perfect One"
        description="האם עוסק פטור צריך להוציא חשבונית? מדריך מלא על דרישות חשבוניות, ההבדל בין חשבונית וקבלה, והצעדים הנכונים."
        keywords="חשבונית עוסק פטור, דרישות חשבוניות, הבדל חשבונית קבלה, איך להוציא חשבונית"
        canonical="https://perfect1.co.il/urgent-invoice"
        schema={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "חשבוניות לעוסק פטור",
          "description": "מדריך מלא על דרישות חשבוניות לעוסקים פטורים בישראל",
          "author": {
            "@type": "Organization",
            "name": "Perfect One"
          },
          "datePublished": "2024-01-01",
          "articleSection": "חוקים ודרישות עוסק פטור"
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'חשבוניות לעוסק פטור' }
          ]} />
        </div>
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-right">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                ✓ מדריך משפטי מלא
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                חשבוניות לעוסק פטור
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto md:mx-0">
                האם צריך להוציא חשבונית? מה צריך להיות בה? איך לעמוד בדרישות משפטיות?
              </p>
              <p className="text-lg text-white/80 max-w-3xl mx-auto md:mx-0">
                מדריך מלא לעוסקים פטורים בישראל על חשבוניות, קבלות, ודרישות חוקיות
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            
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

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl mb-12 md:mb-20">
              <h2 className="text-2xl md:text-3xl font-black mb-2 text-center">
                צריך עזרה בחשבוניות?
              </h2>
              <p className="text-center text-white/90 mb-8">השאר פרטים ויועץ שלנו יעזור לך בהוצאת חשבוניות נכונות</p>
              
              <div className="max-w-md mx-auto">
                <UnifiedLeadForm
                  variant="default"
                  title=""
                  ctaText="קבל עזרה בחשבוניות"
                  successTitle="קיבלנו את הפרטים! ✓"
                  successMessage="נציג יצור איתך קשר ויעזור לך בנושא החשבוניות"
                  sourcePage="חשבוניות לעוסק פטור"
                  fields={["name", "phone"]}
                  invertColors={true}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <a href="https://wa.me/972502277087?text=היי, צריך עזרה בנושא חשבוניות לעוסק פטור" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full h-11 md:h-12 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    דבר בווצאפ
                  </Button>
                </a>
                <a href="tel:+972502277087" className="flex-1">
                  <Button className="w-full h-11 md:h-12 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30">
                    <Phone className="ml-2 w-5 h-5" />
                    התקשר עכשיו
                  </Button>
                </a>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-8 md:mb-12 text-center">
                שאלות נפוצות על חשבוניות
              </h2>
              <div className="space-y-3 md:space-y-4">
                {faqs.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md border border-gray-200"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                      className="w-full px-5 md:px-6 py-4 md:py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-bold text-[#1E3A5F] text-sm md:text-lg text-right">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 md:w-6 md:h-6 text-[#1E3A5F] transition-transform ${
                          expandedFaq === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 md:px-6 py-4 md:py-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-gray-200"
                      >
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA - Open Osek Patur */}
            <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 md:p-10 mb-12 md:mb-20">
              <h2 className="text-2xl md:text-3xl font-black mb-4">עדיין לא פתחת עוסק פטור?</h2>
              <p className="text-white/90 mb-6">תחילה צריך לפתוח עוסק פטור, ואז נוכל לעזור לך בנושא החשבוניות</p>
              <Link to={createPageUrl('OsekPaturOnlineLanding')} className="inline-block">
                <Button className="h-12 px-8 bg-white text-green-600 hover:bg-gray-100 font-bold">
                  פתח עוסק פטור אונליין עכשיו
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </section>

            {/* Related Content */}
            <RelatedContent pageType="guide" />
          </motion.div>
        </div>
      </main>
    </>
  );
}