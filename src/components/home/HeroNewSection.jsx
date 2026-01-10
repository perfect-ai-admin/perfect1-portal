import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Zap, Users } from 'lucide-react';

export default function HeroNewSection() {
  const scrollToCategories = () => {
    const element = document.getElementById('business-types');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-72 h-72 bg-[#D4AF37]/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-[#27AE60]/20 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
          >
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-white/90 text-sm font-medium">המרכז הארצי לפתיחת עוסקים בישראל</span>
          </motion.div>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            פתיחת עסק בישראל
            <br />
            <span className="text-[#D4AF37]">עוסק פטור, מורשה וחברה בע״מ</span>
          </h1>

          {/* Subtitle - H2 */}
          <h2 className="text-xl md:text-2xl text-white/90 mb-6 font-bold max-w-3xl mx-auto">
            כל מה שצריך כדי לפתוח ולנהל עסק בישראל – במקום אחד
          </h2>

          {/* Supporting text */}
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-12">
            מידע מקצועי, תהליכים מסודרים וליווי מול רשויות המס – מהשלב הראשון ועד פעילות שוטפת
          </p>

          {/* CTA Primary */}
          <button 
            onClick={scrollToCategories}
            className="h-16 px-12 text-xl font-black rounded-2xl bg-gradient-to-r from-[#27AE60] via-[#2ECC71] to-[#27AE60] hover:from-[#2ECC71] hover:via-[#27AE60] hover:to-[#2ECC71] text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
          >
            בחר את סוג העסק שלך
            <ArrowLeft className="w-5 h-5" />
          </button>
        </motion.div>
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