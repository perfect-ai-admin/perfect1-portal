import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Phone, MessageCircle, FileText, AlertCircle, Shield, Clock, XCircle, Building2, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import RelatedContent from '../components/seo/RelatedContent';
import PageTracker from '../components/seo/PageTracker';

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-[#1E3A5F]/30 transition-all"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-bold text-[#1E3A5F]">{question}</h3>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-[#1E3A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        >
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CloseBusinessLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
        source_page: 'דף נחיתה - סגירת עוסק',
        category: 'other',
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
      question: "איך סוגרים עוסק פטור?",
      answer: "סגירת עוסק פטור נעשית באמצעות הגשת הודעה למס הכנסה, ביטוח לאומי ומע\"מ (במידת הצורך). יש למלא טופס 821 למס הכנסה ולוודא שאין חובות פתוחים. חשוב להגיש דוח אחרון עד תאריך הסגירה."
    },
    {
      question: "האם חייבים לסגור תיק גם אם לא הייתה פעילות?",
      answer: "כן, חובה לסגור תיק רשמית גם אם לא הייתה פעילות עסקית. אי סגירה עלולה להוביל להמשך התחייבויות מול ביטוח לאומי ולתיקים פתוחים שיכולים להצטבר לקנסות."
    },
    {
      question: "כמה זמן לוקח לסגור עוסק פטור?",
      answer: "התהליך לוקח בדרך כלל 2-4 שבועות מרגע הגשת כל המסמכים הנדרשים והסדרת חובות קיימים. במקרים מורכבים או עם חובות, התהליך עשוי להימשך יותר."
    },
    {
      question: "איך סוגרים עוסק מורשה במע\"מ?",
      answer: "סגירת עוסק מורשה דורשת הגשת דוחות מע\"מ אחרונים, סגירת חשבוניות פתוחות, והגשת בקשה לביטול רישום במע\"מ באתר המס. יש לוודא שכל החשבוניות הוגשו והתחשבנו עם הרשויות."
    },
    {
      question: "מה קורה אם לא סוגרים תיק עצמאי?",
      answer: "אי סגירת תיק עלולה לגרום להמשך חיובים בביטוח לאומי, קנסות על אי הגשת דוחות, ובעיות עתידיות בפתיחת עסק חדש. התיק נשאר פתוח ברשויות והוא עלול לצבור חובות."
    },
    {
      question: "איך סוגרים חברה בע\"מ ברשם החברות?",
      answer: "סגירת חברה דורשת החלטת כינוס ופירוק (או פשיטת רגל במקרים מסוימים), פירעון חובות, הגשת דוחות אחרונים למס, ורישום הפירוק ברשם החברות. זהו תהליך מורכב יותר מסגירת עוסק."
    },
    {
      question: "האם אפשר לסגור עסק רטרואקטיבית?",
      answer: "במקרים מסוימים ניתן לבקש סגירה רטרואקטיבית, אך זה דורש הצדקה והסדרת כל החובות והדוחות לתקופה. המלצה להתייעץ עם רואה חשבון לפני הגשת בקשה כזו."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/close-business" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - סגירת עוסק פטור וחברה"
        description="שירות מקצועי לסגירת עוסק פטור, עוסק מורשה וחברות בע״מ בצורה מסודרת ובטוחה"
        address={{
          street: "",
          city: "",
          country: "ישראל"
        }}
        phone="+972-50-227-7087"
        website="https://perfect1.co.il"
      />
      <SEOOptimized
        title="איך סוגרים עוסק פטור, עוסק מורשה או חברה בע״מ | סגירה מסודרת ובטוחה"
        description="מדריך מקיף לסגירת עוסק פטור, עוסק מורשה או חברה בע״מ בישראל. טיפול מול מס הכנסה, מע״מ וביטוח לאומי. סגירה נכונה ללא קנסות וחובות."
        keywords="סגירת עוסק פטור, איך סוגרים עוסק, סגירת עוסק מורשה, סגירת חברה בע״מ, סגירת תיק עצמאי"
        canonical="https://perfect1.co.il/close-business"
        schema={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Perfect One - סגירת עוסק פטור וחברה בע״מ",
          "description": "שירות מקצועי לסגירת עוסק פטור, עוסק מורשה וחברות בע״מ",
          "url": "https://perfect1.co.il/close-business",
          "telephone": "+972-50-227-7087",
          "priceRange": "₪₪",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IL"
          },
          "areaServed": {
            "@type": "Country",
            "name": "ישראל"
          },
          "serviceType": "סגירת עוסק פטור וחברה"
        }}
      />
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'סגירת עוסק' }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#3B5F8C] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#27AE60] rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                  <Shield className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-bold">סגירה מסודרת ובטוחה</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  איך סוגרים עוסק פטור, עוסק מורשה או חברה בע״מ
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed font-medium">
                  סגירת עסק בישראל דורשת טיפול מסודר מול מס הכנסה, מע״מ, ביטוח לאומי ולעיתים גם רשם החברות
                </p>

                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-6 mb-8 border-2 border-red-300/30 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
                    <p className="text-white text-lg font-medium">
                      <strong>חשוב:</strong> סגירה לא נכונה עלולה להשאיר חובות, קנסות או תיקים פתוחים – גם שנים אחרי שהפעילות הופסקה
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl"
                  >
                    <FileText className="ml-3 w-6 h-6" />
                    בדיקת מצב וסגירת תיק
                  </Button>
                  <a href="https://wa.me/972502277087?text=היי, אני רוצה לסגור עסק בצורה מסודרת" target="_blank" rel="noopener noreferrer">
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl"
                    >
                      <MessageCircle className="ml-3 w-5 h-5" />
                      דבר איתנו בווצאפ
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
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center">
                      <XCircle className="w-8 h-8 text-[#1E3A5F]" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">סגירה מסודרת עם ליווי מקצועי</h3>
                    <p className="text-gray-600">טיפול מקצה לקצה מול רשויות המס</p>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'בדיקת מצב התיקים ברשויות',
                      'התאמות מול מס הכנסה ומע״מ',
                      'הגשת דוחות אחרונים',
                      'טיפול בחובות או קנסות קיימים',
                      'הכוונה לפתרון נכון',
                      'ליווי עד לסגירה מוחלטת'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-3">כבר עזרנו ל-</p>
                    <p className="text-4xl font-black text-[#1E3A5F]">500+</p>
                    <p className="text-gray-600 font-medium">עסקים לסגור בצורה מסודרת</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AEO - תשובה מיידית */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-r-4 border-[#1E3A5F]"
            >
              <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-4">
                סגירת תיק עצמאי או חברה – לא רק להפסיק לעבוד, אלא לסגור נכון
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                הפסקת פעילות עסקית היא רק השלב הראשון. סגירה רשמית של תיק עוסק או חברה דורשת טיפול מסודר מול מס הכנסה, מע״מ וביטוח לאומי – כולל הגשת דוחות אחרונים, סגירת חשבוניות פתוחות, והתאמות מול הרשויות. <strong>סגירה לא נכונה עלולה להשאיר תיקים פתוחים שיכולים להצטבר לקנסות וחובות – גם שנים לאחר מכן.</strong>
              </p>
            </motion.div>
          </div>
        </section>

        {/* סוגי סגירה */}
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                סוגי סגירה לפי סוג העסק
              </h2>
              <p className="text-xl text-gray-600">כל סוג עסק דורש טיפול שונה</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
               {[
                 {
                   icon: FileText,
                   title: 'סגירת עוסק פטור',
                   subtitle: 'מס הכנסה, מע״מ וביטוח לאומי',
                   points: [
                     'הגשת טופס 821 למס הכנסה',
                     'הודעה לביטוח לאומי',
                     'דוח אחרון עד תאריך הסגירה',
                     'וידוא שאין חובות פתוחים',
                     'סגירה תוך 2-4 שבועות'
                   ],
                   errors: 'טעויות נפוצות: אי הגשת דוח אחרון, השארת חובות',
                   link: 'CloseOsekPaturComprehensive'
                 },
                {
                  icon: CheckCircle,
                  title: 'סגירת עוסק מורשה',
                  subtitle: 'טיפול במע״מ ודוחות פתוחים',
                  points: [
                    'הגשת דוחות מע״מ אחרונים',
                    'סגירת חשבוניות מול הרשויות',
                    'ביטול רישום במע״מ',
                    'התאמות מול מס הכנסה',
                    'הגשת דוח שנתי סופי'
                  ],
                  errors: 'טעויות נפוצות: חשבוניות לא מוגשות, מע״מ חסר'
                },
                {
                  icon: Building2,
                  title: 'סגירת חברה בע״מ',
                  subtitle: 'רשם החברות ורשויות המס',
                  points: [
                    'החלטת כינוס ופירוק',
                    'פירעון חובות לנושים',
                    'דוחות אחרונים למס',
                    'רישום פירוק ברשם החברות',
                    'תהליך מורכב הדורש ליווי'
                  ],
                  errors: 'טעויות נפוצות: השארת חברה לא פעילה פתוחה'
                }
              ].map((type, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center mb-4">
                    <type.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.subtitle}</p>
                  
                  <ul className="space-y-2 mb-4">
                    {type.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">{type.errors}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* בעיות נפוצות */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                כבר הפסקת לעבוד? זה עדיין לא אומר שהעסק סגור
              </h2>
              <p className="text-xl text-gray-600">בעיות נפוצות שנוצרות כשלא סוגרים תיק כהלכה</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                'תיקים פתוחים במס הכנסה ללא מעקב',
                'חובות מע״מ שממשיכים להצטבר',
                'דוחות שלא הוגשו - קנסות אוטומטיים',
                'קנסות מצטברים מביטוח לאומי',
                'פעילות שהופסקה בלי סגירה רשמית',
                'בעיות בפתיחת עסק חדש בעתיד'
              ].map((problem, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 bg-red-50 rounded-xl p-4 border-r-4 border-red-500"
                >
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <p className="text-gray-800 font-medium">{problem}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* אמון ומקצועיות */}
        <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-[#27AE60]/10 text-[#27AE60] px-6 py-2 rounded-full text-sm font-bold mb-6">
                <Shield className="w-5 h-5" />
                ליווי מקצועי
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6">
                סגירה מסודרת עם ליווי מול רשויות המס
              </h2>
              
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                אנחנו מטפלים בתהליך הסגירה מקצה לקצה – בדיקת מצב התיקים, התאמות מול הרשויות, והכוונה לפתרון נכון של בעיות שנוצרו במהלך הפעילות. <strong>בלי הפתעות, בלי קנסות, בלי חובות.</strong>
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Clock, text: 'סגירה תוך 2-4 שבועות' },
                  { icon: Shield, text: 'ליווי מקצועי וביטחון' },
                  { icon: CheckCircle, text: 'סגירה מוחלטת של כל התיקים' }
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                    <item.icon className="w-10 h-10 text-[#27AE60] mx-auto mb-3" />
                    <p className="text-gray-800 font-bold">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#3B5F8C]" id="contact-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                לא בטוחים איך נכון לסגור את העסק שלכם?
              </h2>
              <p className="text-xl text-white/90">אפשר לבדוק את מצב התיקים ולקבל הכוונה מסודרת לפני שמבצעים סגירה</p>
            </motion.div>

            {isSuccess ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                <p className="text-gray-600">נחזור אליך בקרוב לבדיקת מצב התיקים</p>
              </div>
            ) : (
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
                      placeholder="למשל: צלם, מעצב, מאמן כושר..."
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
                    {isSubmitting ? 'שולח...' : 'בדיקת מצב וסגירת תיק'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    ללא התחייבות • טיפול מסודר • ליווי מקצועי
                  </p>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                שאלות נפוצות על סגירת עסק
              </h2>
              <p className="text-lg text-gray-600">כל מה שרצית לדעת על סגירת עוסק פטור, עוסק מורשה וחברה</p>
            </motion.div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* Related Content */}
        <RelatedContent pageType="landing" />

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-[#27AE60] to-[#229954] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                רוצים לסגור את העסק בצורה מסודרת? 🏁
              </h2>
              <p className="text-xl text-white/90 mb-8">
                נעזור לכם בכל התהליך – <strong>בלי קנסות, בלי חובות, בלי הפתעות</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl"
                >
                  <FileText className="ml-3 w-6 h-6" />
                  בדיקה וסגירה
                </Button>
                <a href="https://wa.me/972502277087?text=היי, אני רוצה לסגור עסק בצורה מסודרת" target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl"
                  >
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פנייה בווצאפ
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