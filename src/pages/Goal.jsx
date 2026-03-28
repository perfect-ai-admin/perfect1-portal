import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, Users, Wallet, Target, 
  LayoutGrid, Clock, Heart, Megaphone,
  ArrowLeft, CheckCircle2, Zap, BarChart3,
  Shield, Rocket, Brain, Sparkles,
  XCircle, MessageCircle, ShieldCheck,
  Mic, Trophy, Star,
  ScanFace, Magnet, RefreshCcw,
  PenTool, Share2, Calendar, Repeat,
  Copy, Map,
  Gift, UserPlus, Smile, LifeBuoy,
  Bot, Coffee, Hourglass, Cpu,
  ClipboardCheck, FileText, Flame, Construction
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SIGNUP_URL = "https://perfect-dashboard.com/login?from_url=https%3A%2F%2Fperfect-dashboard.com%2FClientDashboard";

// --- GENERIC GOAL DATA ---
const goalsData = {
  'increase-revenue': {
    title: 'הגדלת הכנסה חודשית',
    subtitle: 'המנטור שלך יבנה איתך תכנית צמיחה עקבית ולא יוותר לך עד שתראה את המספרים עולים',
    icon: TrendingUp,
    color: 'emerald',
    description: 'זה לא עוד קורס. זה מנטור צמוד שמנתח את המספרים שלך, בונה תכנית עבודה עמוקה ומלווה אותך צעד-אחר-צעד. הוא יגיד לך בדיוק מה לעשות בכל בוקר כדי לשפר רווחיות, ולא ייתן לך לוותר לעצמך עד שהיעד יושג.',
    steps: [
      {
        title: 'ניתוח עומק עם המנטור',
        desc: 'המנטור יצלול איתך למספרים, יזהה איפה הכסף "בורח" ויסמן בדיוק את הנקודות שחייבות טיפול מיידי.'
      },
      {
        title: 'בניית מדרג מוצרים חכם',
        desc: 'יחד נבנה סולם ערך שיגרום ללקוחות לקנות יותר. המנטור ינחה אותך איך להגדיל את העסקה הממוצעת בצורה טבעית.'
      },
      {
        title: 'אופטימיזציית תמחור מודרכת',
        desc: 'המנטור יעזור לך להתאים את המחירים כדי למקסם רווחים, על בסיס נתונים קרים ולא תחושות בטן.'
      },
      {
        title: 'ליווי יומי עד ליעד',
        desc: 'בכל בוקר המנטור יציב לך יעדים יומיים ויבדוק אותך בסוף היום. הוא כאן כדי לוודא שאתה לא מוריד רגל מהגז.'
      }
    ],
    outcomes: [
      'עלייה ממוצעת של 20-30% בהכנסות בלווי המנטור',
      'שליטה מלאה במספרים ובתחזיות',
      'תחושת ביטחון שיש מי שמכוון את הספינה',
      'רווח נקי גדול יותר שנשאר בכיס'
    ]
  },
  'increase-customers': {
    title: 'הגדלת כמות לקוחות',
    subtitle: 'המנטור יבנה לך מכונת שיווק משומנת וידחוף אותך לייצר זרם לידים קבוע',
    icon: Users,
    color: 'blue',
    description: 'המנטור לא מאמין במזל, אלא בסיסטם. הוא ילווה אותך בבניית מערך שיווקי חכם, ידייק איתך את המסרים, וידאג שאתה מבצע את הפעולות הנדרשות כדי להפוך מתעניינים ללקוחות משלמים, יום אחרי יום.',
    steps: [
      {
        title: 'זיקוק קהל היעד',
        desc: 'המנטור ישאל אותך את השאלות הקשות כדי להגדיר בדיוק מי הלקוח האידיאלי, ואיפה הכי נכון לתפוס אותו.'
      },
      {
        title: 'בניית משפך שיווקי',
        desc: 'הנחיה צעד-אחר-צעד בבניית המסלול שעובר הלקוח. המנטור יוודא ששום שלב לא מתפספס בדרך למכירה.'
      },
      {
        title: 'יצירת תוכן מגנט עם AI',
        desc: 'המנטור יעזור לך לייצר תכנים מדויקים שמושכים בדיוק את הלקוחות הנכונים, בלי שתצטרך לשבור את הראש.'
      },
      {
        title: 'ניהול לידים קפדני',
        desc: 'המנטור יטמיע אצלך שיטות עבודה שיבטיחו שאף פנייה לא הולכת לאיבוד, ורק הלקוחות הבשלים מגיעים אליך.'
      }
    ],
    outcomes: [
      'זרם לידים יציב שהמנטור עוזר לייצר',
      'חיסכון בזמן על שיחות עם לקוחות לא רלוונטיים',
      'מערכת שיווק שעובדת לפי תכנית סדורה',
      'גדילה עקבית בבסיס הלקוחות הפעיל'
    ]
  },
  'cash-flow-stability': {
    title: 'יציבות בתזרים מזומנים',
    subtitle: 'המנטור יעשה לך סדר בבלאגן וילמד אותך לשלוט בעתיד הפיננסי של העסק',
    icon: Wallet,
    color: 'violet',
    description: 'מספיק עם כיבוי שריפות. המנטור יכריח אותך להסתכל למספרים בעיניים, יבנה איתך תחזית תזרים מדויקת וילווה אותך בניהול הכסף בצורה אחראית ומחושבת, כדי שתוכל לישון בשקט.',
    steps: [
      {
        title: 'מיפוי פיננסי מלא',
        desc: 'המנטור יעבור איתך על כל הוצאה והכנסה. נעשה סדר מוחלט כדי להבין בדיוק מה המצב האמיתי.'
      },
      {
        title: 'בניית תחזית קדימה',
        desc: 'יחד נבנה מודל שצופה את מצב החשבון 3-6 חודשים קדימה. המנטור יתריע בפניך לפני שנוצרת בעיה.'
      },
      {
        title: 'ניהול גבייה ללא פשרות',
        desc: 'המנטור יטמיע אצלך תהליכים אוטומטיים ונוקשים לגבייה, כדי שכל שקל שמגיע לך יכנס בזמן.'
      },
      {
        title: 'יצירת "כרית ביטחון"',
        desc: 'תכנית עבודה להפרשת כספים לחיסכון. המנטור לא ייתן לך "לגנוב" מהעתיד של העסק.'
      }
    ],
    outcomes: [
      'שליטה מלאה ושקט נפשי בניהול התזרים',
      'קבלת החלטות השקעה בביטחון עם המנטור',
      'אפס הפתעות מול הבנק',
      'יציבות פיננסית ארוכת טווח'
    ]
  },
  // 'improve-closing-rate' is handled by a custom component below
  'business-order': {
    title: 'סדר ושליטה בעסק',
    subtitle: 'המנטור יעזור לך להפוך כאוס למכונה משומנת וישחרר אותך מהניהול השוטף',
    icon: LayoutGrid,
    color: 'cyan',
    description: 'המנטור יצלול איתך לקרביים של העסק, ימפה כל תהליך ויבנה איתך נהלי עבודה מסודרים. המטרה: לבנות תשתית חזקה שתאפשר לעסק לעבוד גם בלעדיך.',
    steps: [
      {
        title: 'מיפוי תהליכים יסודי',
        desc: 'המנטור ינחה אותך לתעד איך כל דבר קורה בעסק, כדי לזהות צווארי בקבוק וכפילויות.'
      },
      {
        title: 'כתיבת ספר נהלים',
        desc: 'יחד נהפוך את הידע שבראש שלך לשיטה כתובה. המנטור יתעקש על סדר ובהירות.'
      },
      {
        title: 'הטמעת שגרות ניהול',
        desc: 'המנטור יבנה לך לו"ז ניהולי ומערכת משימות, ויוודא שאתה עובד לפיהם ולא לפי כיבוי שריפות.'
      },
      {
        title: 'שחרור והאצלת סמכויות',
        desc: 'המנטור יעזור לך לזהות מה לשחרר, למי, ואיך לפקח על זה בלי לעשות את זה בעצמך.'
      }
    ],
    outcomes: [
      'עסק שדופק כמו שעון גם כשאתה לא שם',
      'מינימום תקלות וטעויות אנוש',
      'יכולת לגדול ולקלוט עובדים בקלות',
      'שקט נפשי ופניות לחשוב על אסטרטגיה'
    ]
  },
  'save-time': {
    title: 'חיסכון בזמן עבודה',
    subtitle: 'המנטור יזהה את גזלני הזמן שלך וילמד אותך לעבוד חכם, לא קשה',
    icon: Clock,
    color: 'orange',
    description: 'המנטור לא ייתן לך להמשיך לטבוע בעבודה שחורה. הוא ינתח את הלו"ז שלך, יכניס אוטומציות ובינה מלאכותית, ויבנה לך סדר יום שמתמקד רק במה שמביא תוצאות.',
    steps: [
      {
        title: 'אבחון בזבוז זמן',
        desc: 'המנטור ישקף לך איפה אתה שורף זמן יקר על פעולות שלא מקדמות את העסק.'
      },
      {
        title: 'אוטומציה של השגרה',
        desc: 'יחד נגדיר תהליכים אוטומטיים שיחליפו אותך במשימות הסיזיפיות. המנטור ידאג לביצוע.'
      },
      {
        title: 'ייעול בעזרת AI',
        desc: 'המנטור ילמד אותך להשתמש בכלים שלנו כדי לסיים משימות של שעות בדקות בודדות.'
      },
      {
        title: 'ניהול זמן אכזרי',
        desc: 'בניית לו"ז שמתמקד ב-20% שמביא 80% מהתוצאות. המנטור לא ייתן לך לסטות ממנו.'
      }
    ],
    outcomes: [
      'חיסכון של 10-15 שעות שבועיות בהנחיית המנטור',
      'פוקוס מוחלט על צמיחה במקום תפעול',
      'איזון בריא יותר בין עבודה לחיים אישיים',
      'הספק כפול בחצי מהזמן'
    ]
  },
  'customer-retention': {
    title: 'שימור והחזרת לקוחות',
    subtitle: 'המנטור יעזור לך להפוך לקוחות מזדמנים למעריצים נאמנים שקונים שוב ושוב',
    icon: Heart,
    color: 'pink',
    description: 'המנטור יבנה איתך "מסע לקוח" שמרגש ומשמר. הוא ינחה אותך מתי ואיך לתקשר עם לקוחות קיימים, ויוודא שאתה לא מזניח את הנכס הכי גדול של העסק שלך.',
    steps: [
      {
        title: 'תכנון מסע לקוח',
        desc: 'המנטור יעזור לך למפות את החוויה של הלקוח ולייצר נקודות "וואו" שיגרמו לו להישאר.'
      },
      {
        title: 'תקשורת יזומה',
        desc: 'בניית גאנט תקשורת וניוזלטרים. המנטור ידחוף אותך לשמור על קשר רציף ובעל ערך.'
      },
      {
        title: 'הצעות ערך ללקוחות',
        desc: 'המנטור יעזור לך לייצר מבצעים בלעדיים שמעודדים רכישה חוזרת והגדלת סל.'
      },
      {
        title: 'הפעלת מנגנון המלצות',
        desc: 'שיטה סדורה שהמנטור יטמיע אצלך, שתגרום ללקוחות המרוצים להביא חברים לעסק.'
      }
    ],
    outcomes: [
      'עלייה דרמטית בערך חיי לקוח (LTV)',
      'הכנסה יציבה ובטוחה מלקוחות חוזרים',
      'קהילה נאמנה שהופכת לשגרירים שלך',
      'יותר רווח במינימום הוצאות שיווק'
    ]
  },
  'marketing-machine': {
    title: 'מנגנון שיווק קבוע',
    subtitle: 'המנטור יבנה איתך מכונת תוכן שלא עוצרת וממצבת אותך כאוטוריטה',
    icon: Megaphone,
    color: 'indigo',
    description: 'המנטור לא ייתן לך להיעלם מהתודעה. הוא יבנה איתך אסטרטגיית תוכן ארוכת טווח, יעזור לך לייצר אותה בקלות, ויוודא שאתה שומר על עקביות שבונה מותג חזק.',
    steps: [
      {
        title: 'אסטרטגיית תוכן מנצחת',
        desc: 'המנטור יתכנן איתך גאנט תוכן מדויק - מה מפרסמים, מתי ואיפה, כדי להשיג מקסימום אפקט.'
      },
      {
        title: 'ייצור תוכן מהיר',
        desc: 'שימוש בכלי ה-AI בהנחיית המנטור כדי לייצר פוסטים וסרטונים מעולים במינימום מאמץ.'
      },
      {
        title: 'נוכחות רב-ערוצית',
        desc: 'המנטור ידחוף אותך להפיץ את המסר בכל הערוצים הרלוונטיים במקביל, בלי לוותר.'
      },
      {
        title: 'מדידה ושיפור מתמיד',
        desc: 'מעקב שבועי עם המנטור על הנתונים. נלמד מה עובד, נשפר ונשכפל את ההצלחה.'
      }
    ],
    outcomes: [
      'מותג חזק שנמצא תמיד בתודעה',
      'זרם פניות קבוע בזכות עבודה עקבית',
      'מיצוב כמומחה מוביל בתחומך',
      'שחרור מהתלות בקמפיינים ממומנים יקרים'
    ]
  }
};

