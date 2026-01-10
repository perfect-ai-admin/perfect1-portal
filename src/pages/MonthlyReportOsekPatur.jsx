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
import { Phone, MessageCircle, ChevronDown, ArrowRight, CheckCircle, TrendingUp, BarChart3, Shield, Zap, Target, Clock, Users, Award } from 'lucide-react';

export default function MonthlyReportOsekPatur() {
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      question: 'כמה עולה ליווי חודשי?',
      answer: 'ליווי חודשי עולה 199₪ בלבד. זו השקעה קטנה שמחסכת לך הרבה עבודה וטעויות. כשאתה לא צריך לדאוג לליווי חודשי - אתה יכול להתמקד בגדל העסק.'
    },
    {
      question: 'מה בדיוק כולל הליווי החודשי?',
      answer: 'אפליקציה להפקת קבלות דיגיטליות, מעקב אוטומטי של הכנסות והוצאות, ליווי חודשי למס הכנסה וביטוח לאומי, פתרון בעיות מס וקיזוז הוצאות, וקישור ישיר לרואה חשבון לכל שאלה.'
    },
    {
      question: 'צריך לפתוח עוסק פטור קודם?',
      answer: 'כן, צריך שיהיה עוסק פטור פעיל. אם עדיין לא פתחת, אתה יכול לעשות זאת אונליין בתוך דקות, ולאחר מכן להתחיל עם הליווי החודשי שלנו.'
    },
    {
      question: 'האם אני קשור לחוזה ארוך?',
      answer: 'לא בכלל. אתה יכול לבטל בכל עת בלי עונשים. אנחנו מאמינים שאם השירות טוב - תרצה להישאר.'
    },
    {
      question: 'מה אם אני בחו"ל או בחופשה?',
      answer: 'הכל דיגיטלי לחלוטין. אפליקציה, דיווחים, ויעוץ - הכל מהטלפון שלך מכל מקום בעולם. אנחנו זמינים לך תמיד.'
    },
    {
      question: 'כמה זמן לוקח הליווי החודשי?',
      answer: 'כל ליווי חודשי לוקח לנו סביב 30-45 דקות בלבד. אתה מקבל דוח מפורט שמראה בדיוק מה הלוויינו ולמה.'
    }
  ];

  return (
    <>
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs.map(faq => ({ question: faq.question, answer: faq.answer }))} />
      <PageTracker pageUrl="/monthly-report-osek-patur" pageType="landing" />
      <SEOOptimized
        title="ליווי חודשי לעוסק פטור | 199₪/חודש | ניהול שוטף + רואה חשבון | Perfect One"
        description="ליווי חודשי מלא לעוסק פטור: ניהול הכנסות, דיווחים למס הכנסה וביטוח לאומי, קבלות דיגיטליות, ייעוץ מס + דוח שנתי. תחזוקה שוטפת של העסק בלי אחריות."
        keywords="ליווי חודשי עוסק פטור, ניהול חודשי, דיווח חודשי, רואה חשבון מנויים, ליווי עוסק פטור, דיווחים לרשויות, ניהול הוצאות הכנסות"
        canonical="https://perfect1.co.il/monthly-report-osek-patur"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "ליווי חודשי לעוסק פטור",
          "description": "שירות ליווי חודשי מלא לעוסקים פטורים הכולל ניהול בחשבונות, דיווחים ודוח שנתי",
          "url": "https://perfect1.co.il/monthly-report-osek-patur",
          "provider": {
            "@type": "Organization",
            "name": "Perfect One",
            "url": "https://perfect1.co.il"
          },
          "offers": {
            "@type": "Offer",
            "price": "199",
            "priceCurrency": "ILS",
            "priceValidUntil": "2026-12-31",
            "availability": "https://schema.org/InStock",
            "description": "ליווי חודשי עם קבלות דיגיטליות, מעקב הוצאות, דיווחים, וייעוץ"
          },
          "areaServed": {
            "@type": "Country",
            "name": "IL"
          }
        }}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'ליווי חודשי לעוסק פטור' }
          ]} />
        </div>
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-right">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                ✨ כל התהליך מנוהל כחול תמיד
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                ליווי חודשי לעוסק פטור
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto md:mx-0">
                <strong>199₪ בחודש</strong> — רואה חשבון שדואג לכל דבר בעבורך
              </p>
              <p className="text-lg text-white/80 max-w-3xl mx-auto md:mx-0">
                ניהול הכנסות, דיווחים שוטפים, קבלות דיגיטליות, ייעוץ מס, וגם דוח שנתי בסוף השנה
              </p>
            </motion.div>
          </div>
        </section>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >

            {/* What's Included Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-12 md:mb-20 border-t-4 border-green-600">
              <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-8 text-center">
                מה כולל הליווי החודשי?
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">קבלות דיגיטליות</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">הפקת קבלות בשניה מהאפליקציה, הכל נשמר אוטומטית בעננים עם גיבוי מלא.</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">מעקב הכנסות-הוצאות</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">ניהול שוקף של כל העסק - דוחות בזמן אמת, ניתוח רווחיות, וזיהוי הוצאות לקיזוז.</p>
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
                    <h3 className="font-bold text-[#1E3A5F] text-base">דיווחים לרשויות</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">דיווחים חודשיים למס הכנסה וביטוח לאומי, הכל מטופל בידיים של רואה חשבון מוסמך.</p>
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
                    <h3 className="font-bold text-[#1E3A5F] text-base">ייעוץ מס שוטף</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">ייעוץ למס, חוקים וכללי הדיווח - כל זה כלול בחבילה. בלי תוספות נוספות.</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">תמיכה זמינה תמיד</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">רואה חשבון זמין לשאלות בוואטסאפ וטלפון. בלי המתנה, בלי דלקות משרדים.</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                  className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1E3A5F] text-base">בלי התחייבות ארוכה</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">חודש לחודש, בלי חוזה ארוך. אתה יכול לבטל בכל עת - אם השירות טוב, תרצה להישאר.</p>
                </motion.div>
              </div>
            </div>

            {/* Why Monthly Monitoring */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 md:mb-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-600"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">חוסך לך זמן יקר</h3>
                <p className="text-gray-600">אתה יכול להתמקד בעסק שלך, אנחנו דואגים לכל הדיווחים וההנהלה</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-600"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">שקט נפשי מלא</h3>
                <p className="text-gray-600">כל הדיווחים בזמן, בלי קנסות, בלי בעיות עם הרשויות</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-600"
              >
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">רואה חשבון זמין לך</h3>
                <p className="text-gray-600">שאלה על מס? בעיה עם הכנסה? אנחנו כאן בוואטסאפ וטלפון</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-600"
              >
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">מחיר שקוף וברור</h3>
                <p className="text-gray-600">199₪ בחודש בלבד, בלי הוצאות נוספות או הפתעות</p>
              </motion.div>
            </div>

            {/* CTA Section - Using Unified Form */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl mb-12 md:mb-20">
              <h2 className="text-2xl md:text-3xl font-black mb-2 text-center">
                התחיל עם ליווי חודשי
              </h2>
              <p className="text-center text-white/90 mb-8">אנחנו נדאג לכל הדיווחים וההנהלה בעבורך</p>
              
              <div className="max-w-md mx-auto">
                <UnifiedLeadForm
                  variant="default"
                  title=""
                  ctaText="התחל ליווי חודשי עכשיו"
                  successTitle="קיבלנו את הפרטים! ✓"
                  successMessage="נציג יצור איתך קשר בהקדם ונסביר איך זה עובד"
                  sourcePage="ליווי חודשי לעוסק פטור"
                  fields={["name", "phone"]}
                  invertColors={true}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <a href="https://wa.me/972502277087?text=היי, אני מעוניין בליווי חודשי לעוסק פטור" target="_blank" rel="noopener noreferrer" className="flex-1">
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
                מה בדיוק אנחנו עושים בעבורך כל חודש?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { 
                    title: "📱 ניהול קבלות דיגיטליות",
                    desc: "אנחנו מנהלים את המערכת שלך לקבלות ודוחות, הכל מעוקב וארגוני"
                  },
                  {
                    title: "📊 עקבות הכנסות והוצאות",
                    desc: "מעקב מדויק של כל שקל שנכנס ויוצא, בדוק בכל עת"
                  },
                  {
                    title: "🏛️ דיווחים לרשויות",
                    desc: "דיווחים חודשיים למס הכנסה וביטוח לאומי — אנחנו מטפלים בהכל"
                  },
                  {
                    title: "💰 עד 30% עלויות מס פחות",
                    desc: "אנחנו מוודאים שאתה מקבל את כל הקיזוזים החוקיים והעלויות המקצועיות"
                  },
                  {
                    title: "❓ ייעוץ מס שוטף",
                    desc: "שאלות על מס, קיזוזים, הכנסות? אנחנו כאן לעזור בוואטסאפ"
                  },
                  {
                    title: "📄 דוח שנתי מוכן",
                    desc: "בסוף השנה אנחנו מכינים ומגישים את הדוח השנתי שלך"
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border-r-4 border-green-600"
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
                שאלות נפוצות
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
                        className={`w-5 h-5 md:w-6 md:h-6 text-green-600 transition-transform ${
                          expandedFaq === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 md:px-6 py-4 md:py-5 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-gray-200"
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
              <section className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white rounded-2xl p-8 md:p-10 mb-12 md:mb-20">
                <h2 className="text-2xl md:text-3xl font-black mb-4">עדיין לא פתחת עוסק פטור?</h2>
                <p className="text-white/90 mb-6">תחילה צריך לפתוח עוסק פטור, ואז נוכל להתחיל עם הליווי החודשי</p>
                <Link to={createPageUrl('OsekPaturOnlineLanding')} className="inline-block">
                  <Button className="h-12 px-8 bg-white text-[#1E3A5F] hover:bg-gray-100 font-bold">
                    פתח עוסק פטור אונליין עכשיו
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </section>

              {/* Related Content */}
              <RelatedContent pageType="support" />
              </motion.div>
              </div>
              </main>
              </>
              );
              }