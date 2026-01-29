import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function JourneyProgress({ 
  progress = 0, 
  completed = 0, 
  total = 7, 
  goals = [] 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-50">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-bold text-[#1E3A5F]">המסע שלך</h3>
          <span className="text-sm font-bold text-gray-600">
            {completed}/{total}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] h-full rounded-full"
          />
        </div>
        
        <p className="text-sm text-gray-500 mt-2 text-center font-medium">
          {progress}% התקדמות
        </p>
      </div>

      <div className="space-y-3">
        {goals.map((goal, index) => {
          const isCompleted = goal.status === 'completed';
          const isCurrent = goal.status === 'in_progress';
          const isLocked = goal.status === 'not_started' && index > 0 && 
                          !goals.slice(0, index).every(g => g.status === 'completed');

          return (
            <motion.div
              key={goal.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all',
                isCompleted && 'bg-green-50',
                isCurrent && 'bg-blue-50 border-l-4 border-[#27AE60]',
                !isCompleted && !isCurrent && 'bg-gray-50'
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-[#27AE60] flex-shrink-0" />
              ) : isCurrent ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-6 h-6 rounded-full border-2 border-[#27AE60] flex items-center justify-center flex-shrink-0"
                >
                  <div className="w-2 h-2 bg-[#27AE60] rounded-full" />
                </motion.div>
              ) : (
                <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-bold text-sm',
                  isCompleted && 'text-[#27AE60] line-through text-opacity-60',
                  isCurrent && 'text-[#1E3A5F]',
                  !isCompleted && !isCurrent && 'text-gray-600'
                )}>
                  שלב {index + 1}/{total} - {goal.goals?.goal_name_he || 'מטרה'}
                </p>
                
                {isCurrent && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    פעיל כעת
                  </p>
                )}
              </div>
              
              {goal.progress_percent > 0 && !isCompleted && isCurrent && (
                <span className="text-xs font-bold text-[#27AE60] bg-green-100 px-2 py-1 rounded-full">
                  {goal.progress_percent}%
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}