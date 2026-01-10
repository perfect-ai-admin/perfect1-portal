import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import FAQSchema from '../components/seo/FAQSchema';
import PageTracker from '../components/seo/PageTracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import UnifiedLeadForm from '../components/forms/UnifiedLeadForm';
import { Phone, MessageCircle, ChevronDown, ArrowRight, CheckCircle, User, Lock, Shield, Zap, AlertCircle } from 'lucide-react';

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

      <main className="min-h-screen bg-white">
        {/* Hero Section - Match Reference Design */}
        <section className="bg-gradient-to-br from-[#2C5282] via-[#3B6BA8] to-[#1E3A5F] text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Form Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:order-2"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-2 flex items-center justify-center gap-2">
                      <span>צריך הבהרה?</span>
                      <span className="text-3xl">⚡</span>
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">משפטי - פטור מיידי</p>
                  </div>

                  <div className="mb-6 text-center">
                    <p className="text-gray-800 font-bold text-sm mb-2">תחזקו את העסק שלכם היום</p>
                    <p className="text-xs text-gray-600">הלל פרטים להיות מהליח שוק שוב</p>
                  </div>
                  
                  <form className="space-y-3">
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="שם מלא *"
                        className="pr-10 h-11 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] text-sm"
                      />
                    </div>
                    
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="טלפון *"
                        className="pr-10 h-11 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] text-sm"
                      />
                    </div>
                    
                    <Button className="w-full h-12 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white font-black rounded-xl text-base shadow-lg">
                      בדיקה ללא התחייבות ✈️
                    </Button>
                  </form>

                  <p className="text-xs text-gray-500 text-center mt-3 font-bold">
                    🔓 בלי ספאם • ליווי אנושי
                  </p>
                </div>
              </motion.div>

              {/* Right: Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-right lg:order-1"
              >
                <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-xs font-bold mb-6 border border-red-500/30">
                  <span>⚠️</span>
                  <span>פתרון מידי</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2 leading-tight text-white">
                  צריך חשבונית עכשיו בישראל?
                </h1>

                <h2 className="text-2xl md:text-3xl font-black text-[#27AE60] mb-6">
                  פתרון מידי!
                </h2>

                <p className="text-white/90 mb-8 text-lg font-medium max-w-lg">
                  לקוחות מחכים לך שלך?
                </p>

                {/* Benefits Grid - 2x2 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8 max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'פתרון משפטי', icon: '✓' },
                      { label: '100% זמן', icon: '⏱️' },
                      { label: 'הסל אונליין', icon: '✓' },
                      { label: 'בלי תאונות', icon: '✓' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/95">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phone Number - Big */}
                <div className="bg-white rounded-full py-3 px-6 inline-block shadow-lg mb-6 max-w-lg">
                  <p className="text-[#1E3A5F] text-2xl md:text-3xl font-black">050227 7087</p>
                </div>

                <a href="https://wa.me/972502277087?text=היי, צריך עזרה בנושא חשבוניות לעוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button className="h-14 px-8 text-lg font-black rounded-full bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl w-full md:w-auto">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פתרון מידי בווצאפ
                  </Button>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="bg-[#1E3A5F] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <h3 className="text-4xl md:text-5xl font-black text-[#27AE60] mb-2">100%</h3>
                <p className="text-white/90 font-medium">תשובות משפטיות נכונות</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <h3 className="text-4xl md:text-5xl font-black text-[#D4AF37] mb-2">24h</h3>
                <p className="text-white/90 font-medium">זמן תجابה מדיגום קבלת הפנייה</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                <h3 className="text-4xl md:text-5xl font-black text-[#27AE60] mb-2">87%</h3>
                <p className="text-white/90 font-medium">ממשתמשים מרוצים לחלוטין</p>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Content */}
          
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

            {/* Strong CTA - Mid Page */}
            <section className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] text-white rounded-2xl p-8 md:p-12 mb-16 shadow-2xl">
              <h2 className="text-2xl md:text-4xl font-black mb-4 text-center">עדיין לא בטוח בדרישות?</h2>
              <p className="text-center text-white/95 mb-8 text-lg">אנחנו כאן לעזור - התקשר או דבר בווצאפ</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/972502277087?text=היי, צריך עזרה בנושא חשבוניות לעוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button className="h-14 px-8 text-lg font-black bg-white text-[#27AE60] hover:bg-white/90 rounded-full">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    דבר בווצאפ
                  </Button>
                </a>
                <a href="tel:+972502277087">
                  <Button className="h-14 px-8 text-lg font-black bg-white/20 hover:bg-white/30 text-white border-2 border-white rounded-full">
                    <Phone className="ml-3 w-6 h-6" />
                    התקשר: 050-227-7087
                  </Button>
                </a>
              </div>
            </section>

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

            {/* Final CTA - Open Osek Patur */}
            <section className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] text-white rounded-2xl p-8 md:p-12 text-center">
              <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                ✓ רוצה לפתוח עוסק פטור?
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">צריך לפתוח עוסק פטור קודם?</h2>
              <p className="text-white/95 mb-8 text-lg max-w-2xl mx-auto">
                אנחנו מעזרים לעצמאיים בישראל לפתוח עוסק פטור באופן מקוון - בלי צורך להגיע משום מקום
              </p>
              <Link to={createPageUrl('OsekPaturOnlineLanding')} className="inline-block">
                <Button className="h-14 px-10 text-lg font-black bg-white text-[#27AE60] hover:bg-white/90 rounded-full">
                  פתח עוסק פטור אונליין עכשיו
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </section>
        </div>
      </main>
    </>
  );
}