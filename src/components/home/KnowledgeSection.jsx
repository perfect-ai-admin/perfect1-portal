import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function KnowledgeSection() {
  const faqLinks = [
    {
      question: 'כמה עולה לפתוח עוסק פטור',
      link: 'PricingCost'
    },
    {
      question: 'מתי צריך לעבור מעוסק פטור למורשה',
      link: 'TransitionOsekPaturToMorsha'
    },
    {
      question: 'פתיחת חברה בע״מ – כמה זמן זה לוקח',
      link: 'Services'
    },
    {
      question: 'האם חייב רואה חשבון בתחילת הדרך',
      link: 'OsekPaturLanding'
    }
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
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-6 border border-gray-200 shadow-sm">
            <HelpCircle className="w-5 h-5 text-[#1E3A5F]" />
            <span className="font-bold text-[#1E3A5F]">שאלות נפוצות</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
            שאלות נפוצות לפני פתיחת עסק
          </h2>
        </motion.div>

        {/* FAQ Links Grid */}
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
          {faqLinks.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(item.link)}>
                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#1E3A5F] hover:shadow-lg transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowLeft className="w-4 h-4 text-[#1E3A5F] group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="font-bold text-[#1E3A5F] group-hover:text-[#27AE60] transition-colors">
                      {item.question}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA to Knowledge Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to={createPageUrl('Blog')}>
            <div className="inline-flex items-center gap-2 font-bold text-[#1E3A5F] hover:text-[#27AE60] transition-colors cursor-pointer">
              למרכז המידע
              <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}