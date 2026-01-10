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
import { Phone, MessageCircle, ChevronDown, ArrowRight, CheckCircle, TrendingUp, BarChart3, Shield, Zap, Target, Clock, Users, Award, FileText, Calculator } from 'lucide-react';

export default function AnnualReportOsekPatur() {
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      question: 'כמה עולה הכנת דוח שנתי?',
      answer: 'דוח שנתי עוסק פטור עולה 1,199₪. זו השקעה חד-פעמית שמחסכת לך הרבה אחריות משפטית וטעויות בדיווח. הדוח מכסה את כל הדרישות של מס הכנסה וביטוח לאומי.'
    },
    {
      question: 'מה בדיוק כולל הדוח השנתי?',
      answer: 'הדוח השנתי כולל: סכום סוף שנה 1301 (סוף 1301), דיווח לרשויות (מס הכנסה וביטוח לאומי), ביטול הוצאות תקניות ועודפות, ייעוץ לקיזוזים נוספים, ו-PDF סופי עם כל המסמכים המעודכנים.'
    },
    {
      question: 'מתי צריך להכין דוח שנתי?',
      answer: 'הדוח השנתי צריך להיות מוגש עד ה-31 במרץ בשנה הבאה. אנחנו ממליצים להכין אותו מיד אחרי סוף השנה החשבונאית כדי להמנע מקנסות של מס הכנסה וביטוח לאומי.'
    },
    {
      question: 'האם הדוח השנתי חובה?',
      answer: 'כן! עוסק פטור צריך להגיש דוח שנתי (סוף 1301) למס הכנסה וביטוח לאומי. זה חוקי וחובה. אם לא מגישים, יש עונשים כספיים וקנסות.'
    },
    {
      question: 'איך זה עובד? מה הצעדים?',
      answer: 'קל: אתה מעביר לנו את כל המסמכים (קבלות, הוצאות, הכנסות), אנחנו מעבדים הכל, מכינים את הדוח השנתי המלא, ואנחנו משדרים ישירות לרשויות בשמך.'
    },
    {
      question: 'האם אני צריך להגיע איי מקום?',
      answer: 'לא, הכל דיגיטלי 100%. אתה מעביר מסמכים בוואטסאפ או במייל, אנחנו מטפלים בהכל, ואתה מקבל את הדוח הסופי באימייל.'
    },
    {
      question: 'מה אם אני עוסק פטור אבל לא מוקד הכנסות?',
      answer: 'אפילו אם לא היה לך הכנסה במהלך השנה, אתה עדיין צריך להגיש דוח שנתי. זה מיידיע לרשויות שהעסק לא פעיל או שאין הכנסות.'
    },
    {
      question: 'כמה זמן לוקח להכין את הדוח?',
      answer: 'אנחנו מכינים את הדוח בתוך 3-5 ימי עסק מהרגע שקיבלנו את כל המסמכים. אתה מקבל את ה-PDF הסופי וישר משדרים לרשויות.'
    },
    {
      question: 'האם קיזוזים נוספים יכולים להפחית את המס?',
      answer: 'כן! רוב עוסקים פטורים לא יודעים על קיזוזים חוקיים שיכולים להפחית את ההכנסה החייבת במס. אנחנו בודקים הכל ומעריכים קיזוזים שיעזרו לך.'
    },
    {
      question: 'מה אם יש לי שאלות בדרך?',
      answer: 'אנחנו זמינים בוואטסאפ וטלפון לכל שאלה. אפילו אחרי שנחתמתי את הדוח, אנחנו עדיין כאן לתמיכה.'
    }
  ];

  return (
    <>
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs.map(faq => ({ question: faq.question, answer: faq.answer }))} />
      <PageTracker pageUrl="/annual-report-osek-patur" pageType="landing" />
      <SEOOptimized
        title="דוח שנתי לעוסק פטור | 1,199₪ | הכנה מקצועית + הגשה | Perfect One"
        description="הכנת דוח שנתי לעוסק פטור (סוף 1301) כולל קיזוזים, דיווח לרשויות, ו-PDF סופי. 1,199₪ בלבד, הגשה לידיים מקצועיות של רואה חשבון."
        keywords="דוח שנתי עוסק פטור, סוף 1301, הגשת דוח שנתי, קיזוזים עוסק פטור, דוח שנתי מס הכנסה, דוח שנתי ביטוח לאומי"
        canonical="https://perfect1.co.il/annual-report-osek-patur"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "הכנת דוח שנתי לעוסק פטור",
          "description": "שירות הכנת דוח שנתי מלא לעוסקים פטורים כולל דיווח לרשויות וקיזוזים",
          "url": "https://perfect1.co.il/annual-report-osek-patur",
          "provider": {
            "@type": "Organization",
            "name": "Perfect One",
            "url": "https://perfect1.co.il"
          },
          "offers": {
            "@type": "Offer",
            "price": "1199",
            "priceCurrency": "ILS",
            "priceValidUntil": "2026-12-31",
            "availability": "https://schema.org/InStock",
            "description": "הכנת דוח שנתי מלא עם קיזוזים ודיווח לרשויות"
          },
          "areaServed": {
            "@type": "Country",
            "name": "IL"
          }
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'דוח שנתי לעוסק פטור' }
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
                ✓ דוח שנתי חוקי ומקצועי
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                דוח שנתי לעוסק פטור
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto md:mx-0">
                <strong>1,199₪</strong> — סוף 1301 מלא עם קיזוזים וקבלת אישור
              </p>
              <p className="text-lg text-white/80 max-w-3xl mx-auto md:mx-0">
                אנחנו מטפלים בהכל: בדיקת כל ההוצאות, קיזוזים חוקיים, דיווח למס הכנסה וביטוח לאומי
              </p>

              {/* Price Badge */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-block mt-6 bg-orange-500 text-white px-8 py-4 rounded-full text-2xl font-black shadow-lg"
              >
                1,199₪
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >

            {/* What's Included Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-12 md:mb-20 border-t-4 border-[#1E3A5F]">
              <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-8 text-center">
                מה כולל הדוח השנתי?
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">סוף 1301 מלא</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">דוח שנתי מעודכן לחלוטין עם סכום סוף שנה בהתאם לכל ההוצאות וההכנסות</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">קיזוזים חוקיים</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">בדיקה מעמיקה של כל הוצאה וקיזוזים חוקיים שיעזרו להוריד את המס שלך</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">דיווח לרשויות</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">דיווח ישיר למס הכנסה וביטוח לאומי - הכל מטופל בידינו</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">PDF סופי ודיגיטלי</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">קבלת PDF מלא עם כל המסמכים וההסברים - מוכן להצגה לכל רשות</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">ייעוץ מס שוטף</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">ייעוץ מקצועי על קיזוזים נוספים שעלולים להעלות את ההוצאות החוקיות</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                  className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">תיעוד ושקיפות</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">כל משהו תועד ומוסבר - אתה יודע בדיוק מה דוח וכמה עבור מה</p>
                </motion.div>
              </div>
            </div>

            {/* Why Annual Report */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 md:mb-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-[#1E3A5F]"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">לא דאגה חוקית</h3>
                <p className="text-gray-600">דוח שנתי מקצועי = בטחון מלא שאתה בחוק ואין קנסות משמס הכנסה או ביטוח לאומי</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-600"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">תחזוקה חוקית</h3>
                <p className="text-gray-600">כל עוסק פטור צריך להגיש דוח שנתי עד ה-31 במרץ - אנחנו עוזרים כדי להימנע מקנסות</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-600"
              >
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">קיזוזים חוקיים</h3>
                <p className="text-gray-600">אנחנו בודקים כל הוצאה וקיזוזים שיכולים להפחית את המס שלך בצורה חוקית</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-600"
              >
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">תמיכה טכנית</h3>
                <p className="text-gray-600">שאלות על הדוח? זמינים בוואטסאפ וטלפון גם אחרי ההגשה</p>
              </motion.div>
            </div>

            {/* CTA Section - Using Unified Form */}
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl mb-12 md:mb-20">
              <h2 className="text-2xl md:text-3xl font-black mb-2 text-center">
                תחזוקה שנתית של הדוח
              </h2>
              <p className="text-center text-white/90 mb-8">השארת פרטים עכשיו ויחזור אליך צוות רואים חשבון</p>
              
              <div className="max-w-md mx-auto">
                <UnifiedLeadForm
                  variant="default"
                  title=""
                  ctaText="קבל פרטי דוח שנתי"
                  successTitle="קיבלנו את הפרטים! ✓"
                  successMessage="נציג יצור איתך קשר בהקדם ויסביר את הדוח השנתי"
                  sourcePage="דוח שנתי לעוסק פטור"
                  fields={["name", "phone"]}
                  invertColors={true}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <a href="https://wa.me/972502277087?text=היי, אני מעוניין בהכנת דוח שנתי לעוסק פטור שלי" target="_blank" rel="noopener noreferrer" className="flex-1">
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

            {/* Benefits Section */}
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg mb-12 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-8 text-center">
                איך הדוח השנתי משפר את כלכלת העסק?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { 
                    title: "💰 הפחתת מס עד 30%",
                    desc: "קיזוזים חוקיים שבדקנו יכולים להפחית את ההכנסה החייבת במס"
                  },
                  {
                    title: "✓ ניהול שקוף של הוצאות",
                    desc: "כל הוצאה תועדה וחוקית - אתה יודע בדיוק מה מקוזז"
                  },
                  {
                    title: "🛡️ הגנה משפטית",
                    desc: "דוח שנתי מקצועי הוא הגנה מפני בדיקות ודעיכות רשויות"
                  },
                  {
                    title: "📊 דוח מפורט",
                    desc: "תמונה מלאה של רווחיות העסק לאורך השנה"
                  },
                  {
                    title: "🎯 ייעוץ שנתי",
                    desc: "הצעות לשיפור הניהול הכלכלי בשנה הבאה"
                  },
                  {
                    title: "⏰ דוח מוכן לקבלות",
                    desc: "הדוח הסופי PDF מוכן להצגה לכל הרשויות"
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border-r-4 border-[#1E3A5F]"
                  >
                    <h3 className="font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-8 md:mb-12 text-center">
                שאלות נפוצות על דוח שנתי
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

            {/* CTA - Open Osek Patur if needed */}
            <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 md:p-10 mb-12 md:mb-20">
              <h2 className="text-2xl md:text-3xl font-black mb-4">עדיין לא פתחת עוסק פטור?</h2>
              <p className="text-white/90 mb-6">תחילה צריך לפתוח עוסק פטור, ואז נוכל להכין לך דוח שנתי מקצועי</p>
              <Link to={createPageUrl('OsekPaturOnlineLanding')} className="inline-block">
                <Button className="h-12 px-8 bg-white text-green-600 hover:bg-gray-100 font-bold">
                  פתח עוסק פטור אונליין עכשיו
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </section>

            {/* Related Content */}
            <RelatedContent pageType="action" />
          </motion.div>
        </div>
      </main>
    </>
  );
}