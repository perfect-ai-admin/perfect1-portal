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
import { CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import UnifiedLeadForm from '../components/forms/UnifiedLeadForm';

export default function OsekPaturSteps() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
          // Set default values from user profile
          setFormData(prev => ({
            ...prev,
            phone: currentUser.phone || prev.phone,
            email: currentUser.email || prev.email
          }));
        }
      } catch (err) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage >= 75 && !showPopup) {
        setShowPopup(true);
      }
      if (scrollPercentage >= 35 && !showStickyCta) {
        setShowStickyCta(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showPopup, showStickyCta]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('נא למלא שם וטלפון');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await base44.functions.invoke('submitLeadToN8N', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: 'בקשה לפתיחת עוסק פטור',
        pageSlug: 'osek-patur-steps',
        businessName: 'Perfect One - Osek Patur'
      });

      if (response.data.success) {
        setFormData({ name: '', phone: '', email: '' });
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
      <AggresiveLeadPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />
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

      <main className="bg-white pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'עוסק פטור', url: 'OsekPaturLanding' },
            { label: 'פתיחת עוסק פטור – שלבים' }
          ]} />
        </div>

        {/* Hero */}
        <section className="py-10 md:py-16 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-[#1E3A5F] mb-4 md:mb-6 leading-tight">
              פתיחת עוסק פטור – 5 שלבים
            </h1>
            <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-700 mb-4 md:mb-8">
              כך פותחים עוסק פטור בצורה מסודרת מול הרשויות
            </h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto mb-5 md:mb-6">
              מדריך מלא עם כל מה שצריך לדעת. קרא, תבין, ואם תרצה - נעשה הכל בשבילך.
            </p>
            <Button 
              onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-12 md:h-14 px-6 md:px-10 text-base md:text-lg bg-[#D4AF37] hover:bg-[#c9a430] text-[#1E3A5F] font-black rounded-xl shadow-lg w-full sm:w-auto"
            >
              רוצה שנפתח לך עוסק פטור? →
            </Button>
          </div>
        </section>

        {/* 5 Steps */}
        <section id="steps" className="py-10 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-5 md:space-y-8">
              {steps.map((step, i) => (
                <React.Fragment key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl md:rounded-3xl p-5 md:p-8 border-r-4 md:border-l-4 md:border-r-0 border-blue-600 shadow-md"
                  >
                    <div className="flex items-start gap-3 md:gap-6">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-blue-600 text-white font-black text-base md:text-xl">
                          {step.number}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-2xl font-bold text-[#1E3A5F] mb-2 md:mb-4">{step.title}</h3>
                        <ul className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                          {step.points.map((point, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm md:text-base text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs md:text-sm text-gray-600 italic border-t pt-3">
                          💡 {step.detail}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Mini CTA after step 3 */}
                  {i === 2 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] rounded-2xl md:rounded-3xl p-5 md:p-8 text-center text-white shadow-xl"
                    >
                      <p className="text-lg md:text-xl font-bold mb-1 md:mb-2">נשמע מורכב? 🤔</p>
                      <p className="text-blue-100 mb-4 md:mb-5 text-sm md:text-base">אנחנו עושים הכל בשבילך</p>
                      <Button 
                        onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                        className="h-11 md:h-12 px-6 md:px-8 bg-[#D4AF37] hover:bg-[#c9a430] text-[#1E3A5F] font-black rounded-xl text-sm md:text-base w-full sm:w-auto"
                      >
                        פתיחת עוסק פטור בקליק →
                      </Button>
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Lead Form */}
         <section id="lead-form" className="py-10 md:py-16 bg-gradient-to-br from-blue-50 to-white">
           <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-5 md:p-12 border-2 border-blue-200"
             >
               <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F] text-center mb-1 md:mb-2">
                 רוצה שנפתח עבורך את העוסק?
               </h2>
               <p className="text-sm md:text-base text-gray-700 text-center mb-5 md:mb-8">
                 השאר פרטים ונחזור אליך עם הכוונה מלאה
               </p>
               <form onSubmit={handleSubmit} className="space-y-3">
                 <Input
                   placeholder="שם מלא *"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   className="h-12 rounded-xl border-2 text-base"
                   required
                 />
                 <Input
                   type="tel"
                   placeholder="טלפון *"
                   value={formData.phone}
                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                   className="h-12 rounded-xl border-2 text-base"
                   required
                 />
                 <Input
                   type="email"
                   placeholder="מייל (לא חובה)"
                   value={formData.email}
                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                   className="h-12 rounded-xl border-2 text-base"
                 />
                 <Button
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full h-13 text-base bg-[#D4AF37] hover:bg-[#c9a430] text-[#1E3A5F] font-black rounded-xl disabled:opacity-50 shadow-lg"
                 >
                   {isSubmitting ? (
                     <>
                       <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />
                       שולח...
                     </>
                   ) : (
                     '🚀 פתיחת עוסק פטור - התחל עכשיו'
                   )}
                 </Button>
               </form>
               <p className="text-xs text-gray-500 text-center mt-3">
                 ✓ ללא התחייבות • ✓ נחזור תוך שעות
               </p>
             </motion.div>
           </div>
         </section>

        {/* טעויות נפוצות */}
        <section className="py-10 md:py-20 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6 md:mb-12"
            >
              <h2 className="text-2xl md:text-4xl font-black text-[#1E3A5F] mb-2">
                ⚠️ טעויות נפוצות
              </h2>
              <p className="text-sm md:text-base text-gray-700">
                שאתה חייב להימנע מהן
              </p>
            </motion.div>

            <div className="space-y-3 md:space-y-4">
              {commonMistakes.map((mistake, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-r-4 border-red-500 shadow-sm flex gap-3"
                >
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700">{mistake}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA after mistakes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 md:mt-10 bg-white rounded-2xl p-5 md:p-8 text-center shadow-lg border-2 border-orange-200"
            >
              <p className="text-xl md:text-2xl font-black text-[#1E3A5F] mb-1 md:mb-2">לא רוצה טעויות? 🎯</p>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-5">תן לנו לטפל - בלי כאבי ראש</p>
              <Button 
                onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-11 md:h-12 px-6 md:px-8 bg-[#D4AF37] hover:bg-[#c9a430] text-[#1E3A5F] font-black rounded-xl text-sm md:text-base w-full sm:w-auto"
              >
                פתיחת עוסק פטור ללא טעויות →
              </Button>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-10 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-6 md:mb-12"
            >
              <h2 className="text-2xl md:text-4xl font-black text-[#1E3A5F] mb-2">
                שאלות נפוצות
              </h2>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden px-4 md:px-6 hover:border-blue-400 transition-all"
                >
                  <AccordionTrigger className="text-right hover:no-underline py-3 md:py-4">
                    <h3 className="text-base md:text-lg font-bold text-[#1E3A5F]">{faq.question}</h3>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-gray-700 pb-3 md:pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* CTA after FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 md:mt-10 text-center bg-blue-50 rounded-2xl p-5 md:p-8 border-2 border-blue-200"
            >
              <p className="text-base md:text-lg font-bold text-[#1E3A5F] mb-1 md:mb-2">עדיין יש שאלות?</p>
              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">השאר פרטים ונסביר לך הכל</p>
              <Button 
                onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-11 md:h-12 px-6 md:px-8 bg-[#1E3A5F] hover:bg-[#2C5282] text-white font-bold rounded-xl w-full sm:w-auto"
              >
                שיחת ייעוץ חינם →
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Post-FAQ CTA with inline form */}
        <section className="py-10 md:py-16 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3">
              מוכן לפתוח עוסק פטור?
            </h2>
            <p className="text-blue-100 mb-5 md:mb-8 text-sm md:text-lg">
              שם + טלפון - ונסדר הכל
            </p>
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
              <UnifiedLeadForm
                variant="inline"
                title=""
                subtitle=""
                ctaText="פתיחת עוסק פטור בקליק"
                fields={["name", "phone"]}
                sourcePage="OsekPaturSteps-bottom"
                onSuccess={() => {
                  window.location.href = '/ThankYou';
                }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-4 md:mt-6 text-blue-200 text-xs md:text-sm">
              <span>✓ ללא התחייבות</span>
              <span>✓ תשובה תוך שעות</span>
              <span>✓ שירות אישי</span>
            </div>
          </div>
        </section>

        {/* Sticky Mobile CTA - appears after 35% scroll */}
        {showStickyCta && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t-2 border-[#D4AF37] shadow-[0_-4px_12px_rgba(0,0,0,0.15)] p-3 safe-area-pb"
          >
            <Button 
              onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full h-12 bg-[#D4AF37] hover:bg-[#c9a430] text-[#1E3A5F] font-black rounded-xl text-base shadow-lg"
            >
              🚀 פתיחת עוסק פטור - השאר פרטים
            </Button>
          </motion.div>
        )}

        {/* Related */}
        <RelatedContent pageType="guide" />
      </main>


    </>
  );
}