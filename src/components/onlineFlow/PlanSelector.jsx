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
    name: 'פתיחה דיגיטלית + בדיקה',
    price: '299',
    badge: 'מומלץ לרוב העצמאים',
    recommended: true,
    description: 'פתיחה אונליין עם בדיקה והתאמה',
    features: [
      'כל התכנים של הבסיסי',
      'בדיקה מפורטת של הפרטים',
      'התאמה למוסד הבנקאי',
      'ליווי ראשוני בתהליך',
      'תמיכה בוואטסאפ'
    ],
    notIncluded: []
  }
];

export default function PlanSelector({ onSelectPlan, onBack }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black text-[#1E3A5F] mb-1">
          בחר מסלול
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className={`border-2 rounded-2xl p-6 transition-all cursor-pointer ${
              plan.recommended
                ? 'border-[#27AE60] bg-gradient-to-br from-green-50 to-transparent'
                : 'border-gray-200 hover:border-[#3498DB]'
            }`}
            onClick={() => onSelectPlan(plan)}
          >
            {plan.recommended && (
              <div className="inline-block bg-[#27AE60] text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                ⭐ מומלץ
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-[#27AE60]">
                  ₪{plan.price}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F]">
                {plan.name}
              </h3>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.slice(0, 3).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => onSelectPlan(plan)}
              className={`w-full h-12 font-bold rounded-lg transition-all ${
                plan.recommended
                  ? 'bg-[#27AE60] hover:bg-[#229954] text-white'
                  : 'bg-[#3498DB] hover:bg-[#2980B9] text-white'
              }`}
            >
              בחר מסלול זה
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#3498DB] hover:text-[#2980B9] font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          חזור
        </button>
      </motion.div>
    </div>
  );
}