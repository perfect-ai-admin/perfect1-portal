import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GoalCard from '../goals/GoalCard';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SAMPLE_GOALS = [
  {
    id: '1',
    category: 'revenue',
    title: 'הכנסה חודשית של ₪15,000',
    description: 'להגיע להכנסה יציבה ועקבית',
    current: 12500,
    target: 15000,
    currentDisplay: '₪12,500',
    targetDisplay: '₪15,000',
    deadline: '2026-03-31',
    aiInsight: 'אתה במסלול מצוין! עוד ₪2,500 ותגיע ליעד. המלצה: התמקד בלקוחות קיימים.'
  },
  {
    id: '2',
    category: 'clients',
    title: '10 לקוחות פעילים',
    description: 'בסיס לקוחות יציב',
    current: 7,
    target: 10,
    currentDisplay: '7 לקוחות',
    targetDisplay: '10 לקוחות',
    deadline: '2026-06-30',
    aiInsight: 'התקדמות טובה. צריך עוד 3 לקוחות - שקול לבקש המלצות מלקוחות קיימים.'
  }
];

export default function GoalsTab({ data }) {
  const [goals, setGoals] = useState(SAMPLE_GOALS);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const handleUpdateGoal = (goalId) => {
    console.log('Update goal:', goalId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">המטרות שלי 🎯</h1>
            <p className="text-xl opacity-90">
              הגדר מה הצלחה אומרת עבורך - ונעזור לך להגיע לשם
            </p>
          </div>
          <Button 
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100"
            onClick={() => setShowAddGoal(true)}
          >
            <Plus className="w-5 h-5 ml-2" />
            מטרה חדשה
          </Button>
        </div>
      </div>

      {/* Goals Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <SummaryCard label="מטרות פעילות" value={goals.length} color="bg-blue-50 text-blue-700" />
        <SummaryCard label="הושגו החודש" value="1" color="bg-green-50 text-green-700" />
        <SummaryCard label="במסלול" value={goals.filter(g => (g.current / g.target) >= 0.7).length} color="bg-purple-50 text-purple-700" />
        <SummaryCard label="צריכות תשומת לב" value={goals.filter(g => (g.current / g.target) < 0.4).length} color="bg-orange-50 text-orange-700" />
      </div>

      {/* Goals Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {goals.map(goal => (
          <GoalCard 
            key={goal.id}
            goal={goal}
            onUpdate={handleUpdateGoal}
          />
        ))}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Target className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">טרם הוגדרו מטרות</h3>
          <p className="text-gray-600 mb-6">התחל להגדיר מטרות כדי לעקוב אחרי ההתקדמות שלך</p>
          <Button size="lg" onClick={() => setShowAddGoal(true)}>
            <Plus className="w-5 h-5 ml-2" />
            הוסף מטרה ראשונה
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-sm opacity-75 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}