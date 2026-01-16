import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import PageTracker from '../components/seo/PageTracker';
import RelatedContent from '../components/seo/RelatedContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { CheckCircle, FileText, Phone, MessageCircle, Clock, DollarSign, Award, ArrowRight, Zap, Users, Shield, Lightbulb } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HowToOpenOsekPatur() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'איך פותחים עוסק פטור',
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

  const faqs = [
    {
      question: "כמה זמן לוקח לפתוח עוסק פטור?",
      answer: "בדרך כלל 2-4 שבועות מהגשת הבקשה. אם אתם עם Perfect One, אנחנו מזרזים את התהליך ומטפלים בכל הפרטים."
    },
    {
      question: "כמה עולה לפתוח עוסק פטור?",
      answer: "העלות תלויה בתחום העסק ובמורכבות. עם Perfect One, ישנן חבילות שונות שמתחילות מ-₪499 לפתיחה בסיסית."
    },
    {
      question: "צריך רואה חשבון כדי לפתוח עוסק פטור?",
      answer: "לא חובה, אבל זה מומלץ מאוד. רואה חשבון יוודא שהכל תקין מול הרשויות ויחסוך לך כל כך הרבה צרות בעתיד."
    },
    {
      question: "האם יכול לפתוח עוסק פטור אם אני עובד שכיר?",
      answer: "כן, אתה יכול לעבוד כעוסק פטור גם אם אתה עובד שכיר באותו הזמן. חשוב רק לדווח על הכנסות עוסק."
    },
    {
      question: "מה ההבדל בין פתיחה רגילה לאונליין?",
      answer: "בפתיחה אונליין אתה לא צריך ללכת למשרדי רשות המיסים. אנחנו עושים הכל דיגיטלי - מהבית שלך."
    },
    {
      question: "מה קורה אחרי שהעוסק נפתח?",
      answer: "אתה מקבל מספר אישור ומתחיל לדווח לביטוח לאומי. אנחנו מעבירים לך את כל הדוקומנטציה ודוקים איתך."
    }
  ];

  const steps = [
    { 
      number: 1, 
      title: 'בדיקת זכאות ותכנון',
      description: 'בדיקה אם אתה זכאי לעוסק פטור ובחירת התחום הנכון לך',
      details: 'אנחנו בודקים את המצב שלך - אם אתה עובד שכיר, חופשי, מעניין אותך עוסק פטור או משהו אחר. אנחנו יודעים בדיוק מה מתאים.'
    },
    { 
      number: 2, 
      title: 'איסוף מסמכים',
      description: 'איסוף כל המסמכים הנדרשים להגשה לרשויות',
      details: 'תעודת זהות, כתובת משרד, הוכחה על קשר לעסק, ומסמכים נוספים בהתאם לתחום. אנחנו בדיוק יודעים מה צריך.'
    },
    { 
      number: 3, 
      title: 'הגשה למס הכנסה',
      description: 'הגשת הבקשה למס הכנסה לאישור העוסק',
      details: 'האנחנו מגישים את כל הטפסים למס הכנסה. לך רק לחתום. אנחנו עוקבים אחרי התהליך בכל שלב.'
    },
    { 
      number: 4, 
      title: 'רישום בביטוח לאומי',
      description: 'רישום אוטומטי בביטוח לאומי - וזה קורה מעצמו',
      details: 'מס הכנסה מעביר את הפרטים לביטוח לאומי. אתה מתחיל לשלם דמי ביטוח לאומי קטנים בתחילה.'
    },
    { 
      number: 5, 
      title: 'אישור ותחילת הפעילות',
      description: 'קבלת מספר ארגון וסטארט רשמי של העסק שלך',
      details: 'אתה מקבל מספר ארגון וכל הנתונים. אתה רשמי בספרי הממשלה. עוסקך בעסק הוא חוקי ותקני.'
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/how-to-open-osek-patur" pageType="guide" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - איך פותחים עוסק פטור"
        description="מדריך מלא וקומפרהנסיבי על כיצד לפתוח עוסק פטור בישראל"
      />
      <SEOOptimized
        title="איך פותחים עוסק פטור בישראל - מדריך מלא 2026 | Perfect One"
        description="מדריך שלב אחר שלב להפתיחת עוסק פטור בישראל. כל מה שצריך: הליכים, מסמכים, עלויות וטיפים של מומחים. פתיחה רגילה או אונליין."
        keywords="איך פותחים עוסק פטור, פתיחת עוסק פטור, עוסק פטור בישראל, תהליך פתיחה, מסמכים דרושים"
        canonical="https://perfect1.co.il/how-to-open-osek-patur"
      />

      <main className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'עוסק פטור', url: 'OsekPaturLanding' },
            { label: 'איך פותחים עוסק פטור' }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2C4B] overflow-hidden py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#27AE60] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-[#27AE60]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-[#27AE60]/30">
                <Zap className="w-5 h-5 text-[#27AE60]" />
                <span className="text-[#27AE60] text-sm font-bold">מדריך מעשי 2026</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-8">
                איך פותחים עוסק פטור בישראל?
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                מדריך שלב אחר שלב מ-Perfect One - הצוות שפתח כבר אלפים של עוסקים פטורים בישראל
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור - מעניין בייעוץ" target="_blank" rel="noopener noreferrer">
                  <Button className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    ייעוץ בחינם
                  </Button>
                </a>
                <button 
                  onClick={() => document.getElementById('steps')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-12 sm:h-14 px-6 sm:px-10"
                >
                  <Button variant="outline" className="w-full h-full text-base sm:text-lg font-bold rounded-xl border-2 border-white bg-white/10 text-white hover:bg-white/20 shadow-lg">
                    <FileText className="ml-2 w-5 h-5" />
                    קרא
                  </Button>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 md:gap-8 text-white">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                  <p className="text-sm font-bold">2-4 שבועות</p>
                  <p className="text-xs text-white/70">לפתיחה מלאה</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                  <p className="text-sm font-bold">מ-₪499</p>
                  <p className="text-xs text-white/70">חבילות שונות</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Users className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                  <p className="text-sm font-bold">7000+</p>
                  <p className="text-xs text-white/70">עוסקים שפתחנו</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 5 Steps Section */}
        <section id="steps" className="py-20 bg-gradient-to-br from-white to-blue-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-[#1E3A5F] mb-6">
                5 שלבים לפתיחה מוצלחת
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                התהליך הוא מעשי וברור - אנחנו עוברים כל שלב איתך
              </p>
            </motion.div>

            <div className="space-y-6">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-l-4 border-[#1E3A5F]"
                >
                  <div className="p-8 flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] text-white font-black text-2xl">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#1E3A5F] mb-2">{step.title}</h3>
                      <p className="text-gray-600 mb-2">{step.description}</p>
                      <p className="text-gray-500 text-sm">{step.details}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black text-[#1E3A5F] mb-6">
                למה לבחור ב-Perfect One?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Award,
                  title: 'מומחיות מוכחת',
                  desc: 'יותר מ-7000 עוסקים פתוחים בהצלחה'
                },
                {
                  icon: Shield,
                  title: 'ניהול מלא',
                  desc: 'אנחנו מטפלים בכל הנושאים מול הרשויות'
                },
                {
                  icon: Lightbulb,
                  title: 'ייעוץ חינמי',
                  desc: 'בדיקה אישית וייעוץ למצב שלך בחינם'
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-100 hover:shadow-lg transition-all"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#1E3A5F] flex items-center justify-center mb-6 mx-auto">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3 text-center">{item.title}</h3>
                    <p className="text-gray-700 text-center">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Online Option */}
        <section className="py-20 bg-gradient-to-br from-[#27AE60]/5 to-cyan-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-[#27AE60]/30"
            >
              <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#27AE60]/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-8 h-8 text-[#27AE60]" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#1E3A5F] mb-2">אונליין בלי טרחה</h2>
                  <p className="text-gray-600">רוצים לפתוח עוסק פטור בלי ללכת למשרדים?</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                אנחנו מציעים <strong>פתיחה אונליין מלאה</strong> - לא צריך להיות בישראל, לא צריך ללכת למשרדים, לא צריך להסתבך עם ביירוקרטיה. אנחנו עושים הכל דיגיטלי, מהבית שלך.
              </p>

              <Link to={createPageUrl('OsekPaturOnlineLanding')}>
                <Button className="w-full h-14 text-lg font-bold rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white">
                  <ArrowRight className="ml-3 w-6 h-6" />
                  קרא עוד על פתיחה אונליין
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black text-[#1E3A5F] mb-6">שאלות נפוצות</h2>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem 
                  key={i} 
                  value={`item-${i}`}
                  className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-[#1E3A5F]/30 transition-all px-6"
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
          </div>
        </section>

        {/* CTA Form */}
        <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                מוכנים לפתוח את העוסק שלכם?
              </h2>
              <p className="text-xl text-white/90">
                בואו נעשה זאת ביחד - פשוט, מהיר, ובלי טרחות
              </p>
            </motion.div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="שם מלא *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-xl border-2"
                  required
                />
                <Input
                  type="tel"
                  placeholder="טלפון *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 rounded-xl border-2"
                  required
                />
                <Input
                  placeholder="מקצוע (לא חובה)"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="h-12 rounded-xl border-2"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white"
                >
                  {isSubmitting ? 'שולח...' : 'שלח בקשה'}
                </Button>
              </form>

              <div className="flex gap-4 mt-6 pt-6 border-t">
                <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    WhatsApp
                  </Button>
                </a>
                <a href="tel:+972502277087" className="flex-1">
                  <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    <Phone className="ml-2 w-5 h-5" />
                    טלפון
                  </Button>
                </a>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                ללא התחייבות • ייעוץ מקצועי • תשובה תוך 24 שעות
              </p>
            </div>
          </div>
        </section>

        {/* Related Content */}
        <RelatedContent pageType="guide" />
      </main>
    </>
  );
}