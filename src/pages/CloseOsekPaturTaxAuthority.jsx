import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle, AlertCircle, FileText, CheckCircle, Clock } from 'lucide-react';
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

export default function CloseOsekPaturTaxAuthority() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      question: "מתי חייב להודיע למס הכנסה על סגירת עוסק?",
      answer: "צריך להגיש הודעה על סיום עסקות בתוך 30 ימים מיום הסגירה. ניתן להגיש דרך אתר מס הכנסה או רואה חשבון."
    },
    {
      question: "איזה דוח צריך להגיש סופי?",
      answer: "דוח שנתי סופי (טו״ש - טופס דוח שנתי) המראה הכנסות וניכויים עד תאריך הסגירה. זה חובה לפני סגירה סופית."
    },
    {
      question: "מה קורה אם יש לי הכנסה עד תאריך הסגירה?",
      answer: "כל הכנסה חייבת להיות מדווחת בדוח השנתי הסופי, גם אם זה יום אחד לפני הסגירה."
    },
    {
      question: "אם יש לי חוב למס הכנסה - מה קורה?",
      answer: "החוב לא יעלם. מס הכנסה יכול לחייב בריבית וקנסות אם לא מסדירים את זה לפני הסגירה."
    },
    {
      question: "צריך להחזיר מספר עוסק לאחר הסגירה?",
      answer: "לא משמעותי - מספר העוסק פשוט יישמר כסגור. המש״ח לא יעלם אבל לא תוכל להשתמש בו."
    },
    {
      question: "כמה זמן לוקח למס הכנסה לעבד את הסגירה?",
      answer: "בדרך כלל 2-4 שבועות. זה תלוי בהיקף הבדיקה שלהם ובמהירות התגובה שלך."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.target);
      await base44.entities.Lead.create({
        name: formData.get('name'),
        phone: formData.get('phone'),
        source_page: 'סגירת עוסק פטור - מס הכנסה',
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
      <PageTracker pageUrl="/close-osek-patur-tax-authority" pageType="guide" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - סגירת עוסק פטור במס הכנסה"
        description="מדריך מלא לדרישות מס הכנסה בעת סגירת עוסק פטור"
      />
      <SEOOptimized
        title="סגירת עוסק פטור במס הכנסה - דרישות וטפסים | Perfect One"
        description="מדריך מלא: מה מס הכנסה דורש, אילו דוחות חובה להגיש, ומה קורה עם חובות."
        keywords="סגירת עוסק מס הכנסה, דוח סופי, טופס 3011, סגירה חשבון עוסק"
        canonical="https://perfect1.co.il/close-osek-patur-tax-authority"
      />

      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'סגירת עוסק פטור', url: 'CloseOsekPaturComprehensive' },
            { label: 'מס הכנסה' }
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
                סגירת עוסק פטור במס הכנסה
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                מדריך מלא לדרישות הרשות, דוחות חובה, ומה קורה אם יש חובות או דיווחים פתוחים
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
                דרישות מס הכנסה לסגירה
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: <FileText className="w-8 h-8" />,
                    title: 'דוח שנתי סופי',
                    desc: 'הדוח האחרון שלך שמראה הכנסות וניכויים עד תאריך הסגירה. זה חובה וצריך להגיש אותו לפני סגירה סופית.'
                  },
                  {
                    icon: <Clock className="w-8 h-8" />,
                    title: 'הודעה על סיום עסקות',
                    desc: 'צריך להודיע למס הכנסה בתוך 30 ימים מיום הסגירה. אפשר לעשות את זה דרך אתר מס הכנסה או דרך משרד רואה חשבון.'
                  },
                  {
                    icon: <AlertCircle className="w-8 h-8" />,
                    title: 'פתרון חוקים וחובות',
                    desc: 'כל חוק מע״מ, חוק עובדים, או חוק אחר צריך להיות תוקן לפני הסגירה. מס הכנסה לא יסגור תיק עם חובות פתוחות.'
                  },
                  {
                    icon: <CheckCircle className="w-8 h-8" />,
                    title: 'סגירה מע״מ (אם רשום)',
                    desc: 'אם אתה רשום למע״מ - צריך להגיש דוח מע״מ אחרון ולסגור את התיק במע״מ לפני מס הכנסה.'
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-2xl p-8 border-r-4 border-[#1E3A5F] flex gap-6"
                  >
                    <div className="flex-shrink-0 text-[#1E3A5F]">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{item.desc}</p>
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
                מסמכים נפוצים שצריך להגיש
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                   { 
                     name: 'הודעה על סיום עסקות',
                     code: 'דרך אתר מס הכנסה או רואה חשבון',
                     details: 'תיאור: הודעה רשמית למס הכנסה על סיום העסקות.\nמתי: בתוך 30 ימים מיום הסגירה.\nאיך: ניתן להגיש דרך אתר מס הכנסה (בדיווח מקוון) או דרך רואה חשבון.'
                   },
                   { 
                     name: 'דוח שנתי סופי',
                     code: 'טו״ש - טופס דוח שנתי',
                     details: 'תיאור: מציג הכנסות, ניכויים, והרווח נטו עד לתאריך הסגירה בדיוק.\nמתי: לפני סגירה סופית.\nחשוב: רק הכנסות עד תאריך הסגירה.'
                   },
                  { 
                    name: 'דוח מע״מ סופי',
                    code: 'דוח מע״מ אחרון',
                    details: 'תיאור: אם רשום למע״מ - צריך להגיש דוח אחרון ולהשלים תשלום או לקבל החזר.\nמתי: בבו-זמנית עם סגירת מס הכנסה.\nנחוץ: רק אם רשום למע״מ.'
                  },
                  { 
                    name: 'אישור ביטוח לאומי',
                    code: 'דוח סיום עסקות',
                    details: 'תיאור: אישור שעוסקים בביטוח לאומי יסוגר.\nמתי: בו-זמנית עם מס הכנסה.\nחשוב: צריך לתקן כל חוק לפני הסגירה.'
                  }
                ].map((doc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-6 h-6 text-[#1E3A5F] flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-bold text-[#1E3A5F]">{doc.name}</h3>
                        <p className="text-sm text-gray-500 font-bold">{doc.code}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{doc.details}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-red-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                חובות ודיווחים פתוחים - מה קורה?
              </h2>

              <div className="space-y-6">
                {[
                  {
                    title: '❌ יש חוב מס כנסה',
                    consequence: 'מס הכנסה לא יסגור את התיק עד שתשלם או תוכנן. יכולים להיות קנסות וריבית שנצברו על החוב.'
                  },
                  {
                    title: '❌ דוח שנתי לא הוגש',
                    consequence: 'מס הכנסה יחזור אליך בעדכון ריבית וקנסות. זה יכול להיות יקר מאד ודורש טיפול דחוף.'
                  },
                  {
                    title: '❌ יש חוק מע״מ',
                    consequence: 'אם הרשמת למע״מ ויש חוק - צריך להשלים תשלום או תאום לפני סגירת מס הכנסה.'
                  },
                  {
                    title: '❌ חוק ביטוח לאומי',
                    consequence: 'מס הכנסה לא יסגור תיק עם חוק לביטוח לאומי. זה תנאי מוקדם לסגירה.'
                  },
                  {
                    title: '⚠️ בדיקה במהלך הסגירה',
                    consequence: 'אם מס הכנסה מצא שגיאות במהלך ההליך - זה יכול להוסיף חודשים לתהליך הסגירה.'
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl p-6 border-3 border-red-300 shadow-md"
                  >
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">→ {item.consequence}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 bg-orange-100 border-3 border-orange-400 rounded-xl p-6"
              >
                <div className="flex gap-3 items-start">
                  <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-orange-900 mb-2">💡 טיפ חשוב</h3>
                    <p className="text-orange-800 leading-relaxed">
                      אם אתה רואה שיש בעיות או חובות - כדאי להתמודד איתן בעצמך או דרך רואה חשבון לפני שתתחיל בתהליך הסגירה. זה יחסוך זמן וכסף.
                    </p>
                  </div>
                </div>
              </motion.div>
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
                רוצה לבדוק עם הרשויות הנוספות?
              </h2>
              <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
                סגירה מלאה זה יותר מאשר רק מס הכנסה. צריך גם ביטוח לאומי, מע״מ, והרשויות אחרות. <Link to={createPageUrl('CloseBusinessLanding')} className="text-[#2C5282] font-bold hover:underline">לחץ כאן לטיפול מלא מול כל הרשויות</Link>.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                צריך עזרה בסגירה?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                אנחנו מטפלים בכל התהליך - הודעות, דוחות, וביטול החשבון.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/972502277087?text=היי, אני צריך עזרה בסגירת עוסק במס הכנסה" target="_blank" rel="noopener noreferrer">
                  <Button className="h-14 px-8 text-lg font-black rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    דבר בווטסאפ
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button variant="outline" className="h-14 px-8 text-lg font-black rounded-xl border-2 border-white bg-white/10 text-white hover:bg-white/20">
                    <Phone className="ml-2 w-5 h-5" />
                    התקשר
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}