import React from 'react';
import { motion } from 'framer-motion';
import {
  Sticker, Send, Zap,
  Smile, ThumbsUp, Heart, CheckCircle2,
  Smartphone, ArrowLeft,
  MessageSquare, Users, Sparkles, Coffee, ShoppingBag, Truck, Star
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

const SIGNUP_URL = "https://perfect-dashboard.com/login?from_url=https%3A%2F%2Fperfect-dashboard.com%2FClientDashboard";

const stickerSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "סטיקר ממותג לעסק לוואטסאפ",
  "description": "סטיקר ממותג לוואטסאפ עם הלוגו והמסר של העסק. נוכחות יומיומית בטלפון של הלקוח. מחיר חד פעמי 29 שקל.",
  "brand": { "@type": "Brand", "name": "ClientDashboard" },
  "url": "https://perfect-dashboard.com/BusinessSticker",
  "offers": {
    "@type": "Offer",
    "price": "29",
    "priceCurrency": "ILS",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "420"
  }
};

const stickerFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "מה זה סטיקר ממותג לעסק?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "סטיקר ממותג לעסק הוא מדבקה דיגיטלית עם הלוגו והמסר של העסק שלך, שנשלחת בוואטסאפ. הסטיקר נשמר בטלפון של הלקוח ומופיע בשיחות, מה שיוצר נוכחות מותגית יומיומית."
      }
    },
    {
      "@type": "Question",
      "name": "כמה עולה סטיקר לעסק?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "סטיקר ממותג לעסק עולה 29 שקל בלבד. תשלום חד פעמי ללא מנוי. עסקים רבים יוצרים סט שלם של סטיקרים: תודה, בוקר טוב, אישור הזמנה ועוד."
      }
    },
    {
      "@type": "Question",
      "name": "איך מוסיפים סטיקר לוואטסאפ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "לאחר יצירת הסטיקר, שולחים אותו לעצמכם בוואטסאפ, לוחצים עליו ובוחרים 'הוסף למועדפים'. מאותו רגע הסטיקר זמין לשליחה בכל שיחה."
      }
    },
    {
      "@type": "Question",
      "name": "האם הסטיקר עובד באייפון וגם באנדרואיד?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן, הסטיקרים מותאמים לכל המכשירים ולכל גרסאות הוואטסאפ - אייפון, אנדרואיד ווואטסאפ ווב."
      }
    }
  ]
};

const reasons = [
  {
    icon: MessageSquare,
    title: "נוכחות יומיומית",
    desc: "הסטיקר נמצא בטלפון של הלקוח, מופיע בשיחות ונשאר שם חודשים. זה מיתוג שחי ונושם, לא פוסט שנעלם בפיד."
  },
  {
    icon: Sparkles,
    title: "מקצועיות ברגע",
    desc: "עסק שיש לו סטיקר ממותג משדר רצינות והשקעה בפרטים הקטנים. זה ההבדל בין 'עוד עסק' למותג."
  },
  {
    icon: Users,
    title: "ויראליות טבעית",
    desc: "לקוחות מעבירים סטיקרים טובים הלאה. המותג שלך מטייל בין קבוצות ושיחות פרטיות בלי ששילמת שקל על פרסום."
  }
];

const useCases = [
  {
    title: "תודה על רכישה",
    desc: "סיום עסקה עם חיוך ומיתוג שנשאר.",
    icon: Heart,
    color: "bg-pink-100 text-pink-600"
  },
  {
    title: "שירות לקוחות",
    desc: "תשובות קצרות, נעימות וממותגות.",
    icon: Smile,
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    title: "חיזוק מותג",
    desc: "לוגו שמופיע כל הזמן בתודעה.",
    icon: Zap,
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "אישור ופרגון",
    desc: "תגובה מהירה ללקוחות שיוצרת כימיה.",
    icon: ThumbsUp,
    color: "bg-blue-100 text-blue-600"
  }
];

