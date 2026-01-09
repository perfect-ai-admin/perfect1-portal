import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function ExplanationStep({ onNext }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black text-[#1E3A5F] mb-2">
          100% דיגיטלי
        </h2>
        <p className="text-xl text-gray-600">
          בלי לצאת מהבית • בלי פגישות • בלי דיווחים
        </p>
      </motion.div>

      {/* Key Points - Minimal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {[
          { emoji: '✓', text: 'תהליך מקוון מלא' },
          { emoji: '⏱', text: 'עד 48 שעות' },
          { emoji: '🔒', text: 'מאובטח לחלוטין' },
          { emoji: '🛡', text: 'אחריות מלאה' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <span className="text-3xl">{item.emoji}</span>
            <span className="text-lg font-bold text-gray-800">{item.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Small disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-gray-500 text-center"
      >
        משך הטיפול עשוי להשתנות בהתאם לאישורי הרשויות
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onNext}
          className="w-full h-14 text-lg font-bold rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg"
        >
          בחר מסלול
        </Button>
      </motion.div>
    </div>
  );
}