import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Target, Calendar, CheckCircle2, Zap, Brain, 
  TrendingUp, Users, MessageSquare, LineChart, 
  Shield, Clock, Star, ArrowLeft, Layout, 
  Search, PenTool, DollarSign, BarChart3, 
  Megaphone, UserCheck, Headset, Settings, 
  Award, RefreshCw, XCircle, Check, ChevronDown
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

const SIGNUP_URL = "https://perfect-dashboard.com/login?from_url=https%3A%2F%2Fperfect-dashboard.com%2FAPP";

// --- Helper Components ---

// Custom Icon Wrapper with animated background on hover
const IconWrapper = ({ icon: Icon, className, colorClass }) => {
  if (!Icon) return <div className={className} />;
  return (
    <div className={`relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${className}`}>
      {colorClass && (
        <div className={`absolute inset-0 opacity-20 rounded-xl ${colorClass.replace('text-', 'bg-')}`} />
      )}
      <Icon className={`relative z-10 ${className ? className.replace('w-12 h-12', 'w-6 h-6') : ''}`} />
    </div>
  );
};

// Animated Handshake Icon
const Handshake = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

// Animated Heart Icon
const Heart = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

// Sparkles Icon
const Sparkles = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

// Shiny Button Component
const ShinyButton = ({ children, className, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden group ${className}`}
      {...props}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      <span className="relative flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};

function SectionHeading({ title, subtitle, light = false }) {
return (
  <div className="text-center max-w-4xl mx-auto mb-10 md:mb-20 px-4">
      <motion.h2 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight ${light ? 'text-white' : 'text-gray-900'}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className={`text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto ${light ? 'text-white/80' : 'text-gray-500'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

// --- Data Definitions ---

const AGENTS = [
  { icon: Target, name: "Goal Architect", role: "אדריכל מטרות", desc: "מזקק חזון למטרה עסקית מדידה וברורה", color: "text-blue-600 bg-blue-50" },
  { icon: Calendar, name: "Sprint Builder", role: "בונה תכנית 30 יום", desc: "מפרק את המטרה לצעדים יומיומיים", color: "text-purple-600 bg-purple-50" },
  { icon: CheckCircle2, name: "Execution Coach", role: "מאמן ביצוע", desc: "שומר על סדר יום ומשמעת ברזל", color: "text-green-600 bg-green-50" },
  { icon: TrendingUp, name: "Organic Growth", role: "צמיחה אורגנית", desc: "אסטרטגיות תוכן וחשיפה ללא תשלום", color: "text-pink-600 bg-pink-50" },
  { icon: Megaphone, name: "Ads Strategist", role: "אסטרטג ממומן", desc: "ניהול תקציבים וקמפיינים שמביאים לידים", color: "text-orange-600 bg-orange-50" },
  { icon: PenTool, name: "Content Writer", role: "קופירייטר", desc: "כותב פוסטים, מיילים ותסריטים", color: "text-indigo-600 bg-indigo-50" },
  { icon: Search, name: "SEO Specialist", role: "מומחה SEO", desc: "קידום במנועי חיפוש ונוכחות דיגיטלית", color: "text-cyan-600 bg-cyan-50" },
  { icon: DollarSign, name: "Sales Copy", role: "קופי למכירות", desc: "ניסוח הצעות מחיר והודעות סגירה", color: "text-emerald-600 bg-emerald-50" },
  { icon: UserCheck, name: "Closer Coach", role: "מאמן סגירות", desc: "שיפור אחוזי המרה בשיחות מכירה", color: "text-teal-600 bg-teal-50" },
  { icon: BarChart3, name: "Cashflow Manager", role: "מנהל תזרים", desc: "ניהול פיננסי, גבייה ורווחיות", color: "text-yellow-600 bg-yellow-50" },
  { icon: LineChart, name: "Analytics", role: "אנליסט נתונים", desc: "מעקב KPI וזיהוי מגמות עסקיות", color: "text-slate-600 bg-slate-50" },
  { icon: Users, name: "Retention", role: "שימור לקוחות", desc: "הגדלת LTV ומניעת נטישה", color: "text-rose-600 bg-rose-50" },
  { icon: Headset, name: "Support Ops", role: "מערך שירות", desc: "ייעול מענה ותמיכה בלקוחות", color: "text-sky-600 bg-sky-50" },
  { icon: Settings, name: "Automation Builder", role: "מומחה אוטומציה", desc: "חיבור מערכות וחיסכון בזמן", color: "text-violet-600 bg-violet-50" },
  { icon: Shield, name: "Accountability", role: "בקרת איכות", desc: "מוודא שהמשימות בוצעו ברמה גבוהה", color: "text-red-600 bg-red-50" },
  { icon: Brain, name: "Learning Agent", role: "סוכן למידה", desc: "לומד מהצלחות וכישלונות לשיפור מתמיד", color: "text-fuchsia-600 bg-fuchsia-50" },
];

const TIMELINE = [
  { step: 1, title: "בחירת מטרה", desc: "אתה בוחר יעד מרכזי אחד (למשל: הגדלת הכנסות ב-20%)." },
  { step: 2, title: "אבחון בזק", desc: "הסוכנים שואלים אותך 5-6 שאלות כדי להבין את נקודת הפתיחה." },
  { step: 3, title: "בניית תכנית אסטרטגית", desc: "המערכת בונה תכנית חודשית, שבועית ויומית מותאמת אישית." },
  { step: 4, title: "משימות יומיות (Micro-Tasks)", desc: "כל בוקר מקבלים 3 משימות מדויקות. לא רשימה אינסופית." },
  { step: 5, title: "מעקב וניקוד", desc: "דיווח ביצוע מהיר בסוף יום. המערכת מחשבת ציון התקדמות." },
  { step: 6, title: "זיהוי חסמים", desc: "נתקעת? הסוכן הרלוונטי נכנס לתמונה ונותן פתרון נקודתי." },
  { step: 7, title: "אופטימיזציה שבועית", desc: "במוצ״ש המערכת מנתחת את השבוע ומעדכנת את התכנית לשבוע הבא." },
];

const USE_CASES = [
  { title: "הגדלת הכנסה חודשית", desc: "מטרה קלאסית. הסוכנים יתמקדו במכירות, העלאת מחירים או מוצרים חדשים.", icon: TrendingUp, color: "bg-green-100 text-green-700" },
  { title: "20 לידים בשבוע", desc: "פוקוס על שיווק. סוכני התוכן והקמפיינים יבנו משפך שיווקי אגרסיבי.", icon: Users, color: "bg-blue-100 text-blue-700" },
  { title: "שיפור אחוזי סגירה", desc: "ניתוח שיחות מכירה, שיפור תסריטים ופולואפ. סוכן המכירות מוביל.", icon: Handshake, color: "bg-purple-100 text-purple-700" },
  { title: "מנגנון שיווק קבוע", desc: "בניית סיסטם של תוכן וקידום שלא תלוי במצב הרוח שלך.", icon: Megaphone, color: "bg-orange-100 text-orange-700" },
  { title: "סדר תזרים וחובות", desc: "התייעלות פיננסית. סוכן התזרים בונה תכנית הבראה וצמצום הוצאות.", icon: DollarSign, color: "bg-yellow-100 text-yellow-700" },
  { title: "שימור לקוחות", desc: "בניית מועדון לקוחות, ניוזלטרים והצעות ערך ללקוחות קיימים.", icon: Heart, color: "bg-pink-100 text-pink-700" },
];

const FAQS = [
  { q: "זה מתאים למי שאין לו זמן?", a: "בדיוק למי שאין לו זמן. המערכת חוסכת את זמן התכנון וההתלבטות. מקבלים משימות מוכנות, מבצעים ב-20 דקות, וממשיכים הלאה." },
  { q: "כמה זמן ביום זה דורש?", a: "בין 15 ל-45 דקות ביום לביצוע המשימות, ועוד 2 דקות לדיווח. זה הכל." },
  { q: "מה קורה אם אני תקוע?", a: "לוחצים על כפתור 'עזרה' במשימה, והסוכן הרלוונטי (למשל סוכן שיווק) נותן פתרון, דוגמה או הסבר איך לבצע." },
  { q: "האם זה מחליף מנטור אנושי?", a: "זה מחליף את החלק הטכני, המקצועי והניהולי של מנטור. זה לא מחליף חיבוק, אבל זה הרבה יותר יעיל בלהביא תוצאות עסקיות." },
  { q: "מה אם אני לא יודע להגדיר מטרה?", a: "סוכן 'אדריכל המטרות' יעזור לך בתהליך האונבורדינג לזקק את הרצון שלך למטרה עסקית ברורה." },
  { q: "האם זה מתאים לעסק של אדם אחד?", a: "כן, זו האוכלוסייה שהכי מרוויחה. זה כמו לקבל שותף שמנהל אותך." },
  { q: "איך נראית המדידה?", a: "יש דשבורד שמראה אחוזי ביצוע, התקדמות לעבר היעד הכספי, וניתוח של איפה אתה חזק ואיפה חלש." },
  { q: "אפשר להחליף מטרה?", a: "כן. בכל רגע נתון עובדים על מטרה ראשית אחת, אבל אפשר לסיים אותה או להחליף אותה אם סדרי העדיפויות השתנו." },
  { q: "האם יש תמיכה אנושית?", a: "יש תמיכה טכנית מלאה. הייעוץ העסקי נעשה ב-100% על ידי ה-AI כדי לשמור על מחיר נמוך וזמינות מיידית." },
  { q: "איך מתחילים?", a: "נרשמים למערכת, בוחרים מסלול, ומגדירים את המטרה הראשונה כבר היום." },
];

export default function AiMentorPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      <Header />
      <main className="pt-16 md:pt-20 bg-white font-sans overflow-x-hidden">
        
        {/* 1. HERO SECTION */}
        <section className="relative pt-8 pb-12 md:pt-10 md:pb-24 overflow-hidden bg-gradient-to-b from-violet-50/50 via-white to-white">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-200/20 blur-[120px] rounded-full mix-blend-multiply -z-10 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-200/20 blur-[120px] rounded-full mix-blend-multiply -z-10 animate-pulse delay-700" />
          
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 -z-20 mix-blend-overlay" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              
              {/* Hero Content */}
              <motion.div 
                style={{ opacity, scale }}
                className="flex-1 text-center lg:text-right"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-violet-200 text-violet-700 px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-violet-500/10 mb-4 hover:scale-105 transition-transform cursor-default"
                >
                  <Sparkles className="w-4 h-4 text-violet-500 fill-violet-500" />
                  <span>הלב של המערכת</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-8xl font-black text-gray-900 leading-[1.1] mb-4 tracking-tight drop-shadow-sm"
                >
                  מנטורינג שלא נגמר <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 animate-gradient">
                    אחרי שיחה אחת.
                  </span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-3xl text-gray-500 font-light leading-relaxed mb-6 max-w-2xl mx-auto lg:mx-0"
                >
                  30 סוכני AI חכמים מלווים אותך לכל מטרה עסקית – <br className="hidden md:block"/>
                  <span className="font-medium text-gray-900">בתהליך יומיומי שמביא תוצאה, לא רק דיבורים.</span>
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8 text-gray-600"
                >
                  {[
                    "תהליך שבועי ברור",
                    "משימות + בקרה + תובנות",
                    "זמין 24/7 וזוכר הכל"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/80 backdrop-blur px-5 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="w-3 h-3 text-green-600 stroke-[3]" />
                      </div>
                      <span className="font-medium">{text}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <a href={SIGNUP_URL}>
                    <ShinyButton className="h-16 px-12 text-xl rounded-2xl bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-600/30 text-white w-full sm:w-auto font-bold border-b-4 border-violet-800 active:border-b-0 active:translate-y-1 transition-all">
                      התחל עכשיו בחינם
                      <ArrowLeft className="mr-2 w-6 h-6" />
                    </ShinyButton>
                  </a>
                  <p className="mt-4 sm:mt-0 flex items-center justify-center text-sm text-gray-400 font-medium">
                    <Shield className="w-4 h-4 mr-1 ml-1" />
                    ללא צורך באשראי • התנסות חינם
                  </p>
                </motion.div>
              </motion.div>

              {/* Hero Visual Mockup */}
              <motion.div 
                initial={{ opacity: 0, x: 50, rotate: -5 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                className="flex-1 w-full max-w-xl lg:max-w-2xl relative perspective-1000"
              >
                {/* Abstract UI Representation */}
                <div className="relative bg-white rounded-[2.5rem] shadow-2xl border-4 border-white ring-1 ring-gray-100 overflow-hidden transform transition-transform hover:scale-[1.02] duration-500 float-animation">
                  <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500" />
                  
                  {/* Top Bar */}
                  <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-50 flex items-center justify-center text-violet-600 shadow-inner relative">
                         {/* Circular Progress Indicator around icon */}
                         <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E0E7FF" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="74, 100" className="text-violet-600" />
                         </svg>
                        <Target size={28} className="drop-shadow-sm relative z-10" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 font-medium mb-1">היעד המרכזי</div>
                        <div className="font-bold text-gray-900 text-xl">הגדלת הכנסות ל-₪50k</div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 w-[74%] rounded-full" />
                            </div>
                            <span className="text-xs font-bold text-violet-600">74%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content - Journey Timeline */}
                  <div className="p-8 bg-gray-50/50 space-y-0 min-h-[400px] relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute right-[3.25rem] top-12 bottom-20 w-0.5 bg-gray-200" />

                    {/* Task 1: Completed */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative z-10 flex items-center gap-5 mb-6 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-500 border-4 border-white shadow-sm flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
                            <div>
                                <div className="text-sm font-bold text-gray-900 line-through decoration-gray-400 decoration-2">בניית תכנית שיווקית</div>
                                <div className="text-xs text-green-600 font-medium mt-0.5">בוצע אתמול • 100 נקודות</div>
                            </div>
                            <div className="bg-green-50 p-2 rounded-xl text-green-600">
                                <Award size={18} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Task 2: Current / Active */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="relative z-10 flex items-center gap-5 mb-6"
                      >
                        <div className="w-10 h-10 rounded-full bg-violet-600 border-4 border-violet-100 shadow-lg shadow-violet-200 flex items-center justify-center shrink-0 ring-4 ring-white">
                          <Zap className="w-5 h-5 text-white fill-white animate-pulse" />
                        </div>
                        <div className="flex-1 bg-white p-5 rounded-2xl border-l-4 border-l-violet-500 shadow-md transform scale-105 transition-transform">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs text-violet-500 font-bold uppercase tracking-wider mb-1">משימה יומית</div>
                                    <div className="text-base font-bold text-gray-900">שיחות מכירה ל-5 לידים חמים</div>
                                </div>
                                <div className="bg-violet-50 p-2 rounded-xl text-violet-600">
                                    <Users size={20} />
                                </div>
                            </div>
                             <div className="mt-3 flex gap-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">תסריט מכירה מצורף</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">20 דקות</span>
                             </div>
                        </div>
                    </motion.div>

                    {/* Task 3: Next */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                        className="relative z-10 flex items-center gap-5"
                      >
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shrink-0">
                          <div className="w-3 h-3 rounded-full bg-gray-300" />
                        </div>
                        <div className="flex-1 bg-white/50 p-4 rounded-2xl border border-gray-100 border-dashed flex justify-between items-center grayscale opacity-60">
                            <div>
                                <div className="text-sm font-bold text-gray-700">סיכום שבועי ואופטימיזציה</div>
                                <div className="text-xs text-gray-400 mt-0.5">מחר ב-09:00</div>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded-xl text-gray-400">
                                                <RefreshCw size={18} />
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Mentor Insight Card */}
                                    <motion.div 
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 1.2 }}
                                      className="relative mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex gap-4 shadow-sm z-20"
                                    >
                      <div className="bg-white p-2.5 rounded-full h-fit shadow-sm text-blue-600 shadow-blue-100 shrink-0">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-2">
                            <Brain size={12} />
                            תובנה מהמנטור
                        </div>
                        <div className="text-sm text-gray-700 leading-tight">
                          "שמתי לב שבימי שלישי יש ירידה באנרגיה. הכנתי לך משימה קלילה יותר למחר כדי לשמור על רצף."
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Floating Elements */}
                 <div className="absolute -right-16 top-24 bg-white p-3 pr-5 rounded-2xl shadow-xl shadow-violet-100 border border-violet-50 animate-[float_4s_ease-in-out_infinite] hidden xl:block z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shadow-sm">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">צמיחה שבועית</div>
                      <div className="text-xl font-black text-gray-900 leading-none">+12%</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-12 bottom-8 bg-white p-3 pr-5 rounded-2xl shadow-xl shadow-indigo-100 border border-indigo-50 animate-[float_5s_ease-in-out_infinite_1s] hidden xl:block z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                      <Megaphone size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">סוכן פעיל</div>
                      <div className="text-base font-black text-gray-900 leading-none">אסטרטג שיווק</div>
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-300 animate-bounce"
            >
              <span className="text-xs font-medium tracking-widest uppercase">גלול למטה</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </section>

        {/* 2. PAIN / TRUTH */}
        <section className="py-16 md:py-32 bg-white relative">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-10 md:mb-20 leading-tight">
              למה רוב העסקים לא נכשלים בגלל רעיון — <br />
              <span className="inline-block relative">
                <span className="relative z-10 text-red-500">אלא בגלל הדרך?</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-red-100 -z-0 rotate-1" />
              </span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {[
                { title: "קופצים בין משימות", desc: "יום אחד שיווק, יום אחד מוצר, יום אחד כלום. אין עקביות שבונה מומנטום.", icon: RefreshCw },
                { title: "אין בקרה אמיתית", desc: "אף אחד לא בודק בסוף היום אם באמת ביצעת את מה שתכננת.", icon: Search },
                { title: "חוסר סדר מנטלי", desc: "מיליון רעיונות בראש, אפס יכולת לזקק אותם לתכנית עבודה פשוטה.", icon: Brain },
                { title: "לבד במערכה", desc: "כשקשה, אין מי שיתן את הפתרון המדויק או את הדחיפה הקטנה.", icon: UserCheck },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-red-100 transition-all group text-right relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500 ease-out" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl border border-red-100 shadow-sm flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                      <XCircle className="w-8 h-8 text-red-500 group-hover:text-white" />
                    </div>
                    <h3 className="font-bold text-xl mb-4 text-gray-900 group-hover:text-red-600 transition-colors">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-10 py-6 rounded-3xl text-xl font-medium shadow-2xl shadow-violet-500/30 transform hover:scale-105 transition-transform"
            >
              💡 הבעיה היא לא ידע. הבעיה היא <span className="font-black bg-white/20 px-2 py-1 rounded-lg mx-1">עקביות ומדידה</span>.
            </motion.div>
          </div>
        </section>

        {/* 3. CONCEPT */}
        <section className="py-16 md:py-32 bg-[#0A0A0B] text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[150px] animate-pulse delay-1000" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <SectionHeading 
              light
              title="זה לא מנטור אחד. זו מחלקה שלמה."
              subtitle="לכל תחום בעסק שלך יש סוכן מומחה. כולם עובדים יחד, מסונכרנים סביב המטרה שלך, וזוכרים כל פרט שקרה בעסק שלך."
            />

            {/* Visual Flow */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mt-10 md:mt-20">
              {[
                { label: "הגדרת מטרה", icon: Target, color: "text-blue-400" },
                { label: "פירוק למשימות", icon: Layout, color: "text-violet-400" },
                { label: "ביצוע בפועל", icon: Zap, color: "text-yellow-400" },
                { label: "בקרה ושיפור", icon: RefreshCw, color: "text-green-400" },
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="w-24 h-24 mx-auto bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300 border border-white/10 backdrop-blur-sm shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                    <item.icon className={`w-10 h-10 ${item.color}`} />
                  </div>
                  <div className="font-bold text-xl">{item.label}</div>
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-12 left-[-50%] w-full h-[2px] bg-gradient-to-l from-transparent via-gray-700 to-transparent -z-10 group-hover:via-violet-500 transition-colors duration-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. AGENTS GRID */}
        <section className="py-16 md:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading 
              title="הכירו את הסוכנים" 
              subtitle="צוות של מומחים דיגיטליים שעובד אצלך 24/7, ללא הפסקה, ללא חופשות וללא תלונה."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {AGENTS.map((agent, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8, boxShadow: "0 20px 40px -5px rgba(0,0,0,0.1)" }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all cursor-default group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${agent.color.replace('text-', 'from-').replace('bg-', 'to-')} opacity-5 rounded-bl-full transition-transform group-hover:scale-150 duration-500`} />
                  
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${agent.color} group-hover:scale-110 transition-transform duration-300`}>
                    <IconWrapper icon={agent.icon} className="w-7 h-7" colorClass={agent.color} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-violet-700 transition-colors">{agent.name}</h3>
                  <div className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">{agent.role}</div>
                  <p className="text-gray-500 text-sm leading-relaxed">{agent.desc}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <a href={SIGNUP_URL}>
                <ShinyButton className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-violet-200 h-14 px-10 rounded-2xl font-bold text-lg shadow-sm">
                   + ועוד סוכנים שמצטרפים כל הזמן
                </ShinyButton>
              </a>
            </div>
          </div>
        </section>

        {/* MID PAGE CTA */}
        <section className="py-16 bg-violet-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-multiply" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500 opacity-20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
            
            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right shadow-2xl">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold mb-4 backdrop-blur-sm border border-white/10">
                            <Sparkles className="w-4 h-4" />
                            <span>הזדמנות לזמן מוגבל</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
                            הצוות שלך מוכן להתחיל לעבוד.
                        </h2>
                        <p className="text-violet-100 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                            למה לחכות? קבל גישה מיידית לכל סוכני ה-AI והתחל לראות תוצאות בעסק שלך כבר היום.
                        </p>
                    </div>
                    <div className="shrink-0 w-full md:w-auto">
                         <a href={SIGNUP_URL}>
                            <ShinyButton className="w-full md:w-auto bg-white text-violet-700 hover:bg-violet-50 px-10 py-5 rounded-2xl text-xl font-black shadow-xl shadow-violet-900/20 whitespace-nowrap transform hover:scale-105 transition-all">
                                כניסה למערכת
                                <ArrowLeft className="mr-2 w-6 h-6 inline-block" />
                            </ShinyButton>
                         </a>
                         <div className="text-violet-200 text-sm mt-3 font-medium text-center">
                            ללא צורך בכרטיס אשראי
                         </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 5. TIMELINE PROCESS */}
        <section className="py-16 md:py-32 bg-white relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHeading 
              title="מה קורה מהרגע שבחרת מטרה?" 
              subtitle="תהליך מובנה שחוזר על עצמו ומבטיח התקדמות, לא משנה מה קורה בחוץ."
            />

            <div className="relative space-y-12 md:space-y-24 mt-12 md:mt-20 before:absolute before:inset-0 before:mr-8 md:before:mx-auto before:-translate-x-px md:before:translate-x-0 before:h-full before:w-1 before:bg-gray-100 before:rounded-full">
              {TIMELINE.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                >
                  
                  {/* Icon */}
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-[6px] border-white bg-violet-600 text-white shadow-xl shadow-violet-200 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative group-hover:scale-110 transition-transform duration-300">
                    <span className="font-black text-xl">{step.step}</span>
                  </div>
                  
                  {/* Content Card */}
                  <div className="w-[calc(100%-6rem)] md:w-[calc(50%-4rem)] bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-2xl hover:border-violet-100 transition-all duration-300 group-hover:-translate-y-2">
                    <h3 className="font-bold text-xl text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-500 text-base leading-relaxed">{step.desc}</p>
                  </div>

                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. USE CASES */}
        <section className="py-16 md:py-32 bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading 
              title="לכל שלב בעסק יש Playbook" 
              subtitle="לא משנה מה האתגר הנוכחי שלך, הסוכנים כבר יודעים איך לפתור אותו."
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {USE_CASES.map((usecase, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-lg shadow-gray-200/50 hover:shadow-2xl transition-all border border-gray-100 group cursor-pointer relative"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${usecase.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <IconWrapper icon={usecase.icon} className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{usecase.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-8 text-lg">
                    {usecase.desc}
                  </p>
                  <div className="pt-6 border-t border-gray-50 flex items-center text-sm font-bold text-violet-600 group-hover:gap-3 transition-all">
                    בחר מסלול זה
                    <ArrowLeft className="mr-2 w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. COMPARISON TABLE */}
        <section className="py-16 md:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <SectionHeading 
              title="למה לא לקחת פשוט מנטור חיצוני?" 
              subtitle="הטבלה הזו תחסוך לך בערך 5,000 ש״ח בחודש."
            />

            <div className="overflow-hidden border border-gray-200 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 text-sm md:text-base">
              <div className="grid grid-cols-3 bg-gray-50/80 p-4 md:p-8 border-b border-gray-200 text-center font-bold text-base md:text-xl backdrop-blur-sm sticky top-0 z-10 items-center">
                <div className="text-gray-400 font-medium text-sm md:text-lg text-right">פרמטר</div>
                <div className="text-gray-500 text-sm md:text-xl">מנטור אנושי</div>
                <div className="text-violet-600 bg-violet-100 rounded-xl md:rounded-2xl py-1 md:py-2 px-2 md:px-6 w-fit mx-auto shadow-sm text-sm md:text-xl whitespace-nowrap">מנטור AI</div>
              </div>

              {[
                { param: "זמינות", human: "פעם בשבוע", ai: "24/7, גם בלילה" },
                { param: "עלות", human: "₪2,000 - ₪10,000 בחודש", ai: "כלול במנוי" },
                { param: "זיכרון", human: "שוכח לפעמים", ai: "זוכר הכל לנצח" },
                { param: "ביצוע", human: "מדבר איתך על מה לעשות", ai: "נותן משימות, בודק ביצוע, מתקן" },
                { param: "ידע", human: "מומחה בתחום אחד בד״כ", ai: "30 מומחים בכל התחומים" },
                { param: "מדידה", human: "תחושות בטן", ai: "דשבורד KPI מדויק בזמן אמת" },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 p-4 md:p-8 border-b border-gray-100 last:border-0 hover:bg-violet-50/30 transition-colors items-center text-center group">
                  <div className="font-bold text-gray-900 text-right text-sm md:text-lg">{row.param}</div>
                  <div className="text-gray-500 text-xs md:text-lg px-1">{row.human}</div>
                  <div className="text-gray-900 font-bold text-xs md:text-lg flex justify-center items-center gap-1 md:gap-3 px-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    {row.ai}
                  </div>
                </div>
              ))}
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center text-2xl font-bold mt-16 text-gray-900"
            >
              אנחנו לא מוכרים השראה. <span className="text-violet-600 relative inline-block">
                אנחנו מוכרים תהליך.
                <svg className="absolute w-full h-3 bottom-0 left-0 text-violet-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
              </span>
            </motion.p>
          </div>
        </section>

        {/* 8. TRUST */}
        <section className="py-12 md:py-24 bg-[#0A0A0B] text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />

          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold mb-8 md:mb-16">למה אפשר לסמוך על זה?</h2>
            <div className="grid md:grid-cols-4 gap-8 md:gap-12">
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-violet-600 transition-colors duration-500 shadow-2xl">
                  <Shield className="w-10 h-10 text-violet-300 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-xl mb-3">מתודולוגיה מוכחת</h4>
                <p className="text-gray-400">אותו תהליך שעובד לחברות ענק, מותאם לעסק קטן.</p>
              </div>
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-violet-600 transition-colors duration-500 shadow-2xl">
                  <Clock className="w-10 h-10 text-violet-300 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-xl mb-3">ממוקד זמן</h4>
                <p className="text-gray-400">בלי חפירות. משימות קצרות ומעשיות בלבד.</p>
              </div>
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-violet-600 transition-colors duration-500 shadow-2xl">
                  <Settings className="w-10 h-10 text-violet-300 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-xl mb-3">אדפטיבי לחלוטין</h4>
                <p className="text-gray-400">התכנית משתנה בזמן אמת לפי קצב ההתקדמות שלך.</p>
              </div>
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-violet-600 transition-colors duration-500 shadow-2xl">
                  <Star className="w-10 h-10 text-violet-300 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-xl mb-3">ללא סיכון</h4>
                <p className="text-gray-400">הכל מתועד, שקוף, ואפשר לעצור בכל רגע.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FAQ */}
        <section className="py-16 md:py-32 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <SectionHeading title="שאלות נפוצות" />
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {FAQS.map((faq, idx) => (
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

        {/* 10. FINAL CTA */}
        <section className="py-16 md:py-32 relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-violet-700 to-indigo-900">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

          {/* Animated Circles */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-500 rounded-full blur-[120px] opacity-40 animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px] opacity-40 animate-pulse delay-700" />
          
          <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
            <motion.h2 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="text-5xl md:text-8xl font-black mb-8 tracking-tight leading-none"
            >
              בחר מטרה.<br/> קבל תהליך.<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">תראה תוצאה.</span>
            </motion.h2>
            <p className="text-xl md:text-3xl text-violet-100 mb-12 font-light max-w-2xl mx-auto">
              אל תחכה למחר. הסוכנים מוכנים להתחיל לעבוד על העסק שלך כבר בדקות הקרובות.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <a href={SIGNUP_URL}>
                <ShinyButton className="bg-white text-violet-700 rounded-2xl px-16 h-20 text-2xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_rgba(255,255,255,0.2)]">
                  התחל עכשיו - בחינם
                </ShinyButton>
              </a>
            </motion.div>
            
            <p className="mt-8 text-sm md:text-base text-violet-200 opacity-80 font-medium">
              לוקח דקה להתחיל • בלי התחייבות • ללא צורך בכרטיס אשראי
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}