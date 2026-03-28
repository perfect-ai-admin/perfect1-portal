import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, Star } from 'lucide-react';

import { getSignupUrl } from '@/components/utils/tracking';

const plans = [
  {
    name: 'חינם',
    price: '₪0',
    period: '/לתמיד',
    description: 'להתנסות ולהכיר את המערכת',
    features: [
      'יעד אחד פעיל',
      'כלי מיתוג בסיסיים',
      'דוחות מוגבלים',
    ],
    popular: false,
    color: 'gray',
  },
  {
    name: 'בסיס',
    price: 'בקרוב',
    period: '',
    description: 'לעסק בתחילת הדרך',
    features: [
      'עד 3 יעדים פעילים',
      'כל כלי המיתוג',
      'קמפיינים בסיסיים',
      'תמיכה במייל',
    ],
    popular: false,
    color: 'violet',
  },
  {
    name: 'צמיחה',
    price: 'בקרוב',
    period: '',
    description: 'לעסק בצמיחה',
    features: [
      'יעדים ללא הגבלה',
      'כל כלי השיווק',
      'מודול פיננסי מלא',
      'תמיכה בצ\'אט',
      'דוחות מתקדמים',
    ],
    popular: true,
    color: 'emerald',
  },
  {
    name: 'פרימיום',
    price: 'בקרוב',
    period: '',
    description: 'לעסק שרוצה הכל',
    features: [
      'כל הפיצ\'רים ללא הגבלה',
      'תמיכה טלפונית',
      'הדרכה אישית',
      'התאמות מיוחדות',
      'עדיפות בתמיכה',
    ],
    popular: false,
    color: 'blue',
  },
];

const colorClasses = {
  gray: {
    bg: 'bg-white',
    border: 'border-gray-200',
    badge: 'hidden',
    button: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  },
  violet: {
    bg: 'bg-white',
    border: 'border-gray-200',
    badge: 'hidden',
    button: 'bg-violet-600 hover:bg-violet-700 text-white',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  blue: {
    bg: 'bg-white',
    border: 'border-gray-200',
    badge: 'hidden',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export default function PricingPreview() {
  const SIGNUP_URL = getSignupUrl();
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            בחר חבילה שמתאימה לך
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            התחל בחינם ושדרג כשהעסק גדל
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const colors = colorClasses[plan.color];
            return (
              <div
                key={index}
                className={`${colors.bg} border ${colors.border} rounded-2xl p-6 relative transition-all hover:shadow-lg ${plan.popular ? 'ring-2 ring-emerald-500' : ''}`}
              >
                {plan.popular && (
                  <div className={`absolute -top-3 right-4 ${colors.badge} text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
                    <Star className="w-3 h-3" />
                    פופולרי
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                
                <p className="text-gray-500 text-sm mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a href={SIGNUP_URL}>
                  <Button className={`w-full ${colors.button} rounded-xl h-11`}>
                    התחל עם החבילה
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}