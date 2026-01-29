import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Zap, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GoalCard({ 
  goal, 
  isCurrentGoal = false,
  isCompleted = false,
  onStart,
  index = 0
}) {
  const { goals: goalMeta, progress_percent, current_step, status } = goal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'rounded-2xl p-6 md:p-8 border-2 transition-all cursor-pointer group',
        isCompleted && 'bg-green-50 border-[#27AE60]/30',
        isCurrentGoal && 'bg-gradient-to-br from-blue-50 to-indigo-50 border-[#1E3A5F] shadow-lg',
        !isCompleted && !isCurrentGoal && 'bg-white border-gray-200 hover:border-gray-300'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-[#27AE60] flex-shrink-0" />
            ) : isCurrentGoal ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-6 rounded-full border-2 border-[#1E3A5F] flex items-center justify-center flex-shrink-0"
              >
                <div className="w-2 h-2 bg-[#1E3A5F] rounded-full" />
              </motion.div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
            
            <span className={cn(
              'text-sm font-bold',
              isCompleted && 'text-[#27AE60]',
              isCurrentGoal && 'text-[#1E3A5F]',
              !isCompleted && !isCurrentGoal && 'text-gray-600'
            )}>
              שלב {index + 1}/7
            </span>
          </div>

          <h3 className={cn(
            'text-xl md:text-2xl font-bold break-words',
            isCompleted && 'text-[#27AE60] line-through opacity-75',
            isCurrentGoal && 'text-[#1E3A5F]',
            !isCompleted && !isCurrentGoal && 'text-gray-800'
          )}>
            {goalMeta?.goal_name_he || 'מטרה'}
          </h3>

          {isCurrentGoal && (
            <div className="inline-flex items-center gap-1 mt-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              פעיל כעת
            </div>
          )}
        </div>

        {isCompleted && (
          <div className="text-3xl ml-4 flex-shrink-0">✓</div>
        )}
      </div>

      {/* Description */}
      {goalMeta?.description_he && (
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {goalMeta.description_he}
        </p>
      )}

      {/* Progress (for current goal) */}
      {isCurrentGoal && !isCompleted && (
        <div className="mb-4 p-4 bg-white rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">התקדמות</span>
            <span className="text-sm font-bold text-[#1E3A5F]">{progress_percent || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress_percent || 0}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] h-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            שלב {current_step || 1} בתהליך המנטור
          </p>
        </div>
      )}

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3 mb-6">
        {goalMeta?.points_value && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-gray-700">{goalMeta.points_value} נקודות</span>
          </div>
        )}
        
        {goalMeta?.estimated_duration_days && !isCompleted && (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">~{goalMeta.estimated_duration_days} ימים</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      {isCurrentGoal && !isCompleted && (
        <Button
          onClick={onStart}
          className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg"
        >
          <ArrowLeft className="ml-2 w-4 h-4" />
          התחל את המטרה הזו
        </Button>
      )}

      {isCompleted && (
        <div className="text-center text-sm text-[#27AE60] font-bold">
          סיימת בהצלחה! ✨
        </div>
      )}
    </motion.div>
  );
}