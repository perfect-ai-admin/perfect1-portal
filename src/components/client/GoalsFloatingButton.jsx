import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoalsFloatingButton({ onNavigate, onAddGoal, goals = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = React.useRef(null);
  
  // Mock goals - להחליף בנתונים אמיתיים
  const activeGoals = goals.length > 0 ? goals : [
    { id: 1, title: 'להגיע ל-50 לקוחות חדשים', progress: 65 },
    { id: 2, title: 'להגדיל הכנסות ב-30%', progress: 42 }
  ];

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10"
            >
              {activeGoals.length > 0 && (
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                  {activeGoals.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => {
                        setIsOpen(false);
                        onNavigate('goals');
                      }}
                      className="p-2.5 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{goal.title}</p>
                      {goal.progress !== undefined && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{goal.progress}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={handleAddGoal}
                className="w-full p-3 text-center text-purple-600 font-semibold text-sm hover:bg-purple-50 transition-colors border-t border-gray-200 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                מטרה חדשה
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