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
  const [showPopup, setShowPopup] = useState(false);
  const [popupFormData, setPopupFormData] = useState({ name: '', phone: '', email: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('אנא מלא שם וטלפון');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use backend function to bypass RLS for public users
      await base44.functions.invoke('submitLead', {
        ...formData,
        source_page: 'דף נחיתה - פתיחת עוסק פטור',
        status: 'new'
      });

      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
      alert('אירעה שגיאה בשליחת הטופס. אנא נסה שוב או צור קשר בטלפון.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    setShowPopup(false);
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePopupSubmit = async (e) => {
    e.preventDefault();
    if (!popupFormData.name || !popupFormData.phone) {
      alert('אנא מלא שם וטלפון');
      return;
    }

    try {
      // Use backend function to bypass RLS for public users
      await base44.functions.invoke('submitLead', {
        ...popupFormData,
        source_page: 'פופאפ - 35% גלילה',
        status: 'new'
      });
      setShowPopup(false);
      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
      alert('שגיאה בשליחה, אנא נסה שוב');
    }
  };

  // Sticky CTA Logic & Popup Trigger
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [popupShown, setPopupShown] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.scrollY + window.innerHeight;
      const scrollPercentage = (scrollPosition / scrollHeight) * 100;
      
      setShowStickyCTA(window.scrollY > 500);
      
      // Show popup at 35% scroll
      if (scrollPercentage >= 35 && !popupShown) {
        setShowPopup(true);
        setPopupShown(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popupShown]);

  const faqs = [
    {
      question: "מה בדיוק הבדל בין עוסק פטור לעוסק מורשה?",
      answer: "עוסק פטור - עד 120K בשנה, בלי מע\"מ, לא צריך דוחות מע\"מ חודשיים. עוסק מורשה - מעל 120K, חייב בדוחות מע\"מ חודשיים. שלנו - אנחנו יודעים בדיוק מה מתאים לכם."
    },
    {
      question: "אני עוסק פטור - צריך לשלם ביטוח לאומי?",
      answer: "כן, אבל בתעריף נמוך יותר מעוסקים מורשים. אנחנו עושים את החישוב בשבילך ודואגים שלא תעברו דרך דלת."
    },
    {
      question: "מה קורה אם הכנסותיי עלו למעל 120K באמצע השנה?",
      answer: "צריך לעבור לעוסק מורשה. אנחנו מטפלים בהמרה הזאת - זה לא נורא, זה אפילו טוב (יותר אופציות)."
    },
    {
      question: "כמה עולה ליווי עוסק פטור בחודש?",
      answer: "התמחה שלנו זה עוסקים קטנים - כ-99₪ בחודש כולל דוחות, תשובות לשאלות וויסות של מצב. בכלל זול."
    },
    {
      question: "האם אוכל להעביר את החשבונות שלי מרואה חשבון אחר?",
      answer: "בהחלט. אנחנו ניקח את הקובץ המתודולוגי שלך והמשיכנו משם. לא צריך לשרוט הכל מהתחלה."
    },
    {
      question: "מה קורה אם יש לי שאלה בשבת או חג?",
      answer: "אנחנו משיבים בתחילת יום העסקים הבא. עוד משהו - למה לא להשאיר הודעה בוואטס? כשנבחזור אתם תקבלו תשובה מלאה."
    },
    {
      question: "האם אני יכול לעשות בעצמי את הדוח השנתי?",
      answer: "טכנית - כן. אבל אנחנו כבר מכינים אותו (זה כבר בחוזה). לא כדאי לעשות בעצמך - סיכון לטעויות שאומדות הרבה יותר מהליווי."
    },
    {
      question: "מה אם לא עמדתי בדדליין הגשת דוח?",
      answer: "אנחנו דואגים שזה לא יקרה, אבל אם קרה - יש דרכים להאריך. ישנם קנסות, אבל אנחנו יודעים איך להוריד אותם."
    },
    {
      question: "צריך לשמור על קבלות?",
      answer: "כן, צריך. אנחנו עוזרים לך לארגן את זה בצורה ספרתית - פשוט צלם את הקבלה ועלה לאפליקציה."
    },
    {
      question: "האם יש דרך להעביר לקוח שלי אישור רשמי?",
      answer: "כן - אנחנו מציאים הצעה רשמית עם חתימה דיגיטלית. זה משנה את כל אחד שניה עם הלקוחות."
    },
    {
      question: "מה אם יש לי הכנסות מחו\"ל?",
      answer: "צריך לדווח עליהם בדוח - זה מסבך קצת את החישובים, אבל זה ניתן. אנחנו עושים את זה."
    },
    {
      question: "אני יכול לפתוח אפילו עוסק פטור עבור בן או בת שלי?",
      answer: "לא ממש - עוסק פטור הוא תיק אישי. אבל אם בן/ת שלך רוצה להתחיל עוסק, אנחנו עוזרים גם לו/ה."
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
      <main className="pt-14 md:pt-20 bg-[#F8F9FA]">
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
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

           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
             <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
               <motion.div
                 initial={{ opacity: 0, x: -50 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="text-center lg:text-right"
               >


                 <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 md:mb-6">
                    <span className="text-[#27AE60] block md:inline">פתיחת עוסק פטור</span> פשוט, מהיר וחוקי
                 </h1>

                 <p className="text-lg md:text-2xl text-white/90 mb-6 leading-relaxed font-medium px-2 md:px-0">
                    הדרך המהירה והקלה ביותר לפתוח עוסק פטור - אנחנו נטפל בבירוקרטיה, אתם תתחילו להרוויח
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
                  <Button onClick={scrollToForm} className="w-full sm:w-auto h-12 sm:h-14 lg:h-16 px-4 sm:px-8 lg:px-10 text-base sm:text-lg lg:text-xl font-bold rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg shadow-green-900/20 transform hover:-translate-y-1 transition-all">
                    <Target className="ml-2 w-5 h-5" />
                    פתיחת עוסק פטור בקליק
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
                    <h3 className="text-xl font-black text-[#1E3A5F] mb-1">יוצאים לדרך</h3>
                    <p className="text-sm text-gray-600">הדרך הקלה להיות עצמאי</p>
                  </div>

                  <ul className="space-y-2">
                    {[
                       'פתיחת התיק מול כל הרשויות',
                       'טיפול מלא בבירוקרטיה',
                       'אפליקציה להפקת קבלות',
                       'ראש שקט ממס הכנסה',
                       'מענה אנושי מקצועי'
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

        {/* Search Intent Section */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50 border-t-4 border-[#D4AF37]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-2">
                גם אתה חיפשת את זה?
              </h2>
              <p className="text-lg text-gray-500 font-medium">השאלות שכולם שואלים בגוגל</p>
            </motion.div>

            <div className="space-y-4 mb-12">
              {[
                "איך פותחים עוסק פטור?",
                "עוסק פטור או מורשה?",
                "צריך רואה חשבון לפתיחת עוסק?",
                "כמה זמן לוקח לפתוח עוסק פטור?",
                "איך מתחילים לעבוד חוקי?"
              ].map((query, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl px-6 py-4 flex justify-between items-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-default"
                >
                  <span className="text-lg text-gray-700 font-medium">{query}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[#E8F5E9] rounded-3xl p-8 text-center border border-[#27AE60]/20"
            >
              <h3 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                במקום לחפש תשובות –
                <span className="block text-[#27AE60]">אנחנו עושים את זה בשבילך.</span>
              </h3>
              <button 
                onClick={scrollToForm}
                className="mt-6 inline-flex items-center text-[#27AE60] font-bold text-lg hover:underline hover:text-[#219150] transition-colors"
              >
                בואו נתחיל
                <ArrowLeft className="mr-2 w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* How We Solve It */}
         <section className="py-10 md:py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-center mb-8 md:mb-12"
             >
               <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold mb-4 md:mb-6 shadow-sm">
                 ✅ הפתרון שעבד לאלפים
               </div>
               <h2 className="text-2xl md:text-5xl font-black text-[#1E3A5F] mb-3 md:mb-4 leading-tight">
                 עצמאי? פותחים עוסק פטור עם ליווי מלא
               </h2>
               <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 md:px-0">
                 מתאים לעצמאים בתחילת הדרך - הסבר מלא וליווי אישי מרגע ההחלטה
               </p>
             </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: AlertCircle, title: 'יתרון #1: אפס טעויות בהגשה', desc: 'אנחנו בודקים כל טופס בקפדנות לפני השליחה כדי להבטיח אישור מהיר וחלק' },
                { icon: Clock, title: 'יתרון #2: פתיחה מהירה', desc: 'במקום להמתין שבועות, אנחנו מזרזים את התהליך מול הרשויות וחוסכים לכם זמן יקר' },
                { icon: TrendingUp, title: 'יתרון #3: מעטפת ליווי מלאה', desc: 'אנחנו דואגים לכל הדיווחים השוטפים ולדוחות השנתיים, כדי שתוכלו להתמקד בעבודה' },
                { icon: Shield, title: 'יתרון #4: שקיפות מלאה', desc: 'עדכונים שוטפים בזמן אמת - תמיד תדעו בדיוק מה קורה עם התיק שלכם ומה הצעד הבא' },
                { icon: FileText, title: 'יתרון #5: טכנולוגיה מתקדמת', desc: 'אפליקציה ייעודית וקלה לשימוש למעקב אחר הכנסות והוצאות מכל מקום ובכל זמן' },
                { icon: Award, title: 'יתרון #6: מומחיות וניסיון', desc: 'עם ניסיון של מעל 2,000 עצמאים, אנחנו מכירים את כל הניואנסים הקטנים שחוסכים כסף' }
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

        {/* Proof Section */}
         <section className="py-12 bg-gradient-to-br from-blue-600 to-blue-700">
           <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
             >
               <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-bold mb-6 border border-white/30">
                 📊 הוכחה שזה עובד
               </div>
               <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                 2,000+ עצמאים בחרו בנו להיות הביטחון שלהם
               </h2>
               <p className="text-xl text-white/90 mb-8">
                 בכל חודש משלוש עצמאיים חדשים בוחרים בנו להיות החברה שלהם בדרך
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
                 פתיחת תיק עוסק פטור - תהליך ברור וביטוח מלא
               </h2>
               <p className="text-xl text-gray-600">ליווי שוטף + דוח שנתי + אפליקציה לניהול העסק - הכל בחבילה אחת</p>
             </motion.div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#1E3A5F]/10">
              <ul className="grid md:grid-cols-2 gap-6">
                {[
                  'פתיחת תיק עוסק פטור',
                  'ליווי מול כל הרשויות',
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
                 פתיחת עוסק פטור אונליין עם ליווי אנושי ומענה לשאלות
               </h2>
               <p className="text-lg text-gray-600">למי זה מתאים? עצמאים, פרילנסרים ונותני שירותים בכל תחום</p>
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

        {/* Why Different */}
         <section className="py-12 bg-white">
           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-center mb-10"
             >
               <div className="inline-block bg-purple-100 text-purple-700 px-6 py-2 rounded-full text-sm font-bold mb-6">
                 🎯 מה שונה בנו
               </div>
               <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                 ליווי בפתיחת עוסק פטור - מקצועיות וניסיון שעובד
               </h2>
             </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: Users, title: 'אנחנו עצמאיים', desc: 'מבינים בעומק את הקשיים שלך - אנחנו עברנו בדיוק באותו דרך' },
                { icon: Zap, title: 'שירות אישי ומקצועי', desc: 'כל קליינט משיג תשומת לב הייעודית - לא מחסום טלפוני' },
                { icon: Briefcase, title: 'אפליקציה משלנו', desc: 'לא צריך אפליקציות מרובות - הכל במקום אחד' },
                { icon: Award, title: 'אחריות מלאה', desc: 'אנחנו עומדים מאחוריך - יעילות מובטחת ותמיכה מקצועית' }
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
        <section className="py-8 md:py-20 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847]" id="contact-form">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-center lg:text-right"
              >
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 lg:mb-6 leading-tight">
                  מתחילים עסק? <br className="hidden lg:block"/>
                  פתיחת עוסק פטור עם בטחון מלא
                </h2>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-6 lg:mb-8 max-w-lg mx-auto lg:mx-0">
                  השאירו פרטים ותקבלו שיחה ישירה - כדי לדעת בדיוק איפה אתם עומדים ומה הצעד הבא.
                </p>

                <div className="hidden lg:flex flex-col gap-4 text-white/80">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                       <Shield className="w-6 h-6 text-[#27AE60]" />
                     </div>
                     <span className="text-lg">בלי טרטורים ובירוקרטיה</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                       <Zap className="w-6 h-6 text-[#D4AF37]" />
                     </div>
                     <span className="text-lg">תהליך מהיר ומדויק</span>
                   </div>
                </div>
              </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
               {isSuccess ? (
                 <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                   <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                     <CheckCircle className="w-10 h-10 text-green-500" />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                   <p className="text-gray-600">נחזור אליך בקרוב ונתחיל את התהליך</p>
                 </div>
               ) : (
                 <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-8 border-2 border-[#D4AF37]/30">
                   <form onSubmit={handleSubmit} className="space-y-3">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">שם מלא *</label>
                        <Input
                          placeholder="איך קוראים לך?"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-11 md:h-12 rounded-xl border-2 text-base shadow-sm focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">טלפון *</label>
                        <Input
                          type="tel"
                          placeholder="050-1234567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-11 md:h-12 rounded-xl border-2 text-base shadow-sm focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">מייל *</label>
                        <Input
                          type="email"
                          placeholder="example@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-11 md:h-12 rounded-xl border-2 text-base shadow-sm focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">סוג עיסוק (לא חובה)</label>
                        <Input
                          placeholder="למשל: צלם, מעצב..."
                          value={formData.profession}
                          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                          className="h-11 md:h-12 rounded-xl border-2 text-base shadow-sm focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all"
                        />
                      </div>

                     <Button
                       type="submit"
                       disabled={isSubmitting}
                       className="w-full h-12 md:h-14 text-base md:text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white mt-2"
                     >
                       {isSubmitting ? 'שולח...' : 'לפתיחת עוסק פטור'}
                     </Button>

                     <p className="text-xs text-gray-500 text-center mt-3">
                       ללא התחייבות • שיחה קצרה • הסבר מלא לפני כל תשלום
                     </p>
                     </form>
                 </div>
               )}
             </motion.div>
            </div>
         </div>
        </section>

        {/* Testimonials Section - NEW */}
        <section className="py-12 md:py-20 bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-black text-[#1E3A5F] mb-3 md:mb-4">מה אומרים עלינו?</h2>
              <p className="text-lg md:text-xl text-gray-600 px-4">אלפי עצמאים כבר פתחו עוסק פטור איתנו. הנה כמה מהם:</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  text: "פשוט הצילו אותי. לא הבנתי כלום מהטפסים של מס הכנסה, הם עשו הכל תוך יום אחד. השירות הכי יעיל שנתקלתי בו.",
                  name: "דניאל כהן",
                  role: "מעצב גרפי",
                  stars: 5
                },
                {
                  text: "החשש הכי גדול שלי היה לעשות טעות מול הרשויות. הצוות של Perfect One נתן לי ביטחון מלא וליווי אישי מדהים.",
                  name: "שרה לוי",
                  role: "קוסמטיקאית",
                  stars: 5
                },
                {
                  text: "האפליקציה שלהם גאונית! אני מצלם קבלות והכל מסודר. שווה כל שקל רק בשביל השקט הנפשי הזה.",
                  name: "עומר יוסף",
                  role: "מאמן כושר אישי",
                  stars: 5
                }
              ].map((review, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative"
                >
                  <div className="absolute -top-4 right-8 text-6xl text-[#D4AF37] opacity-20 font-serif">"</div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.stars)].map((_, s) => (
                      <Star key={s} className="w-5 h-5 text-[#D4AF37] fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[#1E3A5F]">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[#1E3A5F]">{review.name}</p>
                      <p className="text-sm text-gray-500">{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
        <section className="py-16 bg-gradient-to-br from-orange-500 to-red-600 relative overflow-hidden">
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
                עוסק פטור לעצמאים ופרילנסרים - ליווי מלא לאורך הדרך
              </h2>
              <p className="text-xl text-white/90 mb-8">
                בואו נעזור לכם להתחיל נכון - שיחה קצרה וחינם, בלי התחייבות, בלי בירוקרטיה
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

      {/* Popup Modal - 35% Scroll */}
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <h3 className="text-xl md:text-2xl font-black text-[#1E3A5F] mb-3 pr-8">
              רגע לפני שממשיכים 👋
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">
              מתלבטים אם עוסק פטור מתאים לכם? השאירו פרטים ומומחה שלנו יעשה לכם סדר בחינם.
            </p>

            <form onSubmit={handlePopupSubmit} className="space-y-3">
              <div>
                <Input
                  placeholder="שם מלא *"
                  value={popupFormData.name}
                  onChange={(e) => setPopupFormData({ ...popupFormData, name: e.target.value })}
                  className="h-12 rounded-xl border-2 text-base shadow-sm focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <Input
                  type="tel"
                  placeholder="טלפון *"
                  value={popupFormData.phone}
                  onChange={(e) => setPopupFormData({ ...popupFormData, phone: e.target.value })}
                  className="h-12 rounded-xl border-2 text-base shadow-sm focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg shadow-green-900/10"
              >
                לפתיחת עוסק פטור
              </Button>

              <p className="text-xs text-gray-500 text-center mt-2">
                * ללא עלות וללא התחייבות
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Sticky Mobile CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showStickyCTA ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 md:hidden flex gap-3 safe-area-bottom"
      >
        <Button 
          onClick={scrollToForm}
          className="flex-1 h-12 text-lg font-bold rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-md"
        >
          פתיחת עוסק פטור
        </Button>
        <a href="https://wa.me/972502277087?text=היי, אשמח לפרטים על פתיחת עוסק פטור" target="_blank" rel="noopener noreferrer" className="flex-none">
          <Button variant="outline" className="h-12 w-12 rounded-xl border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 p-0 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </a>
      </motion.div>
    </>
  );
}