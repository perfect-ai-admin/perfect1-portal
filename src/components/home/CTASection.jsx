import React from 'react';
import { motion } from 'framer-motion';
import LeadForm from '../forms/LeadForm';

export default function CTASection() {
  return (
    <section className="py-20 bg-white">
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
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-6 leading-tight">
              פתח עוסק פטור עכשיו
              <br />
              <span className="text-[#D4AF37]">והתחל להרוויח</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              השאר פרטים ונציג יחזור אליך תוך 24 שעות לייעוץ חינם וללא התחייבות. 
              נעזור לך להבין מה הכי מתאים לך ונלווה אותך בכל הדרך.
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
          >
            <LeadForm 
              variant="card"
              sourcePage="דף הבית - CTA"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}