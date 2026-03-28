import React from 'react';
import { Shield, Users, Clock, HeadphonesIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: 'ליווי מקצועי',
    description: 'צוות מומחים עם ניסיון של שנים בהקמת עסקים בישראל',
  },
  {
    icon: Users,
    title: 'הסברים פשוטים',
    description: 'מסבירים בשפה פשוטה, בלי ז׳רגון משפטי מיותר',
  },
  {
    icon: Clock,
    title: 'פתרון מהיר',
    description: 'תהליכים יעילים שחוסכים לך זמן ומאפשרים להתחיל מהר',
  },
  {
    icon: HeadphonesIcon,
    title: 'שירות מותאם אישית',
    description: 'כל עסק שונה — אנחנו מתאימים את הפתרון בדיוק אליך',
  },
];

export default function TrustSection({ items = TRUST_ITEMS }) {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="portal-h2 text-center mb-3">למה לבחור בנו?</h2>
        <p className="text-center text-gray-500 text-lg mb-12 max-w-2xl mx-auto">
          אנחנו לא עוד אתר מידע. אנחנו גוף מקצועי שמלווה אותך מהרגע הראשון
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 sm:p-6 rounded-2xl bg-portal-bg hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 bg-portal-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-portal-teal" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-portal-navy mb-1 sm:mb-2">{item.title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
