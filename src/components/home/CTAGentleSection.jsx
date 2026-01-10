import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CTAGentleSection() {
  const scrollToForm = () => {
    const element = document.getElementById('contact-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6">
            רוצה להתחיל בצורה מסודרת?
          </h2>
          
          <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed max-w-2xl mx-auto">
            אפשר לפתוח עסק גם לבד –
            <br />
            ואפשר לעשות את זה עם ליווי ומידע ברור כבר מההתחלה.
          </p>

          <Button
            onClick={scrollToForm}
            className="bg-[#27AE60] hover:bg-[#229954] text-white px-12 py-6 text-lg font-bold rounded-2xl inline-flex items-center gap-2"
          >
            בחירת מסלול פתיחה
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}