import React, { useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import HeroGoal from '../goals/HeroGoal';
import SecondaryGoals from '../goals/SecondaryGoals';
import GoalTemplates from '../goals/GoalTemplatesFixed';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SAMPLE_GOALS = [
  {
    id: '1',
    title: 'הכנסה חודשית של ₪15,000',
    description: 'להגיע להכנסה יציבה ועקבית',
    currentDisplay: '₪12,500',
    targetDisplay: '₪15,000',
    deadline: '2026-03-31',
    status: 'active',
    isPrimary: true,
    actionHint: 'התמקד בלקוחות קיימים - זה יביא לך למטרה ב-3 שבועות.'
  },
  {
    id: '2',
    title: '10 לקוחות פעילים',
    deadline: '2026-06-30',
    status: 'active',
    isPrimary: false
  },
  {
    id: '3',
    title: 'מערכת ניהול חשבונות',
    deadline: '2026-04-30',
    status: 'active',
    isPrimary: false
  }
];

// Utility: Scroll with retry logic + scrollIntoView fallback
const scrollToGoalsTop = (retries = 0) => {
  const anchor = document.getElementById('goals-top-anchor');
  const scrollContainer = document.querySelector('main[data-scroll-container="dashboard"]');
  
  if (!anchor || !scrollContainer) {
    if (retries < 15) {
      requestAnimationFrame(() => scrollToGoalsTop(retries + 1));
    }
    return;
  }

  // Method 1: Direct scroll
  scrollContainer.scrollTop = 0;
  
  // Method 2: Fallback - scrollIntoView
  setTimeout(() => {
    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
};

export default function GoalsTab({ data, openAddGoal = false }) {
  const [goals, setGoals] = useState(SAMPLE_GOALS);
  const [showAddGoal, setShowAddGoal] = useState(openAddGoal);
  const [editingGoal, setEditingGoal] = useState(null);
  const goalsTopRef = useRef(null);

  // Step 4: useLayoutEffect + multiple timing attempts for stable scroll
  useLayoutEffect(() => {
    if (showAddGoal) {
      // Attempt 1: After paint
      requestAnimationFrame(() => {
        scrollToGoalsTop();
      });
      
      // Attempt 2: After 100ms (gives modal time to render)
      setTimeout(() => scrollToGoalsTop(), 100);
      
      // Attempt 3: After 300ms (last resort)
      setTimeout(() => scrollToGoalsTop(), 300);
    }
  }, [showAddGoal]);

  const handleShowAddGoal = () => {
    setShowAddGoal(true);
  };

  const heroGoal = goals[0];
  const secondaryGoals = goals.slice(1);

  const handleStatusChange = (goal, nextStatus) => {
    setGoals(prev => prev.map(g => 
      g.id === goal.id 
        ? { ...g, status: nextStatus }
        : g
    ));
  };

  const handleEditGoal = (goal) => {
     setEditingGoal(goal);
     setShowAddGoal(true);
   };

  const handleDeleteGoal = (goalId) => {
     setGoals(prev => prev.filter(g => g.id !== goalId));
   };

  const handleCreateGoal = (newGoal, isEditing = false) => {
     if (isEditing) {
       // עדכן את המטרה הקיימת
       setGoals(prev => prev.map(g => g.id === newGoal.id ? newGoal : g));
     } else {
       // הוסף מטרה חדשה
       if (newGoal.isPrimary) {
         setGoals(prev => [newGoal, ...prev.filter(g => !g.isPrimary)]);
       } else {
         setGoals(prev => [...prev, newGoal]);
       }
     }
     setShowAddGoal(false);
   };

  return (
    <div className="flex justify-center pt-4 px-4 md:pt-0 md:p-0 md:justify-start">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-3 w-full max-w-xs md:max-w-none md:w-full md:bg-transparent md:border-0 md:p-0 md:shadow-none bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
      >
      {/* Step 1: Anchor element - always in DOM */}
      <div id="goals-top-anchor" ref={goalsTopRef} className="invisible h-0" />

      {/* Hero Goal */}
      {heroGoal && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">המטרה הראשית שלך</p>
          <HeroGoal 
            goal={heroGoal}
            onStatusChange={handleStatusChange}
            onEdit={handleEditGoal}
            onDelete={handleDeleteGoal}
          />
        </div>
      )}

      {/* Secondary Goals */}
      {secondaryGoals.length > 0 && (
        <SecondaryGoals 
          goals={secondaryGoals}
          onStatusChange={handleStatusChange}
          onEdit={handleEditGoal}
          onDelete={handleDeleteGoal}
        />
      )}

      {/* Add Goal Button */}
      <div className="pt-4">
        <Button 
          className="w-full gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
          onClick={handleShowAddGoal}
        >
          <Plus className="w-4 h-4" />
          מטרה חדשה
        </Button>
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">אין מטרות עדיין</p>
          <Button onClick={handleShowAddGoal}>
            <Plus className="w-4 h-4 ml-2" />
            צור מטרה ראשונה
          </Button>
        </div>
      )}

      {/* Goal Creation Dialog */}
       {showAddGoal && (
         <GoalTemplates
           onCreateGoal={handleCreateGoal}
           onClose={() => {
             setShowAddGoal(false);
             setEditingGoal(null);
           }}
           hasPrimaryGoal={goals.some(g => g.isPrimary && g.id !== editingGoal?.id)}
           editingGoal={editingGoal}
         />
       )}
       </motion.div>
       </div>
       );
       }