import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const WEEK_STRUCTURE = [
  {
    day: 'שני',
    blocks: [
      { type: 'sales', label: 'מכירות', desc: '3+ שיחות' },
      { type: 'work', label: 'עבודה אמיתית', desc: '4 שעות' }
    ]
  },
  {
    day: 'שלישי',
    blocks: [
      { type: 'sales', label: 'מכירות', desc: '2+ פנייות' },
      { type: 'work', label: 'עבודה אמיתית', desc: '4 שעות' }
    ]
  },
  {
    day: 'רביעי',
    blocks: [
      { type: 'followup', label: 'מעקבים', desc: 'עד חם' },
      { type: 'admin', label: 'ניהול', desc: '2 שעות' }
    ]
  },
  {
    day: 'חמישי',
    blocks: [
      { type: 'sales', label: 'מכירות', desc: '3+ שיחות' },
      { type: 'admin', label: 'ניהול', desc: '2 שעות' }
    ]
  }
];

const COLORS = {
  sales: 'bg-blue-100 text-blue-800 border-blue-300',
  work: 'bg-green-100 text-green-800 border-green-300',
  followup: 'bg-purple-100 text-purple-800 border-purple-300',
  admin: 'bg-gray-100 text-gray-800 border-gray-300'
};

export default function WeeklyStructureScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-4xl font-bold text-gray-900">השבוע שלי</h2>
        <p className="text-lg text-gray-600">מבט פשוט על מה שחשוב</p>
      </div>

      {/* Reminder */}
      <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
        <p className="text-amber-900">
          ✨ זה לא מושלם. זה עובד. כל שבוע זה קצת שונה.
        </p>
      </div>

      {/* Weekly Grid */}
      <div className="space-y-4">
        {WEEK_STRUCTURE.map((dayItem) => (
          <motion.div
            key={dayItem.day}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">יום {dayItem.day}</h3>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {dayItem.blocks.map((block, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-4 border-2 ${COLORS[block.type]}`}
                >
                  <p className="font-semibold">{block.label}</p>
                  <p className="text-sm opacity-75 mt-1">{block.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Flexibility Note */}
      <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
        <p className="text-blue-900 text-sm">
          📌 <strong>חשוב:</strong> אם משהו התרחש וצריך לשנות את היום - בסדר גמור. התוכנית היא מחוות, לא חוק.
        </p>
      </div>
    </motion.div>
  );
}