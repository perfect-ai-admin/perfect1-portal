import React, { useState } from 'react';
import { motion } from 'framer-motion';
import HeroGoal from '../goals/HeroGoal';
import SecondaryGoals from '../goals/SecondaryGoals';
import GoalTemplates from '../goals/GoalTemplates';
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
    actionHint: 'התמקד בלקוחות קיימים - זה יביא לך למטרה ב-3 שבועות.'
  },
  {
    id: '2',
    title: '10 לקוחות פעילים',
    deadline: '2026-06-30',
    status: 'active'
  },
  {
    id: '3',
    title: 'מערכת ניהול חשבונות',
    deadline: '2026-04-30',
    status: 'active'
  }
];

export default function GoalsTab({ data }) {
  const [goals, setGoals] = useState(SAMPLE_GOALS);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const heroGoal = goals[0];
  const secondaryGoals = goals.slice(1, 4);

  const handleStatusChange = (goalId) => {
    setGoals(prev => prev.map(g => 
      g.id === goalId 
        ? { ...g, status: g.status === 'active' ? 'achieved' : 'active' }
        : g
    ));
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    // ניתן להוסיף דיאלוג עריכה אם נדרש
  };

  const handleCreateGoal = (newGoal) => {
    setGoals(prev => [...prev, newGoal]);
    setShowAddGoal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {/* Hero Goal */}
      {heroGoal && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">המטרה הראשית שלך</p>
          <HeroGoal 
            goal={heroGoal}
            onStatusChange={handleStatusChange}
            onEdit={handleEditGoal}
          />
        </div>
      )}

      {/* Secondary Goals */}
      {secondaryGoals.length > 0 && (
        <SecondaryGoals 
          goals={secondaryGoals}
          onStatusChange={handleStatusChange}
          onEdit={handleEditGoal}
        />
      )}

      {/* Add Goal Button */}
      <div className="pt-4">
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => setShowAddGoal(true)}
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
          onClose={() => setShowAddGoal(false)}
        />
      )}
    </motion.div>
  );
}