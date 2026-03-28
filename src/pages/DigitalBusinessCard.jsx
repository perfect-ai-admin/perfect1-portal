import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle2,
  Smartphone,
  Share2,
  QrCode,
  UserPlus,
  MapPin,
  Phone,
  MessageCircle,
  ArrowLeft,
  XCircle,
  Clock,
  Zap,
  Layout
} from 'lucide-react';
import { getSignupUrl } from '@/components/utils/tracking';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import SEOHead from '@/components/seo/SEOHead';

const digitalCardSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "כרטיס ביקור דיגיטלי חכם לעסקים",
  "description": "כרטיס ביקור דיגיטלי חכם עם QR Code, שמירה באנשי קשר, כפתורי וואטסאפ וניווט. תשלום חד פעמי של 149 שקל.",
  "brand": { "@type": "Brand", "name": "ClientDashboard" },
  "url": "https://perfect-dashboard.com/DigitalBusinessCard",
  "offers": {
    "@type": "Offer",
    "price": "149",
    "priceCurrency": "ILS",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "185"
  }
};

const digitalCardFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "מה זה כרטיס ביקור דיגיטלי?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כרטיס ביקור דיגיטלי הוא דף אינטרנט אישי שמרכז את כל פרטי העסק שלך - טלפון, וואטסאפ, מיקום, רשתות חברתיות ועוד. במקום כרטיס נייר שנזרק, הלקוח מקבל לינק שתמיד זמין בטלפון."
      }
    },
    {
      "@type": "Question",
      "name": "כמה עולה כרטיס ביקור דיגיטלי?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כרטיס ביקור דיגיטלי ב-ClientDashboard עולה 149 שקל בלבד. זהו תשלום חד פעמי ללא דמי מנוי חודשיים, והכרטיס שלך לתמיד."
      }
    },
    {
      "@type": "Question",
      "name": "האם כרטיס ביקור דיגיטלי עובד בכל טלפון?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן, כרטיס ביקור דיגיטלי עובד בכל טלפון חכם - אייפון ואנדרואיד. אין צורך בהתקנת אפליקציה, הכרטיס נפתח ישירות בדפדפן."
      }
    },
    {
      "@type": "Question",
      "name": "האם אפשר לעדכן את הפרטים בכרטיס?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כן, ניתן לעדכן את כל הפרטים בכרטיס הביקור הדיגיטלי בכל עת. שינוי מספר טלפון, כתובת, או כל פרט אחר - מתעדכן מיידית בלי צורך להדפיס מחדש."
      }
    },
    {
      "@type": "Question",
      "name": "מה כולל כרטיס ביקור דיגיטלי חכם?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "כרטיס ביקור דיגיטלי חכם כולל: URL קבוע אישי, QR Code להדפסה ושיתוף, שמירה באנשי קשר בלחיצה, כפתורי וואטסאפ/חיוג/ניווט/מייל, עיצוב מקצועי מותאם לעסק, ועריכה חופשית בכל עת."
      }
    }
  ]
};

