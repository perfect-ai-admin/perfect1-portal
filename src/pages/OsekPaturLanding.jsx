import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Phone, MessageCircle, Shield, Clock, Users, Star, TrendingUp, FileText, Briefcase, Target, Zap, Award, ArrowLeft, Smartphone, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';
import FAQSchema from '../components/seo/FAQSchema';
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

export default function OsekPaturLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
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
        source_page: 'דף נחיתה - פתיחת עוסק פטור',
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
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      question: "כמה זמן לוקח לפתוח עוסק פטור?",
      answer: "התהליך הממשלתי בדרך כלל לוקח מספר ימי עסקים. אנחנו מלווים אותך בכל שלב ודואגים שהתהליך יתבצע בצורה חלקה ומסודרת."
    },
    {
      question: "כמה עולה לפתוח עוסק פטור?",
      answer: "פתיחת עוסק פטור עולה 249₪ בלבד וכוללת טיפול מלא מול כל הרשויות, אפליקציה לניהול העסק, ליווי חודשי והכנת דוח שנתי."
    },
    {
      question: "מה המסמכים הנדרשים לפתיחת עוסק פטור?",
      answer: "נדרשים רק שני מסמכים: תעודת זהות ואישור ניהול חשבון בנק. זהו. אנחנו דואגים לכל השאר."
    },
    {
      question: "האם צריך להגיע פיזית למשרד?",
      answer: "לא. כל התהליך מתבצע אונליין - מילוי טופס, העלאת מסמכים וחתימה דיגיטלית. בלי ריצות ובלי יציאה מהבית."
    },
    {
      question: "מה כולל השירות של פתיחת עוסק פטור?",
      answer: "השירות כולל: פתיחת תיק במס הכנסה, רישום במע\"מ, פתיחת תיק בביטוח לאומי, אפליקציה דיגיטלית לניהול הכנסות והוצאות, ליווי חודשי מלא, והכנת והגשת דוח שנתי."
    },
    {
      question: "מהי תקרת ההכנסה לעוסק פטור?",
      answer: "תקרת ההכנסה לעוסק פטור היא 120,000 ₪ בשנה (נכון ל-2026). אם אתה צפוי להרוויח יותר, יש לשקול מעבר לעוסק מורשה."
    },
    {
      question: "האם צריך רואה חשבון לפתיחת עוסק פטור?",
      answer: "כן, מומלץ מאוד לפתוח עוסק עם רואה חשבון. זה מבטיח שהתהליך נעשה נכון, שמירה על זכויות והטבות, וחיסכון בזמן ובכסף בטווח הארוך."
    },
    {
      question: "מה ההבדל בין עוסק פטור לעוסק מורשה?",
      answer: "עוסק פטור מיועד למי שמרוויח עד 120,000₪ בשנה ולא חייב במע\"מ. עוסק מורשה מיועד למי שמרוויח מעל התקרה וחייב בדיווחי מע\"מ חודשיים/חודשיים."
    },
    {
      question: "האם אפשר לעבוד כשכיר ועוסק פטור במקביל?",
      answer: "כן, אפשר להיות שכיר ועוסק פטור בו-זמנית. צריך לדווח על שני מקורות ההכנסה ולשלם מס בהתאם."
    },
    {
      question: "איך מנהלים את הכנסות והוצאות כעוסק פטור?",
      answer: "אנחנו נותנים אפליקציה דיגיטלית נוחה שבה ניתן לרשום הכנסות והוצאות, להפיק קבלות ולעקוב אחרי המצב העסקי בזמן אמת."
    },
    {
      question: "מתי צריך להגיש דוח שנתי לעוסק פטור?",
      answer: "יש להגיש דוח שנתי עד ה-31 במאי של השנה שלאחר שנת המס. אנחנו מכינים ומגישים את הדוח בשבילך כחלק מהשירות."
    },
    {
      question: "האם יש מס מינימלי שחובה לשלם?",
      answer: "לא, אם אין הכנסות או שההוצאות גבוהות מההכנסות - לא משלמים מס. משלמים מס רק על הרווח בפועל."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/osek-patur" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <SEOOptimized
        title="עוסק פטור בישראל - המדריך המלא למי שמתחיל עסק חדש | Perfect One"
        description="רוצה להתחיל עסק בחוקיות? מדריך שלם על עוסק פטור - היתרונות, החסרונות, התהליך והדרישות. למי זה מתאים וכמה זה עולה באמת."
        keywords="עוסק פטור, הקמת עוסק פטור, מה זה עוסק פטור, תנאים לעוסק פטור, דרישות עוסק פטור, עלות עוסק פטור, מסלול עוסק פטור"
        canonical="https://perfect1.co.il/osek-patur"
        schema={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Perfect One - פתיחת עוסק פטור בישראל",
          "description": "שירות מלא לפתיחת עוסק פטור כולל ליווי חודשי ודוח שנתי",
          "url": "https://perfect1.co.il/osek-patur",
          "telephone": "+972-50-227-7087",
          "priceRange": "₪₪",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IL",
            "addressRegion": "ישראל"
          },
          "areaServed": {
            "@type": "Country",
            "name": "ישראל"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "31.0461",
            "longitude": "34.8516"
          },
          "serviceType": "פתיחת עוסק פטור",
          "provider": {
            "@type": "Organization",
            "name": "Perfect One",
            "sameAs": [
              "https://www.facebook.com/perfect1.co.il",
              "https://www.linkedin.com/company/perfect1",
              "https://www.instagram.com/perfect1.co.il"
            ]
          },
          "offers": {
            "@type": "Offer",
            "price": "249",
            "priceCurrency": "ILS",
            "availability": "https://schema.org/InStock"
          },
          "about": {
            "@type": "Thing",
            "name": "פתיחת עוסק פטור בישראל",
            "description": "שירות מקצועי לפתיחת עוסקים פטורים"
          },
          "isPartOf": {
            "@type": "WebSite",
            "name": "Perfect One",
            "url": "https://perfect1.co.il"
          }
        }}
      />
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'פתיחת עוסק פטור' }
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
                <div className="bg-yellow-400/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-yellow-400/40 inline-flex items-center gap-2">
                  <span className="text-yellow-400 text-sm font-bold">⚠️ שירות פרטי - לא ממשלתי</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                   רוצה עוסק? בואו נעשה את זה נכון מהתחלה
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed font-medium">
                   קבלו הכל מ-יום אפס - סטטוס חוקי, מערכת ניהול ותמיכה רציפה
                </p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-white">
                    {[
                      { icon: CheckCircle, text: 'ליווי מלא' },
                      { icon: Clock, text: 'תהליך מהיר' },
                      { icon: Shield, text: 'בלי בירוקרטיה' },
                      { icon: Star, text: 'שקט נפשי' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5 text-[#27AE60]" />
                        <span className="font-semibold text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button onClick={scrollToForm} className="w-full sm:w-auto h-12 sm:h-14 lg:h-16 px-4 sm:px-8 lg:px-10 text-base sm:text-lg lg:text-xl font-bold rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg">
                    <Target className="ml-2 w-5 h-5" />
                    השאר פרטים
                  </Button>
                  <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-4 sm:px-8 text-base sm:text-lg font-bold rounded-xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-lg">
                      <MessageCircle className="ml-2 w-5 h-5" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center mb-4">
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='8' r='7'/%3E%3Cpolyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88'/%3E%3C/svg%3E"
                      alt="פתיחת עוסק פטור מקצועי"
                      className="w-12 h-12 mx-auto mb-3"
                      width="48"
                      height="48"
                      loading="eager"
                    />
                    <h3 className="text-xl font-black text-[#1E3A5F] mb-1">מתחילים נכון</h3>
                    <p className="text-sm text-gray-600">אנחנו עושים את זה בשבילך</p>
                  </div>

                  <ul className="space-y-2">
                    {[
                      'פתיחת תיק עוסק פטור',
                      'טיפול מול כל הרשויות',
                      'אפליקציה לניהול העסק',
                      'ליווי שוטף + דוח שנתי',
                      'תמיכה אישית'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#27AE60] flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500 mb-2">כבר עזרנו ל-</p>
                    <p className="text-3xl font-black text-[#1E3A5F]">2000+</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Challenge Section */}
         <section className="py-12 bg-white border-t-4 border-[#D4AF37]">
           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-center mb-10"
             >
               <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                 השאלה האמיתית שצריך לשאול
               </h2>
               <p className="text-xl text-gray-600">
                 לא "איך לפתוח עוסק?" אלא <strong className="text-[#D4AF37]">"מי יעזור לי לא לטעות?"</strong>
               </p>
             </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'הבלבול', desc: 'יש המון דרישות, טפסים וגופים - איפה מתחילים?' },
                { title: 'הסיכון', desc: 'טעות קטנה בהגשה יכולה לעלות בהרבה כסף' },
                { title: 'הזמן', desc: 'לא מספיק זמן בין העבודה והנדרש ממנהל עסק' },
                { title: 'השקט הנפשי', desc: 'איך יודעים שעשו נכון ושהם חוקיים באמת?' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-red-50 rounded-xl p-6 border-r-4 border-red-400"
                >
                  <p className="text-lg font-bold text-red-700 mb-2">{item.title}</p>
                  <p className="text-gray-700">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Solution */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-block bg-[#27AE60]/10 text-[#27AE60] px-6 py-2 rounded-full text-sm font-bold mb-6">
                ✨ הפתרון שלך
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#1E3A5F] mb-4">
                כל פתיחת העוסק – במקום אחד
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                אנחנו מטפלים בכל התהליך מול הרשויות, כדי שתוכל להתמקד במה שאתה עושה הכי טוב
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: FileText, title: 'פתיחת עוסק פטור', desc: 'כל התהליך מתבצע בליווי מלא - בלי ריצות' },
                { icon: Users, title: 'טיפול מול כל הרשויות', desc: 'מס הכנסה, מע"מ וביטוח לאומי - אנחנו מטפלים בהכל' },
                { icon: Smartphone, title: 'אפליקציה לניהול העסק', desc: 'מערכת דיגיטלית לניהול הכנסות, הוצאות והפקת קבלות' },
                { icon: TrendingUp, title: 'ליווי חודשי מלא', desc: 'ליווי שוטף מול הרשויות ומענה לכל שאלה' },
                { icon: FileText, title: 'הכנת דוח שנתי', desc: 'אנחנו מכינים ומגישים את הדוח השנתי בשבילך' },
                { icon: Shield, title: 'שקט נפשי מלא', desc: 'עובדים חוקית ומסודרים מהיום הראשון' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#27AE60]/20"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2 leading-tight">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-Page Strong CTA */}
        <section className="py-12 bg-gradient-to-br from-[#27AE60] to-[#229954]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-bold mb-6 border border-white/30">
                ⏰ מוכן להתחיל?
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                רוצה לפתוח עוסק פטור ולהתחיל לעבוד?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                השאר פרטים ונחזור אליך תוך שעות - ללא התחייבות
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
               <Button onClick={scrollToForm} className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-xl bg-white text-[#27AE60] hover:bg-white/90 shadow-lg">
                 <Target className="ml-2 w-5 h-5" />
                 השאר פרטים
               </Button>
               <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                 <Button className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-lg">
                   <MessageCircle className="ml-2 w-5 h-5" />
                   WhatsApp
                 </Button>
               </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                מה כולל השירות?
              </h2>
              <p className="text-xl text-gray-600">הכל שקוף - בואו נראה מה אתם מקבלים</p>
            </motion.div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#1E3A5F]/10">
              <ul className="grid md:grid-cols-2 gap-6">
                {[
                  'פתיחת תיק עוסק פטור',
                  'טיפול מלא מול כל הרשויות',
                  'אפליקציה לניהול הכנסות והוצאות',
                  'ליווי חודשי מלא',
                  'הכנת והגשת דוח שנתי',
                  'תמיכה אישית ושקט נפשי'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#27AE60] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-800">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Who Is This For */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                למי זה מתאים?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Briefcase, text: 'עצמאיים בתחילת הדרך' },
                { icon: Users, text: 'פרילנסרים ונותני שירותים' },
                { icon: Award, text: 'בעלי מקצוע' },
                { icon: Target, text: 'כל מי שצריך לפתוח עוסק פטור ולהתחיל לעבוד' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-[#27AE60]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#27AE60]" />
                    </div>
                    <p className="text-lg font-bold text-gray-800">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Perfect One */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] px-6 py-2 rounded-full text-sm font-bold mb-6">
                ⭐ למה Perfect One
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                Perfect One – הבית לעצמאיים
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: Award, title: 'ניסיון בליווי אלפי עצמאיים', desc: 'עזרנו ל-2000+ עצמאיים להתחיל נכון' },
                { icon: Target, title: 'התמחות בעוסקים קטנים', desc: 'אנחנו מתמחים בפתיחת עוסקים קטנים ובינוניים' },
                { icon: MessageCircle, title: 'שירות אישי וברור', desc: 'ללא חאפרות, בשפה פשוטה ונגישה' },
                { icon: Shield, title: 'שקיפות ושקט נפשי', desc: 'מחיר ברור, ליווי מלא, בלי הפתעות' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center mb-2 md:mb-3">
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-[#1E3A5F]" />
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-[#1E3A5F] mb-1 leading-tight">{item.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-snug">{item.desc}</p>
                </motion.div>
              ))}
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
                מוכן לפתוח עוסק פטור?
              </h2>
              <p className="text-xl text-white/90">מלא פרטים ונחזור אליך תוך שעות</p>
            </motion.div>

            {isSuccess ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                <p className="text-gray-600">נחזור אליך בקרוב ונתחיל את התהליך</p>
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">מייל *</label>
                    <Input
                      type="email"
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white"
                  >
                    {isSubmitting ? 'שולח...' : 'הגשת פרטים'}
                  </Button>



                  <p className="text-xs text-gray-500 text-center mt-4">
                    ללא התחייבות • שיחה קצרה • הסבר מלא לפני כל תשלום
                  </p>
                  </form>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                עוד שאלות נפוצות
              </h2>
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

        {/* Scroll to Top */}
        <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-16 px-10 text-xl font-bold rounded-2xl bg-[#1E3A5F] hover:bg-[#2C5282] text-white"
            >
              חזרה לתחילת הדף
            </Button>
          </div>
        </section>

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
                חיפשת פתיחת עוסק פטור – הגעת למקום הנכון
              </h2>
              <p className="text-xl text-white/90 mb-8">
                אנחנו עושים את זה בשבילך, <strong>עכשיו</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={scrollToForm} className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                  <Target className="ml-3 w-6 h-6" />
                  השאר פרטים עכשיו
                </Button>
                <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פנייה מיידית בווצאפ
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