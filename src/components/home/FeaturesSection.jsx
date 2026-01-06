import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CreditCard, Smartphone, Users } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'פתיחה מהירה',
    description: 'תוך 24-72 שעות התיק שלך פתוח ומוכן',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50'
  },
  {
    icon: CreditCard,
    title: 'מחיר שקוף',
    description: 'ללא עמלות נסתרות, הכל ברור מראש',
    color: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-50'
  },
  {
    icon: Smartphone,
    title: 'אפליקציה לניהול',
    description: 'נהל הכנסות והוצאות מכל מקום',
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50'
  },
  {
    icon: Users,
    title: 'ליווי אישי',
    description: 'רו"ח ויועץ מס זמינים לכל שאלה',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-3">
            למה לבחור בנו?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            מעל 2,000 עוסקים פטורים מצטרפים אלינו מדי שנה
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-full border border-gray-100">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-black text-[#1E3A5F] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}