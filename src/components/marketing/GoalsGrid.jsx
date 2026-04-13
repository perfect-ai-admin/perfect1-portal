import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Wallet,
  Target,
  LayoutGrid,
  Clock,
  Heart,
  Megaphone,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

const SIGNUP_URL = "https://www.perfect1.co.il/login?from_url=https%3A%2F%2Fwww.perfect1.co.il%2FAPP";

const goals = [
  { icon: TrendingUp, title: 'הגדלת הכנסה חודשית', color: 'emerald', id: 'increase-revenue' },
  { icon: Users, title: 'הגדלת כמות לקוחות', color: 'blue', id: 'increase-customers' },
  { icon: Wallet, title: 'יציבות בתזרים מזומנים', color: 'violet', id: 'cash-flow-stability' },
  { icon: Target, title: 'שיפור אחוזי סגירה', color: 'amber', id: 'improve-closing-rate' },
  { icon: LayoutGrid, title: 'סדר ושליטה בעסק', color: 'cyan', id: 'business-order' },
  { icon: Clock, title: 'חיסכון בזמן עבודה', color: 'orange', id: 'save-time' },
  { icon: Heart, title: 'שימור והחזרת לקוחות', color: 'pink', id: 'customer-retention' },
  { icon: Megaphone, title: 'מנגנון שיווק קבוע', color: 'indigo', id: 'marketing-machine' },
];

const colorClasses = {
  emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  violet: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
  amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  cyan: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
  orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
  pink: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
  indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
};

const iconColors = {
  emerald: 'text-emerald-600',
  blue: 'text-blue-600',
  violet: 'text-violet-600',
  amber: 'text-amber-600',
  cyan: 'text-cyan-600',
  orange: 'text-orange-600',
  pink: 'text-pink-600',
  indigo: 'text-indigo-600',
};

export default function GoalsGrid() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-white relative overflow-hidden">
        {/* Soft radial background */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
        
        <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            מה המטרה הבאה שלך?
          </motion.h2>
          <p className="text-xl text-gray-500 font-light">
            בחר את היעד העסקי המרכזי שלך כרגע, ואנחנו נתאים לך את הכלים המדויקים להצלחה.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {goals.map((goal, index) => (
            <motion.a
              key={index}
              href={`/Goal?id=${goal.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex flex-col items-center justify-center p-8 rounded-[2rem] bg-gray-50 border border-transparent hover:border-violet-100 hover:bg-white hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer aspect-square"
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-white shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1`}>
                <goal.icon className={`w-9 h-9 ${iconColors[goal.color]}`} />
              </div>
              
              <span className="text-lg font-bold text-gray-900 text-center px-2 leading-tight">
                {goal.title}
              </span>
              
              <div className="absolute bottom-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
                    בחר יעד זה
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a href={SIGNUP_URL}>
            <Button className="h-14 px-10 text-lg rounded-2xl bg-gray-900 text-white hover:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              התחל לעבוד על היעדים שלך
              <ArrowLeft className="mr-2 w-5 h-5" />
            </Button>
          </a>
          <p className="mt-4 text-sm text-gray-400 font-medium">
            הצטרף ל-2,000+ עסקים שכבר צומחים עם המערכת
          </p>
        </motion.div>
      </div>
    </section>
  );
}