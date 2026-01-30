import React, { useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  CheckCircle, AlertCircle, Phone, MessageCircle, 
  FileText, DollarSign, Shield, AlertTriangle, HelpCircle, Clock, Building2
} from 'lucide-react';
import SEOOptimized from './SEOOptimized';
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import RelatedContent from '../components/seo/RelatedContent';
import PageTracker from '../components/seo/PageTracker';
import ScrollCTAHandler from '../components/cro/ScrollCTAHandler';
import SafeCtaBar from '../components/cro/SafeCtaBar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CloseOsekPaturComprehensive() {
  const [showLeadForm, setShowLeadForm] = useState(false);

  const faqs = [
    {
      question: "כמה זמן לוקח תהליך הסגירה?",
      answer: "בדרך כלל 2-4 שבועות. תלוי בהיקף העסק וכמה מהר משיבות הרשויות."
    },
    {
      question: "צריך רואה חשבון לסגור עוסק?",
      answer: "לא חובה, אבל זה מעט מסובך. אם עשית דוח שנתי בשנה האחרונה - עדיף שרואה חשבון יגיש את הסגירה."
    },
    {
      question: "מה קורה אם לא אסגור נכון?",
      answer: "יכול שתישאר חובות עם הרשויות, קנסות, וריבית. גם לא תוכל להתחיל עוסק חדש בקלות."
    },
    {
      question: "צריך להחזיר כסף לעוסק אם יש עודף?",
      answer: "אם יש עודף חיובי - כן, אתה יכול לקבל החזר. זה תלוי בבדיקת הרשויות."
    },
    {
      question: "אפשר לסגור עוסק וגם להתחיל חדש בו-זמנית?",
      answer: "כן, אפשר. אבל עדיף להפריד בשנים או לפחות לא בחודש זהה."
    },
    {
      question: "מה עם חוב שלי עוסק - מי משלם אותו?",
      answer: "אתה או מי שלקח את החוב בשמך. סגירת העוסק לא מבטלת חובות אישיים."
    }
  ];

  const authorities = [
    {
      name: 'מס הכנסה',
      icon: '📋',
      tasks: ['הגשת דוח שנתי אחרון', 'סיום רישום כעוסק', 'הערכה סופית אם צריך'],
      timeline: '1-2 שבועות'
    },
    {
      name: 'מע״מ (מע״מ)',
      icon: '💰',
      tasks: ['דוח מע״מ אחרון', 'סגירת תיק מע״מ', 'החזר יתרה אם יש'],
      timeline: '1-3 שבועות'
    },
    {
      name: 'ביטוח לאומי',
      icon: '🛡️',
      tasks: ['הודעה על סיום עוסקות', 'תשלום חוקים בכל חודש עבודה', 'סיום רישום'],
      timeline: '2-3 שבועות'
    }
  ];

  return (
    <>
      <ScrollCTAHandler />
      <PageTracker pageUrl="/close-osek-patur" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - סגירת עוסק פטור"
        description="מדריך מלא לסגירת עוסק פטור בישראל - שלבים, רשויות, טעויות להימנע"
      />
      <SEOOptimized
        title="סגירת עוסק פטור – שלבים, רשויות וטעויות להימנע"
        description="מדריך מלא לסגירת עוסק פטור: מתי לסגור, אילו רשויות, טעויות נפוצות, ומה קורה אם לא סוגרים נכון."
        keywords="סגירת עוסק פטור, איך סוגרים עוסק, סגירה ממס הכנסה, סגירה מביטוח לאומי, דוח שנתי סופי"
        canonical="https://perfect1.co.il/close-osek-patur"
      />

      <main className="bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'שירותים', url: 'Services' },
            { label: 'סגירת עוסק פטור' }
          ]} />
        </div>

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 border border-red-500/30">
                <AlertCircle className="w-5 h-5 text-red-300" />
                <span className="text-red-200 text-base font-bold">תהליך שידרוש קצת קפדנות</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-8">
                סגירת עוסק פטור – מדריך מלא
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                סגירת עוסק פטור כוללת טיפול במספר רשויות במקביל. מדריך זה יעזור לך להבין בדיוק מה צריך לעשות ומאילו טעויות להימנע.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/972502277087?text=היי, אני צריך לסגור את העוסק שלי" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg transition-all">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    ייעוץ חינם בווצאפ
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* מתי לסגור */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                מתי צריך לסגור עוסק פטור?
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: '📍', title: 'סיום פעילות', desc: 'החלטת לסגור את העסק לצמיתות' },
                  { icon: '📈', title: 'מעבר למורשה', desc: 'החלטת להתקדם לעוסק מורשה' },
                  { icon: '🏢', title: 'מעבר לחברה', desc: 'הקמת חברה וסגירת העוסק הפרטי' },
                  { icon: '⏸️', title: 'הפסקה זמנית', desc: 'לא תפעל לתקופה - עדיף לסגור' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gradient-to-br from-white to-blue-50/40 rounded-2xl p-6 border-r-4 border-[#1E3A5F] hover:shadow-lg transition-all"
                  >
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* הרשויות */}
        <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                אילו רשויות מעורבות בסגירה?
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {authorities.map((auth, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-[#1E3A5F] hover:shadow-xl transition-all"
                  >
                    <div className="text-5xl mb-4">{auth.icon}</div>
                    <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">{auth.name}</h3>
                    
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-600 mb-3 uppercase">משימות:</p>
                      <ul className="space-y-2">
                        {auth.tasks.map((task, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#1E3A5F]/10 rounded-lg p-3">
                      <p className="text-sm font-bold text-[#1E3A5F]">⏱️ {auth.timeline}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section - Close Business */}
        <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
           >
             <h3 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-4">
               צריך לסגור את התיק במהירות?
             </h3>
             <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
               אנחנו נטפל בכל פרטי הסגירה במהירות - פשוט תתן לנו את הפרטים שלך
             </p>
             <a href="https://wa.me/972502277087?text=היי, אני צריך לסגור את העוסק שלי" target="_blank" rel="noopener noreferrer">
               <Button className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg">
                 <MessageCircle className="ml-2 w-5 h-5" />
                 סגירת תיק בווצאפ
               </Button>
             </a>
           </motion.div>
         </div>
        </section>

        {/* שלבי הסגירה */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                שלבי הסגירה השלב-שלב
              </h2>

              <div className="space-y-6">
                {[
                   {
                     step: 1,
                     title: 'בדיקת חובות לרשויות',
                     desc: 'בדוק אם יש חובות בגין מס הכנסה, מע״מ או ביטוח לאומי. מטרתך היא לגבי כמה אתה חייב לפני סגירה.'
                   },
                   {
                     step: 2,
                     title: 'הגשת דוח שנתי סופי',
                     desc: 'אם לא הגשת דוח לשנה האחרונה של פעילות - זה חובה. הוא חייב להגיע ל-מס הכנסה לפני סגירה רשמית.'
                   },
                   {
                     step: 3,
                     title: 'הודעה למס הכנסה על סגירה',
                     desc: 'מלא טופס סגירת עוסק (טופס 101) ושלח למס הכנסה. זה יכול להיעשות אונליין דרך אתר מס הכנסה או בתיקייה בעצמך.'
                   },
                   {
                     step: 4,
                     title: 'סגירה של מע״מ (אם הרשמת)',
                     desc: 'אם הרשמת את העוסק למע״מ - צריך לסגור את החשבון שם. הגש דוח מע״מ אחרון וביקש להחזר יתרה אם יש.'
                   },
                   {
                     step: 5,
                     title: 'סגירה של ביטוח לאומי',
                     desc: 'הודעה על סיום עסקות לביטוח לאומי (טופס 101). תשלום כל התשלומים החובה עד לחודש הסגירה.'
                   },
                   {
                     step: 6,
                     title: 'קבלת אישורי סגירה',
                     desc: 'כשכל הרשויות סגרו את הקבצים שלך - תקבל אישורים סופיים. אתה יכול להיות בטוח שהסגירה הושלמה כחוק.'
                   }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 pb-6 border-b-2 border-gray-200 last:border-b-0"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#1E3A5F] text-white font-black text-xl">
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* טעויות נפוצות */}
        <section className="py-16 bg-red-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                טעויות נפוצות בסגירה
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: AlertTriangle,
                    title: 'לא הגשת דוח שנתי אחרון',
                    desc: 'הרוב שוכחים את זה. אתה חייב להגיש דוח שנתי עד שהעוסק סגור סופית.'
                  },
                  {
                    icon: AlertCircle,
                    title: 'פתיחת עוסק חדש בלי לסגור את הישן',
                    desc: 'אם תפתח עוסק חדש בלי לסגור את הישן - תיתקל בבעיות עם מס הכנסה וביטוח לאומי.'
                  },
                  {
                    icon: Clock,
                    title: 'אי-שמירת תעדוך',
                    desc: 'שמור את כל ההודעות והאישורים מהרשויות. זה עשוי להיות חשוב אם תצטרך להוכיח את הסגירה בעתיד.'
                  },
                  {
                    icon: FileText,
                    title: 'אי-תשלום חובות בעת הסגירה',
                    desc: 'אם יש לך חובות לביטוח לאומי או מס הכנסה - תשלם קנסות וריבית אם לא תשלם בעת הסגירה.'
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-red-500"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                        <p className="text-gray-700">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* מה קורה אם לא סוגרים נכון */}
         <section className="py-16 bg-white">
           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
               <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                 מה קורה אם לא סוגרים נכון?
               </h2>

               <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-300 mb-8">
                 <p className="text-lg text-gray-800 leading-relaxed mb-6">
                   סגירה לא תקינה של עוסק יכולה להיות בעיה משמעותית שתעקוב אחריך במשך שנים:
                 </p>

                 <ul className="space-y-4">
                   {[
                     '💰 חוקים וריבית על חובות שלא שולמו לרשויות',
                     '📊 קנסות על כל חודש שהעוסק "פעל" אחרי שהיה צריך להיסגור',
                     '🚫 כשתרצה לפתוח עוסק חדש - תתקל בחסימות ודרישות מס הכנסה',
                     '⚖️ בעיות משפטיות אם תתגלה תעסוקה לא רשומה לאחר הסגירה',
                     '🔔 התראות ותביעות מביטוח לאומי ומס הכנסה'
                   ].map((item, i) => (
                     <li key={i} className="flex items-start gap-3">
                       <span className="text-xl flex-shrink-0">{item.split(' ')[0]}</span>
                       <span className="text-gray-800 font-medium">{item.split(' ').slice(1).join(' ')}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               {/* CTA */}
               <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-300 text-center">
                 <h3 className="text-2xl font-black text-[#1E3A5F] mb-3">
                    רוצים לסגור עוסק פטור במהירות?
                 </h3>
                 <a href="https://wa.me/972502277087?text=היי, אני צריך לסגור את העוסק שלי" target="_blank" rel="noopener noreferrer">
                   <Button 
                     className="h-14 px-8 text-lg font-black rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
                   >
                     <MessageCircle className="ml-2 w-5 h-5" />
                     סגירת תיק בווצאפ
                   </Button>
                 </a>
               </div>
             </motion.div>
           </div>
         </section>

        {/* FAQ */}
        <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
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
            </motion.div>
          </div>
        </section>

        {/* Contact */}
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
                אנחנו מטפלים בכל הפרטים - אתה רק תצטרך לחתום על מסמכים.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
               <a href="https://wa.me/972502277087?text=היי, אני צריך לסגור את העוסק שלי" target="_blank" rel="noopener noreferrer">
                 <Button className="w-full sm:w-auto h-12 sm:h-14 lg:h-16 px-6 sm:px-10 lg:px-12 text-base sm:text-lg lg:text-xl font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg">
                   <MessageCircle className="ml-2 w-5 h-5" />
                   בדיקה חינמית – בווצאפ
                 </Button>
               </a>
               <a href="tel:0502277087">
                 <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 lg:h-16 px-6 sm:px-10 lg:px-12 text-base sm:text-lg lg:text-xl font-bold rounded-xl border-2 border-white bg-white/10 text-white hover:bg-white hover:text-[#1E3A5F] transition-all">
                   <Phone className="ml-2 w-5 h-5" />
                   התקשר
                 </Button>
               </a>
              </div>
              <p className="text-white/60 mt-6">בלי התחייבות • שיחה קצרה • הסבר מלא</p>
            </motion.div>
          </div>
        </section>

        {/* Related Content */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-[#F8F9FA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
              תוכן קשור שעשוי לעניין אותך
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to={createPageUrl('HowToCloseOsekPatur')} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all h-full border-r-4 border-[#1E3A5F]">
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3 group-hover:text-[#2C5282] transition-colors">
                    איך סוגרים עוסק פטור?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    מדריך שלב-שלב מלא לסגירת עוסק פטור עם כל הפרטים החשובים
                  </p>
                </div>
              </Link>
              <Link to={createPageUrl('CloseOsekPaturTaxAuthority')} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all h-full border-r-4 border-[#1E3A5F]">
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3 group-hover:text-[#2C5282] transition-colors">
                    סגירה ממס הכנסה
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    איך לסגור את עוסקך מול מס הכנסה בצורה תקינה
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Safe CTA Bar - Google Compliant */}
        <SafeCtaBar 
          title="בדיקת מצב וסגירת תיק"
          subtitle="שם + טלפון בלבד"
          sourcePage="CloseOsekPaturComprehensive - SafeCtaBar"
        />

        {/* Lead Form Modal */}
        {showLeadForm && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center" onClick={() => setShowLeadForm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-11/12 sm:w-96 pointer-events-auto p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-black text-[#1E3A5F]">סגירת עוסק פטור</h3>
                  <button
                    onClick={() => setShowLeadForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = e.target.name.value;
                    const phone = e.target.phone.value;
                    window.location.href = `https://wa.me/972502277087?text=שלום, שמי ${name} ומספר הטלפון שלי ${phone}. אני רוצה לסגור את העוסק שלי.`;
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">שם מלא</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="הכנס שמך"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#1E3A5F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">מספר טלפון</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="05X-XXXXXXX"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#1E3A5F] focus:outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-[#25D366] hover:bg-[#20b858] text-white font-bold rounded-xl mt-6 px-4 py-3 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm whitespace-nowrap">
                      ייעוץ חינם בווצאפ
                    </span>
                  </Button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  אנחנו נחזור אליך תוך מספר שעות
                </p>
              </div>
            </motion.div>
          </>
        )}
        </main>
        </>
        );
        }