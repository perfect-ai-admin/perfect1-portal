import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Zap, Eye } from 'lucide-react';

export default function TrustSection() {
  const trustPoints = [
    { icon: CheckCircle, text: 'מידע מותאם לישראל', detail: 'כל המידע עדכני ומתאים לחוקים הישראליים' },
    { icon: Lock, text: 'תהליכים דיגיטליים מסודרים', detail: 'הכל מעובד בצורה פשוטה וברורה' },
    { icon: Zap, text: 'ללא התחייבות מוקדמת', detail: 'בחר בעצמך איזה מסלול מתאים לך' },
    { icon: Eye, text: 'שקיפות מלאה', detail: 'כל המחירים והתנאים ברורים מהתחילה' }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F]/5 via-transparent to-[#27AE60]/5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-[#1E3A5F] mb-6">
            ידע מקצועי, תהליכים מסודרים וליווי מול רשויות המס
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            האתר מרכז מידע ושירותים לעצמאים ולעסקים בישראל – משלב פתיחת התיק ועד התנהלות שוטפת מול מס הכנסה, מע״מ וביטוח לאומי, בצורה ברורה, אחראית ומקצועית.
          </p>
        </motion.div>

        {/* Trust Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl border-2 border-gray-100 hover:border-[#1E3A5F]/30 transition-all group"
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-xl font-black text-[#1E3A5F] mb-3">
                  {item.text}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.detail}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}