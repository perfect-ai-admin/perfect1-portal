import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import {
  CheckCircle, AlertCircle, Phone, MessageCircle,
  TrendingUp, Users, FileText, DollarSign, Zap,
  Shield, AlertTriangle, HelpCircle, Building2, ArrowRight
} from 'lucide-react';
import SEOOptimized from './SEOOptimized';
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import RelatedContent from '../components/seo/RelatedContent';
import PageTracker from '../components/seo/PageTracker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function OsekPaturVsMorasha() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('אנא מלא שם וטלפון');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'עוסק פטור או מורשה',
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
      question: "איך יודעים בוודאות איזה סוג עוסק מתאים?",
      answer: "בדוק שלוש דברים: סוג הלקוחות שלך (פרטיים או עסקיים), היקף ההכנסה החזוי, וסוג הפעילות. אם ההכנסות צפויות להיות גבוהות או הלקוחות הם עסקים - מורשה יותר טוב. אם זה התחלה קטנה - תתחיל עם פטור."
    },
    {
      question: "יכול להתחיל כעוסק פטור ואחר כך לעבור למורשה?",
      answer: "כן, זה אפשרי לחלוטין. הרבה עסקים מתחילים כפטור ומעברים למורשה כשהם גדלים. זה תהליך עם מס הכנסה."
    },
    {
      question: "מה קורה אם אנחצה את תקרת ההכנסה בטעות?",
      answer: "אתה חייב להירשם כעוסק מורשה מיד. אי הרישום בזמן יכול להוביל לקנסות וריבית. עדיף להתייעץ עם רואה חשבון מראש."
    },
    {
      question: "עוסק מורשה צריך בהכרח רואה חשבון?",
      answer: "לעוסק מורשה - כן, כמעט בהכרח. ההתנהלות החשבונאית מורכבת יותר ודיווחי מע״מ דורשים דיוק רב."
    },
    {
      question: "אם אני עוסק פטור - יכול לקזז הוצאות?",
      answer: "עוסק פטור קוזז הוצאות לצורכי ניכוי מס הכנסה, אבל לא מע״מ. הרבה עסקיים מורשים זוכים בקיזוזים טובים יותר של מע״מ."
    },
    {
      question: "לקוחות עסקיים רוצים פטור או מורשה?",
      answer: "לקוחות עסקיים בדרך כלל מעדיפים לעבוד עם עוסק מורשה. הם יכולים לקזז את המע״מ, וזה גם נראה יותר מקצועי."
    },
    {
      question: "תקרת עוסק פטור משתנה?",
      answer: "כן, התקרה משתנה מדי שנה בהצמדת מדד. בשנת 2026 התקרה היא 122,833 ₪."
    },
    {
      question: "אם אני עוסק פטור - מי בודק את החשבונות שלי?",
      answer: "מס הכנסה יכול לבדוק בכל זמן אם הם רוצים. עדיף שיהיה לך רואה חשבון שמוודא שהכל תקין."
    },
    {
      question: "איזה סוג עוסק טוב יותר לצילום או עיצוב?",
      answer: "תלוי בגודל וסוג הלקוחות. אם אתה עובד עם לקוחות פרטיים או קטנים - פטור. אם עובד עם סוכנויות או חברות גדולות - מורשה."
    },
    {
      question: "מה התהליך להתחיל כעוסק מורשה?",
      answer: "צריך להירשם למס הכנסה ולמע״מ. אנחנו מטפלים בכל זה - זה לוקח בדרך כלל 3-5 ימים עסקים."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/osek-patur-vs-morasha" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - עוסק פטור או מורשה"
        description="השוואה מלאה ויעילה בין עוסק פטור לעוסק מורשה - זה יעזור לך להחליט"
      />
      <SEOOptimized
        title="עוסק פטור או מורשה – מה מתאים לך? | השוואה והחלטה"
        description="השוואה מלאה בין עוסק פטור למורשה: הבדלים, יתרונות וחסרונות, ודרך לבחור את הנכון עבורך."
        keywords="עוסק פטור או מורשה, הבדל בין עוסק פטור למורשה, איזה עוסק לפתוח, השוואת עוסק"
        canonical="https://perfect1.co.il/osek-patur-vs-morasha"
      />

      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'שירותים', url: 'Services' },
            { label: 'עוסק פטור או מורשה' }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#27AE60] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-[#27AE60]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#27AE60]/30">
                  <HelpCircle className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-[#27AE60] text-sm font-bold">תחליט בחכמה</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  עוסק פטור או מורשה – מה מתאים לך?
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                  <strong className="text-[#D4AF37]">זו ההחלטה החשובה ביותר לתחילת העסק.</strong>
                  <br />
                  אנחנו נעזור לך להבין את ההבדלים וללא ספק לבחור את הנכון.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl"
                  >
                    <FileText className="ml-3 w-6 h-6" />
                    בדיקה בחינם
                  </Button>
                  <a href="https://wa.me/972502277087?text=היי, רוצה לדעת איזה סוג עוסק מתאים לי" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl">
                      <MessageCircle className="ml-3 w-5 h-5" />
                      דבר בווצאפ
                    </Button>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] mx-auto mb-4 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">אנחנו נעזור לך להחליט</h3>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'הבנה ברורה של ההבדלים',
                      'בדיקה אישית של המצב שלך',
                      'המלצה מותאמת',
                      'ליווי בפתיחה',
                      'ללא התחייבות'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ההבדלים */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4 text-center">
                מה ההבדל בין עוסק פטור לעוסק מורשה?
              </h2>
              <p className="text-xl text-gray-600 text-center mb-12">
                השוואה מפורטת וברורה
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-4 border-[#1E3A5F]">
                      <th className="py-6 px-4 text-right font-black text-[#1E3A5F] text-lg">קריטריון</th>
                      <th className="py-6 px-4 text-right font-black text-white bg-[#27AE60] text-lg">עוסק פטור</th>
                      <th className="py-6 px-4 text-right font-black text-white bg-[#2C5282] text-lg">עוסק מורשה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'maam', label: 'מע״מ', patur: 'פטור ✓', morasha: 'חייב להוציא' },
                      { key: 'takra', label: 'תקרת הכנסה', patur: '122,833 ₪ (2026)', morasha: 'ללא תקרה' },
                      { key: 'nihal', label: 'ניהול ספרים', patur: 'פשוט וקל', morasha: 'מורכב וניהול קפדני' },
                      { key: 'dilug', label: 'דיווח מע״מ', patur: 'אין', morasha: 'חודשי או דו-חודשי' },
                      { key: 'lekuachim', label: 'מתאים ל-', patur: 'לקוחות פרטיים', morasha: 'עסקים וחברות' },
                      { key: 'qizeuz', label: 'קיזוז הוצאות', patur: 'מוגבל', morasha: 'קיזוז מע״מ מלא' },
                      { key: 'ashkarot', label: 'אישורים וחשבוניות', patur: 'קבלות או חשבוניות פשוטות', morasha: 'חשבוניות רשמיות בלבד' },
                      { key: 'ehel', label: 'עלויות ניהול', patur: 'נמוכות', morasha: 'גבוהות יותר' },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-5 px-4 font-bold text-gray-800 text-right border-b border-gray-200">{row.label}</td>
                        <td className="py-5 px-4 text-gray-700 text-right border-b border-gray-200 border-r-4 border-r-[#27AE60]">{row.patur}</td>
                        <td className="py-5 px-4 text-gray-700 text-right border-b border-gray-200 border-r-4 border-r-[#2C5282]">{row.morasha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* למי מתאים? */}
        <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* עוסק פטור */}
              <div>
                <div className="inline-flex items-center gap-2 bg-[#27AE60]/10 text-[#27AE60] px-4 py-2 rounded-full text-sm font-bold mb-6">
                  ✓ התחלה פשוטה
                </div>
                <h3 className="text-3xl font-black text-[#1E3A5F] mb-6">עוסק פטור מתאים ל-</h3>
                
                <ul className="space-y-4 mb-8">
                  {[
                    { text: 'עוסקים בתחילת הדרך', icon: '🚀' },
                    { text: 'עסקים קטנים עם הכנסה נמוכה', icon: '📊' },
                    { text: 'נותנים שירות ללקוחות פרטיים בעיקר', icon: '👤' },
                    { text: 'לא צפויים לעבור את תקרת ההכנסה בשנה הקרובה', icon: '💰' },
                    { text: 'רוצים התחלה פשוטה ללא בירוקרטיה', icon: '✨' }
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm"
                    >
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <span className="text-gray-800 font-medium">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="bg-gradient-to-br from-[#27AE60] to-[#2ECC71] rounded-2xl p-6 text-white">
                  <p className="mb-4 leading-relaxed">
                    <strong>יתרונות:</strong> פשוט, זול, מינימום ניהול, פטור ממע״מ
                  </p>
                  <Link to={createPageUrl('OsekPaturLanding')}>
                    <Button className="w-full bg-white text-[#27AE60] hover:bg-white/90 font-bold">
                      <ArrowRight className="ml-2 w-4 h-4" />
                      למד עוד על עוסק פטור
                    </Button>
                  </Link>
                </div>
              </div>

              {/* עוסק מורשה */}
              <div>
                <div className="inline-flex items-center gap-2 bg-[#2C5282]/10 text-[#2C5282] px-4 py-2 rounded-full text-sm font-bold mb-6">
                  📈 צמיחה ו-B2B
                </div>
                <h3 className="text-3xl font-black text-[#1E3A5F] mb-6">עוסק מורשה מתאים ל-</h3>
                
                <ul className="space-y-4 mb-8">
                  {[
                    { text: 'עסקים בצמיחה או בהיקף גדול', icon: '📈' },
                    { text: 'עובדים עם עסקים וחברות (B2B)', icon: '🏢' },
                    { text: 'הכנסות צפויות גבוהות', icon: '💎' },
                    { text: 'צריכים להוציא חשבוניות רשמיות', icon: '📋' },
                    { text: 'רוצים לקזז מע״מ על הוצאות', icon: '✅' }
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm"
                    >
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <span className="text-gray-800 font-medium">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="bg-gradient-to-br from-[#2C5282] to-[#1E3A5F] rounded-2xl p-6 text-white">
                  <p className="mb-4 leading-relaxed">
                    <strong>יתרונות:</strong> אין תקרה, קיזוז מע״מ, מקצועי יותר, טוב לצמיחה
                  </p>
                  <Button className="w-full bg-white text-[#2C5282] hover:bg-white/90 font-bold" onClick={() => alert('צור קשר לליווי פתיחת עוסק מורשה')}>
                    <ArrowRight className="ml-2 w-4 h-4" />
                    דבר על עוסק מורשה
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* טעויות נפוצות */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                טעויות נפוצות בבחירה
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: AlertTriangle,
                    title: 'פתיחת עוסק פטור כשצריך מורשה',
                    desc: 'חשבת שהכנסות תהיינה נמוכות, אבל בסוף הן עלו. כדאי לתכנן עד שנה קדימה.'
                  },
                  {
                    icon: AlertCircle,
                    title: 'בחירה לפי "מה זול יותר"',
                    desc: 'לא בחר עוסק לפי המחיר של הפתיחה. בחר לפי הצורך האמיתי של העסק.'
                  },
                  {
                    icon: Clock,
                    title: 'עיכוב בהרישום למורשה',
                    desc: 'חצית את התקרה ולא הרשמת כמורשה בזמן? זה יכול להוביל לקנסות.'
                  },
                  {
                    icon: AlertTriangle,
                    title: 'אי תכנון לשנה הקרובה',
                    desc: 'אם אתה בעוסק פטור - תכנן מראש אם תעבור לתקרה. אם כן - התחל לתכנן את המעבר.'
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-red-50 rounded-2xl p-6 shadow-lg border-r-4 border-red-500 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Strong */}
        <section className="py-16 bg-gradient-to-r from-[#27AE60] to-[#2ECC71]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                עדיין לא בטוח?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                בואו נבדוק את המצב שלך בדיוק ונתן לך התייעוץ המותאם
              </p>
              <Button 
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-16 px-12 text-2xl font-black rounded-2xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl"
              >
                <FileText className="ml-3 w-7 h-7" />
                בדיקה בחינם - ללא התחייבות
              </Button>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                עוד שאלות נפוצות
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

        {/* Contact Form */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]" id="contact-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                בואו נבדוק איזה סוג עוסק מתאים לך
              </h2>
              <p className="text-xl text-white/90">
                בדיקה אישית בחינם - ללא התחייבות
              </p>
            </motion.div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[#D4AF37]/30">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">שם מלא *</label>
                  <Input
                    placeholder="איך קוראים לך?"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-xl border-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">טלפון *</label>
                  <Input
                    type="tel"
                    placeholder="050-1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-xl border-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">סוג עיסוק (לא חובה)</label>
                  <Input
                    placeholder="למשל: צלם, מעצב, מאמן..."
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="h-12 rounded-xl border-2"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white"
                >
                  {isSubmitting ? 'שולח...' : 'בדיקה בחינם ותשובה במהלך היום'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  אנחנו נחזור אליך בתוך שעות • ייעוץ מקצועי • בלי ספאם
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Related Content */}
        <RelatedContent pageType="landing" />
      </main>
    </>
  );
}