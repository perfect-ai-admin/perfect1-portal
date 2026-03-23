import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function FomoSection() {
  return (
    <section className="py-10 md:py-14 bg-gradient-to-r from-red-50 to-orange-50 border-y-4 border-red-200">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-5">
          <AlertTriangle className="w-4 h-4" />
          נתון קריטי
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
          7 מתוך 10 עצמאים מתחילים לא נכון
          <span className="block text-red-600 mt-1">ומשלמים על זה ביוקר</span>
        </h2>

        <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">
          פתיחת עוסק פטור נראית פשוטה – אבל טעויות קטנות יכולות לעלות לך זמן וכסף.
          <br />
          <strong>הרבה בוחרים ליווי כדי להתחיל נכון מההתחלה.</strong>
        </p>
      </div>
    </section>
  );
}