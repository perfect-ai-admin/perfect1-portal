import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

export default function NewHeroSection() {
  const scrollToCategories = () => {
    document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847] overflow-hidden pt-20">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#27AE60] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            פתיחת עסק בישראל – עוסק פטור, עוסק מורשה וחברה בע״מ
          </h1>

          <h2 className="text-2xl md:text-3xl text-white/90 font-bold mb-4 leading-relaxed">
            כל מה שצריך כדי לפתוח ולנהל עסק בישראל – במקום אחד
          </h2>

          <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            מידע מקצועי, תהליכים מסודרים וליווי מול רשויות המס – מהשלב הראשון ועד פעילות שוטפת.
          </p>

          <Button
            onClick={scrollToCategories}
            className="h-16 px-12 text-2xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl hover:shadow-xl transition-all"
          >
            בחר את סוג העסק שלך
            <ArrowDown className="ml-3 w-6 h-6 animate-bounce" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}