import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'פתיחה דיגיטלית בסיסית',
    price: '199',
    badge: 'מתאים לעצמאיים פשוטים',
    description: 'פתיחה אונליין בלי ליווי נוסף',
    features: [
      'תהליך דיגיטלי מלא',
      'חתימה דיגיטלית',
      'פתיחת תיק במס הכנסה',
      'רישום במע"מ כפטור',
      'רישום בביטוח לאומי'
    ],
    notIncluded: [
      'ליווי חודשי',
      'אפליקציה לניהול'
    ]
  },
  {
    id: 'premium',
    name: 'פתיחה + ליווי מלא',
    price: '299',
    badge: '👑 המומלץ ביותר',
    recommended: true,
    description: 'פתיחה אונליין עם ליווי מלא ותמיכה',
    features: [
      'ליווי מול רשויות המס',
      'מחשבון תכנון מס',
      'מענה לשאלות מקצועיות',
      'תמיכה בוואטסאפ',
      'התאמה למוסד הבנקאי'
    ],
    notIncluded: []
  }
];

export default function PlanSelector({ onSelectPlan, onBack, formData }) {
  const handleSelectPlan = (plan) => {
    onSelectPlan(plan);
  };

  return (
    <div className="space-y-2 py-1">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-black text-[#1E3A5F] mb-0.5">
          בחרו את המסלול המתאים
        </h2>
        <p className="text-xs text-gray-600">שני אפשרויות • בחרו המתאים לכם</p>
      </motion.div>

      <div className="space-y-2">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            onClick={() => handleSelectPlan(plan)}
            className={`relative cursor-pointer rounded-xl p-3 border-2 transition-all transform hover:scale-105 ${
              plan.recommended
                ? 'bg-gradient-to-br from-[#27AE60]/5 to-[#2ECC71]/5 border-[#27AE60] shadow-lg'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {/* Recommended Badge with Crown */}
            {plan.recommended && (
              <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] text-white px-3 py-0.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
                  👑 {plan.badge}
                </span>
              </div>
            )}

            <div className={plan.recommended ? 'pt-2' : ''}>
              {/* Price */}
              <div className="mb-1.5">
                <span className={`font-black text-2xl ${plan.recommended ? 'text-[#27AE60]' : 'text-gray-800'}`}>₪{plan.price}</span>
                <span className={`font-bold mr-1 ${plan.recommended ? 'text-[#27AE60] text-xs' : 'text-xs text-gray-500'}`}>תשלום חד פעמי!</span>
              </div>

              {/* Name */}
              <h3 className={`font-bold text-xs mb-0.5 ${plan.recommended ? 'text-[#27AE60]' : 'text-[#1E3A5F]'}`}>
                {plan.name}
              </h3>

              {/* Short Description */}
              <p className="text-xs text-gray-600 mb-2 leading-tight">
                {plan.description}
              </p>

              {/* Features */}
              <div className="space-y-0.5">
                {plan.features.slice(0, 3).map((feature, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <span className={plan.recommended ? 'text-[#27AE60]' : 'text-gray-400'}>✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="pt-1"
      >
        <button
          onClick={onBack}
          className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-xs text-gray-600 font-medium transition-colors"
        >
          ← חזור
        </button>
      </motion.div>
    </div>
  );
}