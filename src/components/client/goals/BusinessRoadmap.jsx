import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Lock, ChevronDown, ChevronUp, Map, Play, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function BusinessRoadmap({ user, tasks, onSelectStep, activeGoals = [], onShowUpgrade, goalLimit = 1 }) {
  // Always expanded by default now, but can be toggled
  const [isExpanded, setIsExpanded] = useState(true);

  if (!tasks || tasks.length === 0) return null;

  // Find current active step index (first pending/in_progress)
  const currentStepIndex = tasks.findIndex(t => t.status === 'in_progress' || t.status === 'pending');
  const activeIndex = currentStepIndex === -1 ? tasks.length : currentStepIndex;

  // Helper to check if a task is already an active goal
  const isTaskActiveGoal = (task) => {
    return activeGoals.some(g => 
        g.title === task.title || 
        g.category === `task_${task.id}` || 
        g.category === `task_goal_${task.id}`
    );
  };

  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-l from-white to-indigo-50/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-400 blur-lg opacity-20 rounded-full"></div>
             <div className="w-10 h-10 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm relative z-10">
                <Map className="w-5 h-5" />
             </div>
          </div>
          <div className="text-right">
             <h3 className="text-base font-bold text-gray-900">המפה העסקית המלאה</h3>
             <p className="text-xs text-gray-500 mt-0.5">
               המסלול שלך להצלחה: {tasks.length} שלבים • {Math.round((activeIndex / tasks.length) * 100)}% הושלמו
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 hidden sm:inline-block">
              {isExpanded ? 'הסתר מפה' : 'הצג מפה'}
           </span>
           {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 space-y-3">
              {tasks.map((task, index) => {
                const isCompleted = index < activeIndex;
                const isCurrent = index === activeIndex;
                const isActiveGoal = isTaskActiveGoal(task);
                
                return (
                  <div 
                    key={task.id || index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      isCurrent 
                        ? "bg-white border-indigo-200 shadow-sm" 
                        : "bg-white/50 border-transparent hover:border-gray-200 hover:bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold flex-shrink-0",
                      isCompleted ? "bg-green-100 border-green-200 text-green-700" :
                      isCurrent ? "bg-indigo-100 border-indigo-200 text-indigo-700" :
                      "bg-gray-50 border-gray-200 text-gray-400"
                    )}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : (index + 1)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            isCompleted ? "text-gray-500 line-through" : "text-gray-900"
                          )}>
                            {task.title}
                          </h4>
                          {task.is_milestone && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-bold">
                              אבן דרך
                            </span>
                          )}
                       </div>
                       {isCurrent && (
                          <p className="text-xs text-indigo-600 mt-0.5">
                             זה השלב הנוכחי בתוכנית שלך
                          </p>
                       )}
                    </div>

                    {!isCompleted && (
                       <div className="flex-shrink-0">
                          {isActiveGoal ? (
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md font-medium border border-green-100">
                               בביצוע
                            </span>
                          ) : (
                            <Button 
                               size="sm" 
                               variant="outline" 
                               className="h-7 px-3 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 gap-1.5 bg-white shadow-sm"
                               onClick={() => {
                                 // Active goals count check (excluding completed/archived usually, but activeGoals passed here should be the filtered list)
                                 const currentActiveCount = activeGoals.filter(g => ['active', 'in_progress', 'selected'].includes(g.status)).length;
                                 
                                 if (goalLimit !== null && currentActiveCount >= goalLimit) {
                                   onShowUpgrade();
                                 } else {
                                   onSelectStep(task);
                                 }
                               }}
                            >
                               <Plus className="w-3 h-3" />
                               הוסף
                            </Button>
                          )}
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}