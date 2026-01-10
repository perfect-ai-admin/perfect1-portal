import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

export default function FinalCTASection() {
  const scrollToCategories = () => {
    document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            רוצה להתחיל בצורה מסודרת?
          </h2>

          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            אפשר לפתוח עסק גם לבד –
            <br />
            ואפשר לעשות את זה עם ליווי ומידע ברור כבר מההתחלה.
          </p>

          <Button
            onClick={scrollToCategories}
            className="h-16 px-12 text-2xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl hover:shadow-xl transition-all"
          >
            בחירת מסלול פתיחה
            <ArrowDown className="ml-3 w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}