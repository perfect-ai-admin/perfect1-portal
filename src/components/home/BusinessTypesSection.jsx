import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Users, ArrowLeft } from 'lucide-react';

export default function BusinessTypesSection() {
  const businessTypes = [
    {
      title: 'עוסק פטור',
      icon: Building2,
      description: 'פתיחת עוסק פטור',
      details: 'מידע, עלויות, פתיחה אונליין והשלבים הראשונים לעצמאים בתחילת הדרך.',
      cta: 'מידע ופתיחה לעוסק פטור',
      link: 'OsekPaturLanding',
      color: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      accentColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'עוסק מורשה',
      icon: TrendingUp,
      description: 'עוסק מורשה – פתיחה ומעבר מפטור',
      details: 'מתי צריך לעבור למורשה, חובות מע״מ וליווי מקצועי.',
      cta: 'בדיקה אם אני צריך להיות מורשה',
      link: 'Services',
      color: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      accentColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'חברה בע״מ',
      icon: Users,
      description: 'פתיחת חברה בע״מ בישראל',
      details: 'הקמת חברה, תהליך פתיחה, עלויות וליווי שוטף לעסקים מתקדמים.',
      cta: 'מידע על פתיחת חברה בע״מ',
      link: 'Services',
      color: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      accentColor: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <section className="py-16 bg-white" id="business-types">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
            איך אתה מתכנן לפתוח את העסק שלך?
          </h2>
        </motion.div>

        {/* Business Type Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {businessTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(type.link)}>
                  <div className={`bg-gradient-to-br ${type.color} rounded-3xl p-8 border-2 ${type.borderColor} hover:shadow-xl transition-all h-full hover:scale-105 cursor-pointer`}>
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${type.bgColor} flex items-center justify-center mb-6`}>
                      <Icon className={`w-8 h-8 ${type.accentColor}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">
                      {type.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-sm font-bold text-gray-600 mb-4">
                      {type.description}
                    </p>

                    {/* Description */}
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {type.details}
                    </p>

                    {/* CTA */}
                    <div className={`inline-flex items-center gap-2 font-bold ${type.accentColor} hover:gap-3 transition-all`}>
                      {type.cta}
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}