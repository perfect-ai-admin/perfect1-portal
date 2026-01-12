import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function BusinessTypesSection() {
  const businessTypes = [
    {
      title: 'עוסק פטור',
      icon: Building2,
      description: 'פתיחת עוסק פטור',
      details: 'מידע, עלויות, פתיחה אונליין והשלבים הראשונים לעצמאים בתחילת הדרך.',
      cta: 'מידע ופתיחה לעוסק פטור',
      link: 'OsekPaturLanding',
      bgGradient: 'from-blue-600 to-cyan-600',
      lightBg: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-400',
      accentColor: 'bg-blue-600',
      lightAccent: 'bg-blue-100'
    },
    {
      title: 'עוסק מורשה',
      icon: TrendingUp,
      description: 'עוסק מורשה – פתיחה ומעבר מפטור',
      details: 'מתי צריך לעבור למורשה, חובות מע״מ וליווי מקצועי.',
      cta: 'בדיקה אם אני צריך להיות מורשה',
      link: 'OsekMorshaLanding',
      bgGradient: 'from-green-600 to-emerald-600',
      lightBg: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-400',
      accentColor: 'bg-green-600',
      lightAccent: 'bg-green-100'
    },
    {
      title: 'חברה בע״מ',
      icon: Users,
      description: 'פתיחת חברה בע״מ בישראל',
      details: 'הקמת חברה, תהליך פתיחה, עלויות וליווי שוטף לעסקים מתקדמים.',
      cta: 'מידע על פתיחת חברה בע״מ',
      link: 'CompanyLanding',
      bgGradient: 'from-purple-600 to-pink-600',
      lightBg: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-400',
      accentColor: 'bg-purple-600',
      lightAccent: 'bg-purple-100'
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-white" id="business-types">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Section Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12 md:mb-16"
         >
          <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-3 md:mb-4">
             איך אתה מתכנן לפתוח את העסק שלך?
           </h2>
           <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">בחר את סוג העסק שמתאים לך וקבל מידע ברור</p>
        </motion.div>

        {/* Business Type Cards - Premium Design */}
        <div className="grid md:grid-cols-3 gap-6">
           {businessTypes.map((type, index) => {
             const Icon = type.icon;
             return (
               <motion.div
                 key={index}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.15 }}
                 whileHover={{ y: -10 }}
               >
                 <Link to={createPageUrl(type.link)} className="group block h-full">
                   <div className="relative h-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200">
                     {/* Top Gradient Bar */}
                     <div className={`h-2 bg-gradient-to-r ${type.bgGradient}`}></div>

                     {/* Card Content */}
                     <div className="p-6 md:p-8">
                       {/* Icon */}
                       <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${type.lightAccent} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
                         <Icon className={`w-8 h-8 md:w-10 md:h-10 text-[${type.accentColor}]`} style={{ color: type.accentColor === 'bg-blue-600' ? '#2563eb' : type.accentColor === 'bg-green-600' ? '#16a34a' : '#9333ea' }} />
                       </div>

                       {/* Title */}
                       <h3 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-2 md:mb-3">
                         {type.title}
                       </h3>

                       {/* Subtitle */}
                       <p className="text-xs md:text-sm font-bold text-gray-500 mb-4 md:mb-6 uppercase tracking-wide">
                         {type.description}
                       </p>

                       {/* Description */}
                       <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 leading-relaxed">
                         {type.details}
                       </p>

                       {/* CTA - Interactive */}
                       <div className="inline-flex items-center gap-2 md:gap-3 font-black text-sm md:text-base group-hover:gap-4 md:group-hover:gap-5 transition-all" style={{ color: type.accentColor === 'bg-blue-600' ? '#2563eb' : type.accentColor === 'bg-green-600' ? '#16a34a' : '#9333ea' }}>
                         {type.cta}
                         <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                       </div>
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