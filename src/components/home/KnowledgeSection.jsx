import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';

const questions = [
  {
    text: 'כמה עולה לפתוח עוסק פטור',
    href: createPageUrl('PricingLanding')
  },
  {
    text: 'מתי צריך לעבור מעוסק פטור למורשה',
    href: createPageUrl('Services')
  },
  {
    text: 'פתיחת חברה בע״מ – כמה זמן זה לוקח',
    href: createPageUrl('Services')
  },
  {
    text: 'האם חייב רואה חשבון בתחילת הדרך',
    href: createPageUrl('MasHaKnasaOsekPatur')
  }
];

export default function KnowledgeSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50" id="info-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
            שאלות נפוצות לפני פתיחת עסק
          </h2>
          <p className="text-lg text-gray-600">
            קישורים לתשובות ברורות על השאלות שכולם שואלים
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={question.href}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#27AE60] group block h-full"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-[#1E3A5F] group-hover:text-[#27AE60] transition-colors leading-relaxed">
                    {question.text}
                  </p>
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-[#27AE60] transition-colors flex-shrink-0 ml-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link 
            to={createPageUrl('Services')}
            className="inline-block text-lg font-bold text-[#27AE60] hover:text-[#229954] underline"
          >
            → למרכז המידע
          </Link>
        </div>
      </div>
    </section>
  );
}