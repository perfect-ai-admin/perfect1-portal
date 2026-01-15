import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SecondaryGoals({ goals, onStatusChange, onEdit }) {
  if (!goals || goals.length === 0) return null;

  const statusIcons = {
    active: <Circle className="w-4 h-4 text-gray-400" />,
    achieved: <CheckCircle2 className="w-4 h-4 text-green-600" />,
    stuck: <AlertCircle className="w-4 h-4 text-orange-600" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-2"
    >
      <p className="text-sm font-semibold text-gray-600 px-1">מטרות משניות</p>
      <div className="space-y-2">
        {goals.map(goal => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg border border-gray-100 p-3 hover:border-gray-200 transition-colors flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={() => onStatusChange(goal.id)}
                className="mt-0.5 flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                {statusIcons[goal.status]}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  goal.status === 'achieved' ? 'text-gray-400 line-through' : 'text-gray-900'
                )}>
                  {goal.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(goal.deadline).toLocaleDateString('he-IL')}
                </p>
              </div>
            </div>
            <button
              onClick={() => onEdit(goal)}
              className="p-1 hover:bg-gray-50 rounded transition-colors flex-shrink-0"
              aria-label="ערוך מטרה"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}