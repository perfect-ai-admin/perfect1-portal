import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Sparkles, MessageSquare, Video, CheckCircle2, 
  ArrowLeft, Brain, Smile, Globe
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

const SIGNUP_URL = "https://www.perfect1.co.il/login?from_url=https%3A%2F%2Fwww.perfect1.co.il%2FAPP";

const features = [
  {
    icon: User,
    title: "פרזנטור דיגיטלי אישי",
    desc: "דמות שמבוססת עליך או על המותג שלך, שמדברת בקול שלך ומשדרת את המסרים שלך 24/7."
  },
  {
    icon: Video,
    title: "יצירת וידאו מיידית",
    desc: "אין צורך בצלם, תאורה או ימי צילום. פשוט מקלידים טקסט והאווטר מדבר אותו בוידאו איכותי."
  },
  {
    icon: Globe,
    title: "מדבר בכל שפה",
    desc: "האווטר שלך יכול לדבר עברית, אנגלית ועוד 50 שפות, כדי שתוכל לפנות לקהלים חדשים בקלות."
  },
  {
    icon: Smile,
    title: "תמיד נראה מעולה",
    desc: "לא משנה אם קמת עייף או אין לך כוח להצטלם - האווטר תמיד ייצג אותך בצורה המקצועית והמרשימה ביותר."
  }
];

const useCases = [
  {
    title: "סרטוני הדרכה",
    desc: "הסבר על מוצרים או שירותים בצורה ברורה ועקבית."
  },
  {
    title: "שיווק ברשתות",
    desc: "יצירת תוכן לטיקטוק ואינסטגרם בקצב גבוה בלי להצטלם."
  },
  {
    title: "ברכה אישית",
    desc: "שליחת סרטון תודה או ברכה ללקוח בשניות."
  },
  {
    title: "נציג באתר",
    desc: "דמות שמקבלת את פני הגולשים באתר ומסבירה עליו."
  }
];

const faqs = [
  {
    q: "האם זה נראה אמיתי?",
    a: "כן, הטכנולוגיה שלנו יוצרת אווטרים ברמה פוטו-ריאליסטית, כולל תנועות שפתיים מסונכרנות ושפת גוף טבעית."
  },
  {
    q: "האם אני צריך להקליט את הקול שלי?",
    a: "אתה יכול להשתמש בקול שלך (אנחנו נשכפל אותו) או לבחור מתוך מאגר של קולות מקצועיים ונעימים."
  },
  {
    q: "כמה זמן לוקח לייצר סרטון?",
    a: "ברגע שהאווטר מוכן, יצירת סרטון חדש לוקחת דקות בודדות. פשוט כותבים את הטקסט ומקבלים וידאו."
  },
  {
    q: "האם זה מתאים למותג שלי?",
    a: "בהחלט. אנחנו מתאימים את האווטר (לבוש, רקע, סגנון דיבור) לשפה המותגית שלך כדי ליצור זהות אחידה."
  }
];

export default function AvatarAiPage() {
  return (
    <>
      <Header />
      <main className="pt-20 bg-white font-sans overflow-x-hidden">
        
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-fuchsia-50 via-white to-white">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-fuchsia-200/20 blur-[100px] rounded-full -z-10" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-200/20 blur-[100px] rounded-full -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white border border-fuchsia-100 text-fuchsia-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-6">
                <Brain className="w-4 h-4" />
                <span>הפנים החדשות של העסק שלך</span>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
                אווטר AI שמייצג אותך<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-violet-600">
                   בכל מקום, 24/7
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 font-light max-w-3xl mx-auto mb-10 leading-relaxed">
                תפסיק לשבור את הראש על ימי צילום. צור פרזנטור דיגיטלי מושלם
                שמדבר את המסרים שלך, נראה מעולה תמיד, ומייצר לך תוכן וידאו אינסופי בקליק.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={SIGNUP_URL}>
                  <Button className="h-14 px-8 text-lg rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 shadow-xl shadow-fuchsia-600/20 w-full sm:w-auto">
                    צור את האווטר שלך
                    <Sparkles className="mr-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Visual Representation */}
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-16 relative mx-auto max-w-4xl"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 aspect-video overflow-hidden flex items-center justify-center bg-gray-900">
                {/* Mockup Interface */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-50" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full px-12">
                    {/* Avatar Preview */}
                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-fuchsia-500 shadow-[0_0_40px_rgba(232,121,249,0.3)] bg-gray-800 overflow-hidden relative">
                         <img
                           src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500"
                           alt="Avatar"
                           loading="lazy"
                           decoding="async"
                           className="w-full h-full object-cover opacity-90" />
                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-20 flex items-end justify-center pb-4">
                             <div className="flex gap-1">
                                 <div className="w-1 h-4 bg-fuchsia-500 rounded-full animate-pulse" />
                                 <div className="w-1 h-6 bg-fuchsia-500 rounded-full animate-pulse delay-75" />
                                 <div className="w-1 h-3 bg-fuchsia-500 rounded-full animate-pulse delay-150" />
                                 <div className="w-1 h-5 bg-fuchsia-500 rounded-full animate-pulse delay-100" />
                             </div>
                         </div>
                    </div>

                    {/* Chat/Script Input */}
                    <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full text-right">
                        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                            <MessageSquare className="w-4 h-4 text-fuchsia-400" />
                            <span className="text-white text-sm font-medium">התסריט שלך</span>
                        </div>
                        <div className="space-y-2">
                             <div className="h-2 w-3/4 bg-white/20 rounded animate-pulse" />
                             <div className="h-2 w-full bg-white/20 rounded animate-pulse delay-75" />
                             <div className="h-2 w-5/6 bg-white/20 rounded animate-pulse delay-150" />
                        </div>
                        <div className="mt-6 flex justify-end">
                             <div className="bg-fuchsia-600 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                                 <Video className="w-3 h-3" />
                                 ג'נרט וידאו
                             </div>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">למה העסק שלך חייב אווטר?</h2>
              <p className="text-xl text-gray-500">זה הרבה יותר מ"גימיק", זה כוח עבודה דיגיטלי</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="p-8 rounded-[2rem] bg-fuchsia-50/50 border border-fuchsia-100 hover:bg-white hover:shadow-xl hover:border-fuchsia-200 transition-all group duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-fuchsia-600">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-20 bg-gray-900 text-white">
           <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-black mb-6">איפה משתמשים בזה?</h2>
                 <p className="text-xl text-gray-400">בכל מקום שבו הלקוחות שלך רוצים לראות פנים ולשמוע קול</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 {useCases.map((useCase, idx) => (
                    <div key={idx} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-fuchsia-500 transition-colors flex items-start gap-4">
                        <div className="mt-1 bg-fuchsia-500/20 p-2 rounded-lg text-fuchsia-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                            <p className="text-gray-400">{useCase.desc}</p>
                        </div>
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
                  <AccordionTrigger className="text-right text-lg font-bold text-gray-900 hover:text-fuchsia-600 hover:no-underline py-6">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed text-lg pb-6 pr-4 border-r-2 border-fuchsia-200">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white text-center">
            <div className="relative z-10 max-w-4xl mx-auto px-4">
                <h2 className="text-4xl md:text-6xl font-black mb-6">תתחיל לייצר וידאו בקצב של AI</h2>
                <p className="text-xl text-gray-300 mb-10">הצטרף למהפכה ותן לאווטר שלך לעבוד בשבילך</p>
                <a href={SIGNUP_URL}>
                  <Button className="h-16 px-12 text-xl rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-2xl hover:scale-105 transition-transform font-bold">
                    צור אווטר לעסק עכשיו
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