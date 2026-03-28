import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight, Palette, Sparkles, Check, Zap, Star } from 'lucide-react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import SEOHead from '@/components/seo/SEOHead';

import { getSignupUrl } from '@/components/utils/tracking';

const smartLogoSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "לוגו לעסק - עיצוב לוגו עם AI",
  "description": "יצירת לוגו מקצועי לעסק עם בינה מלאכותית. 8 סגנונות לבחירה, תוצאה תוך דקות, במחיר של 39 שקל בלבד.",
  "brand": { "@type": "Brand", "name": "ClientDashboard" },
  "url": "https://perfect-dashboard.com/SmartLogo",
  "offers": {
    "@type": "Offer",
    "price": "39",
    "priceCurrency": "ILS",
    "availability": "https://schema.org/InStock",
    "url": "https://perfect-dashboard.com/SmartLogo"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "320"
  }
};

const smartLogoFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "כמה עולה לוגו לעסק ב-ClientDashboard?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "עיצוב לוגו לעסק עולה 39 שקל בלבד. זהו תשלום חד פעמי ללא מנוי חודשי. מקבלים 8 גרסאות לוגו שונות לבחירה."
      }
    },
    {
      "@type": "Question",
      "name": "כמה זמן לוקח ליצור לוגו?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "התהליך לוקח דקות ספורות. ממלאים שאלון קצר על העסק, ה-AI מעבד את המידע ויוצר 8 גרסאות לוגו מקצועיות."
      }
    },
    {
      "@type": "Question",
      "name": "באילו פורמטים מקבלים את הלוגו?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "הלוגו מתקבל בפורמטים PDF, SVG ו-PNG באיכות גבוהה, מוכן לשימוש בדפוס ובדיגיטל."
      }
    },
    {
      "@type": "Question",
      "name": "האם צריך ידע בעיצוב כדי ליצור לוגו?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "לא צריך שום ידע בעיצוב. המערכת מבוססת AI ועושה את כל העבודה. פשוט מתארים את העסק ובוחרים סגנון."
      }
    },
    {
      "@type": "Question",
      "name": "מה ההבדל בין לוגו AI לעיצוב גרפי מקצועי?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "לוגו AI מאפשר לקבל תוצאה מקצועית תוך דקות במחיר נמוך (39 שקל לעומת אלפי שקלים). התוצאה איכותית ומתאימה לרוב העסקים הקטנים והבינוניים."
      }
    }
  ]
};

