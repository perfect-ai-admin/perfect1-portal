import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, Clock, DollarSign, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GOAL_ICONS = {
  revenue: DollarSign,
  clients: Users,
  worklife: Clock,
  skill: BookOpen,
  financial: Target,
  custom: Target
};

export default function GoalCard({ goal, onUpdate }) {
  const Icon = GOAL_ICONS[goal.category] || Target;
  const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
  
  const getStatus = () => {
    if (progress >= 100) return 'achieved';
    if (progress >= 70) return 'onTrack';
    if (progress >= 40) return 'needsAttention';
    return 'atRisk';
  };

  const status = getStatus();

  const statusConfig = {
    achieved: {
      color: 'from-green-500 to-green-600',
      badge: 'bg-green-100 text-green-700',
      text: 'הושגה! 🎉',
      icon: CheckCircle
    },
    onTrack: {
      color: 'from-blue-500 to-blue-600',
      badge: 'bg-blue-100 text-blue-700',
      text: 'במסלול ✓',
      icon: TrendingUp
    },
    needsAttention: {
      color: 'from-yellow-500 to-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700',
      text: 'צריך תשומת לב',
      icon: AlertTriangle
    },
    atRisk: {
      color: 'from-red-500 to-red-600',
      badge: 'bg-red-100 text-red-700',
      text: 'בסיכון',
      icon: AlertTriangle
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
    >
      {/* Header */}
      <div className={cn("bg-gradient-to-r p-6 text-white", config.color)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{goal.title}</h3>
              {goal.description && (
                <p className="text-sm opacity-90 mt-1">{goal.description}</p>
              )}
            </div>
          </div>
          <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", config.badge.replace('100', '50'))}>
            {config.text}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">התקדמות</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-white h-full rounded-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">נוכחי: {goal.currentDisplay || goal.current}</span>
            <span className="opacity-90">יעד: {goal.targetDisplay || goal.target}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {goal.deadline && (
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <Clock className="w-4 h-4" />
            <span className="text-sm">תאריך יעד: {new Date(goal.deadline).toLocaleDateString('he-IL')}</span>
          </div>
        )}

        {goal.aiInsight && (
          <div className="bg-indigo-50 border-r-4 border-indigo-400 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <StatusIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">{goal.aiInsight}</p>
            </div>
          </div>
        )}

        <Button
          onClick={() => onUpdate(goal.id)}
          variant="outline"
          className="w-full"
        >
          עדכן התקדמות
        </Button>
      </div>
    </motion.div>
  );
}