import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Zap, Eye } from 'lucide-react';

export default function TrustSection() {
  const trustPoints = [
    { icon: CheckCircle, text: 'מידע מותאם לישראל' },
    { icon: Lock, text: 'תהליכים דיגיטליים מסודרים' },
    { icon: Zap, text: 'ללא התחייבות מוקדמת' },
    { icon: Eye, text: 'שקיפות מלאה' }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Trust Bullets */}
        <div className="grid md:grid-cols-4 gap-6">
          {trustPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-md border border-gray-100"
              >
                <Icon className="w-6 h-6 text-[#1E3A5F] flex-shrink-0" />
                <span className="font-bold text-gray-700">{item.text}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}