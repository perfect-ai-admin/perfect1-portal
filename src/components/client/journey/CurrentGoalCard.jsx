import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function CurrentGoalCard({ goal, onStart, isLoading = false }) {
  if (!goal || goal.status !== 'in_progress') {
    return null;
  }

  const goalName = goal.goals?.goal_name_he || goal.goal_name_he;
  const description = goal.goals?.description_he || goal.description_he;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="current-goal-card bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 mb-8 shadow-sm"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            🎯 המלצה אישית עבורך
          </h3>
          
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            {goalName}
          </h4>
          
          {description && (
            <p className="text-sm text-gray-600 mb-4">
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onStart}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              {isLoading ? '...' : 'התחל את המטרה הזו'}
            </Button>
            <Button
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
            >
              בחר מטרה אחרת
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}