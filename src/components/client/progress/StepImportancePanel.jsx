import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const reasonColors = {
  planning: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', icon: '🎉' },
  impact: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: '🔑' },
  tracking: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: '📊' },
  remember: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: '✅' }
};

export default React.forwardRef(function StepImportancePanel({ step, isExpanded, onExpandChange }, ref) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  const expanded = isExpanded !== undefined ? isExpanded : internalExpanded;
  const setExpanded = onExpandChange || setInternalExpanded;

  if (!step?.reasons || step.reasons.length === 0) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-100 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-right flex items-start justify-between gap-3 hover:bg-gray-50 transition-all"
      >
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">
            למה {step.title}?
          </h3>
          <p className="text-xs text-gray-600 mt-1">{step.why}</p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50"
          >
            {step.reasons.map((reason, idx) => {
              const colors = reasonColors[reason.type] || reasonColors.planning;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${colors.bg} ${colors.border} border rounded-lg p-3 text-right`}
                >
                  <p className={`${colors.text} text-xs font-semibold mb-1`}>
                    {colors.icon} {reason.title}
                  </p>
                  <p className={`${colors.text} text-xs opacity-80 leading-relaxed`}>
                    {reason.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});