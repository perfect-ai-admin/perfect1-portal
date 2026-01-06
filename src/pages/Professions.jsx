import React from 'react';
import { motion } from 'framer-motion';
import ProfessionsGrid from '../components/home/ProfessionsGrid';

export default function Professions() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              פתיחת עוסק פטור לפי מקצוע
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              יש לנו ניסיון רב בפתיחת עוסקים פטורים ליותר מ-60 מקצועות שונים. 
              מצא את המקצוע שלך וקבל מידע מותאם.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Professions Grid - Show All */}
      <ProfessionsGrid showAll={true} />
    </main>
  );
}