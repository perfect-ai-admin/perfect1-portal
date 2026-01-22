import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Lock, ChevronDown, ChevronUp, Map, Play, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function BusinessRoadmap({ user, tasks, onSelectStep, activeGoals = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
             <Map className="w-4 h-4" />
          </div>
          <div className="text-right">
             <h3 className="text-sm font-bold text-gray-900">המפה העסקית שלך</h3>
             <p className="text-xs text-gray-500">
               {tasks.length} שלבים להצלחה • {Math.round((activeIndex / tasks.length) * 100)}% הושלמו
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-xs text-blue-600 font-medium hidden sm:inline-block">
              {isExpanded ? 'סגור מפה' : 'הצג את המסע המלא'}
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
                               variant="ghost" 
                               className="h-7 px-2 text-xs hover:bg-indigo-50 hover:text-indigo-600 text-gray-400 gap-1.5"
                               onClick={() => onSelectStep(task)}
                            >
                               <Plus className="w-3 h-3" />
                               הוסף כמטרה
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