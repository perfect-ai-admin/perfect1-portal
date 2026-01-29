import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

export default function JourneyProgress({ progress = 0, completed = 0, total = 7, goals = [] }) {
  return (
    <div className="journey-progress-panel bg-white rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">המסע שלך</h3>
        <p className="text-sm text-gray-500 mb-4">
          מסע העסק שלך בנוי על התשובות שלך - זה המסלול שבנינו עבורך
        </p>
      </div>

      {/* Progress Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">
            התקדמות: {completed}/{total}
          </span>
          <span className="text-sm font-semibold text-blue-600">{progress}%</span>
        </div>
        <motion.div 
          className="h-2 bg-gray-200 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </motion.div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal, index) => {
          const isCompleted = goal.status === 'completed';
          const isActive = goal.status === 'in_progress';
          const isLocked = goal.status === 'not_started';

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {isCompleted && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {isActive && (
                  <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />
                )}
                {isLocked && (
                  <Lock className="w-5 h-5 text-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    isCompleted ? 'text-gray-500 line-through' :
                    isActive ? 'text-gray-900' :
                    'text-gray-500'
                  }`}>
                    שלב {goal.goals?.sort_order}/{total} - {goal.goals?.goal_name_he}
                  </span>
                  {isActive && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      פעיל
                    </span>
                  )}
                </div>
              </div>

              {/* Progress (for active goal) */}
              {isActive && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">{goal.progress_percent}%</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}