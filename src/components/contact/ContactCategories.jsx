import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function ContactCategories() {
  const categories = [
    {
      title: 'כמה עולה לפתוח עוסק פטור?',
      icon: '💰',
      link: createPageUrl('Pricing')
    },
    {
      title: 'חשבונית לעוסק פטור',
      icon: '⚠️',
      link: createPageUrl('UrgentInvoice')
    },
    {
      title: 'הפרש בין עוסק פטור למורשה',
      icon: '⚖️',
      link: createPageUrl('OsekPaturVsMorasha')
    },
    {
      title: 'עוסק פטור או מורשה?',
      icon: '🤔',
      link: createPageUrl('OsekPaturLanding')
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {categories.map((category, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
        >
          <Link to={category.link}>
            <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all h-full border border-gray-100 group cursor-pointer">
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="font-bold text-gray-800 text-sm group-hover:text-[#1E3A5F] transition-colors line-clamp-3">
                {category.title}
              </h3>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}