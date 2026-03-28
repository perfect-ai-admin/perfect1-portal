import React from 'react';
import { motion } from 'framer-motion';
import {
  Rocket, Clock, CheckCircle2, Zap, Layout,
  Globe, Sparkles, Smartphone, ArrowLeft
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

const landingPageSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "דף נחיתה לעסק - בניית דף נחיתה עם AI",
  "description": "בניית דף נחיתה מקצועי ומעוצב לעסק תוך 30 שניות עם AI. כולל דומיין ואירוח, קופירייטינג שיווקי ועיצוב רספונסיבי.",
  "brand": { "@type": "Brand", "name": "ClientDashboard" },
  "url": "https://perfect-dashboard.com/BrandedLandingPage",
  "offers": {
    "@type": "Offer",
    "price": "299",
    "priceCurrency": "ILS",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "210"
  }
};

const landingPageFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "כמה עולה לבנות דף נחיתה?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "דף נחיתה ב-ClientDashboard עולה 299 שקל בתשלום חד פעמי. זה כולל דומיין, אירוח, עיצוב מקצועי וכתיבת תוכן שיווקי עם AI. לעומת סוכנויות שגובות 2,000-5,000 שקל."
      }
    },
    {
      "@type": "Question",
      "name": "כמה זמן לוקח לבנות דף נחיתה?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "דף נחיתה נוצר תוך 30 שניות. ממלאים שאלון קצר על העסק, ה-AI כותב את הטקסטים ומעצב את הדף באופן אוטומטי."
      }
    },
    {
      "@type": "Question",
      "name": "האם דף הנחיתה מותאם למובייל?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן, כל דפי הנחיתה שנוצרים במערכת הם רספונסיביים ומותאמים לכל מכשיר - סמארטפון, טאבלט ומחשב."
      }
    },
    {
      "@type": "Question",
      "name": "האם אפשר לערוך את דף הנחיתה אחרי שנוצר?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן, לאחר יצירת הדף ניתן לערוך טקסטים, להחליף תמונות ולשנות צבעים בקלות. אין צורך בידע טכני."
      }
    },
    {
      "@type": "Question",
      "name": "האם דף הנחיתה מתאים לקידום ממומן?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "בהחלט. דפי הנחיתה נבנים עם דגש על מהירות טעינה והנעה לפעולה, מה שהופך אותם למצוינים עבור קמפיינים בפייסבוק, אינסטגרם וגוגל."
      }
    }
  ]
};

const features = [
  {
    icon: Clock,
    title: "מוכן תוך 30 שניות",
    desc: "בלי לחכות למעצבים, בלי תיקונים אינסופיים. ה-AI מייצר לך דף מושלם ברגע."
  },
  {
    icon: Globe,
    title: "כולל דומיין ואירוח",
    desc: "אתה מקבל כתובת URL ייחודית משלך (סאב-דומיין) באופן מיידי. הדף באוויר ומוכן לשיווק."
  },
  {
    icon: Smartphone,
    title: "מותאם למובייל",
    desc: "עיצוב רספונסיבי שנראה מעולה בכל מכשיר - סמארטפון, טאבלט ומחשב."
  },
  {
    icon: Layout,
    title: "קופירייטינג שיווקי",
    desc: "הבינה המלאכותית לא רק מעצבת, היא גם כותבת את הטקסטים בצורה שמניעה לפעולה."
  }
];

const comparisonData = [
  { param: "זמן עבודה", us: "30 שניות", agency: "שבועיים-חודש", diy: "שעות ארוכות" },
  { param: "עלות", us: "₪299 חד פעמי", agency: "₪2,000 - ₪5,000", diy: "תשלום חודשי קבוע" },
  { param: "עיצוב", us: "AI מקצועי ומותאם", agency: "תלוי במעצב", diy: "תבנית גנרית" },
  { param: "כתיבת תוכן", us: "כלול (AI)", agency: "בתוספת תשלום", diy: "עליך" },
  { param: "דומיין ואירוח", us: "כלול בחבילה", agency: "תשלום נפרד", diy: "תשלום נפרד" },
  { param: "ידע טכני", us: "0 ידע נדרש", agency: "לא נדרש", diy: "חובה ללמוד מערכת" },
];