export default function DigitalBusinessCard() {
  const SIGNUP_URL = getSignupUrl();

  return (
    <div className="min-h-screen bg-white font-sans text-right" dir="rtl">
      <SEOHead
        title="כרטיס ביקור דיגיטלי | כרטיס ביקור חכם לעסקים ב-149 שקל - ClientDashboard"
        description="כרטיס ביקור דיגיטלי חכם לעסקים ועצמאים. כולל QR Code, שמירה באנשי קשר, וואטסאפ וניווט. תשלום חד פעמי 149 שקל ללא מנוי. מוכן תוך דקות."
        canonical="/DigitalBusinessCard"
        keywords="כרטיס ביקור דיגיטלי, כרטיס ביקור חכם, כרטיס ביקור אונליין, כרטיס ביקור לעסק, כרטיס דיגיטלי, כרטיס ביקור עם QR"
        schema={[digitalCardSchema, digitalCardFAQSchema]}
      />
      <Header />
      
      {/* 🟦 HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse"></span>
            <span className="text-sm font-medium text-violet-200">149₪ בלבד | תשלום חד־פעמי | בלי מנוי</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            כרטיס ביקור <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">דיגיטלי חכם</span> לעסקים
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            לינק אחד שמחליף כרטיסי ביקור, וואטסאפ והסברים מיותרים
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <a href={SIGNUP_URL}>
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white text-lg h-14 px-8 rounded-full shadow-lg shadow-violet-600/25 transition-all hover:scale-105">
                צור כרטיס ביקור דיגיטלי עכשיו
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </a>
          </div>

          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            מוכן תוך דקות • עובד בכל טלפון • נראה מקצועי
          </p>
        </div>
      </section>

      {/* 🟦 PAIN POINTS - Why do people need this? */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              כל פעם שמבקשים ממך פרטים – <span className="text-violet-600">זה הרגע שקובע</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              מי שאין לו כרטיס דיגיטלי – נראה פחות רציני.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { text: 'נמאס לשלוח מספר ואז "עוד רגע אשלח לינק"', icon: MessageCircle },
              { text: 'כרטיס מודפס הולך לאיבוד ונזרק לפח', icon: XCircle },
              { text: 'פרופיל וואטסאפ פשוט לא נראה מקצועי מספיק', icon: Smartphone },
              { text: 'אין לך משהו מסודר ומרשים לשלוח בסוף פגישה', icon: Layout },
            ].map((item, index) => (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                    <item.icon size={24} />
                  </div>
                  <p className="font-medium text-slate-700 leading-snug">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🟦 VALUE PROPOSITION - What you get */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Image / Visual Representation */}
            <div className="relative order-2 lg:order-1">
              <div className="relative z-10 bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl max-w-xs mx-auto border-8 border-slate-800">
                 {/* Mockup Screen */}
                 <div className="bg-white rounded-[1.5rem] overflow-hidden h-[500px] relative flex flex-col items-center pt-8 px-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
                    <div className="w-32 h-6 bg-gray-100 rounded mb-2"></div>
                    <div className="w-24 h-4 bg-gray-50 rounded mb-8"></div>
                    
                    <div className="w-full space-y-3">
                        <div className="h-12 bg-violet-50 rounded-xl w-full border border-violet-100 flex items-center px-4 gap-3">
                            <Phone className="w-5 h-5 text-violet-600" />
                            <div className="w-24 h-3 bg-violet-100/50 rounded"></div>
                        </div>
                        <div className="h-12 bg-green-50 rounded-xl w-full border border-green-100 flex items-center px-4 gap-3">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            <div className="w-24 h-3 bg-green-100/50 rounded"></div>
                        </div>
                        <div className="h-12 bg-blue-50 rounded-xl w-full border border-blue-100 flex items-center px-4 gap-3">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <div className="w-24 h-3 bg-blue-100/50 rounded"></div>
                        </div>
                    </div>

                    <div className="mt-auto mb-6 w-full bg-slate-900 text-white py-3 rounded-xl text-center text-xs">
                        שמור לאנשי קשר
                    </div>
                 </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-violet-100 to-indigo-50 rounded-full -z-10 blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                מה מקבלים <span className="text-violet-600">בכרטיס ביקור דיגיטלי חכם?</span>
              </h2>
              
              <ul className="space-y-6">
                {[
                  { text: "כרטיס דיגיטלי אישי עם URL קבוע", icon: Smartphone },
                  { text: "QR Code מוכן להדפסה ולשיתוף מיידי", icon: QrCode },
                  { text: "שמירה באנשי קשר (VCF) בלחיצה אחת", icon: UserPlus },
                  { text: "כפתורי פעולה חכמים: וואטסאפ, חיוג, ניווט ומייל", icon: Zap },
                  { text: "עיצוב מקצועי שמותאם לעסק שלך", icon: Layout },
                  { text: "עריכה חופשית בפרטים – תמיד נשאר מעודכן", icon: CheckCircle2 },
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center shrink-0 text-violet-600 mt-1">
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <span className="text-lg font-medium text-slate-800">{feature.text}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 p-6 bg-slate-50 border-r-4 border-violet-600 rounded-lg">
                <p className="text-lg font-medium text-slate-700 italic">
                  "זה לא סתם כרטיס – זו נקודת המפגש המקצועית שלך עם כל לקוח חדש."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟦 HOW IT WORKS - Simple Flow */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">3 צעדים וזה מוכן</h2>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-700 -z-10"></div>

            {[
              { step: 1, title: "ממלאים שאלון קצר", desc: "פרטים בסיסיים, לוגו ותמונה", icon: MessageCircle },
              { step: 2, title: "הכרטיס נוצר אוטומטית", desc: "המערכת מעצבת הכל לבד", icon: Zap },
              { step: 3, title: "מקבלים לינק + QR", desc: "מוכן לשיתוף מיידי עם לקוחות", icon: Share2 },
            ].map((item) => (
              <div key={item.step} className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors relative">
                <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-violet-600/30 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <a href={SIGNUP_URL}>
              <Button variant="outline" className="text-white border-slate-600 hover:bg-white hover:text-slate-900 h-12 px-8 rounded-full text-lg">
                רוצה לראות איך זה נראה?
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 🟦 SOCIAL PROOF / TRUST */}
      <section className="py-16 bg-violet-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              "מתאים לעצמאים ובעלי עסקים מכל התחומים",
              "נראה מעולה גם בפגישה וגם בוואטסאפ",
              "עובד בלי אפליקציה ובלי התקנות"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-violet-100">
                <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50" />
                <span className="font-medium text-slate-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🟦 PRICING BLOCK */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="border-2 border-violet-100 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
              מומלץ
            </div>
            
            <CardContent className="p-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">כמה זה עולה?</h2>
              
              <div className="mb-8">
                <span className="text-6xl font-bold text-slate-900">149₪</span>
                <span className="block text-lg text-slate-500 mt-2 font-medium">תשלום חד־פעמי</span>
              </div>

              <div className="space-y-4 mb-10 text-right max-w-[200px] mx-auto">
                {["בלי דמי מנוי חודשיים", "בלי התחייבות", "הכרטיס שלך לתמיד"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <a href={SIGNUP_URL}>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white h-14 text-lg rounded-xl shadow-lg shadow-violet-600/20">
                  צור כרטיס עכשיו - 149₪
                </Button>
              </a>

              <p className="mt-6 text-sm text-slate-500 bg-slate-50 py-2 px-4 rounded-lg inline-block">
                פחות מארוחת צהריים – יותר רושם מכל אתר
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 🟦 FINAL CTA */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
            כל מי שפוגש אותך –<br/>
            צריך לראות אותך <span className="text-violet-400">מקצועי</span>
          </h2>
          
          <div className="flex flex-col items-center gap-4">
            <a href={SIGNUP_URL}>
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white text-xl h-16 px-12 rounded-full shadow-xl shadow-violet-600/30 hover:scale-105 transition-transform">
                צור כרטיס ביקור דיגיטלי עכשיו
                <ArrowLeft className="mr-2 h-6 w-6" />
              </Button>
            </a>
            <p className="text-slate-400 text-sm mt-4">
              תוך דקות • בלי כאב ראש • מוכן לשימוש
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}