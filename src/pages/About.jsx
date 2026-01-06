import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import { CheckCircle, Users, Award, Clock, ArrowLeft, Target, Heart, Shield } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'מקצועיות',
    description: 'צוות מקצועי של רואי חשבון ויועצי מס עם ניסיון רב'
  },
  {
    icon: Heart,
    title: 'שירות אישי',
    description: 'ליווי צמוד ואישי לכל לקוח, כאילו אתה הלקוח היחיד שלנו'
  },
  {
    icon: Shield,
    title: 'אמינות',
    description: 'שקיפות מלאה במחירים ובתהליכים, בלי הפתעות'
  }
];

const stats = [
  { number: '2,000+', label: 'עוסקים פטורים בשנה' },
  { number: '98%', label: 'שביעות רצון' },
  { number: '24h', label: 'זמן תגובה מקסימלי' },
  { number: '10+', label: 'שנות ניסיון' }
];

export default function About() {
  return (
    <>
      <SEOOptimized 
        {...seoPresets.about}
        canonical="https://perfect1.co.il/about"
      />
      <main className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-white/90 text-sm font-medium">המרכז הארצי לעוסקים פטורים</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              פרפקט וואן - הבית לעצמאים
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              אנחנו מאמינים שכל אחד יכול להיות עצמאי מצליח. 
              המשימה שלנו היא להפוך את התהליך לפשוט, נגיש ומשתלם.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white -mt-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-elegant text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-1">{stat.number}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-6">
                הסיפור שלנו
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  פרפקט וואן נוסדה מתוך הבנה עמוקה שפתיחת עסק לא צריכה להיות מסובכת. 
                  ראינו אנשים מוכשרים שמפחדים לקחת את הצעד הראשון בגלל הבירוקרטיה והחששות מהרשויות.
                </p>
                <p>
                  החלטנו לשנות את זה. יצרנו שירות שמלווה עצמאים מהרגע הראשון - 
                  מפתיחת התיק ועד ניהול העסק השוטף. הכל במחיר הוגן ושקוף.
                </p>
                <p>
                  היום אנחנו גאים לומר שעזרנו לאלפי עצמאים לפתוח עסק ולהגשים את החלום שלהם.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">למה אנחנו?</h3>
                <ul className="space-y-4">
                  {[
                    'פותחים כ-2,000 עוסקים פטורים בשנה',
                    'צוות מקצועי ומנוסה',
                    'מחירים שקופים ללא הפתעות',
                    'ליווי אישי מא\' ועד ת\'',
                    'אפליקציה מתקדמת לניהול העסק',
                    'זמינות גבוהה לשאלות'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#D4AF37] rounded-2xl flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">
              הערכים שלנו
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              הערכים האלה מנחים אותנו בכל יום ובכל אינטראקציה עם לקוחותינו
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center mb-6">
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              מוכנים להתחיל?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              הצטרפו לאלפי העצמאים שכבר בחרו בנו
            </p>
            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg font-bold rounded-full bg-[#D4AF37] hover:bg-[#c9a432] text-[#1E3A5F]"
              >
                לפתיחת עוסק פטור עכשיו
                <ArrowLeft className="mr-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}