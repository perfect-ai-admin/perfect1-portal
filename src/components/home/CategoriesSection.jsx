import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const categories = [
  {
    id: 'patur',
    title: 'עוסק פטור',
    description: 'פתיחת עוסק פטור',
    details: 'מידע, עלויות, פתיחה אונליין והשלבים הראשונים לעצמאים בתחילת הדרך.',
    cta: 'מידע ופתיחה לעוסק פטור',
    href: createPageUrl('OsekPaturLanding'),
    color: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    accentColor: 'text-[#3498DB]'
  },
  {
    id: 'murash',
    title: 'עוסק מורשה',
    description: 'עוסק מורשה – פתיחה ומעבר מפטור',
    details: 'מתי צריך לעבור למורשה, חובות מע״מ וליווי מקצועי.',
    cta: 'בדיקה אם אני צריך להיות מורשה',
    href: '#coming-soon',
    color: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    accentColor: 'text-[#9B59B6]'
  },
  {
    id: 'company',
    title: 'חברה בע״מ',
    description: 'פתיחת חברה בע״מ בישראל',
    details: 'הקמת חברה, תהליך פתיחה, עלויות וליווי שוטף לעסקים מתקדמים.',
    cta: 'מידע על פתיחת חברה בע״מ',
    href: '#coming-soon',
    color: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    accentColor: 'text-[#27AE60]'
  }
];

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-white" id="categories-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-[#1E3A5F] mb-4">
            איך אתה מתכנן לפתוח את העסק שלך?
          </h2>
          <p className="text-xl text-gray-600">
            בחר את סוג העסק המתאים לך וקבל מידע ברור
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-8 border-2 ${category.borderColor} h-full shadow-lg hover:shadow-xl transition-all`}>
                <h3 className={`text-3xl font-black ${category.accentColor} mb-2`}>
                  {category.title}
                </h3>
                
                <p className="text-lg font-bold text-[#1E3A5F] mb-4">
                  {category.description}
                </p>

                <p className="text-gray-700 mb-8 leading-relaxed text-base">
                  {category.details}
                </p>

                {category.href !== '#coming-soon' ? (
                  <Link to={category.href}>
                    <Button className="w-full h-12 text-lg font-bold rounded-xl bg-[#1E3A5F] hover:bg-[#2C5282] text-white">
                      {category.cta}
                      <ArrowLeft className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full h-12 text-lg font-bold rounded-xl bg-gray-300 text-gray-600 cursor-not-allowed">
                    {category.cta}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}