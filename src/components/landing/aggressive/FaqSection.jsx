import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-base font-bold text-[#1E3A5F]">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-gray-600 leading-relaxed text-sm">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqSection() {
  const faqs = [
    {
      q: 'כמה זמן לוקח לפתוח עוסק פטור?',
      a: 'עם ליווי מקצועי, התהליך נמשך בדרך כלל בין יום ל-3 ימי עסקים. אנחנו דואגים שהכל ילך חלק ומהר.'
    },
    {
      q: 'האם חייבים ליווי מקצועי?',
      a: 'לא חייבים, אבל ליווי חוסך טעויות יקרות, זמן ובירוקרטיה מיותרת. 7 מתוך 10 עצמאים שמתחילים לבד עושים טעויות שעולות להם ביוקר.'
    },
    {
      q: 'מה כולל התהליך?',
      a: 'פתיחת תיק מול כל הרשויות (מס הכנסה, ביטוח לאומי, מע"מ), הסבר מלא על החובות שלך, ליווי שוטף לאורך כל הדרך.'
    }
  ];

  return (
    <section className="py-10 md:py-14 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F] text-center mb-6">
          שאלות נפוצות
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}