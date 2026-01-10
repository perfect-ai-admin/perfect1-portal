import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, Phone, MessageCircle, Smartphone, 
  FileText, DollarSign, BarChart3, Shield, 
  Zap, Clock, Users, TrendingUp, Receipt,
  Monitor, Download, Star
} from 'lucide-react';
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
      className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-[#1E3A5F]/50 transition-all"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <p className="text-lg font-bold text-[#1E3A5F]">{question}</p>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-[#27AE60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default function InvoicesAppLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
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
        source_page: 'דף נחיתה - אפליקציה לחשבוניות',
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
      question: "האם אפשר להפיק חשבוניות בלי עוסק פטור?",
      answer: "לא, בשביל להפיק חשבוניות חוקיות בישראל, צריך להיות בעל עוסק מורשה או עוסק פטור. האפליקציה שלנו מיועדת לעוסקים פטורים ומורשים שכבר פתחו עוסק."
    },
    {
      question: "האפליקציה כלולה במחיר השירות?",
      answer: "כן, האפליקציה להפקת חשבוניות וקבלות כלולה לחלוטין במחיר השירות החודשי של ליווי עוסקים פטורים. אין עלות נוספת."
    },
    {
      question: "איך מתחילים להשתמש באפליקציה?",
      answer: "אם אין לך עוסק פטור - קודם כל נפתח לך עוסק פטור אונליין. לאחר מכן תקבל גישה מיידית לאפליקציה ונלווה אותך בהתקנה ושימוש ראשוני."
    },
    {
      question: "האפליקציה עובדת גם על אייפון ואנדרואיד?",
      answer: "כן, האפליקציה זמינה למכשירי iOS (אייפון) ו-Android. בנוסף, ניתן להשתמש בה גם דרך דפדפן אינטרנט מכל מחשב."
    },
    {
      question: "האם האפליקציה מחוברת למס הכנסה?",
      answer: "האפליקציה שומרת את כל הנתונים בצורה מסודרת ומאפשרת הפקת דוחות בקלות. אנחנו מטפלים בדיווח לרשויות במסגרת השירות החודשי."
    },
    {
      question: "מה קורה אם אני צריך עזרה עם האפליקציה?",
      answer: "קיבלת תמיכה מלאה בוואטסאפ וטלפון. הצוות שלנו זמין לעזור בכל שאלה או בעיה עם האפליקציה - בין אם זה טכני או חשבונאי."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/invoices-app" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - אפליקציה לחשבוניות"
        description="אפליקציה מתקדמת להפקת חשבוניות וקבלות לעוסקים פטורים"
        address={{
          street: "",
          city: "",
          country: "ישראל"
        }}
        phone="+972-50-227-7087"
        website="https://perfect1.co.il"
      />
      <SEOOptimized
        title="אפליקציה לחשבוניות וקבלות | ניהול דיגיטלי לעוסקים פטורים"
        description="אפליקציה חכמה להפקת חשבוניות וקבלות דיגיטליות בהתאמה לעוסקים פטורים. כלולה במחיר השירות. ממשק פשוט, הפקה מהירה וניהול מלא של הכנסות והוצאות."
        keywords="אפליקציה לחשבוניות, הפקת קבלות דיגיטליות, אפליקציה לעוסק פטור, הפקת חשבוניות אונליין"
        canonical="https://perfect1.co.il/invoices-app"
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "אפליקציה לחשבוניות וקבלות - Perfect One",
          "applicationCategory": "BusinessApplication",
          "description": "אפליקציה מתקדמת להפקת חשבוניות וקבלות לעוסקים פטורים",
          "operatingSystem": "iOS, Android, Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "ILS",
            "description": "כלול במחיר השירות החודשי"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "450"
          }
        }}
      />
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'שירותים', url: 'Services' },
            { label: 'אפליקציה לחשבוניות' }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#27AE60] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-[#27AE60]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#27AE60]/30">
                  <Smartphone className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-[#27AE60] text-sm font-bold">אפליקציה דיגיטלית מתקדמת</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  חשבוניות וקבלות
                  <br />
                  <span className="text-[#D4AF37]">בלחיצת כפתור</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-4 leading-relaxed font-medium">
                  אפליקציה חכמה להפקת חשבוניות וקבלות דיגיטליות
                </p>
                <p className="text-lg text-white/80 mb-8">
                  <strong className="text-[#27AE60]">כלול במחיר השירות</strong> - בלי עלויות נוספות
                </p>

                <div className="bg-gradient-to-r from-[#27AE60]/20 to-[#2ECC71]/20 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-3 text-white">
                    {[
                      { icon: Smartphone, text: 'ממשק פשוט' },
                      { icon: Zap, text: 'הפקה מהירה' },
                      { icon: Shield, text: 'חוקי 100%' },
                      { icon: CheckCircle, text: 'כלול במחיר' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
                        <item.icon className="w-5 h-5 text-white" />
                        <span className="font-bold text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50/10 backdrop-blur-sm rounded-xl p-4 mb-8 border border-blue-300/30">
                  <p className="text-white/90 text-sm">
                    💡 <strong>עדיין אין לך עוסק פטור?</strong>{' '}
                    <Link 
                      to={createPageUrl('OsekPaturOnlineLanding')}
                      className="text-[#D4AF37] underline font-bold hover:text-[#F4D03F]"
                    >
                      פתח עוסק אונליין עכשיו
                    </Link>
                    {' '}ותקבל גישה מיידית לאפליקציה
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, מעוניין באפליקציה לחשבוניות" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl">
                      <MessageCircle className="ml-3 w-6 h-6" />
                      דבר איתנו בווצאפ
                    </Button>
                  </a>
                  <a href="tel:0502277087">
                    <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl">
                      <Phone className="ml-3 w-5 h-5" />
                      0502277087
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
                    <Smartphone className="w-16 h-16 mx-auto mb-4 text-[#1E3A5F]" />
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">אפליקציה מתקדמת</h3>
                    <p className="text-gray-600">ממשק נוח ופשוט לשימוש</p>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'הפקת חשבוניות תוך שניות',
                      'קבלות דיגיטליות מהנייד',
                      'ניהול לקוחות וספקים',
                      'מעקב אחר הכנסות והוצאות',
                      'דוחות ותובנות בזמן אמת',
                      'סנכרון בענן - גישה מכל מקום'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="text-gray-600 font-medium">דירוג ממוצע 4.8/5 מ-450+ משתמשים</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                למה האפליקציה שלנו?
              </h2>
              <p className="text-xl text-gray-600">הכל מה שעוסק פטור צריך - באפליקציה אחת</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: 'הפקה מהירה', desc: 'חשבונית או קבלה תוך שניות - ישירות מהנייד', color: '#27AE60' },
                { icon: Smartphone, title: 'ממשק פשוט', desc: 'עיצוב נקי ואינטואיטיבי שקל להבין', color: '#3498DB' },
                { icon: FileText, title: 'חשבוניות מותאמות', desc: 'תבניות מעוצבות עם הלוגו שלך', color: '#9B59B6' },
                { icon: Users, title: 'ניהול לקוחות', desc: 'שמירת פרטי לקוחות ושליחה מהירה', color: '#E67E22' },
                { icon: BarChart3, title: 'דוחות ותובנות', desc: 'מעקב אחר הכנסות והוצאות בזמן אמת', color: '#1E3A5F' },
                { icon: Shield, title: 'אבטחה מלאה', desc: 'כל המידע מאובטח ומוגן בענן', color: '#C0392B' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: feature.color + '20' }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                איך זה עובד?
              </h2>
              <p className="text-xl text-gray-600">3 שלבים פשוטים להתחיל</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  step: '1', 
                  icon: FileText, 
                  title: 'פתח עוסק פטור', 
                  desc: 'אם עדיין אין לך, פתח עוסק פטור אונליין תוך 24-48 שעות',
                  link: true
                },
                { 
                  step: '2', 
                  icon: Download, 
                  title: 'הורד את האפליקציה', 
                  desc: 'קבל גישה מיידית לאפליקציה במייל או בוואטסאפ'
                },
                { 
                  step: '3', 
                  icon: CheckCircle, 
                  title: 'התחל להפיק', 
                  desc: 'הפק חשבוניות וקבלות מהנייד תוך שניות'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative bg-white rounded-2xl p-6 shadow-lg text-center"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-[#27AE60] to-[#2ECC71] text-white font-black flex items-center justify-center text-lg">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center mb-4 mt-2">
                    <item.icon className="w-7 h-7 text-[#1E3A5F]" />
                  </div>
                  <h4 className="font-bold text-[#1E3A5F] mb-2 text-lg">{item.title}</h4>
                  <p className="text-gray-600">{item.desc}</p>
                  {item.link && (
                    <Link 
                      to={createPageUrl('OsekPaturOnlineLanding')}
                      className="inline-block mt-3 text-[#27AE60] font-bold hover:underline"
                    >
                      פתח עוסק אונליין →
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                מחיר שקוף וברור
              </h2>
            </motion.div>

            <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-3xl shadow-2xl p-8 text-white">
              <div className="text-center mb-8">
                <div className="inline-block bg-[#27AE60] text-white px-6 py-2 rounded-full text-sm font-bold mb-4">
                  ✨ כלול במחיר השירות
                </div>
                <h3 className="text-3xl font-black mb-2">האפליקציה כלולה</h3>
                <p className="text-white/80 text-lg">אין עלות נוספת - הכל במחיר אחד</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-bold text-xl mb-4">מה כלול:</h4>
                  <ul className="space-y-3">
                    {[
                      'גישה מלאה לאפליקציה',
                      'חשבוניות וקבלות ללא הגבלה',
                      'ניהול לקוחות וספקים',
                      'דוחות ותובנות',
                      'תמיכה טכנית מלאה',
                      'עדכונים וגרסאות חדשות'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-bold text-xl mb-4">השירות החודשי:</h4>
                  <div className="mb-4">
                    <div className="text-4xl font-black text-[#27AE60] mb-2">₪199/חודש</div>
                    <p className="text-white/80">כולל הכל - פתיחת עוסק + אפליקציה + ליווי</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                      <span>פתיחת עוסק פטור</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                      <span>אפליקציה לחשבוניות</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                      <span>ליווי חודשי מלא</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                      <span>הכנת דוח שנתי</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847]" id="contact-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                מעוניין באפליקציה?
              </h2>
              <p className="text-xl text-white/90">מלא פרטים ונחזור אליך עם כל המידע</p>
            </motion.div>

            {isSuccess ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                <p className="text-gray-600">נחזור אליך בקרוב עם כל הפרטים על האפליקציה</p>
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">אימייל (לא חובה)</label>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 rounded-xl border-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white"
                  >
                    {isSubmitting ? 'שולח...' : 'קבל פרטים על האפליקציה'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    ללא התחייבות • תמיכה מלאה • כלול במחיר
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
                שאלות נפוצות
              </h2>
              <p className="text-lg text-gray-600">כל מה שרצית לדעת על האפליקציה</p>
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
                מוכנים להתחיל? 📱
              </h2>
              <p className="text-xl text-white/90 mb-8">
                צריך עוסק פטור?{' '}
                <Link 
                  to={createPageUrl('OsekPaturOnlineLanding')}
                  className="underline font-bold hover:text-white"
                >
                  פתח אונליין עכשיו
                </Link>
                {' '}וקבל גישה לאפליקציה
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/972502277087?text=היי, מעוניין באפליקציה לחשבוניות" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פנייה בווצאפ
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl">
                    <Phone className="ml-3 w-6 h-6" />
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