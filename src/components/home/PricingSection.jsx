import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, ArrowLeft } from 'lucide-react';

const plans = [
  {
    name: 'פתיחת תיק',
    price: '199',
    period: 'חד פעמי',
    description: 'פתיחת עוסק פטור מלאה',
    features: [
      'פתיחת תיק במס הכנסה',
      'רישום במע"מ כפטור',
      'פתיחת תיק בביטוח לאומי',
      'הדרכה ראשונית',
      'תמיכה טלפונית'
    ],
    highlighted: false
  },
  {
    name: 'ליווי חודשי',
    price: '149',
    period: 'לחודש',
    description: 'ליווי שוטף לאורך כל הדרך',
    features: [
      'הנפקת חשבוניות/קבלות',
      'דיווחים שוטפים',
      'אפליקציה לניהול',
      'רו"ח/יועץ מס זמין',
      'ייעוץ מס שוטף',
      'סגירת תיק בעת הצורך'
    ],
    highlighted: true,
    badge: 'הכי פופולרי'
  },
  {
    name: 'דוח שנתי',
    price: '500',
    period: 'לשנה',
    description: 'הגשת דוח שנתי למס הכנסה',
    features: [
      'ריכוז הכנסות והוצאות',
      'הכנת טופס 1301',
      'הגשה למס הכנסה',
      'מענה לפניות הרשויות',
      'ייעוץ להפחתת מס'
    ],
    highlighted: false
  }
];

export default function PricingSection() {
  return (
    <section className="py-20 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-sm font-medium mb-4">
            💰 מחירון שקוף
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">
            מחירים ללא הפתעות
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            מחירים שקופים וברורים - בלי עמלות נסתרות
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plan.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {plan.badge}
                </div>
              )}
              <div className={`h-full rounded-3xl p-8 transition-all ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] text-white shadow-2xl' 
                  : 'bg-white shadow-elegant hover:shadow-elegant-hover'
              }`}>
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-[#1E3A5F]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/70' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className={`text-5xl font-black ${plan.highlighted ? 'text-white' : 'text-[#1E3A5F]'}`}>
                    {plan.price}₪
                  </span>
                  <span className={`text-sm mr-1 ${plan.highlighted ? 'text-white/70' : 'text-gray-500'}`}>
                    +מע"מ / {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                        plan.highlighted ? 'text-[#D4AF37]' : 'text-[#27AE60]'
                      }`} />
                      <span className={plan.highlighted ? 'text-white/90' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to={createPageUrl('Contact')}>
                  <Button 
                    className={`w-full h-12 rounded-xl font-bold ${
                      plan.highlighted 
                        ? 'bg-[#D4AF37] hover:bg-[#c9a432] text-[#1E3A5F]' 
                        : 'bg-[#1E3A5F] hover:bg-[#2C5282] text-white'
                    }`}
                  >
                    התחל עכשיו
                    <ArrowLeft className="mr-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}