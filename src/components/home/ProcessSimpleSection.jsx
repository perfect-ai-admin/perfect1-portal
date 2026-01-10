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
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6">
            כך מתחילים בצורה נכונה
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-6 text-white text-center min-w-[200px]"
              >
                <div className="w-16 h-16 rounded-full bg-[#27AE60] text-white font-black text-2xl flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-white/80 text-sm">{step.description}</p>
              </motion.div>

              {index < steps.length - 1 && (
                <ArrowRight className="w-6 h-6 text-[#27AE60] hidden md:block" />
              )}
            </React.Fragment>
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
            className="bg-[#1E3A5F] hover:bg-[#2C5282] text-white px-12 py-6 text-lg font-bold rounded-xl"
          >
            רוצה להבין מה מתאים לך?
          </Button>
        </motion.div>
      </div>
    </section>
  );
}