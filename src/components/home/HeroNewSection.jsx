import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function HeroNewSection() {
  const scrollToCategories = () => {
    const element = document.getElementById('business-types');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl will-change-transform"
        />
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#27AE60]/15 rounded-full blur-3xl will-change-transform"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-0 w-96 h-96 bg-[#1E3A5F]/20 rounded-full blur-3xl will-change-transform"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-6 py-3 mb-10 border border-white/20"
        >
          <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse"></div>
          <span className="text-white/95 text-sm font-bold">המרכז הארצי לפתיחת עוסקים בישראל</span>
        </motion.div>

        {/* H1 - Extra Large */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-4"
        >
          פתיחת עסק בישראל
        </motion.h1>

        {/* Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-[#D4AF37] mb-8 leading-tight"
        >
          עוסק פטור
          <br />
          עוסק מורשה וחברה בע״מ
        </motion.div>

        {/* H2 - Subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-2xl md:text-3xl font-bold text-white/95 mb-6 max-w-3xl mx-auto leading-relaxed"
        >
          כל מה שצריך כדי לפתוח ולנהל עסק בישראל – במקום אחד
        </motion.h2>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-14 leading-relaxed"
        >
          מידע מקצועי, תהליכים מסודרים וליווי מול רשויות המס – מהשלב הראשון ועד פעילות שוטפת
        </motion.p>

        {/* CTA Button - Large */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={scrollToCategories}
          className="h-20 px-16 text-2xl font-black rounded-3xl bg-gradient-to-r from-[#27AE60] via-[#2ECC71] to-[#27AE60] hover:from-[#2ECC71] hover:via-[#27AE60] hover:to-[#2ECC71] text-white shadow-2xl hover:shadow-3xl transition-all inline-flex items-center justify-center gap-3 animate-pulse-glow"
        >
          בחירת מסלול פתיחה
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8F9FA"/>
        </svg>
      </div>
    </section>
  );
}