const processSteps = [
  {
    step: "1",
    title: "ממלאים פרטים",
    desc: "מעלים לוגו ובוחרים את המסר שרוצים על הסטיקר (למשל: תודה רבה, בוקר טוב, או סלוגן)."
  },
  {
    step: "2",
    title: "המערכת מעצבת",
    desc: "ה-AI שלנו מעבד את הלוגו, מסיר רקע אם צריך, ובונה את הסטיקר בפורמט המושלם לוואטסאפ."
  },
  {
    step: "3",
    title: "מקבלים לנייד",
    desc: "תוך שניות מקבלים קובץ מוכן שמוסיפים למועדפים בוואטסאפ ומתחילים לשלוח."
  }
];

const faqs = [
  {
    q: "איך מקבלים את הסטיקר?",
    a: "מיד בסיום התהליך תקבלו קובץ מותאם לוואטסאפ. פשוט שולחים אותו לעצמכם, לוחצים עליו ובוחרים 'הוסף למועדפים'."
  },
  {
    q: "האם זה עובד באייפון וגם באנדרואיד?",
    a: "כן! הסטיקרים שלנו מותאמים ב-100% לכל המכשירים ולכל גרסאות הוואטסאפ."
  },
  {
    q: "אני צריך ידע בעיצוב?",
    a: "ממש לא. המערכת עושה הכל אוטומטית. אתם רק צריכים לוגו או תמונה של העסק."
  },
  {
    q: "האם אפשר להכין כמה סטיקרים?",
    a: "בוודאי. במחיר של 29 ₪ לסטיקר, עסקים רבים יוצרים סט שלם: תודה, בוקר טוב, אישור הזמנה ועוד."
  }
];

