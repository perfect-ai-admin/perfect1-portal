import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import PageTracker from '../components/seo/PageTracker';
import RelatedContent from '../components/seo/RelatedContent';
import AggresiveLeadPopup from '../components/popups/AggresiveLeadPopup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { CheckCircle, AlertCircle, Phone, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function OsekPaturSteps() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone.trim() || !formData.name.trim()) {
      toast.error('נא למלא שם וטלפון');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await base44.functions.invoke('submitLeadToN8N', {
        name: formData.name,
        phone: formData.phone,
        email: '',
        message: formData.profession || 'לא ציין מקצוע',
        pageSlug: 'osek-patur-steps',
        businessName: 'Perfect One - Osek Patur'
      });

      if (response.data.success) {
        setFormData({ name: '', phone: '', profession: '' });
        // Navigate to thank you page
        navigate(createPageUrl('ThankYou'));
      } else {
        toast.error('שגיאה בשליחת הלידים: ' + (response.data.error || 'שגיאה לא ידועה'));
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('שגיאה בשליחה: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'בדיקה - האם עוסק פטור מתאים לך?',
      points: [
        'בדיקת הכנסה משוערת ותחום העיסוק',
        'הבנת הבדל בין עוסק פטור לעוסק מורשה וחברה בע״מ',
        'וידוא שאתה עומד בתנאי הסף של מס הכנסה'
      ],
      detail: 'למה זה חשוב: אם אתה לא זכאי, התהליך יעכב. אם אתה בחר בצורה לא נכונה, תיתקל בצרות מאוחר יותר.'
    },
    {
      number: 2,
      title: 'איסוף מסמכים ופתיחת תיק במס הכנסה',
      points: [
        'הכנת תיק עם מס הכנסה - בקשה לפתיחת עוסק פטור',
        'הגשת צהרה בסיסית וסיווג פעילות נכון',
        'בירור אם צריך להירשם למע״מ או פטור'
      ],
      detail: 'למה זה חשוב: מס הכנסה הוא השאובי הראשון. גם ביטוח לאומי מקבל את הנתונים דרכם.'
    },
    {
      number: 3,
      title: 'רישום בביטוח לאומי כעצמאי',
      points: [
        'רישום אוטומטי בביטוח לאומי - קורה כשמס הכנסה מעביר את הנתונים',
        'קבלת דרישות מקדמה לתשלום דמי ביטוח לאומי',
        'הבנת תשלום חודשי/רבעוני בהתאם להכנסה משוערת'
      ],
      detail: 'למה זה חשוב: עכימור חובות בביטוח לאומי גורם לבעיות בדוחות עתידיים ובזכויות אבטלה/מחלה.'
    },
    {
      number: 4,
      title: 'ניהול קבלות ודיווחים בסיסיים',
      points: [
        'הוצאת קבלות לכל עסקה (דרך מע״מ או קבלה פשוטה)',
        'תיעוד הוצאות בצורה מסודרת (מיסים, שכר דירה, חומרים)',
        'שמירה על כל המסמכים לפחות 3-4 שנים'
      ],
      detail: 'למה זה חשוב: ביתרון קבלות ועוד תיעוד גרוע יוביל לתביעות באודיט או סלילה של הכנסות.'
    },
    {
      number: 5,
      title: 'סיכום, בדיקות ופתיחה רשמית של העוסק',
      points: [
        'קבלת מספר ארגון רשמי מס הכנסה',
        'בדיקה שהכל בסדר מול ביטוח לאומי וביטחון הזכויות שלך',
        'התחלת פעילות מסודרת עם ניהול תקני של הכנסות והוצאות'
      ],
      detail: 'למה זה חשוב: סיום נכון של הפתיחה אומר שאתה תקני מול כל הרשויות ויכול לפעול בשקט.'
    }
  ];

  const commonMistakes = [
    'פתיחה חלקית בלי רישום מלא בכל הרשויות - רק בחלק מהמשרדים',
    'אי-סדר בקבלות והוצאות מלמ ן ההתחלה - גורם לבעיות בדוח שנתי',
    'דיווח מאוחר או לא מדויק בביטוח לאומי - מצטבר חובות',
    'ערבוב בין הכנסות אישיות לעסקיות - משחק שלם עם המס',
    'היעדר הבנה של חובות דיווח חודשי/רבעוני - מקצרים עם הרשויות'
  ];

  const faqs = [
    {
      question: 'איך פותחים עוסק פטור בישראל - בפועל?',
      answer: 'בתהליך של 5 שלבים: בדיקת זכאות, איסוף מסמכים, הגשה למס הכנסה, רישום בביטוח לאומי, וקבלת אישור. בדרך כלל 2-4 שבועות מהתחילה לסוף.'
    },
    {
      question: 'האם צריך לבצע את הפתיחה בעצמי או יכול להזמין עזרה?',
      answer: 'אתה יכול להזמין עזרה. אנחנו ב-Perfect One עוזרים בפתיחה בצורה מסודרת - גם רגילה וגם אונליין.'
    },
    {
      question: 'מה קורה אחרי שהעוסק נפתח?',
      answer: 'אתה מתחיל להוציא קבלות, תיעוד הוצאות, ודיווח חודשי לביטוח לאומי. בסוף השנה - דוח שנתי למס הכנסה.'
    },
    {
      question: 'כמה זמן יקח לפתיחה?',
      answer: 'בדרך כלל 2-4 שבועות. אם אתה עושה זאת דרך Perfect One, אנחנו דואגים שהתהליך יתקדם בהקדם.'
    },
    {
      question: 'מה ההבדל בין פתיחה רגילה לאונליין?',
      answer: 'בפתיחה רגילה אתה צריך להופיע במשרדי מס הכנסה. באונליין - הכל דיגיטלי, מהבית שלך.'
    },
    {
      question: 'איזה מסמכים אני צריך?',
      answer: 'תעודת זהות, כתובת משרד/עבודה, הוכחה על קשר לעסק, וממשלתי בהתאם לתחום (דיפלומות, רישיונות וכדומה).'
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/osek-patur-steps" pageType="guide" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - 5 שלבים לפתיחת עוסק פטור"
        description="מדריך מלא לפתיחת עוסק פטור בישראל ב-5 שלבים"
      />
      <SEOOptimized
        title="איך פותחים עוסק פטור – 5 שלבים | Perfect One"
        description="מדריך ברור לפתיחת עוסק פטור ב-5 שלבים מול הרשויות. כל השלבים במקום אחד + טעויות נפוצות + אפשרות לפתיחה אונליין."
        keywords="איך פותחים עוסק פטור, פתיחת עוסק פטור, איך פותחים עסק עצמאי, איך פותחים עסק, שלבים לפתיחת עסק עצמאי, איך פותחים עוסק פטור בישראל, מדריך לפתיחת עסק עצמאי, מה צריך כדי לפתוח עסק עצמאי"
        canonical="https://perfect1.co.il/osek-patur-steps"
      />

      <main className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'עוסק פטור', url: 'OsekPaturLanding' },
            { label: 'פתיחת עוסק פטור – שלבים' }
          ]} />
        </div>

        {/* Hero */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-[#1E3A5F] mb-6">
              פתיחת עוסק פטור – 5 שלבים לפתיחה נכונה בישראל
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-8">
              כך פותחים עוסק פטור בצורה מסודרת מול מס הכנסה, מע״מ וביטוח לאומי
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
              כל שלב מוסבר בברור. אם אתה רוצה שנטפל בזה בעבורך, אתה יכול גם לבחור בתהליך של <Link to={createPageUrl('OsekPaturOnlineLanding')} className="text-blue-600 font-bold hover:text-blue-800 underline">פתיחת עוסק פטור אונליין</Link> שנעשה כלו דיגיטלי.
            </p>
          </div>
        </section>

        {/* 5 Steps */}
        <section id="steps" className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 border-l-4 border-blue-600 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 text-white font-black text-xl">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">{step.title}</h3>
                      <ul className="space-y-2 mb-4">
                        {step.points.map((point, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-600 italic border-t pt-4">
                        💡 {step.detail}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Lead Form */}
         <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
           <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border-2 border-blue-200"
             >
               <h2 className="text-3xl font-black text-[#1E3A5F] text-center mb-2">
                 רוצה שנפתח עבורך את העוסק הפטור?
               </h2>
               <p className="text-gray-700 text-center mb-8">
                 אם חשוב לך לעשות את זה מסודר ולחסוך זמן, השאר פרטים ונחזור אליך עם הכוונה מלאה
               </p>
               <form onSubmit={handleSubmit} className="space-y-3">
                 <Input
                   placeholder="שם מלא"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   className="h-12 rounded-xl border-2"
                   required
                 />
                 <Input
                   type="tel"
                   placeholder="טלפון"
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
                   className="w-full h-11 sm:h-12 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50"
                 >
                   {isSubmitting ? (
                     <>
                       <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />
                       שולח...
                     </>
                   ) : (
                     'בדיקה מסודרת'
                   )}
                 </Button>
               </form>
               <p className="text-xs text-gray-500 text-center mt-4">
                 נחזור אליך תוך 24 שעות • ללא התחייבות
               </p>
             </motion.div>
           </div>
         </section>

        {/* טעויות נפוצות */}
        <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-black text-[#1E3A5F] mb-4">
                טעויות נפוצות בפתיחת עוסק פטור
              </h2>
              <p className="text-gray-700">
                ואיך להימנע מהן
              </p>
            </motion.div>

            <div className="space-y-4">
              {commonMistakes.map((mistake, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-6 border-r-4 border-red-500 shadow-sm hover:shadow-md transition-all flex gap-4"
                >
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{mistake}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-black text-[#1E3A5F] mb-2">
                שאלות נפוצות על פתיחת עוסק פטור
              </h2>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden px-6 hover:border-blue-400 transition-all"
                >
                  <AccordionTrigger className="text-right hover:no-underline py-4">
                    <h3 className="text-lg font-bold text-[#1E3A5F]">{faq.question}</h3>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Online CTA */}
        <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-l-4 border-green-600"
            >
              <h2 className="text-3xl font-black text-[#1E3A5F] mb-4">
                מצב כל זה מילא בעוד שבוע?
              </h2>
              <p className="text-gray-700 mb-6">
                אפשר גם לבצע <Link to={createPageUrl('OsekPaturOnlineLanding')} className="text-green-600 font-bold hover:text-green-800 underline">פתיחת עוסק פטור אונליין</Link> בתהליך סדור ודיגיטלי לחלוטין - בלי ללכת למשרדים, בלי טלטול.
              </p>
              <Link to={createPageUrl('OsekPaturOnlineLanding')}>
                <Button className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  אונליין
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-white border-t">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-black text-[#1E3A5F] mb-4">
              השאלה סיביות? ניתן לתקשר ישירות
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer">
                <Button className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                  <MessageCircle className="ml-2 w-4 h-4" />
                  WhatsApp
                </Button>
              </a>
              <a href="tel:+972502277087">
                <Button className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                  <Phone className="ml-2 w-4 h-4" />
                  התקשר
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Related */}
        <RelatedContent pageType="guide" />
      </main>
    </>
  );
}