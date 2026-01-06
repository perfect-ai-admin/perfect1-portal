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
    <section className="py-20 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">
            למה לבחור בנו?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            אלפי עצמאים כבר בחרו בנו לליווי העסק שלהם
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-elegant hover:shadow-elegant-hover transition-all duration-300 h-full">
                <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 bg-gradient-to-br ${feature.color} bg-clip-text`} style={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                  <feature.icon className={`w-8 h-8 text-[#1E3A5F]`} />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}