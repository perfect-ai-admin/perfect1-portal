import React from 'react';
import { motion } from 'framer-motion';
import {
  Presentation, FileSpreadsheet, Zap, Target,
  TrendingUp, Users, MessageSquare, Award,
  CheckCircle2, ArrowLeft, Brain, Share2,
  Briefcase, DollarSign, Clock, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import SEOHead from '@/components/seo/SEOHead';

import { getSignupUrl } from '@/components/utils/tracking';

const presentationSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "מצגת עסקית ומצגת משקיעים עם AI",
  "description": "יצירת מצגת עסקית מקצועית או מצגת משקיעים תוך 30 שניות עם בינה מלאכותית. כולל עיצוב, קופירייטינג וניתוח נתונים מאקסל.",
  "brand": { "@type": "Brand", "name": "ClientDashboard" },
  "url": "https://perfect-dashboard.com/BusinessPresentation",
  "offers": {
    "@type": "Offer",
    "price": "149",
    "priceCurrency": "ILS",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "155"
  }
};

const presentationFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "כמה עולה מצגת עסקית?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "מצגת עסקית ב-ClientDashboard עולה 149 שקל בתשלום חד פעמי. לעומת מעצב פרילנסר שגובה 3,000-10,000 שקל, זה חיסכון משמעותי."
      }
    },
    {
      "@type": "Question",
      "name": "כמה זמן לוקח ליצור מצגת עסקית?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "המצגת נוצרת תוך 30 שניות. ממלאים שאלון קצר או מעלים קובץ אקסל, וה-AI מנתח את הנתונים ובונה מצגת מעוצבת ומשכנעת."
      }
    },
    {
      "@type": "Question",
      "name": "האם אפשר ליצור מצגת משקיעים?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן, המערכת תומכת ב-3 סוגי מצגות: מצגת מכירה, מצגת משקיעים (Pitch Deck) ומצגת אסטרטגית. כל סוג מותאם למטרה שלו עם מבנה ומסרים שונים."
      }
    },
    {
      "@type": "Question",
      "name": "האם אפשר לערוך את המצגת?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן, המצגת מתקבלת בפורמט פתוח שמאפשר לדייק ניסוחים, להחליף תמונות או לשנות נתונים בקלות."
      }
    },
    {
      "@type": "Question",
      "name": "האם המצגת מתאימה גם לעסקים קטנים?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "במיוחד לעסקים קטנים. המצגת מאפשרת להיראות כמו חברה גדולה ומסודרת, בלי להוציא תקציבים גדולים על מיתוג."
      }
    }
  ]
};

const reasons = [
  {
    icon: Clock,
    title: "קיצור תהליך שכנוע",
    desc: "מצגת טובה חוסכת הסברים, מיישרת קו ועונה על התנגדויות מראש. במקום 'תן לי לחשוב על זה', הלקוח אומר 'אוקיי, הבנתי'."
  },
  {
    icon: MessageSquare,
    title: "שליטה בנרטיב",
    desc: "בלי מצגת הלקוח מפרש לבד. עם מצגת - אתה קובע מה חשוב, מה הסדר ומה המסקנה הסופית."
  },
  {
    icon: Share2,
    title: "עובד גם כשאתה לא בחדר",
    desc: "המצגת נשלחת בווטסאפ ועוברת בין שותפים. היא מוכרת עבורך גם כשאתה לא שם לדבר."
  },
  {
    icon: Award,
    title: "מראה רצינות ובשלות",
    desc: "עסק בלי מצגת נתפס כחובבני. מצגת חדה משדרת 'הבן אדם יודע מה הוא עושה', גם אם המוצר זהה."
  },
  {
    icon: TrendingUp,
    title: "מינוף הזדמנויות",
    desc: "פגישה עם משקיע, מכרז או לקוח גדול - אלו הזדמנויות שלא חוזרות. מצגת טובה מבטיחה שלא תפספס."
  }
];

