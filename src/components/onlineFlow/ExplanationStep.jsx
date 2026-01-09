import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function ExplanationStep({ onNext }) {
  return (
    <div className="space-y-3 py-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-black text-[#1E3A5F]">
          100% דיגיטלי
        </h2>
      </motion.div>

      {/* Key Points - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        {[
          { emoji: '✓', text: 'תהליך מקוון מלא' },
          { emoji: '⏱', text: 'עד 48 שעות' },
          { emoji: '🔒', text: 'מאובטח לחלוטין' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="flex items-center gap-3 p-2"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="font-bold text-gray-800">{item.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="pt-2"
      >
        <Button
          onClick={onNext}
          className="w-full h-12 font-bold rounded-lg bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg"
        >
          בחר מסלול
        </Button>
      </motion.div>
    </div>
  );
}