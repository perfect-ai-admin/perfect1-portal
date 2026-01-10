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
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle, ChevronDown, ArrowRight, CheckCircle, TrendingUp, BarChart3, Shield } from 'lucide-react';

export default function MonthlyReportOsekPatur() {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      question: 'כמה עולה ליווי חודשי?',
      answer: 'ליווי חודשי עולה 199₪ בלבד. זה כולל אפליקציה לניהול הכנסות, דיווחים לרשויות, וגישה ישירה לרואה חשבון.'
    },
    {
      question: 'מה כולל הליווי החודשי?',
      answer: 'הליווי כולל אפליקציה להפקת קבלות, מעקב הכנסות והוצאות, דיווחים שוטפים לרשויות, ייעוץ מס שוטף, וגישה לרואה חשבון לכל שאלה.'
    },
    {
      question: 'צריך לפתוח עוסק פטור קודם?',
      answer: 'כן, אם עדיין לא פתחת עוסק פטור, תוכל לעשות זאת אונליין בקלות ובמהירות, ולאחר מכן להתחיל עם הליווי החודשי.'
    },
    {
      question: 'האם יש חוזה ארוך?',
      answer: 'לא, אתה יכול לבטל בכל עת. אין התחייבות ארוכת טווח, רק ליווי חודשי גמיש.'
    },
    {
      question: 'מי יעזור לי בשאלות?',
      answer: 'רואה חשבון מוסמך שלנו זמין 24/6 לכל שאלה. אתה מקבל תמיכה ישירה וייעוץ מקצועי.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'דיווח חודשי לעוסק פטור',
        category: 'osek_patur',
        status: 'new'
      });
      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <main className="min-h-screen bg-gradient-to-br from-green-50 to-white">
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

            {/* Services Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mb-12 md:mb-20">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all border-l-4 border-green-500"
              >
                <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">📱 קבלות דיגיטליות</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">הפקת קבלות בשניה דרך האפליקציה, הכל מעוקב באופן אוטומטי</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500"
              >
                <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">📊 מעקב הכנסות-הוצאות</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">ניהול שוקף של כל העסק שלך - בדיוק לאן הולך כל שקל</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all border-l-4 border-purple-500"
              >
                <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">🏛️ דיווחים לרשויות</h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">כל הדיווחים למס הכנסה וביטוח לאומי מטופלים בידיים מקצועיות</p>
              </motion.div>
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
          </motion.div>
        </div>
      </main>
    </>
  );
}