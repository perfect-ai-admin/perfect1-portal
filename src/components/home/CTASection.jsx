import React from 'react';
import { motion } from 'framer-motion';
import UnifiedLeadForm from '../forms/UnifiedLeadForm';

export default function CTASection() {
  return (
    <section className="py-12 bg-white" data-lead-form="bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-[#27AE60]/10 text-[#27AE60] px-4 py-2 rounded-full text-sm font-medium mb-6">
              🚀 מוכנים להתחיל?
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 leading-tight">
              מוכן להתחיל את העסק שלך?
              <br />
              <span className="text-[#27AE60]">אנחנו כאן בשבילך!</span>
            </h2>
            <p className="text-gray-700 text-xl mb-8 leading-relaxed font-medium">
              השאר פרטים ונציג יחזור אליך תוך שעות. 
              <br />
              <strong>ייעוץ חינם וללא התחייבות</strong> - רק עזרה אמיתית להתחיל נכון.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#27AE60]/10 flex items-center justify-center">
                  <span className="text-[#27AE60] font-bold">✓</span>
                </div>
                <span className="text-gray-700">ייעוץ ראשוני חינם</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#27AE60]/10 flex items-center justify-center">
                  <span className="text-[#27AE60] font-bold">✓</span>
                </div>
                <span className="text-gray-700">תשובה תוך 24 שעות</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#27AE60]/10 flex items-center justify-center">
                  <span className="text-[#27AE60] font-bold">✓</span>
                </div>
                <span className="text-gray-700">ללא התחייבות</span>
              </div>
            </div>
          </motion.div>

          {/* Form */}
           <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             data-lead-form="bottom"
           >
             <UnifiedLeadForm 
               variant="card"
               title="🚀 התחל את העסק שלך היום"
               subtitle="מלא פרטים ונחזור אליך תוך שעות"
               ctaText="בדוק אם זה מתאים לך"
               fields={["name", "phone", "email"]}
               sourcePage="דף הבית - CTA"
             />
           </motion.div>
        </div>
      </div>
    </section>
  );
}