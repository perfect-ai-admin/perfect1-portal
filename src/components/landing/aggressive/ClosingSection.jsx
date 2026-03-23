import React from 'react';
import LeadFormInline from './LeadFormInline';

export default function ClosingSection({ onSubmit, isSubmitting }) {
  return (
    <section className="py-10 md:py-16 bg-gradient-to-br from-[#0F2847] via-[#1E3A5F] to-[#0F2847] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-64 h-64 bg-red-500 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-[#D4AF37] rounded-full blur-[80px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 relative">
        <div className="text-center mb-8">
          <div className="inline-block bg-red-500/20 text-red-300 px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-red-500/30">
            🚨 אל תחכה – התחל היום
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight">
            פתיחת עוסק פטור מתחילה בהחלטה אחת
          </h2>
          <p className="text-lg text-white/80">
            השאר פרטים ונחזור אליך עם כל מה שצריך כדי להתחיל
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <LeadFormInline
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            sourcePage="דף נחיתה אגרסיבי - סגירה"
            ctaText="פתח עוסק פטור עכשיו"
            subText="ללא התחייבות • חזרה מיידית"
            dark
          />
        </div>
      </div>
    </section>
  );
}