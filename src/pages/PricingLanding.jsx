import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertTriangle, TrendingUp, Clock, Shield, DollarSign, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import PageTracker from '../components/seo/PageTracker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function PricingLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'כמה עולה לפתוח עוסק פטור',
        status: 'new'
      });
      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('pricing-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      question: "כמה עולה לפתוח עוסק פטור בשנת 2026?",
      answer: "העלות משתנה לפי הדרך שבה אתה פותח: באופן עצמאי - אין עלות ישירה, דרך רואה חשבון - בין 500-1,500 ₪ בממוצע, ודרך שירות אונליין - מחיר קבוע של 199 ₪. כל אפשרות כוללת יתרונות וחסרונות שונים."
    },
    {
      question: "האם פתיחת עוסק פטור אונליין זולה יותר?",
      answer: "כן, פתיחה אונליין היא בדרך כלל חסכונית יותר מרואה חשבון מסורתי. המחיר הקבוע של 199 ₪ כולל את כל הטיפול מול הרשויות, ללא עלויות נוספות או הפתעות."
    },
    {
      question: "האם אפשר לפתוח עוסק פטור לבד?",
      answer: "כן, אפשר לפתוח לבד דרך אתרי הרשויות ללא עלות ישירה. אבל חשוב לדעת שטעויות בתהליך עלולות לעלות לך יקר בהמשך - בחירת סיווג שגוי, תיאום מס לא נכון, או הצהרות מוטעות יכולים להסתבך."
    },
    {
      question: "מה שונה בין פתיחה אונליין לפתיחה דרך רואה חשבון?",
      answer: "פתיחה אונליין היא בדרך כלל מהירה יותר, זולה יותר, ונעשית כולה דיגיטלית ללא פגישות. רואה חשבון מציע ליווי אישי ופגישה פנים אל פנים, אבל במחיר גבוה יותר. שני המסלולים מטפלים במלוא התהליך מול הרשויות."
    },
    {
      question: "האם יש עלויות נוספות אחרי פתיחת עוסק פטור?",
      answer: "אין עלויות חובה לרשויות, אבל יש להתחשב בליווי חודשי והגשת דוח שנתי. אם אתה עובד עם רואה חשבון או שירות ליווי, יהיו תשלומים חודשיים בהתאם לחבילה שבחרת."
    },
    {
      question: "כמה זמן לוקח לפתוח עוסק פטור?",
      answer: "התהליך עצמו לוקח בין 24-72 שעות בממוצע, תלוי בדרך הפתיחה. פתיחה אונליין היא בדרך כלל המהירה ביותר - תוך יום עבודה אחד. פתיחה עצמאית יכולה לקחת זמן רב יותר בגלל צורך בהבנת המערכות השונות."
    },
    {
      question: "האם פתיחת עוסק פטור אונליין כוללת טיפול מול מס הכנסה ומע״מ?",
      answer: "כן, פתיחה אונליין כוללת טיפול מלא מול כל הרשויות: מס הכנסה, מע״מ (רישום כפטור), וביטוח לאומי. הכל נעשה עבורך ללא צורך לרוץ בין משרדים או למלא טפסים מסובכים."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/pricing-landing" pageType="landing" />
      <SEOOptimized
        title="כמה עולה לפתוח עוסק פטור? פירוט מחירים ואפשרויות פתיחה 2026"
        description="השוואת עלויות פתיחת עוסק פטור: לבד, דרך רואה חשבון, או אונליין ב-199 ₪. מידע מלא ללא התחייבות."
        keywords="כמה עולה לפתוח עוסק פטור, עלות פתיחת עוסק פטור, מחיר פתיחת עוסק פטור, פתיחת עוסק פטור אונליין מחיר, עוסק פטור אונליין"
        canonical="https://perfect1.co.il/pricing-landing"
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }}
      />
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: '/' },
            { label: 'כמה עולה לפתוח עוסק פטור' }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-5xl font-black text-[#1E3A5F] mb-6 leading-tight">
                כמה עולה לפתוח עוסק פטור? פירוט מחירים ואפשרויות פתיחה
              </h1>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                אם אתה שואל את עצמך כמה עולה לפתוח עוסק פטור, הגעת למקום הנכון. 
                בעמוד הזה נסביר לך בדיוק מה העלויות האמיתיות, מה כלול בכל אפשרות, 
                ונעזור לך להבין מה הכי מתאים לך.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Option 1: לבד */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-4xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור לבד
              </h2>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">העלות: 0 ₪ (ללא עלות ישירה)</h3>
                    <p className="text-gray-700 leading-relaxed">
                      פתיחת עוסק פטור באופן עצמאי היא חינמית לחלוטין. אתה יכול להיכנס לאתרי הרשויות 
                      (מס הכנסה, מע״מ, ביטוח לאומי), למלא את הטפסים ולפתוח את התיק בעצמך.
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 border-r-4 border-red-500 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">טעויות נפוצות שעלולות לעלות לך יקר:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span><strong>בחירת סיווג שגוי</strong> - קוד עיסוק לא נכון יכול להשפיע על שיעור המס שלך</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span><strong>תיאום מס לא נכון</strong> - יכול לגרום לתשלום יותר מדי או פחות מדי במקדמות</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span><strong>הצהרות שגויות</strong> - טעויות בטפסים יכולות להסתבך אותך עם הרשויות בהמשך</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 font-bold">•</span>
                          <span><strong>אי הבנת ההשלכות</strong> - בחירות שאתה עושה היום משפיעות על המיסוי שלך לשנים</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  <strong>חשוב לדעת:</strong> אמנם אין עלות כספית ישירה, אבל טעויות בתהליך יכולות לעלות לך 
                  הרבה יותר בהמשך. אם אתה לא בטוח במה שאתה עושה, כדאי לשקול ליווי מקצועי.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Option 2: רואה חשבון */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-4xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור דרך רואה חשבון
              </h2>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-2 border-gray-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">טווח מחירים: 500-1,500 ₪ בממוצע</h3>
                    <p className="text-gray-700 leading-relaxed">
                      המחיר משתנה בהתאם למשרד, למיקום הגיאוגרפי, ולרמת השירות. יש רואי חשבון שמציעים 
                      פתיחה במחיר נמוך כחלק מחבילת ליווי שנתית, ויש כאלה שגובים מחיר נפרד.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      מה כלול בדרך כלל:
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• פתיחת תיק במס הכנסה</li>
                      <li>• רישום כפטור במע״מ</li>
                      <li>• פתיחת תיק בביטוח לאומי</li>
                      <li>• ייעוץ ראשוני</li>
                      <li>• הסבר על חובות דיווח</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-gray-600" />
                      מה בדרך כלל לא כלול:
                    </h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• ליווי חודשי (תוסף נפרד)</li>
                      <li>• הגשת דוחות (תוסף נפרד)</li>
                      <li>• תמיכה שוטפת (תוסף נפרד)</li>
                      <li>• שירותים נוספים (תוסף נפרד)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border-r-4 border-blue-500 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-3">מתי זה משתלם?</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>אם אתה צריך ייעוץ אישי ופגישה פנים אל פנים</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>אם המצב שלך מורכב (מספר מקורות הכנסה, שותפים, וכו')</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>אם אתה מעדיף קשר אישי עם בן אדם שמכיר אותך</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Option 3: אונליין */}
        <section className="py-12 bg-gradient-to-br from-[#E8F4FD] to-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-4xl font-bold text-[#1E3A5F] mb-6">
                כמה עולה לפתוח עוסק פטור אונליין
              </h2>
              
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#27AE60]">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-[#27AE60]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">מחיר קבוע: 199 ₪ (תשלום חד-פעמי)</h3>
                    <p className="text-gray-700 leading-relaxed">
                      למי שמעדיף לעשות הכל דיגיטלי וללא פגישות, קיימת אפשרות לפתוח עוסק פטור אונליין 
                      במחיר קבוע של 199 ₪. זה מחיר שקוף וידוע מראש, ללא תוספות או הפתעות.
                    </p>
                  </div>
                </div>

                <div className="bg-[#27AE60]/5 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-800 mb-3">מה כלול במחיר:</h4>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {[
                      'פתיחת תיק עוסק פטור במלואו',
                      'טיפול מול מס הכנסה',
                      'רישום במע״מ כפטור',
                      'פתיחת תיק בביטוח לאומי',
                      'הדרכה מלאה על השלבים הבאים',
                      'תמיכה במהלך התהליך'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border-r-4 border-blue-500 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-800 mb-3">למה זה נוח?</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>מהיר:</strong> התהליך נעשה תוך 24-48 שעות</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>בטוח:</strong> הכל נעשה נכון, מקצועי ומאובטח</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>חסכוני:</strong> מחיר נמוך משמעותית מרואה חשבון</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>פשוט:</strong> ללא צורך בפגישות או ריצות</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-700 text-center">
                  אם אתה מחפש דרך פשוטה, מהירה וחסכונית לפתוח עוסק פטור, אפשר גם{' '}
                  <Link 
                    to={createPageUrl('OsekPaturOnlineLanding')}
                    className="text-[#1E3A5F] underline font-bold hover:text-[#2C5282]"
                  >
                    לפתוח עוסק פטור אונליין
                  </Link>
                  {' '}בצורה דיגיטלית מלאה.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Soft CTA */}
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-4">
                עדיין לא בטוח מה מתאים לך?
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                זה בסדר גמור. כל מצב הוא אישי, וחשוב לבחור את המסלול שמתאים בדיוק לך.
                <br />
                אפשר להשאיר פרטים ואנחנו נעזור לך להבין מה הכי נכון בשבילך.
              </p>
              <Button 
                onClick={scrollToForm}
                className="h-14 px-8 text-lg rounded-xl bg-[#1E3A5F] hover:bg-[#2C5282] text-white"
              >
                בדוק אם זה מתאים לך
                <ArrowLeft className="mr-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-4xl font-bold text-[#1E3A5F] mb-4">
                שאלות נפוצות על פתיחת עוסק פטור ועלויות
              </h2>
              <p className="text-lg text-gray-700">
                כל מה שרצית לדעת על המחירים והתהליך
              </p>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white rounded-2xl shadow-md border-2 border-gray-100 px-6 data-[state=open]:border-[#1E3A5F]"
                >
                  <AccordionTrigger className="text-right hover:no-underline py-5">
                    <span className="text-base md:text-lg font-bold text-gray-800">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 leading-relaxed pb-5 text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        section>

        {/* Form Section */}
        <section className="py-16 bg-white" id="pricing-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-4">
                רוצה לדעת מה הכי מתאים לך?
              </h2>
              <p className="text-lg text-gray-700">
                השאר פרטים ונחזור אליך לעזור לך לבחור את המסלול הנכון
              </p>
            </motion.div>

            <div className="bg-gradient-to-br from-[#E8F4FD] to-blue-50 rounded-3xl shadow-xl p-8 border-2 border-[#1E3A5F]/20">
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
                  type="email"
                  placeholder="אימייל (אופציונלי)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 rounded-xl border-2"
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold rounded-xl bg-[#1E3A5F] hover:bg-[#2C5282] text-white"
                >
                  {isSubmitting ? 'שולח...' : 'השאר פרטים ובדוק עבורך'}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  ללא התחייבות • שיחה קצרה • עזרה אמיתית
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}