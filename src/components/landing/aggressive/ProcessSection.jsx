import React from 'react';
import { FileText, Phone, Rocket } from 'lucide-react';

export default function ProcessSection() {
  const steps = [
    { icon: FileText, num: '1', title: 'משאירים פרטים', desc: 'שם + טלפון – זה הכל' },
    { icon: Phone, num: '2', title: 'מקבלים שיחה והכוונה', desc: 'נציג חוזר אליך תוך דקות' },
    { icon: Rocket, num: '3', title: 'מתחילים בצורה מסודרת', desc: 'פתיחת עוסק פטור בליווי מלא' }
  ];

  return (
    <section className="py-10 md:py-14 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-[#1E3A5F] mb-2">
            איך פותחים עוסק פטור נכון?
          </h2>
          <p className="text-gray-500 font-medium">3 צעדים פשוטים</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-6 shadow-md text-center border-2 border-transparent hover:border-[#27AE60]/20 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#1E3A5F] flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-black">{step.num}</span>
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -left-3 transform -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-[#27AE60] flex items-center justify-center">
                    <span className="text-white text-xs">→</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}