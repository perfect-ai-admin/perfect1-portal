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
        <h2 className="text-3xl font-black text-[#1E3A5F] mb-1">
          איזה מסלול מתאים לך?
        </h2>
        <p className="text-sm text-gray-600">בחר מה בדיוק אתה צריך - לא יותר, לא פחות</p>
      </motion.div>

      <div className="space-y-3 pt-2">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            onClick={() => onSelectPlan(plan)}
            className={`relative border-2 rounded-xl p-4 transition-all cursor-pointer ${
              plan.recommended
                ? 'border-[#27AE60] bg-gradient-to-br from-green-50 to-emerald-50 ring-2 ring-[#27AE60]/10'
                : 'border-gray-200 hover:border-[#3498DB] bg-white'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-[#27AE60] text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                  ⭐ הבחירה הפופולרית
                </div>
              </div>
            )}

            <div className="mb-4 pt-2">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-[#27AE60]">
                  ₪{plan.price}
                </span>
                <span className="text-xs text-gray-500">לפתיחה</span>
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F]">
                {plan.name}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
            </div>

            {/* Features Mini */}
            <div className="mb-4 space-y-1">
              {plan.features.slice(0, 3).map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-[#27AE60] font-bold">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => onSelectPlan(plan)}
              className={`w-full h-11 text-sm font-bold rounded-lg transition-all ${
                plan.recommended
                  ? 'bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg'
                  : 'bg-[#3498DB] hover:bg-[#2980B9] text-white'
              }`}
            >
              {plan.recommended ? '🚀 בחר מסלול זה' : 'בחר'}
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