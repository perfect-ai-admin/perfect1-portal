import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const steps = [
  {
    number: '1',
    title: 'בוחרים סוג עסק',
    description: 'קובעים האם פטור, מורשה או חברה בע״מ מתאימים לך'
  },
  {
    number: '2',
    title: 'מקבלים מידע ברור',
    description: 'מידע מלא, עלויות, תהליך ופתרונות מותאמים להצעתך'
  },
  {
    number: '3',
    title: 'ממשיכים בביטחון',
    description: 'תהליך פתיחה מסודר או ליווי שוטף לפי הצורך'
  }
];

export default function HowItWorksSection() {
  const scrollToInfo = () => {
    document.getElementById('info-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-[#1E3A5F] mb-4">
            כך מתחילים בצורה נכונה
          </h2>
          <p className="text-xl text-gray-600">
            שלוש שלבים פשוטים להתחלה בביטחון
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#1E3A5F]/5 to-[#27AE60]/5 rounded-2xl p-8 border-2 border-[#1E3A5F]/10">
                <div className="w-14 h-14 rounded-full bg-[#27AE60] text-white font-black text-2xl flex items-center justify-center mb-4">
                  {step.number}
                </div>
                
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3">
                  {step.title}
                </h3>
                
                <p className="text-gray-700 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-0.5 bg-[#27AE60]"></div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={scrollToInfo}
            variant="outline"
            className="h-14 px-10 text-lg font-bold rounded-xl border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white"
          >
            רוצה להבין מה מתאים לך?
            <ArrowLeft className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}