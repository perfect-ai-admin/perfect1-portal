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
      answer: 'ליווי חודשי עולה 199₪ בלבד. זו השקעה קטנה שמחסכת לך הרבה עבודה וטעויות. כשאתה לא צריך לדאוג להדיווחים - אתה יכול להתמקד בגדל העסק.'
    },
    {
      question: 'מה בדיוק כולל הליווי החודשי?',
      answer: 'אפליקציה להפקת קבלות דיגיטליות, מעקב אוטומטי של הכנסות והוצאות, דיווחים שוטפים למס הכנסה וביטוח לאומי, פתרון בעיות מס וקיזוז הוצאות, וקישור ישיר לרואה חשבון לכל שאלה.'
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
      question: 'כמה זמן לוקח הדיווח החודשי?',
      answer: 'כל דיווח חודשי לוקח לנו סביב 30-45 דקות בלבד. אתה מקבל דוח מפורט שמראה בדיוק מה הדיווחנו ולמה.'
    }
  ];

  return (
    <>
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs.map(faq => ({ question: faq.question, answer: faq.answer }))} />
      <SEOOptimized
        title="דיווח חודשי לעוסק פטור | ליווי חודשי 199₪ | Perfect One"
        description="ליווי חודשי לעוסק פטור: אפליקציה, דיווחים לרשויות, וגישה לרואה חשבון. 199₪ בחודש, בלי התחייבות."
        keywords="דיווח חודשי עוסק פטור, ליווי חודשי, רואה חשבון עוסק פטור, מעקב הכנסות הוצאות"
        canonical="https://perfect1.co.il/monthly-report-osek-patur"
      />

      <PageTracker pageUrl="/monthly-report-osek-patur" pageType="landing" />
      <SEOOptimized
        title="ליווי חודשי לעוסק פטור | 199₪/חודש | ניהול שוטף + רואה חשבון | Perfect One"
        description="ליווי חודשי מלא לעוסק פטור: ניהול הכנסות, דיווחים למס הכנסה וביטוח לאומי, קבלות דיגיטליות, ייעוץ מס + דוח שנתי. תחזוקה שוטפת של העסק בלי אחריות."
        keywords="ליווי חודשי עוסק פטור, ניהול חודשי, דיווח חודשי, רואה חשבון מנויים, ליווי עוסק פטור"
        canonical="https://perfect1.co.il/monthly-report-osek-patur"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "ליווי חודשי לעוסק פטור",
          "description": "שירות ליווי חודשי מלא לעוסקים פטורים הכולל ניהול בחשבונות, דיווחים ודוח שנתי",
          "provider": {
            "@type": "Organization",
            "name": "Perfect One"
          },
          "price": "199",
          "priceCurrency": "ILS",
          "priceValidUntil": "2026-12-31"
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
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-[#1E3A5F] mb-4 md:mb-6 text-center">
              ליווי חודשי לעוסק פטור
            </h1>
            <p className="text-lg md:text-xl text-gray-600 text-center mb-12 md:mb-16 max-w-3xl mx-auto">
              <strong>199₪ בחודש</strong> לניהול שוטף שלם עם רואה חשבון זמין לכל שאלה
            </p>

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

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl mb-12 md:mb-20">
              <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-center">
                עוסק שקר בראש. אנחנו דואגים לשאר.
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <Input
                  placeholder="שם מלא *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 md:h-12 bg-white/20 border-white/30 text-white placeholder-white/70 text-sm md:text-base"
                  required
                />
                <Input
                  type="tel"
                  placeholder="טלפון *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 md:h-12 bg-white/20 border-white/30 text-white placeholder-white/70 text-sm md:text-base"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 md:h-12 bg-white text-green-600 hover:bg-gray-100 font-bold text-sm md:text-base"
                >
                  {isSubmitting ? 'שולח...' : 'בדיקה ללא התחייבות'}
                </Button>
              </form>

              <div className="grid grid-cols-2 md:flex md:gap-4 gap-3 mb-6 md:mb-8">
                <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="col-span-1 md:flex-1">
                  <Button className="w-full h-10 md:h-12 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30 text-xs md:text-base">
                    <MessageCircle className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
                    WhatsApp
                  </Button>
                </a>
                <a href="tel:+972502277087" className="col-span-1 md:flex-1">
                  <Button className="w-full h-10 md:h-12 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30 text-xs md:text-base">
                    <Phone className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
                    טלפון
                  </Button>
                </a>
              </div>

              {/* Open Osek Patur Button */}
              <div className="border-t border-white/20 pt-6 md:pt-8">
                <p className="text-white/90 text-xs md:text-sm mb-3 text-center">עדיין לא פתחת עוסק פטור?</p>
                <Link to={createPageUrl('OsekPaturOnlineLanding')} className="block">
                  <Button className="w-full h-11 md:h-12 bg-white text-green-600 hover:bg-gray-100 font-black text-sm md:text-base">
                    ✓ פתח עוסק פטור אונליין עכשיו
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </Link>
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

              {/* Related Content */}
              <RelatedContent pageType="support" />
              </motion.div>
              </div>
              </main>
              </>
              );
              }