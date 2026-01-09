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

export default function PlanSelector({ onSelectPlan, onBack, formData }) {
  const [selectedId, setSelectedId] = React.useState(null);

  const handleSelect = (plan) => {
    setSelectedId(plan.id);
  };

  const handleContinue = () => {
    if (selectedId) {
      const selected = plans.find(p => p.id === selectedId);
      onSelectPlan(selected);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-black text-[#1E3A5F] mb-0.5">
          בחרו את המסלול המתאים
        </h2>
        <p className="text-xs text-gray-600">שני אפשרויות • הבחר המתאים לך</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {plans.map((plan, idx) => {
          const isSelected = selectedId === plan.id;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleSelect(plan)}
              className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all ${
                isSelected
                  ? 'bg-[#27AE60]/10 border-[#27AE60] shadow-lg'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#27AE60] text-white px-3 py-0.5 rounded-full text-xs font-black shadow-lg">
                    מומלץ
                  </span>
                </div>
              )}

              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-2 left-2">
                  <div className="w-5 h-5 rounded-full bg-[#27AE60] flex items-center justify-center">
                    <span className="text-white font-black">✓</span>
                  </div>
                </div>
              )}

              <div className={plan.recommended ? 'pt-3' : ''}>
                {/* Price */}
                <div className="mb-2">
                  <span className="font-black text-3xl text-[#27AE60]">₪{plan.price}</span>
                  <span className="text-xs text-gray-500 mr-1">לפתיחה</span>
                </div>

                {/* Name */}
                <h3 className="font-bold text-sm text-[#1E3A5F] mb-1">
                  {plan.name}
                </h3>

                {/* Short Description */}
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {plan.description}
                </p>

                {/* Features */}
                <div className="space-y-1">
                  {plan.features.slice(0, 2).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="text-[#27AE60] font-bold">•</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-2 pt-2"
      >
        <Button
          onClick={handleContinue}
          disabled={!selectedId}
          className="w-full h-12 font-black text-base rounded-lg bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          המשך בתהליך
        </Button>
        <button
          onClick={onBack}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-xs text-gray-600 font-medium transition-colors"
        >
          ← חזור
        </button>
      </motion.div>
    </div>
  );
}