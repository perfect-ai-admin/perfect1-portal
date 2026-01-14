import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function LoadScreen({ focus, onSave }) {
  const [loadLevel, setLoadLevel] = useState(focus?.load_level || 'medium');
  const [reason, setReason] = useState(focus?.load_reason || '');

  const LOAD_COLORS = {
    low: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900', label: 'נמוך' },
    medium: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900', label: 'בינוני' },
    high: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-900', label: 'גבוה' }
  };

  const color = LOAD_COLORS[loadLevel];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-4xl font-bold text-gray-900">עומס נוכחי</h2>
        <p className="text-lg text-gray-600">איך אתה מרגיש?</p>
      </div>

      {/* Load Level Selector */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-800">אני מרגיש...</p>
        
        <div className="grid grid-cols-3 gap-3">
          {['low', 'medium', 'high'].map((level) => (
            <motion.button
              key={level}
              onClick={() => setLoadLevel(level)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-2xl p-6 border-2 transition-all ${
                loadLevel === level
                  ? `${LOAD_COLORS[level].bg} ${LOAD_COLORS[level].border} border-2`
                  : 'bg-white border-gray-200'
              }`}
            >
              <p className="text-3xl mb-2">
                {level === 'low' && '😌'}
                {level === 'medium' && '🤔'}
                {level === 'high' && '😰'}
              </p>
              <p className="font-semibold text-sm">
                {level === 'low' && 'בקרה'}
                {level === 'medium' && 'בסדר'}
                {level === 'high' && 'מוצף'}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Reason */}
      {loadLevel === 'high' && (
        <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200 space-y-4">
          <label>
            <p className="text-sm font-semibold text-red-900 mb-2">למה העומס גבוה?</p>
            <Textarea
              placeholder="למשל: יש יותר מדי משימות פתוחות / עבודה רביעית שלא כללתי"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-16"
            />
          </label>

          <div className="space-y-2">
            <p className="text-sm text-red-900 font-semibold">💡 אפשרויות:</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  onSave({
                    load_level: 'low',
                    load_reason: 'סילוק משימות'
                  });
                }}
              >
                🗑️ בואו נמחוק / נדחה משימות
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  onSave({
                    load_level: 'medium',
                    load_reason: 'פירוק משימות'
                  });
                }}
              >
                ✂️ בואו נפרק משימות
              </Button>
            </div>
          </div>
        </div>
      )}

      {loadLevel !== 'high' && (
        <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
          <p className="text-green-900">
            ✨ אתה בקרה. המשך ככה.
          </p>
        </div>
      )}

      <Button
        onClick={() =>
          onSave({
            load_level: loadLevel,
            load_reason: reason
          })
        }
        size="lg"
        className="w-full"
      >
        שמור עומס
      </Button>
    </motion.div>
  );
}