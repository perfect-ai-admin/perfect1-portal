import React, { useState, useRef, useEffect } from 'react';
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

export default function GoalsTab({ data, openAddGoal = false }) {
  const [goals, setGoals] = useState(SAMPLE_GOALS);
  const [showAddGoal, setShowAddGoal] = useState(openAddGoal);
  const [editingGoal, setEditingGoal] = useState(null);
  const topRef = useRef(null);

  React.useEffect(() => {
    if (openAddGoal) {
      setShowAddGoal(true);
    }
  }, [openAddGoal]);

  // Scroll to top when opening add goal form
  useEffect(() => {
    if (showAddGoal) {
      // Find scrollable parent or window
      setTimeout(() => {
        const scrollableParent = topRef.current?.closest('[style*="overflow"]') || window;
        if (scrollableParent === window) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }, [showAddGoal]);

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
    <div className="w-full" ref={topRef}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center pt-4 px-4 md:pt-0 md:p-0 md:justify-start"
      >
      <div className="space-y-3 w-full max-w-xs md:max-w-none md:w-full md:bg-transparent md:border-0 md:p-0 md:shadow-none bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
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
          variant="outline" 
          className="w-full gap-2"
          onClick={() => {
            setShowAddGoal(true);
            setTimeout(() => {
              topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 0);
          }}
        >
          <Plus className="w-4 h-4" />
          מטרה חדשה
        </Button>
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">אין מטרות עדיין</p>
          <Button onClick={() => setShowAddGoal(true)}>
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
      </div>
      </motion.div>
      </div>
      );
       }