import React from 'react';
import { Users, Star, TrendingUp } from 'lucide-react';

export default function ProofSection() {
  return (
    <section className="py-10 md:py-14 bg-gradient-to-br from-[#1E3A5F] to-[#0F2847]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
          +2,000 עצמאים כבר פתחו עוסק בצורה נכונה
        </h2>
        <p className="text-lg text-white/80 mb-8">
          אנשים בדיוק כמוך בחרו להתחיל נכון – בלי טעויות ובלי כאב ראש
        </p>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, num: '2,000+', label: 'עצמאים שפתחו' },
            { icon: Star, num: '4.9/5', label: 'דירוג לקוחות' },
            { icon: TrendingUp, num: '10 דק\'', label: 'זמן חזרה' }
          ].map((item, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <item.icon className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-black text-white">{item.num}</div>
              <div className="text-sm text-white/70 font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}