const colorClasses = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'text-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', icon: 'text-violet-600', button: 'bg-violet-600 hover:bg-violet-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-600', button: 'bg-amber-600 hover:bg-amber-700' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: 'text-cyan-600', button: 'bg-cyan-600 hover:bg-cyan-700' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-600', button: 'bg-orange-600 hover:bg-orange-700' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: 'text-pink-600', button: 'bg-pink-600 hover:bg-pink-700' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'text-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700' },
};

// --- CUSTOM COMPONENT FOR 'business-order' ---
function BusinessOrderView() {
  return (
    <>
        <Header />
        <main className="pt-20 bg-white font-sans text-gray-900" dir="rtl">
        
        {/* HERO SECTION - HIGH IMPACT */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-slate-900 to-slate-900 z-0"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] mb-8">
                <LayoutGrid className="w-4 h-4" />
                <span>המנכ"ל והאסטרטג שלך מוכן</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
                להפוך כאוס<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">למכונה משומנת</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
                מרגיש שהכל תלוי בך? שיום חופש הוא בגדר חלום? המנטור יעזור לך לבנות נהלים, להאציל סמכויות וליצור עסק שיודע לעבוד (ולהרוויח) גם כשאתה לא נמצא.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={SIGNUP_URL}>
                  <Button className="h-16 px-12 text-xl rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300 font-bold border-0">
                    אני רוצה עסק שעובד בשבילי
                    <ArrowLeft className="mr-2 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THE PAIN */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">למה העסק שלך מבולגן?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                כי בנית אותו תוך כדי תנועה, בלי תשתית ניהולית. עכשיו, כשגדלת, ה"שיטה" הישנה כבר לא עובדת.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'הכל בראש שלך', desc: 'אין נהלים כתובים. אם אתה חולה או בחופש, העסק נעצר. אתה הצוואר בקבוק של הכל.', icon: Brain },
                { title: 'כיבוי שריפות תמידי', desc: 'במקום לנהל, אתה מגיב לבעיות. לקוח כועס, עובד שלא הבין, ספק שאיחר. זה מתיש.', icon: Flame },
                { title: 'טעויות חוזרות', desc: 'אותן פאשלות קורות שוב ושוב כי אין סיסטם שמונע אותן. זה עולה לך הרבה כסף ועצבים.', icon: RefreshCcw }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/50 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-cyan-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION - DEEP DIVE PROCESS */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-cyan-600 font-bold tracking-wider uppercase text-sm">הסיסטם לניהול</span>
              <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6">מחנות מכולת לארגון מוביל</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                המנטור יעזור לך להוציא את הידע מהראש שלך, להפוך אותו לנהלים ברורים, ולבנות היררכיה ושגרות ניהול שיאפשרו לך לשחרר.
              </p>
            </div>

            <div className="space-y-24">
              
              {/* STEP 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-[2rem] rotate-3 opacity-10"></div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center">
                        <ScanFace className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 01</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">מיפוי תהליכי ליבה</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">תיעוד המסלול המלא של המוצר/שירות מההתחלה עד הסוף</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זיהוי נקודות כשל וצווארי בקבוק בתהליך</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הגדרת "מי אחראי על מה" בצורה ברורה</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">איך הדברים עובדים באמת?</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    הצעד הראשון לסדר הוא להבין את הכאוס. המנטור ישקף לך את העסק כמו שמעולם לא ראית אותו - כרצף של פעולות ותהליכים שחייבים להתחבר זה לזה בצורה חלקה.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 to-indigo-600 rounded-[2rem] -rotate-3 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 02</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">ספר הנהלים (Playbook)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">כתיבת הוראות הפעלה לכל תפקיד ומשימה בעסק</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת צ'ק-ליסטים למניעת טעויות אנוש</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הנגשת הידע לצוות בצורה פשוטה וברורה</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">להפוך את הידע לנכס</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    כשכל הידע כתוב, אתה יכול להחליף עובדים בקלות, לקלוט חדשים במהירות, ולהפסיק לענות על אותן שאלות 10 פעמים ביום. העסק הופך למערכת שאינה תלויה בזיכרון של אף אחד.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-cyan-600 rounded-[2rem] rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                        <ClipboardCheck className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 03</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">שגרות ניהול ובקרה</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הגדרת פגישות צוות אפקטיביות (בלי מריחות זמן)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">קביעת מדדי ביצוע (KPIs) לכל עובד ולעסק כולו</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">דוחות בקרה שבועיים שמשקפים את הדופק של העסק</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">לנהל, לא להתנהל</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    המנטור יעזור לך לבנות את הלו"ז הניהולי שלך. במקום להיות "מנכ"ל כיבוי שריפות", תהפוך ל"מנכ"ל מנווט" שיודע בדיוק מה קורה בכל רגע ומה צריך לעשות כדי להתקדם.
                  </p>
                </div>
              </div>

               {/* STEP 4 */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-teal-500 to-green-600 rounded-[2rem] -rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                        <Construction className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 04</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">בניית צוות מנצח</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הגדרות תפקיד מדויקות וגיוס האנשים הנכונים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">תהליכי חפיפה והכשרה מובנים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">תרבות ארגונית של מצוינות ואחריות אישית</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">אתה לא יכול לעשות הכל לבד</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    כדי לגדול, אתה צריך ידיים טובות שיעזרו לך. המנטור ילווה אותך בבניית הצוות, כך שתוכל לסמוך עליהם בעיניים עצומות ולדעת שהעסק בידיים טובות.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DAY IN THE LIFE */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">סמנכ"ל התפעול (COO) שלך</h2>
                <p className="text-xl text-gray-400">
                    המנטור דואג שהרכבת תגיע בזמן, כל הזמן. בלי תקלות ובלי הפתעות.
                </p>
            </div>

            <div className="space-y-8">
                {[
                    { time: '08:00', title: 'מסדר בוקר וירטואלי', desc: 'המנטור: "בוקר טוב. הנה רשימת המשימות הפתוחות של הצוות להיום. שים לב שמשימה X בפיגור."' },
                    { time: '11:00', title: 'בקרת איכות', desc: 'התראה: "לקוח דיווח על תקלה. זה קרה כבר 3 פעמים החודש. הנה נוהל מתוקן למניעת הישנות המקרה."' },
                    { time: '14:00', title: 'ניהול עובדים', desc: 'תזכורת: "לעובד Y יש שיחת משוב היום. הנה סיכום הביצועים שלו בחודש האחרון כדי שתגיע מוכן."' },
                    { time: '17:00', title: 'דוח סוף יום', desc: 'סיכום: "היום טופלו 40 פניות, נסגרו 5 עסקאות, כל המשימות בוצעו. העסק עבד ב-95% יעילות."' }
                ].map((slot, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                        <div className="w-20 font-mono text-cyan-400 text-xl font-bold pt-1">{slot.time}</div>
                        <div className="flex-1 pb-8 border-b border-gray-800 group-last:border-0">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{slot.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{slot.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-b from-cyan-50 to-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
             <LayoutGrid className="w-12 h-12 text-cyan-500 mx-auto mb-6 fill-current" />
             <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
               רוצה לצאת לחופש בראש שקט?
             </h2>
             <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
               זה אפשרי. תן למנטור לעזור לך לבנות עסק שלא תלוי בך, אלא עובד בשבילך.
             </p>
             
             <a href={SIGNUP_URL}>
                <Button className="h-16 px-16 text-xl rounded-full bg-gray-900 text-white shadow-2xl hover:bg-black hover:scale-105 transition-all duration-300">
                   אני רוצה לעשות סדר בעסק
                   <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
             </a>
             <p className="mt-6 text-sm text-gray-500">
               * ללא התחייבות • אפשרות ביטול בכל רגע • 14 יום ניסיון חינם
             </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">שאלות נפוצות</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>כתיבת נהלים זה לא משעמם?</AccordionTrigger>
                        <AccordionContent>
                        זה יכול להיות, אבל זה הדבר הכי רווחי שתעשה. המנטור וה-AI עוזרים לך לכתוב אותם מהר מאוד. אנחנו הופכים הקלטה קולית שלך לנוהל כתוב ומסודר תוך שניות.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>העסק שלי קטן, אני באמת צריך את זה?</AccordionTrigger>
                        <AccordionContent>
                        דווקא כשהעסק קטן קל יותר לבנות תשתית נכונה. כשתגדל (וזו המטרה), יהיה קשה מאוד לתקן את היסודות. תבנה עכשיו כמו "גדול", ותגדל חלק.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>האם זה יגרום לעסק להרגיש "בירוקרטי"?</AccordionTrigger>
                        <AccordionContent>
                        ההפך. סדר יוצר חופש. כשכולם יודעים מה לעשות, אין שאלות מיותרות, אין עיכובים והכל זורם מהר יותר. בירוקרטיה זה כשהדברים *לא* ברורים.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        <Footer />
    </main>
    </>
  );
}

// --- CUSTOM COMPONENT FOR 'save-time' ---
function SaveTimeView() {
  return (
    <>
        <Header />
        <main className="pt-20 bg-white font-sans text-gray-900" dir="rtl">
        
        {/* HERO SECTION - HIGH IMPACT */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-slate-900 to-slate-900 z-0"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)] mb-8">
                <Clock className="w-4 h-4" />
                <span>מנהל הזמן והאופרציה שלך מוכן</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
                להפסיק לכבות שריפות<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">ולהתחיל לנהל את הזמן</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
                אתה עובד קשה מדי. המנטור יעזור לך להטמיע אוטומציות חכמות, לנקות את הלו"ז מרעשים ולהחזיר לעצמך 10 שעות עבודה בשבוע - כבר בחודש הראשון.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={SIGNUP_URL}>
                  <Button className="h-16 px-12 text-xl rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:scale-105 transition-all duration-300 font-bold border-0">
                    אני רוצה את החיים שלי בחזרה
                    <ArrowLeft className="mr-2 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THE PAIN */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">למה אין לך זמן לנשום?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                העסק אמור לשרת אותך, אבל כרגע אתה משרת את העסק 24/7. זה לא חייב להיות ככה.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'עבודה שחורה וסיזיפית', desc: 'אתה עושה ידנית דברים שהיו צריכים לקרות לבד (חשבוניות, תיאומים, מיילים). זה שורף לך שעות.', icon: Repeat },
                { title: 'הפרעות בלתי פוסקות', desc: 'כל טלפון וכל הודעה מקפיצים אותך. אין לך רגע אחד של פוקוס אמיתי ליצירה ופיתוח העסק.', icon: MessageCircle },
                { title: '"אם אני לא שם זה לא קורה"', desc: 'בנית עסק שתלוי בך ב-100%. אתה הצוואר בקבוק של עצמך, ולכן אתה לא יכול לגדול.', icon: XCircle }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION - DEEP DIVE PROCESS */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-orange-600 font-bold tracking-wider uppercase text-sm">הסיסטם להתייעלות</span>
              <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6">לעבוד חכם, לא קשה</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                המנטור יעזור לך לנקות את השולחן, להעביר משימות ל"רובוטים" (אוטומציה ו-AI) ולהתמקד רק במה שמביא כסף וצמיחה.
              </p>
            </div>

            <div className="space-y-24">
              
              {/* STEP 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-[2rem] rotate-3 opacity-10"></div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                        <ScanFace className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 01</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">אבחון גזלני זמן (Time Audit)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">מיפוי מדויק: איפה השעות שלך נשרפות באמת?</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זיהוי משימות שחייבות לעבור האצלה או אוטומציה</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">חסימת "חורים שחורים" בלו"ז (רשתות חברתיות, שיחות סרק)</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">לאן נעלם היום שלך?</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    רובנו בטוחים שאנחנו "עובדים", אבל בפועל אנחנו מתעסקים בטפל. המנטור ישים לך מראה מול העיניים ויראה לך כמה זמן אתה מבזבז על דברים שאסור לך לעשות.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-amber-500 to-yellow-600 rounded-[2rem] -rotate-3 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 02</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">צבא של רובוטים (אוטומציה)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">חשבוניות, מיילים ותיאומים - הכל קורה לבד</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">חיבור בין המערכות שלך (CRM, מייל, יומן) לסנכרון מלא</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">שימוש ב-AI לביצוע משימות "אנושיות" (כתיבה, סיכום, מענה)</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">תן לטכנולוגיה לעבוד בשבילך</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    למה להעתיק נתונים ידנית או לשלוח מייל גנרי כשאפשר לעשות את זה אוטומטית? המנטור יעזור לך להקים תשתיות שעובדות 24/7, בלי להתעייף ובלי לבקש העלאה.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500 to-lime-600 rounded-[2rem] rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 03</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">ניהול משימות ופוקוס (Deep Work)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">שיטת "חלונות זמן" לעבודה מרוכזת ללא הפרעות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">תיעדוף אכזרי: מה חשוב ומה דחוף (ומה הולך לפח)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">ניהול אנרגיה, לא רק ניהול זמן (מתי אתה הכי חד?)</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">שעה אחת של פוקוס שווה יום שלם</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    המנטור יילחם על תשומת הלב שלך. נלמד אותך לסגור את הטלפון, להתנתק מהרעש, ולייצר בשעתיים מה שפעם לקח לך יומיים של מריחה.
                  </p>
                </div>
              </div>

               {/* STEP 4 */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-orange-500 to-red-600 rounded-[2rem] -rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                        <Coffee className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 04</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">איזון ושחרור (Freedom)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בניית נהלים שמאפשרים לך להתנתק בלי שהעסק יקרוס</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יציאה לחופש אמיתי (בלי לפתוח לפטופ)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זמן איכות למשפחה ולתחביבים כחלק מהלו"ז הקדוש</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">פתאום יש לך חיים</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    המטרה של העסק היא לתת לך חופש, לא לקחת אותו. המנטור יוודא שאתה מסיים לעבוד בשעה נורמלית, שיש לך סופי שבוע פנויים, ושאתה נהנה מהדרך.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DAY IN THE LIFE */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">העוזר האישי (הקשוח) שלך</h2>
                <p className="text-xl text-gray-400">
                    המנטור שומר על הזמן שלך מכל משמר, ולא נותן לאף אחד לבזבז אותו - כולל לך.
                </p>
            </div>

            <div className="space-y-8">
                {[
                    { time: '08:00', title: 'תכנון בוקר מהיר', desc: 'המנטור מציג: "יש לך 3 משימות ליבה היום. כל השאר - לדחות, להאציל או למחוק. אל תתפזר."' },
                    { time: '10:00', title: 'חלון פוקוס', desc: 'התראה: "עכשיו שעה וחצי של עבודה עמוקה על הפרויקט החדש. סגור וואטסאפ, שים טיימר. בהצלחה."' },
                    { time: '13:00', title: 'אוטומציה בפעולה', desc: 'עדכון: "בזמן שעבדת, המערכת שלחה הצעות מחיר ל-4 לידים ותיאמה לך 2 פגישות. חסכת 45 דקות."' },
                    { time: '17:00', title: 'סגירת יום', desc: 'המנטור נוזף: "סיימת את היעדים להיום. סגור את המחשב ולך הביתה. מחר יום חדש."' }
                ].map((slot, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                        <div className="w-20 font-mono text-orange-400 text-xl font-bold pt-1">{slot.time}</div>
                        <div className="flex-1 pb-8 border-b border-gray-800 group-last:border-0">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">{slot.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{slot.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-b from-orange-50 to-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
             <Hourglass className="w-12 h-12 text-orange-500 mx-auto mb-6 fill-current" />
             <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
               הזמן שלך שווה כסף
             </h2>
             <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
               תפסיק לבזבז אותו על שטויות. תן למנטור לעשות סדר ולהחזיר לך את השליטה בחיים.
             </p>
             
             <a href={SIGNUP_URL}>
                <Button className="h-16 px-16 text-xl rounded-full bg-gray-900 text-white shadow-2xl hover:bg-black hover:scale-105 transition-all duration-300">
                   אני רוצה להתייעל עכשיו
                   <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
             </a>
             <p className="mt-6 text-sm text-gray-500">
               * ללא התחייבות • אפשרות ביטול בכל רגע • 14 יום ניסיון חינם
             </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">שאלות נפוצות</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>אוטומציה זה לא מסובך טכנית?</AccordionTrigger>
                        <AccordionContent>
                        פעם זה היה מסובך, היום זה פשוט. המנטור והכלים שלנו עושים את הרוב מאחורי הקלעים. אנחנו נראה לך בדיוק על מה ללחוץ, או שנעשה את זה בשבילך.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>העסק שלי דורש יחס אישי, רובוט יכול להחליף את זה?</AccordionTrigger>
                        <AccordionContent>
                        הרובוט לא מחליף את היחס האישי, הוא מפנה לך זמן לתת אותו. במקום לבזבז זמן על תיאום פגישות (שרובוט עושה מצוין), יהיה לך זמן לשיחה אמיתית ועמוקה עם הלקוח.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>אני רגיל לשלוט בהכל, איך משחררים?</AccordionTrigger>
                        <AccordionContent>
                        בהדרגה ובביטחון. המנטור יעזור לך לשחרר משימות קטנות ופשוטות קודם, וכשתראה שזה עובד טוב יותר בלעדיך, הביטחון שלך לשחרר עוד יגדל.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        <Footer />
    </main>
    </>
  );
}

// --- CUSTOM COMPONENT FOR 'customer-retention' ---
function CustomerRetentionView() {
  return (
    <>
        <Header />
        <main className="pt-20 bg-white font-sans text-gray-900" dir="rtl">
        
        {/* HERO SECTION - HIGH IMPACT */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/40 via-slate-900 to-slate-900 z-0"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)] mb-8">
                <Heart className="w-4 h-4" />
                <span>מנהל חווית הלקוח שלך מוכן</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
                להפסיק את הנטישה<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">ולהפוך לקוחות למעריצים</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
                קל פי 5 למכור ללקוח קיים מאשר להביא חדש. המנטור יעזור לך לבנות "דלי ללא חורים", לייצר חווית שירות יוצאת דופן ולגרום ללקוחות שלך לקנות ממך שוב ושוב.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={SIGNUP_URL}>
                  <Button className="h-16 px-12 text-xl rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] hover:scale-105 transition-all duration-300 font-bold border-0">
                    אני רוצה לקוחות נאמנים לתמיד
                    <ArrowLeft className="mr-2 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THE PAIN */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">למה הלקוחות עוזבים?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                זה לא בגלל המחיר. זה בגלל שהם מרגישים שאתה לוקח אותם כמובן מאליו.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'תסמונת "שגר ושכח"', desc: 'אתה נותן שירות מעולה במכירה, אבל נעלם יום אחרי. הלקוח מרגיש נטוש.', icon: XCircle },
                { title: 'פספוס מכירות חוזרות', desc: 'לקוח כבר קנה וסמך עליך, אבל לא הצעת לו את הדבר הבא. השארת כסף על הרצפה.', icon: Wallet },
                { title: 'אדישות מסוכנת', desc: 'לקוח שקט הוא לא בהכרח לקוח מרוצה. הוא פשוט עובר למתחרים בשקט.', icon: LifeBuoy }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-pink-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION - DEEP DIVE PROCESS */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-pink-600 font-bold tracking-wider uppercase text-sm">הסיסטם לשימור</span>
              <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6">מלקוח מזדמן לשגריר נאמן</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                המנטור יעזור לך לבנות מערכת יחסים אמיתית עם הלקוחות, כזו שגורמת להם להרגיש מיוחדים, מוערכים, ובעיקר - שלך לתמיד.
              </p>
            </div>

            <div className="space-y-24">
              
              {/* STEP 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-[2rem] rotate-3 opacity-10"></div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
                        <Map className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 01</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">מיפוי "מסע הלקוח" (Journey)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זיהוי נקודות ה"וואו" שיגרמו ללקוח להתאהב</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">איתור נקודות תורפה ושבירה בתהליך השירות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת חווית Onboarding (קליטה) בלתי נשכחת</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">הרושם הראשוני קובע</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    הרגעים הראשונים אחרי המכירה הם הקריטיים ביותר. המנטור יוודא שהלקוח שלך מרגיש שעשה את ההחלטה הכי טובה בחיים שלו כשהוא בחר בך.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-rose-500 to-red-600 rounded-[2rem] -rotate-3 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 02</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">תקשורת יזומה (Proactive)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">סיסטם אוטומטי לבדיקת שביעות רצון ("הכל בסדר?")</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">שליחת ברכות בימי הולדת וחגים (בלי לזכור לבד)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">עדכונים שוטפים שנותנים ערך ושומרים על קשר</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">אל תחכה לצרות</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    רוב העסקים מדברים עם הלקוח רק כשיש בעיה או כשרוצים כסף. המנטור יעזור לך להיות שם בשבילו גם סתם כדי להגיד "תודה" או "מזל טוב". זה עושה את כל ההבדל.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500 to-purple-600 rounded-[2rem] rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 03</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">הצעות ערך (Upsell & Cross-sell)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זיהוי הזמן המושלם להציע מוצר משלים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת מבצעים בלעדיים ללקוחות VIP</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הגדלת נתח הארנק (Share of Wallet) בצורה טבעית</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">למכור זה לעזור</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    אם הלקוח מרוצה, הוא רוצה עוד ממך. המנטור יעזור לך לזהות מה עוד הוא צריך, ולהציע לו את זה בצורה שתתקבל כהטבה ולא כניסיון מכירה אגרסיבי.
                  </p>
                </div>
              </div>

               {/* STEP 4 */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-pink-500 to-orange-600 rounded-[2rem] -rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 04</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">מנגנון המלצות (Referrals)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">שיטה סדורה לבקשת המלצות (בלי להתבייש)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">תגמול לקוחות שמביאים חברים ("חבר מביא חבר")</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הפיכת לקוחות לשגרירים של המותג ברשתות</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">השיווק הכי טוב הוא חינם</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    לקוח מרוצה הוא איש המכירות הכי טוב שלך. המנטור יבנה לך מנגנון שהופך את ההמלצות למנוע צמיחה אוטומטי, שמביא לידים חמים ומוכנים לסגירה.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DAY IN THE LIFE */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">מנהל קשרי הלקוחות שלך</h2>
                <p className="text-xl text-gray-400">
                    המנטור דואג שאף לקוח לא ירגיש שקוף, ושאתה תמיד בראש סדר העדיפויות שלהם.
                </p>
            </div>

            <div className="space-y-8">
                {[
                    { time: '09:00', title: 'בוקר טוב אישי', desc: 'המנטור מזכיר: "לדני יש יום הולדת היום. הנה ברכה מוכנה עם קופון מתנה. שלח לו בוואטסאפ."' },
                    { time: '13:00', title: 'בקרת שביעות רצון', desc: 'התראה: "שרה סיימה את הפרויקט לפני שבוע. זה הזמן לשלוח לה הודעת התעניינות ולבקש משוב."' },
                    { time: '16:00', title: 'זיהוי הזדמנות', desc: 'ניתוח דאטה: "5 לקוחות ותיקים לא קנו כבר חודשיים. בוא נשלח להם הטבה מיוחדת כדי להעיר אותם."' },
                    { time: '19:00', title: 'בקשת המלצה', desc: 'המנטור מציע: "יוסי נתן פידבק מעולה בשיחה. הנה נוסח לבקשת המלצה לגוגל, שלח לו עכשיו כשהוא עוד חם."' }
                ].map((slot, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                        <div className="w-20 font-mono text-pink-400 text-xl font-bold pt-1">{slot.time}</div>
                        <div className="flex-1 pb-8 border-b border-gray-800 group-last:border-0">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">{slot.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{slot.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-b from-pink-50 to-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
             <Heart className="w-12 h-12 text-pink-500 mx-auto mb-6 fill-current" />
             <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
               הגיע הזמן להפסיק לרדוף
             </h2>
             <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
               הלקוחות הכי טובים שלך כבר אצלך. תן למנטור לעזור לך לשמור אותם ולהרוויח מהם יותר.
             </p>
             
             <a href={SIGNUP_URL}>
                <Button className="h-16 px-16 text-xl rounded-full bg-gray-900 text-white shadow-2xl hover:bg-black hover:scale-105 transition-all duration-300">
                   אני רוצה לשמר את הלקוחות שלי
                   <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
             </a>
             <p className="mt-6 text-sm text-gray-500">
               * ללא התחייבות • אפשרות ביטול בכל רגע • 14 יום ניסיון חינם
             </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">שאלות נפוצות</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>זה לא יציק ללקוחות שלי?</AccordionTrigger>
                        <AccordionContent>
                        ההפך. לקוחות אוהבים שמתעניינים בהם, כל עוד זה נעשה בטעם ובמינון הנכון. המנטור ידאג שהתקשורת תהיה ערכית ונעימה, ולא ספאמית.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>אין לי זמן לכתוב ברכות לכולם</AccordionTrigger>
                        <AccordionContent>
                        בשביל זה יש אוטומציה ו-AI. המערכת תכין לך את הכל מראש, אתה רק צריך לאשר ולשלוח (או לתת למערכת לשלוח לבד). מינימום זמן, מקסימום יחס אישי.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>איך זה עוזר לי להרוויח יותר?</AccordionTrigger>
                        <AccordionContent>
                        פשוט מאוד: לקוח חוזר לא עולה כסף לשווק לו (כי הוא כבר מכיר אותך), הוא קונה מהר יותר, ובסכומים גבוהים יותר. שיפור של 5% בשימור לקוחות יכול להגדיל את הרווחים ב-25% עד 95%!
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        <Footer />
    </main>
    </>
  );
}

// --- CUSTOM COMPONENT FOR 'marketing-machine' ---
function MarketingMachineView() {
  return (
    <>
        <Header />
        <main className="pt-20 bg-white font-sans text-gray-900" dir="rtl">
        
        {/* HERO SECTION - HIGH IMPACT */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 z-0"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] mb-8">
                <Megaphone className="w-4 h-4" />
                <span>מנהל המותג והתוכן שלך מוכן</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
                להפוך לאוטוריטה<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">שאי אפשר להתעלם ממנה</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
                נמאס לך לרדוף אחרי לקוחות? תן למנטור לבנות איתך מכונת תוכן משומנת שתמצב אותך כמומחה המוביל בתחומך, ותגרום ללקוחות לעמוד בתור כדי לעבוד איתך.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={SIGNUP_URL}>
                  <Button className="h-16 px-12 text-xl rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:scale-105 transition-all duration-300 font-bold border-0">
                    אני רוצה להפוך למותג מוביל
                    <ArrowLeft className="mr-2 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THE PAIN */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">למה אף אחד לא מכיר אותך?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                אתה תותח במה שאתה עושה, אבל השיווק שלך לא משקף את זה. העולם מלא ברעש, וקשה לבלוט.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'חוסר עקביות כרוני', desc: 'אתה מעלה פוסט, נעלם לשבועיים, ואז מנסה לפצות על זה. האלגוריתם שונא את זה.', icon: Calendar },
                { title: 'שבירת ראש על תוכן', desc: 'אתה יושב מול מסך ריק ולא יודע מה לכתוב. בסוף אתה מוותר או מעלה משהו "ליד".', icon: Brain },
                { title: 'להיות "כמו כולם"', desc: 'המסרים שלך נשמעים בדיוק כמו המתחרים. הלקוחות לא מבינים למה לבחור דווקא בך.', icon: Copy }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION - DEEP DIVE PROCESS */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">הסיסטם למיתוג</span>
              <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6">מאלמוני למוביל דעה</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                המנטור יהפוך למנהל התוכן והאסטרטגיה שלך. לא עוד "שליפות מהמותן", אלא מכונה משומנת שמייצרת ערך ובונה אמון, יום אחרי יום.
              </p>
            </div>

            <div className="space-y-24">
              
              {/* STEP 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] rotate-3 opacity-10"></div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Map className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 01</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">אסטרטגיית תוכן ("המצפן")</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">פיצוח ה-DNA של המותג: מה הקול הייחודי שלך?</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בניית "עמודי תווך" (Content Pillars) לתוכן</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">תכנון גאנט חודשי מראש, מותאם ליעדים העסקיים</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">לדעת בדיוק מה להגיד</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    הסוד למותג חזק הוא בהירות. המנטור יעזור לך לזקק את המסרים שלך כך שכל פוסט, סרטון או מייל יקדמו אותך למטרה וידברו ישירות ללב של הלקוח.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-purple-500 to-fuchsia-600 rounded-[2rem] -rotate-3 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 02</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">מפעל לייצור תוכן (במהירות)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">שימוש ב-AI לכתיבת פוסטים ומאמרים ב-5 דקות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת "בנק רעיונות" אינסופי שלא נגמר לעולם</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">מחזור חכם של תוכן (Repurposing) לכל הפלטפורמות</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">מקסימום אימפקט, מינימום מאמץ</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    אתה לא צריך להיות קופירייטר או עורך וידאו. המנטור יראה לך איך לייצר תוכן ברמה עולמית בשבריר מהזמן שזה לוקח לאחרים, בעזרת הכלים המתקדמים שלנו.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-[2rem] rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
                        <Share2 className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 03</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">הפצה רב-ערוצית (להיות בכל מקום)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">נוכחות דומיננטית ברשתות החברתיות הרלוונטיות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בניית רשימת תפוצה (הנכס הדיגיטלי הכי חשוב)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">שיווק באמצעות קהילות וקבוצות</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">תודעה = כסף</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    המטרה היא שכאשר הלקוח יצטרך את השירות שלך, אתה תהיה השם הראשון שיעלה לו לראש. המנטור יוודא שאתה נשאר בתודעה שלהם כל הזמן, בצורה נעימה וערכית.
                  </p>
                </div>
              </div>

               {/* STEP 4 */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500 to-blue-600 rounded-[2rem] -rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center">
                        <Repeat className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 04</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">עקביות ומדידה</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">רוטינות יומיות פשוטות שקל להתמיד בהן</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">מעקב אחרי מעורבות (Engagement) והמרות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">שיפור מתמיד על בסיס נתונים</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">מרתון, לא ספרינט</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    מותג לא בונים ביום, אבל אפשר להרוס אותו בשנייה של חוסר עקביות. המנטור הוא ה"מאמן האישי" שלך למיתוג, שדואג שתופיע למגרש כל יום ותיתן את ההצגה הכי טובה שלך.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DAY IN THE LIFE */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">העורך הראשי שלך</h2>
                <p className="text-xl text-gray-400">
                    המנטור דואג שפס הייצור של התוכן שלך יעבוד בלי תקלות ובלי "מחסומי כתיבה".
                </p>
            </div>

            <div className="space-y-8">
                {[
                    { time: '08:00', title: 'השראה על הבוקר', desc: 'המנטור שולח: "יש טרנד חדש בתחום שלך על X. בוא נכתוב על זה דעה קצרה. הנה 3 נקודות התחלה..."' },
                    { time: '11:00', title: 'זמן יצירה', desc: 'סשן ממוקד של 20 דקות שבו המנטור עוזר לך לכתוב 3 פוסטים לשבוע הקרוב בעזרת תבניות מוכנות.' },
                    { time: '14:00', title: 'בקרת איכות', desc: 'לפני פרסום, המנטור מעיר: "הכותרת קצת חלשה. בוא נשנה אותה למשהו יותר מסקרן, כמו..."' },
                    { time: '17:00', title: 'בוסטר הפצה', desc: 'תזכורת: "הפוסט מאתמול קיבל הרבה תגובות. בוא נהפוך אותו לסטורי וניוזלטר כדי למקסם את החשיפה."' }
                ].map((slot, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                        <div className="w-20 font-mono text-indigo-400 text-xl font-bold pt-1">{slot.time}</div>
                        <div className="flex-1 pb-8 border-b border-gray-800 group-last:border-0">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{slot.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{slot.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
             <Megaphone className="w-12 h-12 text-indigo-500 mx-auto mb-6 fill-current" />
             <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
               מוכן שישמעו אותך?
             </h2>
             <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
               אל תתן לידע ולניסיון שלך ללכת לאיבוד ברעש. בוא נבנה לך את הבמה שמגיעה לך.
             </p>
             
             <a href={SIGNUP_URL}>
                <Button className="h-16 px-16 text-xl rounded-full bg-gray-900 text-white shadow-2xl hover:bg-black hover:scale-105 transition-all duration-300">
                   אני רוצה לבנות מכונת שיווק
                   <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
             </a>
             <p className="mt-6 text-sm text-gray-500">
               * ללא התחייבות • אפשרות ביטול בכל רגע • 14 יום ניסיון חינם
             </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">שאלות נפוצות</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>אני לא אוהב להיחשף או להצטלם, זה חובה?</AccordionTrigger>
                        <AccordionContent>
                        ממש לא. אפשר לבנות מותג חזק מאוד גם בטקסט (בלינקדאין/בלוג), באודיו (פודקאסט) או עם תמונות אווירה. המנטור יתאים את האסטרטגיה למה שנוח לך.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>כמה זמן זה דורש ביום?</AccordionTrigger>
                        <AccordionContent>
                        השיטה שלנו בנויה ליעילות. עם העזרה של המנטור וה-AI, אפשר לנהל מערך תוכן מרשים גם ב-30 דקות ביום (או שעתיים מרוכזות בשבוע).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>האם אתם כותבים את התוכן במקומי?</AccordionTrigger>
                        <AccordionContent>
                        אנחנו (המנטור וה-AI) עושים 80% מהעבודה - נותנים רעיונות, שלד, טיוטות וניסוחים. ה-20% האחרונים (הטאץ' האישי והידע המקצועי) מגיעים ממך, כדי שזה יישמע אותנטי.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        <Footer />
    </main>
    </>
  );
}

// --- CUSTOM COMPONENT FOR 'increase-revenue' ---
function IncreaseRevenueView() {
  return (
    <>
        <Header />
        <main className="pt-20 bg-white font-sans text-gray-900" dir="rtl">
        
        {/* HERO SECTION - HIGH IMPACT */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-900 z-0"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] mb-8">
                <TrendingUp className="w-4 h-4" />
                <span>המנטור לצמיחה עסקית מוכן</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
                לשבור את תקרת הזכוכית<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">ולהכפיל את הרווחים</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
                מרגיש שאתה עובד פול-גז בניוטרל? המחזור תקוע למרות שאתה נותן את הנשמה? המנטור יבנה איתך מנועי צמיחה חדשים ויהפוך את העסק שלך למכונה שמדפיסה כסף.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={SIGNUP_URL}>
                  <Button className="h-16 px-12 text-xl rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:scale-105 transition-all duration-300 font-bold border-0">
                    אני רוצה לראות את המספרים עולים
                    <ArrowLeft className="mr-2 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THE PAIN */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">למה קשה לך לגדול?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                רוב העסקים נתקעים באותו מחזור במשך שנים. זה לא בגלל השוק, זה בגלל המודל העסקי.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'עובד קשה, מרוויח אותו דבר', desc: 'ההוצאות גדלות יחד עם ההכנסות, ובשורה התחתונה לא נשאר לך יותר בכיס.', icon: BarChart3 },
                { title: 'תמחור בחסר', desc: 'אתה מפחד להעלות מחירים כדי לא להפסיד לקוחות, ונשאר עם רווחיות שוחקת.', icon: Wallet },
                { title: 'תלות במוצר אחד', desc: 'אין לך סולם מוצרים חכם (Upsell), אז אתה כל הזמן צריך להביא עוד ועוד לקוחות חדשים.', icon: LayoutGrid }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION - DEEP DIVE PROCESS */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm">הסיסטם לצמיחה</span>
              <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6">מסטגנציה לפריצת דרך</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                המנטור לא ייתן לך להמשיך "לזרום". הוא יפרק את העסק לגורמים, יזהה את מנועי הרווח האמיתיים, ויבנה איתך אסטרטגיה שתזניק את המחזור.
              </p>
            </div>

            <div className="space-y-24">
              
              {/* STEP 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-[2rem] rotate-3 opacity-10"></div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <ScanFace className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 01</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">אנליזה: איפה הכסף מסתתר?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">ניתוח רווחיות לכל מוצר ושירות (מה באמת משתלם?)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זיהוי "לקוחות מפסידים" שגוזלים זמן ולא מכניסים כסף</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">איתור הזדמנויות מיידיות להגדלת הכנסה ללא מאמץ</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">להפסיק לנחש, להתחיל לדעת</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    לפני שרצים קדימה, המנטור יעזור לך להבין מה עובד ומה תוקע אותך. רוב העסקים מגלים ש-20% מהמוצרים שלהם אחראים ל-80% מהרווח. אנחנו נתמקד בזה.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-green-500 to-lime-600 rounded-[2rem] -rotate-3 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                        <LayoutGrid className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 02</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">בניית סולם הערך (Value Ladder)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">פיתוח מוצרי המשך (Backend) להגדלת שווי עסקה</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת חבילות פרמיום ללקוחות שמוכנים לשלם יותר</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">מנגנון Upsell ו-Cross-sell אוטומטי לכל מכירה</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">להרוויח יותר מכל לקוח</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    למה להסתפק במכירה אחת? המנטור יעזור לך לבנות אקו-סיסטם של מוצרים, כך שכל לקוח שנכנס יקנה ממך שוב ושוב, בסכומים הולכים וגדלים.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-cyan-600 rounded-[2rem] rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 03</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">אסטרטגיית תמחור מנצחת</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">העלאת מחירים חכמה בלי לאבד לקוחות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">מעבר מתמחור לפי שעה לתמחור לפי ערך (Value Based)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בניית מודלים של הכנסה חוזרת (Retainer/Subscription)</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">תפסיק למכור בזול</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    המחיר שלך הוא המיצוב שלך. המנטור ייתן לך את הביטחון והכלים לגבות את מה שאתה באמת שווה, ולהפוך את העסק למותג יוקרתי ומבוקש.
                  </p>
                </div>
              </div>

               {/* STEP 4 */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 to-indigo-600 rounded-[2rem] -rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 04</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">מנועי צמיחה והתרחבות</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">פתיחת ערוצי שיווק חדשים ומניבים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת שיתופי פעולה אסטרטגיים (Affiliates)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הכנת התשתית להכפלת העסק בשנה הקרובה</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">לחשוב כמו אימפריה</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    המטרה היא לא לגדול ב-5%, אלא ב-50% או 100%. המנטור יעזור לך לזהות את ההזדמנויות הגדולות בשוק ולתפוס אותן בשתי ידיים.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DAY IN THE LIFE */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">שותף הצמיחה שלך</h2>
                <p className="text-xl text-gray-400">
                    המנטור דוחף אותך קדימה כל יום, ולא נותן לך לנוח על זרי הדפנה.
                </p>
            </div>

            <div className="space-y-8">
                {[
                    { time: '08:30', title: 'פוקוס על הכסף', desc: 'המנטור שואל: "מה הפעולה האחת שתעשה היום שתכניס הכי הרבה כסף לקופה?" ומכוון אותך לשם.' },
                    { time: '12:00', title: 'זיהוי הזדמנות', desc: 'התראה חכמה: "לקוח Y סיים פרויקט. זה הזמן המושלם להציע לו את חבילת התחזוקה השנתית. הנה הצעה מוכנה."' },
                    { time: '15:00', title: 'בקרת רווחיות', desc: 'לפני שליחת הצעת מחיר, המנטור בודק: "האם תמחרת נכון את שעות העבודה? נראה שאנחנו על הגבול, ממליץ להוסיף 15%."' },
                    { time: '18:00', title: 'מדד הצמיחה', desc: 'סיכום יומי: "היום גדלנו ב-X ש"ח ביחס לממוצע. אנחנו בקצב הנכון ליעד השנתי. תמשיך ככה."' }
                ].map((slot, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                        <div className="w-20 font-mono text-emerald-400 text-xl font-bold pt-1">{slot.time}</div>
                        <div className="flex-1 pb-8 border-b border-gray-800 group-last:border-0">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{slot.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{slot.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
             <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto mb-6 fill-current" />
             <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
               הגיע הזמן לקפוץ לשלב הבא
             </h2>
             <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
               אל תסתפק ב"בסדר". תן למנטור לעזור לך לממש את הפוטנציאל האמיתי של העסק שלך.
             </p>
             
             <a href={SIGNUP_URL}>
                <Button className="h-16 px-16 text-xl rounded-full bg-gray-900 text-white shadow-2xl hover:bg-black hover:scale-105 transition-all duration-300">
                   אני רוצה להגדיל הכנסות
                   <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
             </a>
             <p className="mt-6 text-sm text-gray-500">
               * ללא התחייבות • אפשרות ביטול בכל רגע • 14 יום ניסיון חינם
             </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">שאלות נפוצות</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>האם אפשר לגדול מהר בלי לקרוס?</AccordionTrigger>
                        <AccordionContent>
                        בהחלט. המנטור שומר עליך שלא תגדל "עקום". אנחנו בונים תשתיות ותהליכים במקביל לגדילה בהכנסות, כדי שהעסק יוכל להכיל את העומס החדש בצורה בריאה.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>אני מפחד להעלות מחירים, זה לא יבריח לקוחות?</AccordionTrigger>
                        <AccordionContent>
                        זה יבריח את הלקוחות הלא נכונים. המנטור יעזור לך לדייק את הערך שלך כך שהלקוחות הטובים ישמחו לשלם יותר, ויפנה לך זמן מלקוחות שרק מבזבזים לך אנרגיה.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>כמה מהר רואים שינוי בשורה התחתונה?</AccordionTrigger>
                        <AccordionContent>
                        לפעמים זה מיידי (כמו תיקון תמחור או גביית חובות), ולפעמים זה תהליך של חודש-חודשיים (בניית מוצרים חדשים). המטרה היא צמיחה יציבה ולא "מכה" חד פעמית.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        <Footer />
    </main>
    </>
  );
}

// --- CUSTOM COMPONENT FOR 'increase-customers' ---
function IncreaseCustomersView() {
  return (
    <>
        <Header />
        <main className="pt-20 bg-white font-sans text-gray-900" dir="rtl">
        
        {/* HERO SECTION - HIGH IMPACT */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900 z-0"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-8">
                <Users className="w-4 h-4" />
                <span>מכונת הלידים שלך מוכנה להנעה</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
                תפסיק לרדוף אחרי לקוחות<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">ותן להם לרדוף אחריך</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
                מסתמך רק על "פה לאוזן"? הגיע הזמן לבנות מערכת שיווק חכמה שמזרימה לך פניות איכותיות באופן קבוע, גם כשאתה ישן. המנטור יראה לך בדיוק איך עושים את זה.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={SIGNUP_URL}>
                  <Button className="h-16 px-12 text-xl rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-300 font-bold border-0">
                    אני רוצה יומן מלא בלקוחות
                    <ArrowLeft className="mr-2 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THE PAIN */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">למה הלקוחות לא מגיעים?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                יש לך מוצר מעולה ושירות מצוין, אבל העולם בחוץ רועש. אם אתה לא צועק נכון, אף אחד לא שומע.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'מלכודת "מפה לאוזן"', desc: 'זה נחמד, אבל אי אפשר לבנות עסק רציני רק על המלצות. אתה חייב שליטה על הזרם.', icon: Users },
                { title: 'שיווק לכולם = שיווק לאף אחד', desc: 'כשאתה מנסה לדבר לכולם, המסר שלך הופך לפרווה ואף אחד לא מרגיש שזה "בשבילו".', icon: Target },
                { title: 'רכבת הרים בלידים', desc: 'שבוע אחד עמוס, שבועיים שקט. חוסר היציבות הזה הורג את העסק ואת השקט הנפשי שלך.', icon: BarChart3 }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION - DEEP DIVE PROCESS */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">הסיסטם השיווקי</span>
              <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6">מ"שקט" לביקוש שיא</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                המנטור לא סתם יגיד לך "תעשה שיווק". הוא יבנה איתך משפך מדויק שמביא את הלקוחות המדויקים שאתה רוצה, ומוכן לשלם.
              </p>
            </div>

            <div className="space-y-24">
              
              {/* STEP 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-600 rounded-[2rem] rotate-3 opacity-10"></div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <ScanFace className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 01</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">דיוק לייזר של הלקוח האידיאלי</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בניית "אוואטר" לקוח - מי הוא, מה כואב לו ואיפה הוא מסתובב</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">ניתוח המתחרים ופיצוח הבידול שלך בשוק</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת מסר אחד חד וברור שפוגע בבטן הרכה</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">מי בעצם הלקוח שלך?</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    הטעות הכי גדולה היא לנסות למכור לכולם. המנטור יעזור לך להבין מי הלקוח שהכי רווחי לך, ואיך לדבר אליו בשפה שהוא לא יוכל להתעלם ממנה.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500 to-violet-600 rounded-[2rem] -rotate-3 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Magnet className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 02</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">המגנט (הצעה שאי אפשר לסרב לה)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בניית "מוצר חדירה" או הטבה שמושכת מתעניינים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">כתיבת דפי נחיתה ומסרים שיווקיים (בעזרת AI)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">אריזת השירות שלך בצורה שמשדרת ערך גבוה</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">תן להם סיבה להרים יד</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    למה שיבחרו דווקא בך? המנטור יעזור לך לנסח הצעה כל כך אטרקטיבית, שהלקוחות ירגישו "פראיירים" אם הם לא יבדקו אותה.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-[2rem] rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                        <Megaphone className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 03</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">הפצה חכמה (להיות בכל מקום)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זיהוי הערוצים הכי אפקטיביים עבורך (פייסבוק? לינקדאין? גוגל?)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת תוכן שבונה סמכות ומביא לקוחות (בקלות)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">ניהול קמפיינים ממומנים גם בתקציב קטן</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">תפסיק להתחבא</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    אם לא יראו אותך, לא יקנו ממך. המנטור יבנה לך תוכנית פעולה פשוטה לנוכחות דיגיטלית, כזו שלא דורשת ממך להיות כל היום באינסטגרם, אבל מביאה תוצאות.
                  </p>
                </div>
              </div>

               {/* STEP 4 */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-teal-500 to-green-600 rounded-[2rem] -rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                        <RefreshCcw className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 04</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">סיסטם החזרת לקוחות</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">מנגנון אוטומטי ליצירת קשר עם לידים רדומים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הגדלת ערך חיי לקוח (LTV) ע"י מכירות חוזרות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הפיכת לקוחות מרוצים לשגרירים שמביאים חברים</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">הכסף הגדול נמצא ב-Follow Up</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    רוב העסקים מוותרים אחרי "לא" אחד. המנטור יעזור לך לבנות מערכת יחסים ארוכת טווח עם הלקוחות, כך שגם אם הם לא קנו היום, הם יקנו מחר.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DAY IN THE LIFE */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">סמנכ"ל השיווק האישי שלך</h2>
                <p className="text-xl text-gray-400">
                    המנטור לא נותן לך "שיעורי בית", הוא עובד איתך על השיווק ביום-יום.
                </p>
            </div>

            <div className="space-y-8">
                {[
                    { time: '08:30', title: 'רעיון לתוכן יומי', desc: 'המנטור שולח לך: "היום יום גשום, בוא נכתוב פוסט שמקשר בין מזג האוויר לבין [השירות שלך]. הנה טיוטה..."' },
                    { time: '11:00', title: 'ניתוח לידים', desc: 'התראת מנטור: "הגיעו 5 פניות חדשות מהקמפיין, 2 מהן נראות חמות במיוחד. תתקשר אליהן עכשיו."' },
                    { time: '15:00', title: 'חידוד מסרים', desc: 'אתה מעלה רעיון למבצע חדש, המנטור משפר לך את הניסוח כדי שיהיה יותר מכירתי ומניע לפעולה.' },
                    { time: '19:00', title: 'סיכום ביצועים', desc: 'דוח קצר: "השבוע הוצאנו X על פרסום והכנסנו Y. ה-ROI שלך חיובי, כדאי להגדיל תקציב ב-10%."' }
                ].map((slot, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                        <div className="w-20 font-mono text-blue-400 text-xl font-bold pt-1">{slot.time}</div>
                        <div className="flex-1 pb-8 border-b border-gray-800 group-last:border-0">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{slot.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{slot.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
             <Users className="w-12 h-12 text-blue-500 mx-auto mb-6 fill-current" />
             <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
               מוכן להציף את העסק בלקוחות?
             </h2>
             <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
               אל תחכה שהם יבואו לבד. בוא נבנה יחד את המערכת שתביא אותם אליך, יום אחרי יום.
             </p>
             
             <a href={SIGNUP_URL}>
                <Button className="h-16 px-16 text-xl rounded-full bg-gray-900 text-white shadow-2xl hover:bg-black hover:scale-105 transition-all duration-300">
                   אני רוצה יותר לקוחות עכשיו
                   <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
             </a>
             <p className="mt-6 text-sm text-gray-500">
               * ללא התחייבות • אפשרות ביטול בכל רגע • 14 יום ניסיון חינם
             </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">שאלות נפוצות</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>האם אני חייב תקציב פרסום גדול?</AccordionTrigger>
                        <AccordionContent>
                        לא. המנטור יודע לעבוד גם עם תקציבים קטנים ואפילו עם שיווק אורגני (חינמי). החוכמה היא הדיוק, לא גודל הארנק. נתחיל בקטן, נראה תוצאות, ורק אז נגדל.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>אין לי זמן להתעסק בשיווק כל היום</AccordionTrigger>
                        <AccordionContent>
                        בדיוק בשביל זה המנטור כאן. הוא מכין לך את רוב העבודה (טקסטים, רעיונות, תכנון) וחוסך לך שעות של "שבירת ראש". המטרה היא מקסימום תוצאות במינימום זמן.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>איך אני אדע אם זה עובד?</AccordionTrigger>
                        <AccordionContent>
                        אנחנו מודדים הכל. המנטור יראה לך בדיוק כמה לידים נכנסו, כמה עלה כל ליד, וכמה כסף נכנס בסוף. אין ניחושים, רק מספרים.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        <Footer />
    </main>
    </>
  );
}

// --- CUSTOM COMPONENT FOR 'cash-flow-stability' ---
function CashFlowStabilityView() {
  return (
    <>
        <Header />
        <main className="pt-20 bg-white font-sans text-gray-900" dir="rtl">
        
        {/* HERO SECTION - HIGH IMPACT */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-slate-900 to-slate-900 z-0"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] mb-8">
                <Wallet className="w-4 h-4" />
                <span>המנטור הפיננסי שלך מוכן</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
                תפסיק לפחד מהבנק<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">ותתחיל לשלוט בכסף</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
                נמאס לך לחיות מחודש לחודש? מופתע כל פעם מחדש מהמינוס? המנטור שלנו יהפוך למנהל הכספים האישי שלך, יבנה איתך תחזית מדויקת ויוודא שאתה תמיד בפלוס.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={SIGNUP_URL}>
                  <Button className="h-16 px-12 text-xl rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] hover:scale-105 transition-all duration-300 font-bold border-0">
                    אני רוצה שקט נפשי כלכלי
                    <ArrowLeft className="mr-2 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THE PAIN */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">למה רוב העסקים חיים בלחץ תמידי?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                זה לא בגלל שאין עבודה, אלא בגלל שאין ניהול. איפה הכסף שלך באמת נמצא?
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'רכבת הרים תזרימית', desc: 'חודש אחד אתה מלך, חודש אחרי אתה לא יודע איך לשלם משכורות.', icon: TrendingUp },
                { title: '"לא נעים לי לגבות"', desc: 'אתה עובד קשה אבל הכסף נשאר אצל הלקוחות כי אתה דוחה את הגבייה.', icon: MessageCircle },
                { title: 'הפתעות של מע"מ', desc: 'פתאום מגיע ה-15 לחודש ואתה בלחץ כי לא שמרת כסף בצד.', icon: XCircle }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-violet-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION - DEEP DIVE PROCESS */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-200/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-violet-600 font-bold tracking-wider uppercase text-sm">הסיסטם הפיננסי</span>
              <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6">מכאוס לשליטה אבסולוטית</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                המנטור לא ילמד אותך כלכלה, הוא ינהל אותך. תהליך מובנה שהופך את המספרים המפחידים לכלי העבודה הכי חזק שלך.
              </p>
            </div>

            <div className="space-y-24">
              
              {/* STEP 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-fuchsia-600 rounded-[2rem] rotate-3 opacity-10"></div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 01</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">מיפוי רנטגן לעסק</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בדיקת כל שורה בחשבון הבנק וסיווג שלה</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זיהוי "דליפות כספיות" והוראות קבע מיותרות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הפרדה מוחלטת בין כסף פרטי לכסף עסקי</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">לראות את האמת בלבן של העיניים</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    לפני שבונים מגדל, מיישרים את השטח. המנטור יכריח אותך להסתכל על המספרים כמו שהם, בלי לייפות את המציאות. אנחנו נגלה בדיוק כמה העסק עולה לך באמת.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500 to-blue-600 rounded-[2rem] -rotate-3 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 02</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">תחזית תזרים ("מכונת הזמן")</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בניית מודל שצופה את מצב הבנק 90 יום קדימה</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זיהוי "בורות תזרימיים" לפני שהם קורים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">תכנון הוצאות גדולות רק כשהתזרים מאפשר</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">להפסיק להיות מופתע</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    דמיין שאתה יודע בדיוק כמה כסף יהיה לך בבנק בעוד 3 חודשים. המנטור יעזור לך לתכנן את העתיד במקום לכבות שריפות בהווה. פתאום "אין כסף למע"מ" הופך לזיכרון רחוק.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-[2rem] rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 03</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">גבייה אגרסיבית (אבל נעימה)</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">אוטומציה של תזכורות תשלום ללקוחות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">נהלי עבודה ברורים: לא משלמים - לא עובדים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">צמצום ימי האשראי ("שוטף פלוס") למינימום</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">הכסף אצלך בכיס, לא אצלם</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    המנטור ייתן לך את הביטחון והכלים לדרוש את מה שמגיע לך. נבנה מערכת גבייה שלא נותנת לאף שקל לחמוק, ומוודאת שהתזרים שלך נשאר חיובי ובריא.
                  </p>
                </div>
              </div>

               {/* STEP 4 */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500 to-teal-600 rounded-[2rem] -rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 04</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">כרית ביטחון וצמיחה</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">הוראת קבע לחיסכון עסקי ("מס לעצמך")</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת רזרבה של 3 חודשי הוצאות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">השקעה חכמה של העודפים חזרה בעסק</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">לישון בשקט בלילה</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    המטרה הסופית היא לא רק לשרוד, אלא לשגשג. המנטור יוודא שאתה שם כסף בצד ליום גשום, ובונה חוסן כלכלי שיאפשר לך לעבור כל משבר בקלות.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DAY IN THE LIFE */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">ה-CFO הדיגיטלי שלך</h2>
                <p className="text-xl text-gray-400">
                    המנטור לא רק נותן עצות, הוא מנהל איתך את הכסף ביומיום.
                </p>
            </div>

            <div className="space-y-8">
                {[
                    { time: '09:00', title: 'סטטוס יומי', desc: 'המנטור מציג לך: כמה כסף נכנס אתמול, כמה יצא, ומה היתרה הצפויה בסוף החודש.' },
                    { time: '11:00', title: 'התראת גבייה', desc: 'המנטור מקפיץ לך: "לקוח X מאחר בתשלום ב-3 ימים. הנה הודעה מוכנה לשליחה אליו."' },
                    { time: '14:00', title: 'אישור הוצאה', desc: 'רוצה לקנות ציוד חדש? המנטור בודק אם התזרים מאפשר את זה וממליץ אם לקנות או לחכות.' },
                    { time: '18:00', title: 'תחזית שבועית', desc: 'לקראת שבוע הבא - המנטור מכין אותך לתשלומים הגדולים שצפויים לרדת כדי שלא תהיה מופתע.' }
                ].map((slot, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                        <div className="w-20 font-mono text-violet-400 text-xl font-bold pt-1">{slot.time}</div>
                        <div className="flex-1 pb-8 border-b border-gray-800 group-last:border-0">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition-colors">{slot.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{slot.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-b from-violet-50 to-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
             <Wallet className="w-12 h-12 text-violet-500 mx-auto mb-6 fill-current" />
             <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
               מוכן לקחת שליטה על הכסף?
             </h2>
             <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
               אל תחכה לטלפון מהבנק. תן למנטור לבנות לך את היציבות הכלכלית שמגיעה לך.
             </p>
             
             <a href={SIGNUP_URL}>
                <Button className="h-16 px-16 text-xl rounded-full bg-gray-900 text-white shadow-2xl hover:bg-black hover:scale-105 transition-all duration-300">
                   אני רוצה להתחיל לנהל את הכסף
                   <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
             </a>
             <p className="mt-6 text-sm text-gray-500">
               * ללא התחייבות • אפשרות ביטול בכל רגע • 14 יום ניסיון חינם
             </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">שאלות נפוצות</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>האם אני צריך ידע קודם בפיננסים?</AccordionTrigger>
                        <AccordionContent>
                        ממש לא. כל המטרה של המנטור היא לפשט את הפיננסים. הוא מדבר איתך בשפה פשוטה, מציג נתונים ברורים ואומר לך בדיוק מה לעשות. לא צריך להיות רואה חשבון כדי להצליח.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>האם המערכת מתחברת לחשבון הבנק שלי?</AccordionTrigger>
                        <AccordionContent>
                        לא באופן ישיר (מטעמי אבטחה ופרטיות). אתה או איש צוות מזינים את הנתונים (או מייבאים מאקסל), והמנטור מנתח אותם. זה גם מכריח אותך להיות בשליטה ומודעות על כל שקל שעובר.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>העסק שלי קטן מאוד, זה מתאים לי?</AccordionTrigger>
                        <AccordionContent>
                        במיוחד לעסקים קטנים! עסק קטן רגיש יותר לזעזועים. דווקא שם, שליטה בתזרים היא קריטית להישרדות וצמיחה. המנטור יגדל איתך ככל שהעסק יצמח.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        <Footer />
    </main>
    </>
  );
}

// --- CUSTOM COMPONENT FOR 'improve-closing-rate' ---
function ImproveClosingRateView() {
  return (
    <>
        <Header />
        <main className="pt-20 bg-white font-sans text-gray-900" dir="rtl">
        
        {/* HERO SECTION - HIGH IMPACT */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-slate-900 to-slate-900 z-0"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] mb-8">
                <Target className="w-4 h-4" />
                <span>המנטור למכירות מחכה לך</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
                תפסיק לקבל "לא"<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">ותתחיל לסגור עסקאות</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
                נמאס לך לשמוע "אני צריך לחשוב על זה"? המנטור הדיגיטלי שלנו ינתח את המכירות שלך, יבנה לך תסריט מנצח וילווה אותך יד-ביד עד שתהפוך למכונת סגירה משומנת.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={SIGNUP_URL}>
                  <Button className="h-16 px-12 text-xl rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:scale-105 transition-all duration-300 font-bold border-0">
                    אני רוצה להכפיל את הסגירות שלי
                    <ArrowLeft className="mr-2 h-6 w-6" />
                  </Button>
                </a>
                <p className="text-sm text-gray-400 mt-2 sm:mt-0">
                  * מותאם אישית לעסק שלך ע״י AI
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* THE PAIN - WHY YOU ARE LOSING */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6">למה הכסף בורח לך בין האצבעות?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                רוב בעלי העסקים מפסידים 70% מהעסקאות הפוטנציאליות שלהם על טעויות בסיסיות. איפה אתה נופל?
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: '"יקר לי מדי"', desc: 'אתה מתקפל כשמדברים על מחיר במקום לבנות ערך.', icon: XCircle },
                { title: '"צריך להתייעץ"', desc: 'אתה נותן ללקוח שליטה בשיחה ומשחרר אותו ללא התחייבות.', icon: Clock },
                { title: 'גווסטינג (העלמות)', desc: 'אתה רודף אחרי לקוחות שלא עונים במקום לייצר דחיפות.', icon: MessageCircle }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE SOLUTION - DEEP DIVE PROCESS */}
        <section className="py-24 bg-slate-50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-amber-600 font-bold tracking-wider uppercase text-sm">השיטה של המנטור</span>
              <h2 className="text-4xl md:text-6xl font-black mt-2 mb-6">תהליך עומק להפיכה למאסטר מכירות</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                זה לא "טיפים למכירה". זהו תהליך ליווי מובנה שבו המנטור מפרק ומרכיב מחדש את כל תהליך המכירה שלך, שלב אחר שלב.
              </p>
            </div>

            <div className="space-y-24">
              
              {/* STEP 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-[2rem] rotate-3 opacity-10"></div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                        <Mic className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 01</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">דיאגנוסטיקה: שיקוף המציאות</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">ניתוח הקלטות שיחה ומזהים תבניות כושלות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">זיהוי "מבריחי לקוחות" במילים שאתה משתמש בהן</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בדיקת הטונציה ורמת האנרגיה בשיחה</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">אנחנו לא מנחשים. אנחנו מודדים.</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    המנטור מתחיל בלהבין *בדיוק* איפה הבעיה. לפני שמתקנים, צריך לדעת מה שבור. אנחנו נגלה למה הלקוחות באמת אומרים לך לא, גם כשהם אומרים משהו אחר.
                  </p>
                  <div className="bg-white/50 p-4 rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-800 text-sm">💡 התובנה של המנטור:</p>
                    <p className="text-gray-600 text-sm italic">"רוב המכירות נופלות ב-30 השניות הראשונות. אנחנו נתקן את הרושם הראשוני שלך."</p>
                  </div>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 to-indigo-600 rounded-[2rem] -rotate-3 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 02</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">פסיכולוגיה והנדסת תסריט</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">בניית תסריט מודולרי שמתאים את עצמו ללקוח</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">שתילת "מוקשי ערך" שמונעים התנגדויות מראש</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">יצירת תחושת דחיפות ומחסור אמיתית</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">שליטה מלאה בתודעת הלקוח</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    מכירה היא הובלה. המנטור יבנה איתך תסריט שהוא לא סתם טקסט, אלא מפה פסיכולוגית. אתה תדע בדיוק מה להגיד כדי לגרום ללקוח להבין שהוא *חייב* את הפתרון שלך עכשיו.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-[2rem] rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 03</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">טיפול בהתנגדויות בזמן אמת</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">ארגז כלים לכל סוג של "לא"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">טכניקות להפיכת התנגדות להזדמנות סגירה</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">סימולציות ואימונים "על יבש" לפני שיחות אמיתיות</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">להפוך את ה"לא" ל"כן"</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    התנגדות היא לא סוף השיחה, היא רק ההתחלה. המנטור יאמן אותך איך לא לקפוא כשלקוח אומר "יקר לי", ואיך להשתמש בזה כדי לחזק את הערך שלך ולסגור את העסקה.
                  </p>
                </div>
              </div>

               {/* STEP 4 */}
               <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 relative">
                   <div className="absolute inset-0 bg-gradient-to-bl from-purple-500 to-fuchsia-600 rounded-[2rem] -rotate-2 opacity-10"></div>
                   <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-gray-400">שלב 04</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">הכסף הגדול: פולואפ וסגירה</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">סיסטם אוטומטי למעקב אחרי הצעות פתוחות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">תסריטי הודעות וואטסאפ שמחזירים לקוחות לחיים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-gray-600">ניהול משא ומתן סופי וחתימה על חוזה</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="text-3xl font-bold mb-4">הכסף נמצא במעקב</h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    60% מהעסקאות נסגרות אחרי הפולואפ ה-5. רוב האנשים פורשים אחרי הראשון. המנטור יהיה ה"שוטר" שלך, יוודא שאתה לא מוותר על אף ליד וילמד אותך איך להיות עקבי בלי להיות "נודניק".
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* DAY IN THE LIFE */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black mb-6">איך נראה יום עם המנטור?</h2>
                <p className="text-xl text-gray-400">
                    זה לא עוד קורס שאתה רואה ושוכח. זה ליווי צמוד, יומיומי ואקטיבי.
                </p>
            </div>

            <div className="space-y-8">
                {[
                    { time: '08:00', title: 'תדריך בוקר', desc: 'המנטור שולח לך את היעדים להיום: למי להתקשר, את מי לסגור, ואיזה לידים חדשים דורשים טיפול.' },
                    { time: '12:00', title: 'ניתוח בזמן אמת', desc: 'העלית הקלטה של שיחה שלא נסגרה? המנטור מנתח אותה ושולח לך 3 נקודות לשיפור לשיחה הבאה.' },
                    { time: '16:00', title: 'דחיפת פולואפ', desc: 'המנטור מתריע: "יש לך 5 הצעות מחיר פתוחות מלפני יומיים. הנה הטקסט המדויק לשלוח להם עכשיו בוואטסאפ."' },
                    { time: '20:00', title: 'סיכום והפקת לקחים', desc: 'כמה סגרנו היום? איפה הצלחנו? המנטור מסכם איתך את היום ובונה את האסטרטגיה למחר.' }
                ].map((slot, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                        <div className="w-20 font-mono text-amber-400 text-xl font-bold pt-1">{slot.time}</div>
                        <div className="flex-1 pb-8 border-b border-gray-800 group-last:border-0">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">{slot.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{slot.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
             <Star className="w-12 h-12 text-amber-500 mx-auto mb-6 fill-current" />
             <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
               מוכן להפוך למאסטר במכירות?
             </h2>
             <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
               אל תחכה לליד הבא כדי "לנסות להשתפר". תן למנטור לבנות לך את הסיסטם שיהפוך כל שיחה לכסף בבנק.
             </p>
             


             <a href={SIGNUP_URL}>
                <Button className="h-16 px-16 text-xl rounded-full bg-gray-900 text-white shadow-2xl hover:bg-black hover:scale-105 transition-all duration-300">
                   אני רוצה להתחיל למכור יותר
                   <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
             </a>
             <p className="mt-6 text-sm text-gray-500">
               * ללא התחייבות • אפשרות ביטול בכל רגע • 14 יום ניסיון חינם
             </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">שאלות נפוצות</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>האם המנטור מתאים לכל סוגי העסקים?</AccordionTrigger>
                        <AccordionContent>
                        כן. עקרונות המכירה (בניית אמון, יצירת ערך, טיפול בהתנגדויות) זהים בין אם אתה מוכר שירותי ייעוץ, מוצרים פיזיים או נדל"ן. המנטור מתאים את התסריטים והגישה לתחום הספציפי שלך.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>אני שונא למכור ולהיות "פושר". זה מתאים לי?</AccordionTrigger>
                        <AccordionContent>
                        בדיוק בשבילך. השיטה שלנו לא מבוססת על אגרסיביות, אלא על הקשבה והובלה. המנטור ילמד אותך איך למכור מתוך מקום של עזרה ושירות, כך שזה ירגיש טבעי ונעים גם לך וגם ללקוח.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>תוך כמה זמן רואים תוצאות?</AccordionTrigger>
                        <AccordionContent>
                        רוב המשתמשים מדווחים על שיפור בביטחון העצמי כבר אחרי הסימולציות הראשונות, ועל עלייה באחוזי הסגירה תוך שבועיים-שלושה של עבודה צמודה עם המנטור ויישום הנהלים.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        <Footer />
    </main>
    </>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function GoalPage() {
  const [searchParams] = useSearchParams();
  const goalKey = searchParams.get('id');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [goalKey]);

  // SPECIAL CASE: IMPROVE CLOSING RATE
  if (goalKey === 'improve-closing-rate') {
    return <ImproveClosingRateView />;
  }

  // SPECIAL CASE: CASH FLOW STABILITY
  if (goalKey === 'cash-flow-stability') {
    return <CashFlowStabilityView />;
  }

  // SPECIAL CASE: INCREASE CUSTOMERS
  if (goalKey === 'increase-customers') {
    return <IncreaseCustomersView />;
  }

  // SPECIAL CASE: INCREASE REVENUE
  if (goalKey === 'increase-revenue') {
    return <IncreaseRevenueView />;
  }

  // SPECIAL CASE: MARKETING MACHINE
  if (goalKey === 'marketing-machine') {
    return <MarketingMachineView />;
  }

  // SPECIAL CASE: CUSTOMER RETENTION
  if (goalKey === 'customer-retention') {
    return <CustomerRetentionView />;
  }

  // SPECIAL CASE: SAVE TIME
  if (goalKey === 'save-time') {
    return <SaveTimeView />;
  }

  // SPECIAL CASE: BUSINESS ORDER
  if (goalKey === 'business-order') {
    return <BusinessOrderView />;
  }

  // GENERIC CASE
  const goal = goalsData[goalKey];

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">המטרה לא נמצאה</h1>
          <a href="/"><Button>חזרה לדף הבית</Button></a>
        </div>
      </div>
    );
  }

  const colors = colorClasses[goal.color];

  return (
    <>
      <Header />
      <main className="pt-20 bg-white font-sans overflow-x-hidden" dir="rtl">
        
        {/* HERO */}
        <section className={`relative pt-16 pb-20 overflow-hidden ${colors.bg} bg-opacity-30`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`inline-flex items-center gap-2 bg-white border ${colors.border} ${colors.text} px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-6`}>
                <Target className="w-4 h-4" />
                <span>יעד ממוקד: {goal.title}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
                {goal.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto mb-10 leading-relaxed">
                {goal.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={SIGNUP_URL}>
                  <Button className={`h-16 px-10 text-xl rounded-2xl text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all font-bold ${colors.button}`}>
                    אני רוצה להשיג את היעד הזה
                    <ArrowLeft className="mr-2 h-6 w-6" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
          
          {/* Abstract BG */}
          <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${colors.bg.replace('bg-', 'bg-')}-400`}></div>
          <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${colors.bg.replace('bg-', 'bg-')}-600`}></div>
        </section>

        {/* DESCRIPTION */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">מה זה אומר בתכלס?</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              {goal.description}
            </p>
          </div>
        </section>

        {/* STEPS */}
        <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 text-gray-900">איך נשיג את המטרה?</h2>
                    <p className="text-xl text-gray-500">4 שלבים פשוטים ומוכחים שיקחו אותך לשם</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    {goal.steps.map((step, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex gap-6 relative overflow-hidden group hover:shadow-lg transition-all">
                            <div className={`absolute top-0 right-0 w-2 h-full ${colors.bg.replace('bg-', 'bg-')}-400`}></div>
                            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-xl font-black ${colors.bg} ${colors.text}`}>
                                {idx + 1}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 text-center">
                    <a href={SIGNUP_URL}>
                        <Button className={`h-14 px-8 text-lg rounded-xl ${colors.button} text-white shadow-lg`}>
                             התחל את שלב 1 עכשיו
                             <Zap className="mr-2 h-5 w-5" />
                        </Button>
                    </a>
                </div>
            </div>
        </section>

        {/* OUTCOMES */}
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="bg-gray-900 rounded-[3rem] p-8 md:p-16 text-white text-center relative overflow-hidden shadow-2xl">
                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${colors.bg.replace('bg-', 'from-')}-500 to-transparent`}></div>
                    
                    <h2 className="text-3xl md:text-5xl font-black mb-12">מה יוצא לך מזה?</h2>
                    
                    <div className="grid md:grid-cols-2 gap-8 text-right">
                        {goal.outcomes.map((outcome, idx) => (
                            <div key={idx} className="flex items-start gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <div className={`mt-1 p-1 rounded-full ${colors.bg} ${colors.text} shrink-0`}>
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <span className="text-lg md:text-xl font-medium text-gray-100">{outcome}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16">
                         <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                             זה לא עוד קורס תיאורטי. זו מערכת עבודה שנותנת לך כלים, משימות ובקרה כדי לוודא שאתה מגיע ליעד.
                         </p>
                         <a href={SIGNUP_URL}>
                            <Button className={`h-16 px-12 text-xl rounded-2xl bg-white ${colors.text} hover:bg-gray-100 shadow-xl hover:scale-105 transition-transform font-bold`}>
                                בוא נשיג את ה-{goal.title}
                                <Rocket className="mr-2 h-6 w-6" />
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        {/* MENTOR CTA */}
        <section className={`py-20 ${colors.bg} bg-opacity-30`}>
             <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
                    <Brain className={`w-5 h-5 ${colors.text}`} />
                    <span className="font-bold text-gray-800">המנטור AI שלנו מחכה לך</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                    אל תעשה את זה לבד
                </h2>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                    בחר את היעד הזה במערכת, והמנטור הדיגיטלי שלנו יבנה לך תכנית עבודה מותאמת אישית, יזכיר לך מה לעשות כל יום, ויעזור לך להתגבר על כל מכשול בדרך.
                </p>
                <a href={SIGNUP_URL}>
                    <Button className={`h-16 px-12 text-xl rounded-2xl ${colors.button} text-white shadow-xl hover:shadow-2xl font-bold w-full md:w-auto`}>
                        כניסה למערכת והתחלת עבודה
                        <ArrowLeft className="mr-2 h-6 w-6" />
                    </Button>
                </a>
             </div>
        </section>

        <Footer />
      </main>
    </>
  );
}