import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Lock, ArrowDown, Map, Flag, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BusinessRoadmap({ user, tasks }) {
  if (!tasks || tasks.length === 0) return null;

  // Find current active step index
  const currentStepIndex = tasks.findIndex(t => t.status === 'in_progress' || t.status === 'pending');
  const activeIndex = currentStepIndex === -1 ? tasks.length : currentStepIndex;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Map className="w-5 h-5 text-blue-400" />
              תוכנית הצמיחה העסקית שלך
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-lg">
              זהו המסע המלא לבניית העסק היציב והרווחי שרצית. כל שלב כאן הוא אבן דרך קריטית.
            </p>
          </div>
          <div className="hidden sm:block text-right">
             <div className="text-2xl font-bold text-blue-400">{Math.round((activeIndex / tasks.length) * 100)}%</div>
             <div className="text-xs text-slate-400">הושלמו</div>
          </div>
        </div>
      </div>

      <div className="p-6 relative">
        {/* Connecting Line */}
        <div className="absolute top-6 bottom-6 right-[43px] w-0.5 bg-gray-100 z-0 hidden sm:block"></div>

        <div className="space-y-6 relative z-10">
          {tasks.map((task, index) => {
            const isCompleted = index < activeIndex;
            const isCurrent = index === activeIndex;
            const isLocked = index > activeIndex;

            return (
              <motion.div 
                key={task.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative flex gap-4 p-4 rounded-xl border transition-all duration-300",
                  isCurrent 
                    ? "bg-blue-50/50 border-blue-200 shadow-sm ring-1 ring-blue-100" 
                    : "bg-white border-transparent hover:border-gray-100"
                )}
              >
                {/* Status Indicator */}
                <div className="flex-shrink-0 relative">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors z-10 relative bg-white",
                    isCompleted ? "border-green-500 bg-green-50" :
                    isCurrent ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200" :
                    "border-gray-200 bg-gray-50 text-gray-400"
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                     isCurrent ? <Flag className="w-5 h-5 animate-pulse" /> :
                     task.is_milestone ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> :
                     <Circle className="w-4 h-4" />}
                  </div>
                  {/* Mobile Connecting Line */}
                  {index !== tasks.length - 1 && (
                    <div className={cn(
                      "absolute top-10 bottom-[-24px] left-1/2 w-0.5 -translate-x-1/2 sm:hidden",
                      isCompleted ? "bg-green-200" : "bg-gray-100"
                    )}></div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn(
                      "font-bold text-base",
                      isCompleted ? "text-gray-500 line-through decoration-gray-300" :
                      isCurrent ? "text-blue-700" :
                      "text-gray-400"
                    )}>
                      {task.title}
                    </h3>
                    <span className="text-xs font-mono font-medium text-gray-300">#{index + 1}</span>
                  </div>
                  
                  <p className={cn(
                    "text-sm leading-relaxed max-w-2xl",
                    isCompleted ? "text-gray-400" :
                    isCurrent ? "text-gray-700 font-medium" :
                    "text-gray-400"
                  )}>
                    {task.description}
                  </p>
                  
                  {isCurrent && (
                    <div className="mt-3 flex items-center gap-2">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">
                          בפוקוס עכשיו
                       </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* End of Journey */}
        <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 mb-2 shadow-sm">
                <Star className="w-6 h-6 fill-current" />
            </div>
            <p className="text-sm text-gray-500 font-medium">המטרה הגדולה: {user?.business_state?.goal || 'עסק יציב ורווחי'}</p>
        </div>
      </div>
    </div>
  );
}