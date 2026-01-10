import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProcessSimpleSection() {
  const steps = [
    {
      number: '1',
      title: 'בוחרים סוג עסק',
      description: 'פטור, מורשה או חברה בע״מ'
    },
    {
      number: '2',
      title: 'מקבלים מידע ברור',
      description: 'הכל מותאם לצורכי העסק שלך'
    },
    {
      number: '3',
      title: 'ממשיכים לפתיחה או ליווי',
      description: 'בהתאם להצורך'
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
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
          <p className="text-lg text-gray-600">שלושה שלבים פשוטים לפתיחת העסק שלך</p>
        </motion.div>

        {/* Desktop - Horizontal */}
        <div className="hidden md:flex items-center justify-center gap-8 mb-12">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex-1 max-w-xs bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-3xl p-8 text-white text-center hover:shadow-xl transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-[#27AE60] text-white font-black text-3xl flex items-center justify-center mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-2xl font-black mb-3 text-white">{step.title}</h3>
                <p className="text-white text-base leading-relaxed font-semibold">{step.description}</p>
              </motion.div>

              {index < steps.length - 1 && (
                <ArrowRight className="w-8 h-8 text-[#27AE60] flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile - Stacked */}
        <div className="md:hidden space-y-4 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-6 text-white flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#27AE60] text-white font-black text-2xl flex items-center justify-center flex-shrink-0">
                {step.number}
              </div>
              <div className="text-right flex-1">
                <h3 className="text-lg font-black mb-1 text-white">{step.title}</h3>
                <p className="text-white text-base font-semibold">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            onClick={() => {
              const element = document.getElementById('business-types');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:shadow-lg text-white px-14 py-6 text-lg font-bold rounded-2xl w-full md:w-auto transition-all"
          >
            רוצה להבין מה מתאים לך?
          </Button>
        </motion.div>
      </div>
    </section>
  );
}