export default function BusinessStickerPage() {
  return (
    <>
      <SEOHead
        title="סטיקר לעסק | סטיקר ממותג לוואטסאפ ב-29 שקל - ClientDashboard"
        description="סטיקר ממותג לעסק לוואטסאפ עם הלוגו והמסר שלך. נוכחות יומיומית בטלפון של הלקוחות. עובד באייפון ואנדרואיד. תשלום חד פעמי 29 שקל."
        canonical="/BusinessSticker"
        keywords="סטיקר לעסק, סטיקר ממותג, סטיקר וואטסאפ, סטיקרים לעסק, סטיקר ממותג לוואטסאפ, מדבקות לוואטסאפ, סטיקר עסקי"
        schema={[stickerSchema, stickerFAQSchema]}
      />
      <Header />
      <main className="pt-20 bg-white font-sans overflow-x-hidden">
        
        {/* HERO SECTION */}
        <section className="relative pt-8 pb-12 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-6 border border-green-200">
                  <Smartphone className="w-4 h-4" />
                  <span>המותג שלך בכיס של הלקוח</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-6">
                  העסק שלך – <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                    בתוך השיחה
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 font-light mb-8 leading-relaxed max-w-2xl mx-auto lg:mr-0">
                  סטיקר ממותג שמופיע בכל שיחה, נשלח הלאה ומחזק את המותג שלך בלי מאמץ.
                  <span className="font-bold block mt-2 text-green-700">נוכחות יומיומית בעלות חד פעמית של 29 ₪.</span>
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a href={SIGNUP_URL}>
                    <Button className="h-14 px-8 text-lg rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto font-bold border-b-4 border-[#128C7E]/20">
                      אני רוצה סטיקר לעסק
                      <Sticker className="mr-2 h-5 w-5" />
                    </Button>
                  </a>
                </div>
              </motion.div>

              {/* WhatsApp Simulation Visual */}
              <motion.div 
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="relative mx-auto max-w-[320px]"
              >
                {/* Phone Frame */}
                <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-4 border-gray-800 relative z-10">
                  <div className="bg-[#efe7dd] rounded-[2.5rem] overflow-hidden h-[500px] relative">
                    {/* Chat Header */}
                    <div className="bg-[#008069] h-16 w-full flex items-center px-4 gap-3 shadow-sm z-20 relative">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                        <ArrowLeft size={18} />
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-bold text-[#008069]">
                        C
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-sm">העסק שלך</div>
                        <div className="text-white/80 text-xs">מחובר/ת</div>
                      </div>
                    </div>

                    {/* Chat Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />

                    {/* Messages */}
                    <div className="p-4 space-y-4 relative z-10 pt-8">
                      {/* Customer Message */}
                      <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%] text-sm text-gray-800">
                          היי, רציתי להגיד תודה על המשלוח המהיר! הגיע מושלם 🙏
                          <div className="text-[10px] text-gray-400 text-left mt-1">10:42</div>
                        </div>
                      </div>

                      {/* Business Sticker Response */}
                      <div className="flex justify-end mt-4">
                        <motion.div 
                          animate={{ scale: [0.5, 1.1, 1] }}
                          transition={{ delay: 0.8, type: "spring" }}
                          className="drop-shadow-xl filter"
                        >
                          {/* Simulated Sticker Graphic */}
                          <div className="relative">
                             <div className="bg-white p-2 rounded-full border-4 border-green-500 w-32 h-32 flex flex-col items-center justify-center transform rotate-6 shadow-sm">
                                <div className="text-green-600 font-black text-xl leading-tight text-center">תודה<br/>רבה!</div>
                                <div className="text-[10px] text-gray-500 mt-1 font-bold">העסק שלך</div>
                                <Heart className="w-6 h-6 text-red-500 fill-current mt-1 animate-pulse" />
                             </div>
                          </div>
                        </motion.div>
                      </div>
                      
                       <div className="flex justify-end">
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded-full">
                          10:43 <CheckCircle2 className="w-3 h-3 text-blue-500" />
                        </div>
                      </div>

                    </div>
                    
                    {/* Input Area */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-2 flex items-center gap-2">
                        <div className="bg-gray-100 rounded-full h-9 flex-1 px-4 flex items-center text-gray-400 text-xs">הקלד/י הודעה...</div>
                        <div className="bg-[#008069] w-9 h-9 rounded-full flex items-center justify-center text-white">
                            <Send size={16} />
                        </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute -right-8 top-1/3 bg-white p-3 rounded-xl shadow-lg border border-green-100 hidden lg:block"
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-green-500 w-5 h-5" />
                        <span className="font-bold text-sm text-gray-700">נשמר במועדפים</span>
                    </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PSYCHOLOGY / WHY IT WORKS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">למה עסקים חכמים עוברים לסטיקרים?</h2>
              <p className="text-xl text-gray-500">סטיקר הוא לא קישוט – הוא כלי פסיכולוגי</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {reasons.map((reason, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-green-100">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-green-600 shadow-sm">
                    <reason.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{reason.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{reason.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-20 bg-green-50/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">איפה זה פוגש את הלקוחות שלך?</h2>
              <p className="text-lg text-gray-500">בדיוק בנקודות שחשוב לחזק את הקשר</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {useCases.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-center border border-gray-100">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STICKER GALLERY */}
        <section className="py-20 bg-indigo-50 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">גלריית השראה</h2>
              <p className="text-xl text-gray-500">6 דוגמאות לסטיקרים שעושים חשק (וביזנס)</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
              {/* Sticker 1: Bakery / Cafe */}
              <div className="flex flex-col items-center group">
                <div className="relative w-44 h-44 bg-orange-100 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-xl shadow-orange-100 transform group-hover:rotate-6 transition-transform duration-300">
                   <Coffee className="w-12 h-12 text-orange-600 mb-2" />
                   <span className="font-black text-orange-800 text-xl">בוקר של</span>
                   <span className="font-black text-orange-600 text-2xl">הצלחה!</span>
                   <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm text-gray-400 border border-gray-100">קפה הפינה</div>
                </div>
              </div>

              {/* Sticker 2: Fashion / Retail */}
              <div className="flex flex-col items-center group">
                <div className="relative w-44 h-44 bg-pink-100 rounded-[2rem] flex flex-col items-center justify-center border-4 border-white shadow-xl shadow-pink-100 transform group-hover:-rotate-6 transition-transform duration-300">
                   <ShoppingBag className="w-10 h-10 text-pink-500 mb-2" />
                   <span className="font-black text-pink-600 text-xl text-center leading-tight">תודה על<br/>ההזמנה!</span>
                   <Heart className="w-5 h-5 text-pink-400 fill-current mt-2 animate-pulse" />
                   <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm text-gray-400 border border-gray-100">בוטיק נועה</div>
                </div>
              </div>
              
              {/* Sticker 3: Professional / Service */}
              <div className="flex flex-col items-center group">
                 <div className="relative w-44 h-44 bg-blue-100 rounded-2xl flex flex-col items-center justify-center border-4 border-white shadow-xl shadow-blue-100 transform group-hover:scale-105 transition-transform duration-300">
                    <CheckCircle2 className="w-12 h-12 text-blue-600 mb-2" />
                    <span className="font-black text-blue-800 text-2xl">מאושר!</span>
                    <span className="text-xs font-bold text-blue-600 mt-1">יוצא לביצוע</span>
                    <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm text-gray-400 border border-gray-100">ביטוח ישיר</div>
                 </div>
              </div>

              {/* Sticker 4: Promotion / Sale */}
              <div className="flex flex-col items-center group">
                <div className="relative w-44 h-44 bg-red-100 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-xl shadow-red-100 transform group-hover:rotate-12 transition-transform duration-300">
                   <span className="font-black text-red-600 text-5xl mb-1 tracking-tighter">SALE</span>
                   <span className="font-bold text-red-800 text-sm bg-red-200 px-2 py-0.5 rounded-full">רק להיום!</span>
                   <Zap className="w-6 h-6 text-yellow-500 fill-current absolute top-5 right-6" />
                   <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm text-gray-400 border border-gray-100">ספורט פלוס</div>
                </div>
              </div>

               {/* Sticker 5: Logistics / Delivery */}
               <div className="flex flex-col items-center group">
                <div className="relative w-44 h-44 bg-green-100 rounded-[2.5rem] flex flex-col items-center justify-center border-4 border-white shadow-xl shadow-green-100 transform group-hover:-rotate-3 transition-transform duration-300">
                   <Truck className="w-12 h-12 text-green-600 mb-2" />
                   <span className="font-black text-green-800 text-xl leading-tight text-center">המשלוח<br/>בדרך!</span>
                   <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm text-gray-400 border border-gray-100">שליחויות בקליק</div>
                </div>
              </div>

              {/* Sticker 6: Review / Feedback */}
              <div className="flex flex-col items-center group">
                <div className="relative w-44 h-44 bg-yellow-50 rounded-xl flex flex-col items-center justify-center border-4 border-white shadow-xl shadow-yellow-100 transform group-hover:rotate-3 transition-transform duration-300">
                   <div className="flex gap-1 mb-3">
                     {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                   </div>
                   <span className="font-black text-yellow-700 text-lg text-center">נהנית?</span>
                   <span className="text-xs text-yellow-800 font-bold bg-yellow-200/50 px-2 py-1 rounded mt-1">נשמח לדירוג</span>
                   <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm text-gray-400 border border-gray-100">פיצה איטליה</div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-lg text-gray-600 mb-4">זה בדיוק מה שהלקוחות שלך יראו בווטסאפ.</p>
            </div>
          </div>
        </section>

        {/* PROCESS STEPS */}
        <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
             <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4">איך זה עובד?</h2>
              <p className="text-xl text-gray-400">תהליך קצר של 30 שניות והסטיקר אצלך</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 text-center">
              {processSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="text-8xl font-black text-white/10 mb-4 absolute -top-16 left-1/2 -translate-x-1/2 select-none">
                    {step.step}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-3 text-green-400">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
                <a href={SIGNUP_URL}>
                    <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-10 py-6 text-lg font-bold shadow-xl shadow-white/10">
                        התחל לעצב את הסטיקר שלך
                    </Button>
                </a>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12 text-gray-900">שאלות נפוצות</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-white border border-gray-100 rounded-2xl px-6 data-[state=open]:shadow-md transition-all">
                  <AccordionTrigger className="text-right text-lg font-bold text-gray-900 hover:text-green-600 hover:no-underline py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-lg pb-6 pr-4 border-r-2 border-green-200">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 relative overflow-hidden bg-[#25D366]">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">סטיקר אחד. נוכחות יומיומית.</h2>
            <p className="text-xl md:text-2xl text-green-50 mb-10 font-medium">
              הצטרפו למאות עסקים שכבר נמצאים בתוך השיחות של הלקוחות שלהם.
            </p>
            
            <a href={SIGNUP_URL}>
              <Button className="h-16 px-12 text-xl rounded-2xl bg-white text-[#075E54] hover:bg-gray-50 shadow-2xl hover:scale-105 transition-transform font-bold border-b-4 border-gray-200">
                צור סטיקר ב-29 ₪
                <ArrowLeft className="mr-2 h-6 w-6" />
              </Button>
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}