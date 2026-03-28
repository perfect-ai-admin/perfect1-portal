import React from 'react';
import { LayoutGrid, TrendingUp, Clock } from 'lucide-react';

const benefits = [
  {
    icon: LayoutGrid,
    title: 'יותר סדר',
    description: 'הכל מרוכז בתהליך אחד ברור – בלי להתפזר בין כלים',
    color: 'violet',
  },
  {
    icon: TrendingUp,
    title: 'יותר תוצאות',
    description: 'עובדים לפי מטרות ברורות, לא לפי ניחושים',
    color: 'emerald',
  },
  {
    icon: Clock,
    title: 'פחות זמן',
    description: 'תבניות וכלים מוכנים שמוציאים לפועל מיד',
    color: 'amber',
  },
];

const colorClasses = {
  violet: {
    bg: 'bg-violet-50',
    icon: 'bg-violet-100 text-violet-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
  },
};

export default function Benefits() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            מה יוצא לך מזה?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            פלטפורמה אחת שעוזרת לך לנהל עסק בצורה חכמה יותר
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const colors = colorClasses[benefit.color];
            return (
              <div
                key={index}
                className={`${colors.bg} rounded-2xl p-6 md:p-8 transition-all hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className={`w-14 h-14 ${colors.icon} rounded-xl flex items-center justify-center mb-5`}>
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}