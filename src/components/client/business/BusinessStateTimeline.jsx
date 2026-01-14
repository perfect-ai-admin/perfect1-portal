import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function BusinessStateTimeline({ decisionLog }) {
  if (!decisionLog || decisionLog.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>אין היסטוריה של החלטות עדיין</p>
      </div>
    );
  }

  const sortedLog = [...(decisionLog || [])].reverse();

  return (
    <div className="space-y-4">
      {sortedLog.slice(0, 5).map((entry, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex gap-4"
        >
          {/* Timeline marker */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              entry.outcome ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {entry.outcome ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            {idx < sortedLog.length - 1 && (
              <div className="w-0.5 h-12 bg-gray-200 mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="text-xs text-gray-500 mb-1">
              {new Date(entry.date).toLocaleDateString('he-IL')}
            </div>
            <div className="font-medium text-gray-900 mb-1">
              {entry.question}
            </div>
            <div className="text-sm text-gray-700 mb-2">
              <span className="font-semibold text-blue-600">החלטה:</span> {entry.decision}
            </div>
            {entry.outcome && (
              <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                <span className="font-semibold">תוצאה:</span> {entry.outcome}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}