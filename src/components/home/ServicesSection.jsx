import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Building2, Shield, Receipt, LineChart, Smartphone, UserCheck } from 'lucide-react';

const services = [
  { icon: FileText, text: 'פתיחת תיק במס הכנסה' },
  { icon: Building2, text: 'רישום במע"מ כפטור' },
  { icon: Shield, text: 'פתיחת תיק בביטוח לאומי' },
  { icon: Receipt, text: 'הנפקת חשבוניות/קבלות' },
  { icon: LineChart, text: 'ליווי שוטף ודיווחים' },
  { icon: Smartphone, text: 'אפליקציה לניהול העסק' },
  { icon: UserCheck, text: 'רו"ח/יועץ מס זמין' },
  { icon: CheckCircle, text: 'סגירת תיק בעת הצורך' }
];

export default function ServicesSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[#E8F4FD] text-[#1E3A5F] px-4 py-2 rounded-full text-sm font-medium mb-4">
            ✨ הכל כלול
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">
            מה כולל השירות שלנו?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            שירות מקיף שמלווה אותך מהרגע הראשון ולאורך כל הדרך
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <div className="bg-gradient-to-br from-[#E8F4FD] to-white rounded-2xl p-6 border border-[#1E3A5F]/10 hover:border-[#1E3A5F]/30 transition-all h-full flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl bg-[#1E3A5F] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <p className="font-medium text-gray-800">{service.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}