const processSteps = [
  {
    step: "1",
    title: "שאלון או העלאת נתונים",
    desc: "עונים על שאלות אפיון קצרות או מעלים קובץ אקסל עם הנתונים הגולמיים שלכם."
  },
  {
    step: "2",
    title: "ה-AI מנתח ולומד",
    desc: "הבינה המלאכותית מנתחת את המספרים, מזקקת את המסרים ובונים את הסיפור העסקי."
  },
  {
    step: "3",
    title: "מצגת מוכנה ב-30 שניות",
    desc: "מקבלים מצגת מעוצבת, משכנעת ומקצועית שמוכנה להצגה או לשליחה למשקיעים ולקוחות."
  }
];

const useCases = [
  {
    title: "מצגת מכירה",
    features: ["חידוד מסר", "בניית זרימה", "הנעה לפעולה ברורה"],
    target: "לפגישות ומכירות"
  },
  {
    title: "מצגת משקיעים",
    features: ["סיפור עסקי", "הצגת נתונים פיננסיים", "למה דווקא אתה"],
    target: "לגיוס הון ושותפים"
  },
  {
    title: "מצגת אסטרטגית",
    features: ["סדר בראש", "קבלת החלטות", "מפת דרכים"],
    target: "לניהול ומיקוד פנימי"
  }
];

const comparisonData = [
  { param: "זמן עבודה", us: "30 שניות", agency: "שבועיים עד חודש", diy: "שעות של תסכול" },
  { param: "עלות", us: "₪149 בלבד", agency: "₪3,000 - ₪10,000", diy: "חינם (אבל יקר בזמן)" },
  { param: "תוכן וקופי", us: "AI כותב עבורך", agency: "תלוי בקופירייטר", diy: "אתה כותב לבד" },
  { param: "עיצוב", us: "נקי ומקצועי", agency: "תלוי במעצב", diy: "תבנית גנרית" },
  { param: "מיקוד", us: "תוצאה עסקית", agency: "נראות ויזואלית", diy: "לסיים עם זה כבר" },
];

const faqs = [
  {
    q: "האם אפשר לערוך את המצגת אחרי שהיא נוצרת?",
    a: "כן, בהחלט. המצגת מתקבלת בפורמט פתוח שמאפשר לך לדייק ניסוחים, להחליף תמונות או לשנות נתונים בקלות."
  },
  {
    q: "האם אפשר להשתמש בנתונים מאקסל?",
    a: "כן! המערכת יודעת לקרוא קבצי אקסל, לנתח את הנתונים ולהציג אותם בגרפים וטבלאות ברורות בתוך המצגת."
  },
  {
    q: "למה המחיר כל כך נמוך?",
    a: "אנחנו משתמשים בטכנולוגיית AI שמחליפה עבודת ידיים יקרה. במקום לשלם למעצבים וקופירייטרים, הטכנולוגיה עושה את העבודה ב-30 שניות, ואנחנו מגלגלים את החיסכון אליך."
  },
  {
    q: "האם זה מתאים גם לעסקים קטנים?",
    a: "במיוחד לעסקים קטנים. זה הכלי שמאפשר לכם להיראות כמו חברה גדולה ומסודרת, בלי להוציא תקציבי עתק על מיתוג."
  }
];

