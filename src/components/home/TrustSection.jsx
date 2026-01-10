import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lightbulb, Lock, Zap } from 'lucide-react';

const trustItems = [
  {
    icon: Lightbulb,
    text: 'מידע מותאם לישראל'
  },
  {
    icon: Zap,
    text: 'תהליכים דיגיטליים מסודרים'
  },
  {
    icon: CheckCircle,
    text: 'ללא התחייבות מוקדמת'
  },
  {
    icon: Lock,
    text: 'שקיפות מלאה'
  }
];

export default function TrustSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
            ידע מקצועי, תהליכים מסודרים וליווי מול רשויות המס
          </h2>
          
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            האתר מרכז מידע ושירותים לעצמאים ולעסקים בישראל – משלב פתיחת התיק ועד התנהלות שוטפת מול מס הכנסה, מע״מ וביטוח לאומי, בצורה ברורה, אחראית ומקצועית.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {trustItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-[#1E3A5F]" />
              </div>
              <p className="font-bold text-[#1E3A5F]">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}