import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SolutionSection({ onCtaClick }) {
  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            ✅ הפתרון
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-[#1E3A5F] mb-3 leading-tight">
            פתיחת עוסק פטור – הדרך הנכונה להתחיל
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            'ליווי אישי לאורך כל התהליך',
            'הסבר ברור בלי בלבול',
            'חיסכון בזמן והתעסקות',
            'התחלה מסודרת ובטוחה'
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="w-8 h-8 rounded-full bg-[#27AE60] flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold text-gray-800">{text}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={onCtaClick}
            className="h-14 px-10 text-lg font-black rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg"
          >
            בדוק זכאות לפתיחת עוסק פטור
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}