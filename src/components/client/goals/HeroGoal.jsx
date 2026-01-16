import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Edit2, X, Circle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HeroGoal({ goal, onStatusChange, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  if (!goal) return null;

  const statusConfig = {
    active: { label: 'בתהליך', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    achieved: { label: 'הושגה', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    stuck: { label: 'תקועה', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' }
  };

  const config = statusConfig[goal.status] || statusConfig.active;
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className={cn(
        "bg-white rounded-lg border-2 p-1.5 md:p-2.5 transition-all",
        config.bg
      )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => {
              const nextStatus = goal.status === 'active' ? 'achieved' : goal.status === 'achieved' ? 'stuck' : 'active';
              onStatusChange(goal, nextStatus);
            }}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0 mt-0.5"
            aria-label="שנה סטטוס"
          >
            {goal.status === 'achieved' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <h2 className="text-xs md:text-sm font-bold text-gray-900">{goal.title}</h2>
            <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full text-[10px]", config.color, config.bg)}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-gray-600">{goal.description}</p>
          </div>
         <div className="flex gap-0.5 flex-shrink-0">
           <button
             onClick={() => onEdit(goal)}
             className="p-1 hover:bg-white/50 rounded transition-colors"
             aria-label="ערוך מטרה"
           >
             <Edit2 className="w-3 h-3 text-gray-400" />
           </button>
           <button
             onClick={() => onDelete(goal.id)}
             className="p-1 hover:bg-red-50 rounded transition-colors"
             aria-label="מחק מטרה"
           >
             <X className="w-3 h-3 text-gray-400 hover:text-red-600" />
           </button>
         </div>
        </div>

        {/* Metric & Timeline */}
        <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 mt-1.5 md:mt-2.5 pt-1.5 md:pt-2.5 border-t border-gray-200">
          <div>
            <p className="text-[11px] text-gray-500 mb-0.5">מדד</p>
            <p className="text-xs font-semibold text-gray-900">{goal.currentDisplay} / {goal.targetDisplay}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-0.5">יעד</p>
            <p className="text-xs font-semibold text-gray-900">{new Date(goal.deadline).toLocaleDateString('he-IL')}</p>
          </div>
          {daysLeft > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 mb-0.5">נותר</p>
              <p className="text-xs font-semibold text-gray-900">{daysLeft} ימים</p>
            </div>
          )}
        </div>

        {/* Expansion */}
        {goal.actionHint && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors w-full"
          >
            <span className="flex-1 text-right">מה מקדם את המטרה עכשיו?</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
          </button>
        )}

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200"
          >
            <p className="text-sm text-gray-700">{goal.actionHint}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}