import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function StepImportancePanel({ step }) {
  const [expanded, setExpanded] = useState(false);

  if (!step?.why) return null;

  return (
    <motion.div
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
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{step.why}</p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-100 px-4 py-3 bg-gray-50"
        >
          <p className="text-sm text-gray-700 leading-relaxed">{step.why}</p>
        </motion.div>
      )}
    </motion.div>
  );
}