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
        <h2 className="text-3xl font-black text-[#1E3A5F] mb-2">
          בחר מסלול
        </h2>
      </motion.div>

      <div className="space-y-3">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
              plan.recommended
                ? 'border-[#27AE60] bg-green-50'
                : 'border-gray-200'
            }`}
            onClick={() => onSelectPlan(plan)}
          >
            {plan.recommended && (
              <div className="inline-block bg-[#27AE60] text-white px-2 py-0.5 rounded-full text-xs font-bold mb-2">
                ⭐ מומלץ
              </div>
            )}

            <div className="mb-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black text-[#27AE60]">
                  ₪{plan.price}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F]">
                {plan.name}
              </h3>
            </div>

            <Button
              onClick={() => onSelectPlan(plan)}
              className={`w-full h-10 text-sm font-bold rounded-lg transition-all ${
                plan.recommended
                  ? 'bg-[#27AE60] hover:bg-[#229954] text-white'
                  : 'bg-[#3498DB] hover:bg-[#2980B9] text-white'
              }`}
            >
              בחר
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={onBack}
          className="text-sm text-[#3498DB] hover:text-[#2980B9] font-medium transition-colors"
        >
          ← חזור
        </button>
      </motion.div>
    </div>
  );
}