const faqs = [
  {
    q: "האם אני צריך ידע טכני?",
    a: "ממש לא. המערכת שלנו בנויה כך שכל אחד יכול להשתמש בה. אתם עונים על מספר שאלות פשוטות לגבי העסק שלכם, וה-AI עושה את כל השאר."
  },
  {
    q: "האם אני יכול לערוך את הדף אחרי שהוא נוצר?",
    a: "כן, בוודאי. לאחר שהמערכת מייצרת את הדף הראשוני, יש לכם אפשרות לערוך טקסטים, להחליף תמונות ולשנות צבעים בקלות."
  },
  {
    q: "האם הדף מותאם לקידום ממומן?",
    a: "חד משמעית. הדפים נבנים בסטנדרט גבוה עם דגש על מהירות טעינה והנעה לפעולה, מה שהופך אותם למצויינים עבור קמפיינים בפייסבוק, אינסטגרם וגוגל."
  },
  {
    q: "מה לגבי דומיין?",
    a: "אתם מקבלים סאב-דומיין מקצועי של המערכת בחינם. אם תרצו לחבר דומיין פרטי משלכם, זה גם אפשרי בהגדרות המתקדמות."
  },
  {
    q: "האם זה תשלום חד פעמי?",
    a: "כן. המחיר של 299 ש״ח הוא חד פעמי עבור הקמת הדף. אין תשלום חודשי על הדף עצמו."
  }
];

