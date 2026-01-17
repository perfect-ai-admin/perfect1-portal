import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import HeroGoal from '../goals/HeroGoal';
import SecondaryGoals from '../goals/SecondaryGoals';
import GoalTemplates from '../goals/GoalTemplatesFixed';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

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
  const goalsTopRef = useRef(null);



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
    <>
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-full sm:max-w-lg">
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
        </DialogContent>
      </Dialog>

      <div className="container mx-auto max-w-4xl p-0 md:p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-8"
        >
          
          {/* Header Section */}
          <div className="flex items-end justify-between px-1">
             <div>
               <h1 className="text-2xl font-bold text-gray-900">המטרות שלי</h1>
               <p className="text-gray-500 text-sm mt-1">
                 {goals.length > 0 
                   ? `יש לך ${goals.length} מטרות פעילות. תן בראש! 💪` 
                   : 'זה הזמן להגדיר מטרות חדשות ולהתחיל לצמוח 🌱'}
               </p>
             </div>
             <Button 
                onClick={handleShowAddGoal}
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all rounded-full px-4"
              >
                <Plus className="w-4 h-4 ml-2" />
                מטרה חדשה
              </Button>
          </div>

          {/* Hero Goal */}
          {heroGoal && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">הפוקוס העיקרי שלך</p>
              </div>
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

          {/* Empty State */}
          {goals.length === 0 && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">אין מטרות עדיין</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">מטרות הן המצפן של העסק. בוא נגדיר את היעד הבא שלך ונתחיל לנוע לעברו.</p>
              <Button onClick={handleShowAddGoal} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                <Plus className="w-5 h-5 ml-2" />
                צור מטרה ראשונה
              </Button>
            </motion.div>
          )}

        </motion.div>
      </div>
    </>
      );
      }