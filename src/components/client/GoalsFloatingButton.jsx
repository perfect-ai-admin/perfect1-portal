import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoalsFloatingButton({ onNavigate, onAddGoal, goals = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = React.useRef(null);
  
  const activeGoals = goals;

  const handleAddGoal = () => {
    setIsOpen(false);
    if (onAddGoal) {
      onAddGoal();
    } else {
      onNavigate('goals');
    }
  };

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      setTimeout(() => {
        // גלילה אל הכפתור עצמו כדי שיעלה לראש העמוד
        buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [isOpen]);

  return (
    <>
      <motion.div
        ref={buttonRef}
        className="md:hidden mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
        >
          <Target className="w-5 h-5" />
          המטרות שלי
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden z-10"
            >
              {activeGoals.length > 0 ? (
                <div className="p-4 space-y-2.5 max-h-64 overflow-y-auto">
                  {activeGoals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setIsOpen(false);
                        // Navigate to goals tab but allow viewing here too
                        // For now just navigate as requested behavior seems to be "reflecting"
                        onNavigate('goals'); 
                      }}
                      className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 border border-purple-200/50"
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-2">{goal.title}</p>
                      {goal.progress !== undefined && (
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-2 bg-white/80 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${goal.progress}%` }}
                              transition={{ duration: 0.6, delay: index * 0.05 + 0.2 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                            />
                          </div>
                          <span className="text-xs font-bold text-purple-700">{goal.progress}%</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  אין מטרות פעילות כרגע
                </div>
              )}
              <button
                onClick={handleAddGoal}
                className="w-full p-4 text-center text-purple-600 font-bold text-sm hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 transition-all border-t border-purple-200 flex items-center justify-center gap-2 active:scale-95"
              >
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                הוסף מטרה חדשה
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </motion.div>
      
      {/* ספייסר כדי לאפשר גלילה למעלה */}
      {isOpen && <div className="h-[60vh]" />}
    </>
  );
}