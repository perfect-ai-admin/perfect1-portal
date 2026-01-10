import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import PageTracker from '../components/seo/PageTracker';

export default function HowToCloseOsekPatur() {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      question: "כמה זמן לוקח לסגור עוסק פטור?",
      answer: "בדרך כלל 2-4 שבועות. התלוי בהיקף העסק וכמה מהר משיבות הרשויות."
    },
    {
      question: "צריך להגיש דוח שנתי לפני הסגירה?",
      answer: "כן, חובה. דוח שנתי סופי חייב להגיע למס הכנסה לפני הסגירה הסופית."
    },
    {
      question: "מה קורה אם לא אגיש דוח שנתי?",
      answer: "יכולות להיות עיכובים בסגירה, קנסות וריבית. זה חשוב מאד לא לדלג על זה."
    },
    {
      question: "אני צריך רואה חשבון לסגור עוסק?",
      answer: "לא חובה, אבל אם הביזנס היה בעל הכנסה משמעותית - עדיף שרואה חשבון יטפל בזה."
    },
    {
      question: "מה אם יש לי חוב לביטוח לאומי או למס הכנסה?",
      answer: "צריך לתקן את החוב לפני הסגירה או התקבול יוקזז מהחזרים אחרים."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'איך סוגרים עוסק פטור',
        category: 'osek_patur',
        status: 'new'
      });
      window.location.href = createPageUrl('ThankYou');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageTracker pageUrl="/how-to-close-osek-patur" pageType="guide" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - מדריך סגירת עוסק פטור"
        description="מדריך שלב אחר שלב לסגירת עוסק פטור בישראל"
      />
      <SEOOptimized
        title="איך סוגרים עוסק פטור - מדריך שלב אחר שלב | Perfect One"
        description="מדריך מלא לסגירת עוסק פטור: שלבים, מסמכים, זמנים, ומה קורה במול הרשויות."
        keywords="סגירת עוסק פטור, איך סוגרים עוסק, סגירה ממס הכנסה, סגירה מביטוח לאומי"
        canonical="https://perfect1.co.il/how-to-close-osek-patur"
      />

      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'שירותים', url: 'Services' },
            { label: 'סגירת עוסק פטור', url: 'CloseOsekPaturComprehensive' },
            { label: 'איך סוגרים עוסק פטור' }
          ]} />
        </div>

        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                איך סוגרים עוסק פטור?
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                מדריך שלב אחר שלב לסגירה בטוחה וחוקית של עוסק פטור
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                6 שלבים לסגירה בטוחה
              </h2>

              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: 'דוח שנתי סופי',
                    time: '1-2 שבועות',
                    desc: 'הגשת דוח שנתי סופי למס הכנסה עד לתאריך הסגירה. זה צעד חובה שלא אפשר לדלג עליו.',
                    authority: '📋 מס הכנסה'
                  },
                  {
                    step: 2,
                    title: 'הודעה למס הכנסה',
                    time: '1-2 שבועות',
                    desc: 'מלא טופס הודעה על סיום עסקות ושלח למס הכנסה. זה אפשר לעשות אונליין דרך אתר הרשות.',
                    authority: '📋 מס הכנסה'
                  },
                  {
                    step: 3,
                    title: 'סגירה של מע״מ (אם קיים)',
                    time: '1-3 שבועות',
                    desc: 'אם הרשמת עוסק למע״מ - צריך להגיש דוח מע״מ אחרון ולשלם או לקבל החזר.',
                    authority: '💰 מע״מ'
                  },
                  {
                    step: 4,
                    title: 'הודעה לביטוח לאומי',
                    time: '2-3 שבועות',
                    desc: 'שלח הודעה על סיום עסקות לביטוח לאומי. חייב לתקן כל חוקים שנותרו לפני הסגירה.',
                    authority: '🛡️ ביטוח לאומי'
                  },
                  {
                    step: 5,
                    title: 'סגירה סופית',
                    time: '1-2 שבועות',
                    desc: 'קבל אישורים סופיים מכל הרשויות. כשכל הרשויות מאשרות - הסגירה הושלמה.',
                    authority: '✅ סגירה'
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-8 border-r-4 border-[#1E3A5F]"
                  >
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#1E3A5F] text-white font-black text-2xl">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-[#1E3A5F]">{item.title}</h3>
                          <span className="text-sm font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">⏱️ {item.time}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">{item.desc}</p>
                        <p className="text-sm font-bold text-gray-600">{item.authority}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-orange-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                מה קורה אם מדלגים על שלב?
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { issue: 'דוח שנתי לא הוגש', consequence: 'קנסות, ריבית, וסגירה לא סופית' },
                  { issue: 'לא הודעת למס הכנסה', consequence: 'עוסק יישאר רשום - יכול להשפיע על עסק חדש' },
                  { issue: 'חוק לביטוח לאומי לא תוקן', consequence: 'קנסות וריבית - זה יכול להיות יקר' },
                  { issue: 'מע״מ לא סוגר כראוי', consequence: 'בעיות עם פיקוח מע״מ וקנסות' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl p-6 border-2 border-red-300 shadow-md"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <h3 className="text-lg font-bold text-[#1E3A5F]">{item.issue}</h3>
                    </div>
                    <p className="text-gray-700 text-sm">→ {item.consequence}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                שאלות נפוצות
              </h2>

              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, i) => (
                  <AccordionItem 
                    key={i} 
                    value={`item-${i}`}
                    className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden px-6"
                  >
                    <AccordionTrigger className="text-right hover:no-underline py-4">
                      <span className="text-lg font-bold text-[#1E3A5F]">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                תהליך מורכב?
              </h2>
              <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
                במקרים מורכבים ניתן לבצע את הסגירה <Link to={createPageUrl('CloseBusinessLanding')} className="text-[#2C5282] font-bold hover:underline">בליווי מלא ומסודר</Link> שדואג שכל שלב נעשה כמו שצריך.
              </p>
            </motion.div>
          </div>
        </section>

            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-8 text-center">
                בואו נעשה את הסגירה בנכון ובלי בעיות
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <Input
                  placeholder="שם מלא *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 bg-white/20 border-white/30 text-white placeholder-white/70"
                  required
                />
                <Input
                  type="tel"
                  placeholder="טלפון *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 bg-white/20 border-white/30 text-white placeholder-white/70"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-white text-gray-800 hover:bg-gray-100 font-bold"
                >
                  {isSubmitting ? 'שולח...' : 'קבל הכוונה לסגירה'}
                </Button>
              </form>

              <div className="flex gap-4 pt-6 border-t border-white/20">
                <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full h-12 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}