export default function BrandedLandingPage() {
  const SIGNUP_URL = getSignupUrl();
  return (
    <>
      <SEOHead
        title="דף נחיתה לעסק | בניית דף נחיתה מקצועי עם AI ב-299 שקל - ClientDashboard"
        description="בנה דף נחיתה מקצועי ומעוצב לעסק שלך תוך 30 שניות. כולל דומיין, אירוח, קופירייטינג שיווקי ועיצוב רספונסיבי. תשלום חד פעמי 299 שקל ללא מנוי."
        canonical="/BrandedLandingPage"
        keywords="דף נחיתה, דף נחיתה לעסק, בניית דף נחיתה, דפי נחיתה, דף נחיתה מעוצב, דף נחיתה ממיר, דף נחיתה מקצועי, דף נחיתה עם AI"
        schema={[landingPageSchema, landingPageFAQSchema]}
      />
      <Header />
      <main className="pt-20 bg-white font-sans overflow-x-hidden">

        {/* HERO SECTION */}
        <section className="relative pt-8 pb-12 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-200/30 blur-[100px] rounded-full -z-10 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-200/20 blur-[100px] rounded-full -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white border border-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-6">
                <Sparkles className="w-4 h-4 fill-violet-500 text-violet-500" />
                <span>מהפכת ה-AI הגיעה לדפי הנחיתה</span>
              </div>
              
              <h1 className="text-3xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-4 md:mb-6">
                דף נחיתה ממיר ומעוצב<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                   ב-30 שניות בלבד
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 font-light max-w-3xl mx-auto mb-10 leading-relaxed">
                תפסיקו לבזבז אלפי שקלים ושבועות של המתנה.
                <br className="hidden md:block" />
                המערכת החכמה שלנו תבנה עבורכם דף נחיתה מקצועי, כתוב ומעוצב - 
                <span className="font-bold text-gray-900"> כולל דומיין מוכן לעבודה.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={SIGNUP_URL}>
                  <Button className="h-14 px-8 text-lg rounded-2xl bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-600/20 w-full sm:w-auto">
                    בנה דף נחיתה ב-₪299
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </a>
                <p className="text-sm text-gray-400 font-medium mt-2 sm:mt-0">
                  * תשלום חד פעמי • ללא דמי מנוי
                </p>
              </div>
            </motion.div>

            {/* Hero Image / Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-16 relative mx-auto max-w-5xl"
            >
              <div className="bg-gray-900 rounded-t-[2rem] p-2 shadow-2xl border-t border-x border-gray-800">
                <div className="bg-white rounded-t-2xl overflow-hidden aspect-[16/9] relative group">
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                        <div className="text-center">
                            <Zap className="w-16 h-16 text-violet-400 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-2xl font-bold text-gray-400">הדף שלך נוצר בזמן אמת...</h3>
                        </div>
                    </div>
                    {/* Overlay representing the finished product */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80')] bg-cover bg-top opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:border-violet-100 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
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
              <p className="text-xl text-gray-400">תהליך סופר-מהיר בשלושה שלבים פשוטים</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-12 right-0 left-0 h-0.5 bg-gradient-to-l from-violet-900 via-violet-500 to-violet-900" />

                {[
                  { step: "1", title: "שאלון קצר", desc: "עונים על מספר שאלות לגבי העסק: מה אתם מוכרים, למי, ומה ההצעה." },
                  { step: "2", title: "הקסם קורה", desc: "ה-AI מנתח את התשובות, כותב את הטקסטים ומעצב את הדף בזמן אמת." },
                  { step: "3", title: "פרסום מיידי", desc: "מקבלים לינק מוכן. אפשר להתחיל לפרסם אותו בפייסבוק, בגוגל או לשלוח ללקוחות." }
                ].map((item, i) => (
                  <div key={i} className="relative flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-6 relative z-10 shadow-xl shadow-violet-900/20 group hover:border-violet-500 transition-colors">
                      <span className="text-4xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">{item.step}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed max-w-xs">{item.desc}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-12 lg:py-32 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">למה אנחנו?</h2>
              <p className="text-xl text-gray-500">השוואה פשוטה שתחסוך לך הרבה כאב ראש וכסף</p>
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
              <div className="grid grid-cols-4 bg-gray-900 text-white p-3 md:p-8 text-center font-bold text-[10px] md:text-lg items-center">
                <div className="text-right">נושא</div>
                <div className="text-violet-400 bg-violet-900/30 py-1 px-1 md:px-2 rounded-lg border border-violet-500/30 break-words">
                  <span className="md:hidden">אנחנו</span>
                  <span className="hidden md:inline">ClientDashboard</span>
                </div>
                <div className="text-gray-400">
                  <span className="md:hidden">פרילנסר</span>
                  <span className="hidden md:inline">בונה אתרים</span>
                </div>
                <div className="text-gray-400">
                  <span className="md:hidden">סוכנות</span>
                  <span className="hidden md:inline">סוכנות דיגיטל</span>
                </div>
              </div>

              {comparisonData.map((row, idx) => (
                <div key={idx} className="grid grid-cols-4 p-3 md:p-8 border-b border-gray-100 hover:bg-violet-50/10 transition-colors items-center text-center text-[10px] md:text-base">
                  <div className="font-bold text-gray-900 text-right leading-tight">{row.param}</div>
                  <div className="font-bold text-violet-700 bg-violet-50 py-1 md:py-2 px-1 rounded-lg md:rounded-xl flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 leading-tight">
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                    <span>{row.us}</span>
                  </div>
                  <div className="text-gray-500 leading-tight px-1">{row.diy}</div>
                  <div className="text-gray-500 leading-tight px-1">{row.agency}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">שאלות נפוצות</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border border-gray-100 rounded-2xl px-6 data-[state=open]:bg-gray-50 transition-colors">
                  <AccordionTrigger className="text-right text-lg font-bold text-gray-900 hover:text-violet-600 hover:no-underline py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-lg pb-6 pr-4 border-r-2 border-violet-200">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-12 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-violet-600" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 blur-[100px] rounded-full animate-pulse" />
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
            <h2 className="text-4xl md:text-6xl font-black mb-6">מוכנים להתחיל למכור?</h2>
            <p className="text-xl md:text-2xl text-violet-100 mb-10 max-w-2xl mx-auto font-light">
              הצטרפו למאות בעלי עסקים שכבר בנו דף נחיתה מקצועי ב-30 שניות.
            </p>
            
            <a href={SIGNUP_URL}>
              <Button className="h-16 px-12 text-xl rounded-2xl bg-white text-violet-700 hover:bg-gray-50 shadow-2xl hover:scale-105 transition-transform font-bold">
                צור דף נחיתה עכשיו
                <Rocket className="mr-2 h-6 w-6" />
              </Button>
            </a>
            <p className="mt-6 text-violet-200 text-sm">
              ללא התחייבות • תמיכה מלאה בעברית • 100% שביעות רצון
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}