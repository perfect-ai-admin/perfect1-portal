import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import SEOOptimized from './SEOOptimized';

export default function Methodology() {
  const steps = [
    { step: 1, title: 'ייעוץ ראשוני', desc: 'הבנת הצרכים והפעילות העסקית שלך' },
    { step: 2, title: 'הכנת מסמכים', desc: 'הכנת כל המסמכים הנדרשים לרישום' },
    { step: 3, title: 'רישום ממשלתי', desc: 'רישום בעוסק פטור ממס הכנסה וביטוח לאומי' },
    { step: 4, title: 'ליווי שוטף', desc: 'ליווי מקצועי וניהול נתונים שוטף' }
  ];

  return (
    <>
      <SEOOptimized
        title="המתודולוגיה שלנו | Perfect One"
        description="גלה את שלבי התהליך שלנו לפתיחת עוסק פטור בישראל"
        canonical="https://perfect1.co.il/Methodology"
      />
      <main className="pt-32 min-h-screen bg-gradient-to-b from-[#F8F9FA] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-4">המתודולוגיה שלנו</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              תהליך מוכח וזליל לפתיחת עוסק פטור בישראל
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-[#1E3A5F]">{item.title}</h3>
                  <CheckCircle className="w-6 h-6 text-[#27AE60]" />
                </div>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}