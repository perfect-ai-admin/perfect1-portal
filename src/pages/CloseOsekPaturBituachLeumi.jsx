import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle, AlertCircle, CheckCircle, Shield, TrendingDown } from 'lucide-react';
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

export default function CloseOsekPaturBituachLeumi() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      question: "מה קורה אם אני לא מדווח על סיום עסקות לביטוח לאומי?",
      answer: "ביטוח לאומי ימשיך לגבות דמי ביטוח כל חודש. בנוסף, יכולים להיות קנסות על אי-דיווח בזמן, ודרישות להחזר דמים שנגבו בטעות."
    },
    {
      question: "כמה זמן לוקח הביטוח לאומי לעבד סגירה?",
      answer: "בדרך כלל 2-4 שבועות. אם יש חוקים פתוחים או השלמות דרושות, זה יכול להיות יותר זמן."
    },
    {
      question: "האם צריך לפרוע חובות לביטוח לאומי לפני סגירה?",
      answer: "זה תלוי בסכום החוב. אתה יכול להתחיל בתהליך סגירה גם עם חובות, אך צריך לתיאם עם הביטוח לאומי תוכנית תשלום."
    },
    {
      question: "מתי בדיוק צריך להודיע לביטוח לאומי על סגירה?",
      answer: "כדאי להודיע תוך 30 ימים מיום הסגירה האמיתי. אם אתה מדווח אחר כך, זה יעלה בקנסות על כל חודש שהחמצת."
    },
    {
      question: "מה עם הביטוח הבריאות שלי? הוא יחדול בעצם כמו העוסק?",
      answer: "לא בהכרח. הביטוח הבריאות שלך כרוך בביטוח לאומי עצמו. כשתשלים את דמי הסיום, צריך לדאוג לעצמך לביטוח חדש דרך קופת חולים."
    }
  ];

  const scenarios = [
    {
      title: 'סגירה רגילה - בלי חובות',
      desc: 'העוסק שלך סיים בצורה טבעית והכל מסודר.',
      steps: [
        'הודעה לביטוח לאומי בתוך 30 ימים',
        'קבלת אישור סגירה מהביטוח',
        'ביטוח לאומי משלם את הדמים שנגבו בעודף',
        'פתיחת ביטוח חדש כעובד או כמו שצריך'
      ],
      time: '2-3 שבועות',
      icon: <CheckCircle className="w-8 h-8 text-green-600" />
    },
    {
      title: 'סגירה עם חובות פתוחים',
      desc: 'יש חוקים למس הכנסה או מע״מ שעדיין פתוחים.',
      steps: [
        'הודעה לביטוח לאומי (חובות לא יעצרו את התהליך)',
        'תיאום תוכנית תשלום עם הביטוח לאומי',
        'סיום שאר התיקים (מס הכנסה, מע״מ)',
        'סגירה סופית לאחר סיום כל החובות'
      ],
      time: '4-6 שבועות',
      icon: <AlertCircle className="w-8 h-8 text-orange-600" />
    },
    {
      title: 'סגירה עם בדיקה במהלך הדרך',
      desc: 'הביטוח לאומי מוצא בעיות או שגיאות בדרך.',
      steps: [
        'קבלת דרישות השלמה מהביטוח לאומי',
        'הגשת מסמכים נדרשים בתוך הזמן שניתן',
        'ייתכן השלמות בתשלומים',
        'קבלת אישור סגירה סופי'
      ],
      time: '6-8 שבועות',
      icon: <TrendingDown className="w-8 h-8 text-red-600" />
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
        source_page: 'סגירת עוסק פטור - ביטוח לאומי',
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
      <PageTracker pageUrl="/close-osek-patur-bituach-leumi" pageType="guide" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - סגירת עוסק פטור בביטוח לאומי"
        description="מדריך מלא לסגירת ביטוח לאומי בעוסק פטור"
      />
      <SEOOptimized
        title="סגירת עוסק פטור בביטוח לאומי - מדריך מלא | Perfect One"
        description="כל מה שצריך לדעת על סגירת ביטוח לאומי בעוסק פטור: תרחישים, חוקים פתוחים, וכיצד למנוע בעיות."
        keywords="סגירת ביטוח לאומי, סגירת עוסק, דוח סיום, חובות ביטוח לאומי"
        canonical="https://perfect1.co.il/close-osek-patur-bituach-leumi"
      />

      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'סגירת עוסק פטור', url: 'CloseOsekPaturComprehensive' },
            { label: 'ביטוח לאומי' }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <Shield className="w-16 h-16 text-[#D4AF37]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                סגירת עוסק פטור בביטוח לאומי
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                ביטוח לאומי הוא צעד חיוני בסגירה. מדריך מלא להבנת התהליך, מניעת חוקים, וסגירה סדורה.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why It's Critical */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                למה ביטוח לאומי כל כך חשוב?
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: '💰 דמים שנגבו בטעות',
                    desc: 'אם לא תודיע על סגירה, ביטוח לאומי ימשיך לגבות דמים כל חודש למשך שנים. זה כסף שאתה לא צריך להוציא.'
                  },
                  {
                    title: '📋 דרישה חובה לסגירה',
                    desc: 'מס הכנסה לא יסגור את התיק שלך עד שביטוח לאומי יודיע שהוא סגור. זה תנאי קדם.'
                  },
                  {
                    title: '⚠️ קנסות על עיכוב',
                    desc: 'אם תדווח עם עיכוב של יותר מ-30 ימים, יכולים להיות קנסות על כל חודש שחלף.'
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200"
                  >
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Scenarios */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                תרחישים אפשריים של סגירה
              </h2>

              <div className="space-y-6">
                {scenarios.map((scenario, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      {scenario.icon}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-[#1E3A5F]">{scenario.title}</h3>
                        <p className="text-gray-600 mt-2">{scenario.desc}</p>
                      </div>
                      <div className="text-right text-sm font-bold text-[#D4AF37]">
                        {scenario.time}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <p className="text-sm font-bold text-gray-700 mb-3">שלבים:</p>
                      <ul className="space-y-2">
                        {scenario.steps.map((step, j) => (
                          <li key={j} className="flex gap-3 text-gray-700">
                            <span className="font-bold text-[#1E3A5F]">{j + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Common Issues */}
        <section className="py-16 bg-orange-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                חובות נפוצים שמונעים סגירה
              </h2>

              <div className="space-y-4">
                {[
                  { issue: '❌ דוחות שנתיים שלא הוגשו', solution: 'צריך להגיש דוחות חסרים לביטוח לאומי' },
                  { issue: '❌ דמים שלא שולמו', solution: 'אפשר להיות עם תוכנית תשלום, אך צריך לתאם' },
                  { issue: '❌ טעויות בדיווח הכנסה', solution: 'צריך תיקון רטרואקטיבי עם הביטוח' },
                  { issue: '❌ חובות ממסים אחרים', solution: 'צריך לסגור עם מס הכנסה והמע״מ קודם' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl p-6 border-r-4 border-orange-500"
                  >
                    <p className="font-bold text-[#1E3A5F] mb-2">{item.issue}</p>
                    <p className="text-gray-700">✓ {item.solution}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Prevention Tips */}
        <section className="py-16 bg-green-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
                איך למנוע בעיות בעתיד?
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    num: '1',
                    title: 'הודע בזמן',
                    desc: 'בתוך 30 ימים מיום הסגירה - אל תחכה. קנסות גדלים עם הזמן.'
                  },
                  {
                    num: '2',
                    title: 'תאום עם ביטוח לאומי',
                    desc: 'בדוק שהם קיבלו את ההודעה. תמיד טוב לשמור על אישור.'
                  },
                  {
                    num: '3',
                    title: 'סגור את הדיווחים',
                    desc: 'אם יש דיווחים שנתיים חסרים, תיקן אותם בתיאום עם מה שמס הכנסה מאישר.'
                  },
                  {
                    num: '4',
                    title: 'הסדר ביטוח חדש',
                    desc: 'ביטוח בריאות וביטוח לאומי כעובד - אל תישאר ללא ביטוח.'
                  }
                ].map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl p-6 border-l-4 border-green-600"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                        {tip.num}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{tip.title}</h3>
                        <p className="text-gray-700">{tip.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-8 text-center">
                שאלות נפוצות
              </h2>

              <Accordion type="single" collapsible className="space-y-3">
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

        {/* Full Solution CTA */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                סגירה של עוסק זה יותר מביטוח לאומי בלבד
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                מס הכנסה, מע״מ, ביטוח לאומי - לכל אחד יש צעדים משלו. אם תרצה תמונה מלאה של סגירה נכונה:
              </p>
              <Link to={createPageUrl('CloseBusinessLanding')} className="inline-block">
                <Button className="h-14 px-8 text-lg font-bold rounded-xl bg-[#1E3A5F] hover:bg-[#2C5282]">
                  ראה תהליך סגירה מלא לכל הרשויות →
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                צריך עזרה בסגירה בביטוח לאומי?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                אנחנו מטפלים בכל תקשורת עם הביטוח, הוצאת אישורים, ותיאום כל הדברים.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/972502277087?text=היי, אני צריך עזרה בסגירת ביטוח לאומי" target="_blank" rel="noopener noreferrer">
                  <Button className="h-14 px-8 text-lg font-black rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    דבר בווטסאפ
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button variant="outline" className="h-14 px-8 text-lg font-black rounded-xl border-2 border-white bg-white/10 text-white hover:bg-white/20">
                    <Phone className="ml-2 w-5 h-5" />
                    התקשר עכשיו
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