const logoExamples = [
  { name: 'טק וחדשנות', color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { name: 'בריאות וטבע', color: 'bg-gradient-to-br from-green-500 to-emerald-500' },
  { name: 'אופנה יוקרתית', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { name: 'ספורט ואנרגיה', color: 'bg-gradient-to-br from-red-500 to-orange-500' },
  { name: 'ממשלתי וקלאסי', color: 'bg-gradient-to-br from-gray-700 to-gray-900' },
  { name: 'מסעדה עסקית', color: 'bg-gradient-to-br from-amber-600 to-yellow-500' },
  { name: 'מוזיקה וקריאטיב', color: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
  { name: 'בנייה ותעשייה', color: 'bg-gradient-to-br from-slate-600 to-slate-800' },
];

export default function SmartLogoPage() {
  const SIGNUP_URL = getSignupUrl();
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    // Auto-scroll function
    const autoScroll = () => {
      if (api) api.scrollNext();
    };

    const interval = setInterval(autoScroll, 4000);

    // Stop auto-scroll on interaction
    api.on("pointerDown", () => {
      clearInterval(interval);
    });

    return () => clearInterval(interval);
  }, [api]);

  return (
    <>
      <SEOHead
        title="לוגו לעסק | עיצוב לוגו מקצועי עם AI ב-39 שקל - ClientDashboard"
        description="צור לוגו מקצועי לעסק שלך עם בינה מלאכותית. 8 סגנונות לבחירה, תוצאה תוך דקות, פורמטים PDF/SVG/PNG. עיצוב לוגו לעסק ב-39 שקל בלבד - ללא מנוי חודשי."
        canonical="/SmartLogo"
        keywords="לוגו לעסק, עיצוב לוגו, לוגו מקצועי, עיצוב לוגו אונליין, לוגו AI, יצירת לוגו, לוגו לעסק קטן, עיצוב לוגו בעברית, לוגו בזול"
        schema={[smartLogoSchema, smartLogoFAQSchema]}
      />
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-b from-yellow-50 via-white to-gray-50">
        {/* Hero Section */}
        <section className="py-16 md:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              יצירת לוגו חכם עם AI
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              לוגו מקצועי ב<span className="text-yellow-600">39 שקל</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI שלנו יוצר לוגו ייחודיים בדקות בודדות. לא צריך מעצב, לא צריך ממתין שבועות. רק תאור קצר של העסק שלך והשקעה של 39 שקל בלבד.
            </p>

            <a href={SIGNUP_URL}>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl px-8 h-14 text-lg font-medium shadow-xl shadow-yellow-600/25 mb-6">
                צור את הלוגו שלך עכשיו
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </a>
            <p className="text-gray-500 text-sm">ללא צורך בכרטיס אשראי • תוצאה תוך דקות</p>
          </div>

          {/* Showcase Carousel */}
          <div className="max-w-7xl mx-auto mt-4 md:mt-20 relative w-full px-0 md:px-0">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 blur-3xl rounded-full transform -translate-y-12 pointer-events-none" />

            <Carousel 
              setApi={setApi} 
              className="w-full max-w-6xl mx-auto relative z-10" 
              opts={{ 
                loop: true,
                direction: 'rtl',
                align: 'start'
              }}
            >
              <CarouselContent className="-ml-0 md:-ml-6">
                {[
                  {
                    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6979cb5c2a04eccbcf83503e/e9fe0484d_image.png",
                    alt: "שלב 1: הזנת פרטי העסק"
                  },
                  {
                    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6979cb5c2a04eccbcf83503e/6651db29e_image.png",
                    alt: "שלב 2: בחירת צבעים"
                  },
                  {
                    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6979cb5c2a04eccbcf83503e/44cb4d1dc_image.png",
                    alt: "שלב 3: בחירת סגנון"
                  }
                ].map((item, index) => (
                  <CarouselItem key={index} className="pl-0 md:pl-6 basis-full md:basis-4/5 lg:basis-3/4" dir="rtl">
                    <div className="flex flex-col h-full group cursor-pointer select-none">
                      <div className="relative rounded-none md:rounded-3xl overflow-hidden shadow-none md:shadow-2xl border-y md:border border-gray-100 bg-white flex items-center justify-center h-[50vh] md:h-[600px] transition-all duration-500 md:group-hover:-translate-y-1 md:group-hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] md:group-hover:border-yellow-300">
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-white/10 opacity-0 md:opacity-100 transition-opacity" />
                        <img 
                          src={item.src}
                          alt={item.alt}
                          className="w-full h-full object-contain p-0 md:p-2 lg:p-4 relative z-10 transition-transform duration-700 md:group-hover:scale-[1.02]"
                        />
                        
                        {/* Mobile Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20 md:hidden z-20">
                          <p className="font-bold text-white text-xl text-center shadow-sm tracking-wide">{item.alt}</p>
                        </div>
                      </div>
                      
                      {/* Desktop Title & Step Indicator */}
                      <div className="hidden md:flex flex-col items-center mt-6 opacity-60 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm mb-3 shadow-sm group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{item.alt}</h3>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Custom Navigation Buttons for RTL */}
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => api?.scrollNext()}
                className="hidden md:flex absolute -left-12 lg:-left-20 top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-yellow-100 bg-white text-yellow-700 hover:bg-yellow-50 shadow-md rounded-full z-20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Button 
                variant="outline" 
                size="icon"
                onClick={() => api?.scrollPrev()}
                className="hidden md:flex absolute -right-12 lg:-right-20 top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-yellow-100 bg-white text-yellow-700 hover:bg-yellow-50 shadow-md rounded-full z-20"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>

              {/* Mobile Dots Indicator */}
              <div className="flex justify-center gap-2 mt-4 md:hidden pb-4">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index + 1 === current ? "bg-yellow-600 w-8" : "bg-gray-300 w-2"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </Carousel>
            
            <div className="text-center mt-6 md:mt-8 space-y-2 px-4">
              <p className="text-gray-900 font-medium text-lg hidden md:block">תהליך פשוט ומהיר - 3 שלבים והלוגו שלך מוכן</p>

            </div>
          </div>
        </section>

        {/* Logo Examples */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">מגוון סגנונות לוגו שהמערכת שלנו יודעת לייצר</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">כל לוגו תוך דקות בודדות - כשאתה רואה כמה מהר וקל זה, אתה תבין למה הרבה בעלי עסקים בחרו בנו</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {logoExamples.map((logo, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className={`${logo.color} rounded-2xl h-48 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105`}>
                    <div className="text-white text-center px-4">
                      <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold">{logo.name}</p>
                    </div>
                  </div>
                  <a href={SIGNUP_URL} className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">צור דומה →</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">איך זה עובד?</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold text-2xl mb-4 mx-auto">1</div>
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">ספר לנו על העסק</h4>
                <p className="text-gray-600">שם, תחום, סגנון ואני מה שרוצה שיהיה בלוגו. זה לוקח 2 דקות.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold text-2xl mb-4 mx-auto">2</div>
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">AI יוצר בשניות</h4>
                <p className="text-gray-600">המערכת מעבדת את המידע והAI יוצר 8 גרסאות לוגו שונות.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold text-2xl mb-4 mx-auto">3</div>
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">בחר, ערוך והורד</h4>
                <p className="text-gray-600">בחר את הלוגו שאתה אוהב, ערוך אם רוצה, והורד בכמה פורמטים.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200 text-right" dir="rtl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">למה לבחור בנו?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600 mt-1 shrink-0">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1 text-lg">39 ש״ח בלבד</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">מחיר הוגן ומשתלם לכל כיס. למה לשלם אלפי שקלים למעצב כשאפשר לקבל תוצאה מקצועית בשבריר מהמחיר?</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600 mt-1 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1 text-lg">תוצאות תוך דקות</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">אין צורך להמתין שבועות לסקיצות. המערכת שלנו מייצרת עבורך מגוון לוגואים מקצועיים תוך פחות מ-2 דקות.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600 mt-1 shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1 text-lg">8 סגנונות לבחירה</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">אנחנו לא מגבילים אותך לסגנון אחד. קבל 8 אפשרויות עיצוב שונות ומגוונות ובחר את זו שהכי מתאימה לעסק שלך.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600 mt-1 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1 text-lg">קבצים לכל שימוש</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">קבל את הלוגו בכל הפורמטים המקצועיים (PDF, SVG, PNG) באיכות הגבוהה ביותר, מוכן לדפוס ולדיגיטל.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-r from-yellow-600 to-orange-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              לא אמור להיות לך עסק בלוגו טוב?
            </h2>
            <p className="text-yellow-100 text-lg mb-8 max-w-2xl mx-auto">
              התחבר עכשיו ותוך דקות הלוגו המושלם יהיה שלך. ב-39 שקל זה ההשקעה הטובה ביותר שאתה עושה לעסק שלך היום.
            </p>
            
            <a href={SIGNUP_URL}>
              <Button className="bg-white text-yellow-600 hover:bg-gray-50 rounded-xl px-10 h-14 text-lg font-medium shadow-xl">
                צור את הלוגו שלך עכשיו - ב39 שקל
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </a>
            
            <p className="text-yellow-100 text-sm mt-4">ללא צורך בכרטיס אשראי • תוצאה תוך דקות</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}