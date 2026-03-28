import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HeroGoal({ goal, onStatusChange, onEdit, onDelete, isLoading = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!goal) return null;

  const statusConfig = {
    active: { label: 'בתהליך', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    achieved: { label: 'הושגה', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    stuck: { label: 'תקועה', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' }
  };

  const config = statusConfig[goal.status] || statusConfig.active;

  const urgencyConfig = {
    low: { label: 'נמוכה', color: 'text-green-700', bg: 'bg-green-50' },
    medium: { label: 'בינונית', color: 'text-orange-700', bg: 'bg-orange-50' },
    high: { label: 'גבוהה', color: 'text-red-700', bg: 'bg-red-50' }
  };
  
  const urgency = urgencyConfig[goal.urgency] || urgencyConfig.medium;
  
  // Calculate progress percentage
  const parseAmount = (str) => {
    if (!str) return 0;
    return parseFloat(str.replace(/[^0-9.-]+/g,"")) || 0;
  };
  
  const current = parseAmount(goal.currentDisplay);
  const target = parseAmount(goal.targetDisplay);
  const progress = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full relative group"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
      
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4 border-b border-blue-100/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm", config.color, "bg-white border-current opacity-80")}>
                  {config.label}
                </span>

              </div>
              <h2 className="text-base md:text-lg font-black text-gray-900 leading-tight mb-1">
                {goal.goal_index && <span className="text-blue-600/50 text-sm ml-1">#{goal.goal_index}</span>}
                {goal.title}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-2 md:line-clamp-none">{goal.description}</p>
            </div>
            
            <div className="flex gap-1">
               <button
                 onClick={() => onEdit(goal)}
                 className="p-1.5 hover:bg-white/80 rounded-lg transition-all text-gray-400 hover:text-blue-600"
               >
                 <Edit2 className="w-4 h-4" />
               </button>
               <button
                 onClick={() => onDelete(goal.id)}
                 className="p-1.5 hover:bg-white/80 rounded-lg transition-all text-gray-400 hover:text-red-600"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-3 md:p-4 space-y-2 md:space-y-4">
          {goal.targetDisplay ? (
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex justify-between items-end text-xs md:text-sm">
                <span className="font-semibold text-gray-700">{progress.toFixed(0)}% הושלמו</span>
                <span className="text-gray-500 font-medium text-[10px] md:text-xs">{goal.currentDisplay} / {goal.targetDisplay}</span>
              </div>
              <div className="h-2 md:h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </motion.div>
              </div>
            </div>
          ) : (
             <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">רמת דחיפות</span>
                <span className={cn("font-bold px-2.5 py-0.5 rounded-full text-xs border", urgency.color, urgency.bg, urgency.bg.replace('bg-', 'border-').replace('50', '200'))}>
                  {urgency.label}
                </span>
             </div>
          )}
        </div>

        {/* Action Hint - Always visible if exists, styled as a "Next Step" */}
        {goal.actionHint && (
          <div className="px-3 pb-3 md:px-4 md:pb-4">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 md:p-3 flex gap-2 md:gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-4 h-4 md:w-5 md:h-5 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-[10px] md:text-xs font-bold">!</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-600/80 mb-0.5">הצעד הבא שלך</p>
                <p className="text-xs md:text-sm text-gray-800 font-medium leading-snug">{goal.actionHint}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}