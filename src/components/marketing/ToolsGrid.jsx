import React from 'react';
import { 
  Palette, 
  FileText, 
  Presentation, 
  Tag,
  Share2,
  CreditCard,
  Receipt,
  ArrowRight,
  Video
} from 'lucide-react';
import { motion } from 'framer-motion';

const SIGNUP_URL = "https://www.perfect1.co.il/login?from_url=https%3A%2F%2Fwww.perfect1.co.il%2FAPP";

const tools = [
  {
    icon: Palette,
    title: 'יצירת לוגו חכם',
    description: 'עיצוב לוגו מקצועי וייחודי לעסק בדקות ספורות בעזרת AI',
    color: 'violet',
    href: '/SmartLogo'
  },
  {
    icon: FileText,
    title: 'דף נחיתה ממותג',
    description: 'דפי נחיתה מעוצבים שממירים מבקרים ללקוחות משלמים',
    color: 'blue',
    href: '/BrandedLandingPage'
  },
  {
    icon: Presentation,
    title: 'מצגת עסקית',
    description: 'יצירת מצגות משקיעים ומכירות מרשימות במהירות שיא',
    color: 'emerald',
    href: '/BusinessPresentation'
  },
  {
    icon: Tag,
    title: 'סטיקר לעסק',
    description: 'מדבקות ממותגות להדפסה ולוואטסאפ לחיזוק המותג',
    color: 'amber',
    href: '/BusinessSticker'
  },
  {
    icon: Share2,
    title: 'עיצובים לרשתות',
    description: 'סט פוסטים וסטוריז מעוצבים אוטומטית לפי המיתוג שלך',
    color: 'pink',
    href: '/SocialDesigns'
  },
  {
    icon: CreditCard,
    title: 'כרטיס ביקור דיגיטלי',
    description: 'כרטיס חכם שנשמר בקלות באנשי הקשר של הלקוחות',
    color: 'cyan',
    href: '/DigitalBusinessCard'
  },
  {
    icon: Video,
    title: 'אווטר AI לעסק',
    description: 'פרזנטור דיגיטלי אישי שמייצר וידאו ותוכן 24/7',
    color: 'orange',
    href: '/AvatarAi'
  },
  {
    icon: Receipt,
    title: 'הצעת מחיר ממותגת',
    description: 'הצעות מחיר מעוצבות שמשדרות אמינות וסוגרות עסקאות',
    color: 'indigo',
    href: '/BrandedQuote'
  },
];

const colorClasses = {
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  pink: { bg: 'bg-pink-50', icon: 'text-pink-600' },
  cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600' },
};

export default function ToolsGrid({ id }) {
  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-gray-50/30" id={id}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 mb-6 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            ארגז הכלים שלך
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            כל הכלים לצמיחה עסקית
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 leading-relaxed font-light"
          >
            פלטפורמה אחת חכמה המרכזת את כל הפתרונות שהעסק שלך צריך.
            <br className="hidden md:block" />
            ממיתוג מקצועי ועד שיווק חכם – הכל כאן.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {tools.map((tool, index) => (
            <motion.a 
              key={index} 
              href={tool.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex flex-col p-8 rounded-3xl bg-white border border-gray-100 hover:border-violet-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 h-full"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorClasses[tool.color].bg} ${colorClasses[tool.color].icon} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                <tool.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-700 transition-colors">
                {tool.title}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                {tool.description}
              </p>

              <div className="mt-6 flex items-center text-sm font-medium text-gray-400 group-hover:text-violet-600 transition-colors">
                להתחיל עכשיו
                <ArrowRight className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}