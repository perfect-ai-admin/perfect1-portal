import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import MentorHeader from './shared/MentorHeader';
import ActionChip from './shared/ActionChip';
import { Button } from '@/components/ui/button';

export default function Daily() {
  const [status, setStatus] = useState('pending');

  const dailyFocus = {
    title: 'שלח פולואפ ל-3 לידים ממתינים',
    estimatedTime: '15-20 דק',
    why: 'לא שלחת פולואפ בשבוע האחרון וזה הורס את אחוז הסגירה',
    action: 'בוא נתחיל'
  };

  const miniPlan = [
    {
      label: 'כסף',
      task: 'שלח הודעת פולואפ אחת',
      type: 'money'
    },
    {
      label: 'תפעול',
      task: 'בדוק את כל ההודעות שלך',
      type: 'ops'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <MentorHeader 
        title="יום יום"
        subtitle={new Date().toLocaleDateString('he-IL')}
        icon={Calendar}
      />

      {/* Daily Focus Card */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">{dailyFocus.title}</h2>
              <p className="text-xs text-gray-600 mt-1">{dailyFocus.estimatedTime}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">{dailyFocus.why}</p>

          {status === 'pending' ? (
            <ActionChip label={dailyFocus.action} variant="primary" />
          ) : (
            <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5" />
              סמן כבוצע
            </div>
          )}
        </motion.div>

        {/* Single Question */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <p className="text-xs text-gray-600 mb-2">שאלה למחשבה:</p>
          <p className="font-medium text-gray-900">מה הדבר היחיד שמכניס כסף השבוע?</p>
        </motion.div>

        {/* Mini Plan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {miniPlan.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-100 rounded-lg p-3"
            >
              <p className="text-xs text-gray-600 font-medium mb-1">{item.label}</p>
              <p className="text-sm text-gray-900">{item.task}</p>
            </div>
          ))}
        </motion.div>

        {/* Check-in */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4"
        >
          <p className="text-xs text-blue-700 font-medium mb-3">בסוף היום:</p>
          <div className="flex gap-2">
            <Button
              onClick={() => setStatus('done')}
              variant={status === 'done' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7"
            >
              בוצע
            </Button>
            <Button
              onClick={() => setStatus('partial')}
              variant={status === 'partial' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7"
            >
              חלקי
            </Button>
            <Button
              onClick={() => setStatus('skipped')}
              variant={status === 'skipped' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7"
            >
              דילגתי
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}