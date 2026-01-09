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
        <h2 className="text-2xl font-black text-[#1E3A5F] mb-0.5">
          <span className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] bg-clip-text text-transparent">המשך בתהליך</span>
        </h2>
        <p className="text-xs text-gray-600">בחר את המסלול המתאים לך</p>
      </motion.div>

      <div className="space-y-2.5 pt-2">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            onClick={() => onSelectPlan(plan)}
            className={`relative transition-all cursor-pointer ${
              plan.recommended
                ? 'border-0 rounded-2xl p-5 bg-gradient-to-br from-[#27AE60] via-green-500 to-[#2ECC71] shadow-xl scale-100'
                : 'border-2 border-gray-200 rounded-xl p-4 bg-white hover:border-[#3498DB]/50'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-white text-[#27AE60] px-4 py-1 rounded-full text-xs font-black shadow-lg border-2 border-[#27AE60]">
                  ⭐⭐⭐ הבחירה המושלמת ⭐⭐⭐
                </div>
              </div>
            )}

            <div className={`${plan.recommended ? 'pt-4' : ''}`}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`font-black ${
                  plan.recommended ? 'text-5xl text-white' : 'text-4xl text-[#27AE60]'
                }`}>
                  ₪{plan.price}
                </span>
                <span className={`text-xs ${
                  plan.recommended ? 'text-white/90' : 'text-gray-500'
                }`}>לפתיחה</span>
              </div>
              <h3 className={`font-bold mb-1 ${
                plan.recommended ? 'text-2xl text-white' : 'text-xl text-[#1E3A5F]'
              }`}>
                {plan.name}
              </h3>
              <p className={`text-xs mb-3 ${
                plan.recommended ? 'text-white/90' : 'text-gray-600'
              }`}>{plan.description}</p>
            </div>

            {/* Features Mini */}
            <div className={`mb-4 space-y-1.5 ${plan.recommended ? 'bg-white/15 rounded-lg p-3' : ''}`}>
              {plan.features.slice(0, 3).map((feature, i) => (
                <div key={i} className={`flex items-start gap-2 text-xs ${
                  plan.recommended ? 'text-white' : 'text-gray-700'
                }`}>
                  <span className={`font-bold flex-shrink-0 ${
                    plan.recommended ? 'text-white' : 'text-[#27AE60]'
                  }`}>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => onSelectPlan(plan)}
              className={`w-full rounded-xl font-black transition-all ${
                plan.recommended
                  ? 'h-14 bg-white text-[#27AE60] hover:bg-white/95 text-lg shadow-lg'
                  : 'h-11 bg-[#3498DB] hover:bg-[#2980B9] text-white text-sm'
              }`}
            >
              {plan.recommended ? '🎯 בחר כרגע' : 'בחר'}
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