export default function BusinessPresentationPage() {
  const SIGNUP_URL = getSignupUrl();
  return (
    <>
      <SEOHead
        title="מצגת עסקית | מצגת משקיעים מקצועית עם AI ב-149 שקל - ClientDashboard"
        description="צור מצגת עסקית או מצגת משקיעים מקצועית תוך 30 שניות. עיצוב מותאם, קופירייטינג AI וניתוח נתונים מאקסל. מצגת מכירה, Pitch Deck ומצגת אסטרטגית."
        canonical="/BusinessPresentation"
        keywords="מצגת עסקית, מצגת משקיעים, עיצוב מצגת, מצגת מכירה, Pitch Deck, מצגת עסקית לדוגמא, מצגת למשקיעים, מצגת מקצועית"
        schema={[presentationSchema, presentationFAQSchema]}
      />
      <Header />
      <main className="pt-20 bg-white font-sans overflow-x-hidden">

        {/* HERO SECTION */}
        <section className="relative pt-8 pb-12 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/30 blur-[100px] rounded-full -z-10" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 blur-[100px] rounded-full -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-6">
                <Brain className="w-4 h-4" />
                <span>ה-AI הופך נתונים לסיפור הצלחה</span>
              </div>
              
              <h1 className="text-3xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-4 md:mb-6">
                מצגת עסקית שסוגרת עסקאות<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                   מוכנה ב-30 שניות
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 font-light max-w-3xl mx-auto mb-10 leading-relaxed">
                במקום לבזבז ימים על עיצוב או אלפי שקלים לסוכנות, 
                המערכת שלנו תיקח את הרעיונות והנתונים שלך ותהפוך אותם למצגת מנצחת.
                <span className="font-bold text-gray-900 block mt-2">בעלות חד פעמית של 149 ₪.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={SIGNUP_URL}>
                  <Button className="h-14 px-8 text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 w-full sm:w-auto">
                    צור מצגת עסקית עכשיו
                    <Presentation className="mr-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Enhanced Presentation Visual */}
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-16 relative mx-auto max-w-5xl"
            >
              <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 aspect-[16/9] md:aspect-[21/9] overflow-hidden flex items-center justify-center">
                
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/50 to-blue-50/50" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Main Slide Preview */}
                <div className="relative z-10 w-[85%] md:w-[70%] aspect-[16/9] bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transform transition-all hover:scale-[1.02] duration-500">
                    {/* Slide Header */}
                    <div className="h-10 md:h-14 border-b border-gray-50 flex items-center justify-between px-4 md:px-6 bg-gradient-to-r from-gray-50 to-white">
                        <div className="w-16 md:w-20 h-3 md:h-4 bg-gray-200 rounded-full" /> {/* Logo placeholder */}
                        <div className="text-[8px] md:text-[10px] text-gray-400 font-mono">CONFIDENTIAL</div>
                    </div>
                    
                    {/* Slide Content */}
                    <div className="flex-1 p-4 md:p-8 grid grid-cols-2 gap-4 md:gap-8">
                        <div className="flex flex-col justify-center space-y-2 md:space-y-4">
                            <div className="h-6 md:h-8 w-3/4 bg-indigo-900/10 rounded-lg mb-1 md:mb-2" /> {/* Title */}
                            <div className="space-y-2 md:space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-2 md:gap-3">
                                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600" />
                                        </div>
                                        <div className="h-2 md:h-3 w-full bg-gray-100 rounded-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 md:mt-4 inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg w-fit">
                                <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                <span className="text-[9px] md:text-[10px] font-bold">נוסח ע"י AI</span>
                            </div>
                        </div>
                        
                        {/* Chart Area */}
                        <div className="bg-gray-50 rounded-xl p-2 md:p-4 flex items-end justify-between gap-1 md:gap-2 border border-gray-100 relative overflow-hidden">
                             {/* Mock Chart */}
                             {[40, 70, 50, 90, 65].map((h, i) => (
                                 <div key={i} className="w-full bg-indigo-500 rounded-t-sm opacity-90 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
                             ))}
                             {/* Data Label */}
                             <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/90 backdrop-blur shadow-sm px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[8px] md:text-[10px] font-bold text-gray-600 flex items-center gap-1">
                                <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-500" />
                                +127% צמיחה
                             </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements / Thumbnails - Hidden on mobile, visible on lg */}
                <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-4 opacity-40 blur-[0.5px]">
                     {[1, 2].map(i => (
                         <div key={i} className="w-24 aspect-[16/9] bg-white rounded-lg border border-gray-200 shadow-sm" />
                     ))}
                </div>

                 <div className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col gap-4 opacity-40 blur-[0.5px]">
                     {[3, 4].map(i => (
                         <div key={i} className="w-24 aspect-[16/9] bg-white rounded-lg border border-gray-200 shadow-sm" />
                     ))}
                </div>

                {/* Badges */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-4 md:bottom-6 right-4 md:right-8 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-100/50"
                >
                    <FileSpreadsheet className="w-3 h-3 md:w-4 md:h-4" />
                    <span>הנתונים נשאבו מאקסל</span>
                    <span className="flex h-2 w-2 relative ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute top-4 md:top-6 left-4 md:left-8 bg-white text-indigo-600 border border-indigo-100 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-xl"
                >
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-600 animate-pulse" />
                    עיצוב מותאם אישית
                </motion.div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* WHY YOU NEED IT */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">למה זה קריטי לעסק?</h2>
              <p className="text-xl text-gray-500">זה לא רק שקפים יפים, זה כלי לסגירת עסקאות</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reasons.map((reason, idx) => (
                <div key={idx} className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-indigo-600">
                    <reason.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{reason.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{reason.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE PROCESS */}
        <section className="py-12 md:py-20 bg-[#0F172A] text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">איך זה עובד?</h2>
              <p className="text-xl text-gray-400">מהרעיון בראש שלך למצגת מוכנה בדקות</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-12 right-0 left-0 h-0.5 bg-gradient-to-l from-indigo-900 via-indigo-500 to-indigo-900" />

                {processSteps.map((item, i) => (
                  <div key={i} className="relative flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-6 relative z-10 shadow-xl shadow-indigo-900/20 group hover:border-indigo-500 transition-colors">
                      <span className="text-4xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">{item.step}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed max-w-xs">{item.desc}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* PRODUCT TYPES / USE CASES */}
        <section className="py-20 bg-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">לא סתם "מצגת", מוצר מדויק</h2>
              <p className="text-xl text-gray-500">בחר את סוג המצגת שאתה צריך, וה-AI יתאים את המבנה והמסר</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100 hover:shadow-xl transition-all">
                  <div className="text-sm font-bold text-indigo-500 bg-indigo-50 w-fit px-3 py-1 rounded-full mb-4">
                    {useCase.target}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{useCase.title}</h3>
                  <ul className="space-y-3 mb-8">
                    {useCase.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={SIGNUP_URL}>
                    <Button variant="outline" className="w-full rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                      בחר מסלול זה
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-12 lg:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">השוואה פשוטה</h2>
              <p className="text-xl text-gray-500">למה אנשים חכמים בוחרים ב-AI שלנו</p>
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-4 bg-gray-900 text-white p-3 md:p-8 text-center font-bold text-[10px] md:text-lg items-center">
                <div className="text-right">נושא</div>
                <div className="text-indigo-400 bg-indigo-900/30 py-1 px-1 md:px-2 rounded-lg border border-indigo-500/30 break-words">
                   <span className="md:hidden">אנחנו</span>
                   <span className="hidden md:inline">ClientDashboard</span>
                </div>
                <div className="text-gray-400">
                   <span className="md:hidden">פרילנסר</span>
                   <span className="hidden md:inline">מעצב פרילנסר</span>
                </div>
                <div className="text-gray-400">DIY (לבד)</div>
              </div>

              {comparisonData.map((row, idx) => (
                <div key={idx} className="grid grid-cols-4 p-3 md:p-8 border-b border-gray-100 hover:bg-indigo-50/10 transition-colors items-center text-center text-[10px] md:text-base">
                  <div className="font-bold text-gray-900 text-right leading-tight">{row.param}</div>
                  <div className="font-bold text-indigo-700 bg-indigo-50 py-1 md:py-2 px-1 rounded-lg md:rounded-xl flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 leading-tight">
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span>{row.us}</span>
                  </div>
                  <div className="text-gray-500 leading-tight px-1">{row.agency}</div>
                  <div className="text-gray-500 leading-tight px-1">{row.diy}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">שאלות נפוצות</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-white border border-gray-100 rounded-2xl px-6 data-[state=open]:shadow-md transition-all">
                  <AccordionTrigger className="text-right text-lg font-bold text-gray-900 hover:text-indigo-600 hover:no-underline py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-lg pb-6 pr-4 border-r-2 border-indigo-200">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-12 md:py-20 relative overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-900">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
            <h2 className="text-4xl md:text-6xl font-black mb-6">אל תגיע לפגישה הבאה בידיים ריקות</h2>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl mx-auto font-light">
              השקעה של 149 ₪ שתעזור לך לסגור עסקה של אלפים.
            </p>
            
            <a href={SIGNUP_URL}>
              <Button className="h-16 px-12 text-xl rounded-2xl bg-white text-indigo-900 hover:bg-gray-100 shadow-2xl hover:scale-105 transition-transform font-bold">
                צור מצגת עסקית עכשיו
                <ArrowLeft className="mr-2 h-6 w-6" />
              </Button>
            </a>
            <p className="mt-6 text-indigo-200 text-sm">
              ללא דמי מנוי • תשלום חד פעמי • מתאים לכל סוגי העסקים
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}