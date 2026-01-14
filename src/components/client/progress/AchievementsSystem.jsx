import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target, DollarSign, Users, Star, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ACHIEVEMENTS = [
  {
    id: 'first_invoice',
    title: 'חשבונית ראשונה',
    description: 'הנפקת חשבונית ראשונה בהצלחה',
    icon: Zap,
    category: 'milestone',
    points: 50,
    unlocked: true,
    unlockedDate: '2026-01-10'
  },
  {
    id: 'revenue_10k',
    title: 'יזם מתחיל',
    description: 'הגעה ל-₪10,000 הכנסות',
    icon: DollarSign,
    category: 'revenue',
    points: 100,
    unlocked: true,
    unlockedDate: '2026-01-12'
  },
  {
    id: 'revenue_50k',
    title: 'עסק צומח',
    description: 'הגעה ל-₪50,000 הכנסות',
    icon: TrendingUp,
    category: 'revenue',
    points: 250,
    unlocked: false,
    progress: 42000,
    target: 50000
  },
  {
    id: 'clients_5',
    title: 'בונה קהילה',
    description: '5 לקוחות פעילים',
    icon: Users,
    category: 'clients',
    points: 75,
    unlocked: true,
    unlockedDate: '2026-01-08'
  },
  {
    id: 'clients_20',
    title: 'מומחה רשת',
    description: '20 לקוחות פעילים',
    icon: Users,
    category: 'clients',
    points: 200,
    unlocked: false,
    progress: 7,
    target: 20
  },
  {
    id: 'goal_achieved',
    title: 'מבצע מטרות',
    description: 'השגת מטרה אישית',
    icon: Target,
    category: 'goals',
    points: 100,
    unlocked: false
  },
  {
    id: 'consistent_month',
    title: 'עקביות משתלמת',
    description: '3 חודשים רצופים עם הכנסה',
    icon: Star,
    category: 'milestone',
    points: 150,
    unlocked: false,
    progress: 2,
    target: 3
  }
];

export default function AchievementsSystem({ compact = false }) {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  
  const totalPoints = ACHIEVEMENTS.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const maxPoints = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
        <Trophy className="w-12 h-12 mb-4 mx-auto" />
        <h3 className="text-2xl font-bold text-center mb-3">ההישגים שלך</h3>
        <div className="bg-white/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">נקודות</span>
            <span className="font-bold">{totalPoints} / {maxPoints}</span>
          </div>
          <Progress value={(totalPoints / maxPoints) * 100} className="h-2" />
        </div>
        <div className="space-y-2">
          {ACHIEVEMENTS.slice(0, 3).map(achievement => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>
        <button 
          className="w-full mt-4 text-sm text-white/90 hover:text-white underline"
          onClick={() => setSelectedAchievement('all')}
        >
          צפה בכל ההישגים →
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-16 h-16" />
            <div>
              <h2 className="text-3xl font-bold">ההישגים שלך</h2>
              <p className="text-white/90">כל צעד קטן הוא הצלחה גדולה</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span>נקודות הישגים</span>
              <span className="text-2xl font-bold">{totalPoints} / {maxPoints}</span>
            </div>
            <Progress value={(totalPoints / maxPoints) * 100} className="h-3" />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map(achievement => (
            <motion.div
              key={achievement.id}
              whileHover={achievement.unlocked ? { scale: 1.05 } : {}}
              onClick={() => setSelectedAchievement(achievement)}
              className={`cursor-pointer bg-white rounded-xl p-6 shadow-lg transition-all ${
                !achievement.unlocked ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                    : 'bg-gray-200'
                }`}>
                  {achievement.unlocked ? (
                    <achievement.icon className="w-6 h-6 text-white" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                  {achievement.points} נקודות
                </Badge>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-2">{achievement.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              
              {!achievement.unlocked && achievement.progress && achievement.target && (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>התקדמות</span>
                    <span>{achievement.progress} / {achievement.target}</span>
                  </div>
                  <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                </div>
              )}
              
              {achievement.unlocked && achievement.unlockedDate && (
                <p className="text-xs text-green-600 font-medium">
                  הושג ב-{new Date(achievement.unlockedDate).toLocaleDateString('he-IL')}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievement Detail Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedAchievement && selectedAchievement !== 'all' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedAchievement.unlocked 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                      : 'bg-gray-200'
                  }`}>
                    {selectedAchievement.unlocked ? (
                      <selectedAchievement.icon className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  {selectedAchievement.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-700">{selectedAchievement.description}</p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>שווה:</strong> {selectedAchievement.points} נקודות הישג
                  </p>
                </div>
                {selectedAchievement.unlocked ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">🎉 הושג!</p>
                    <p className="text-sm text-green-700 mt-1">
                      {new Date(selectedAchievement.unlockedDate).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                ) : (
                  selectedAchievement.progress && selectedAchievement.target && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">התקדמות:</p>
                      <Progress value={(selectedAchievement.progress / selectedAchievement.target) * 100} />
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedAchievement.progress} / {selectedAchievement.target}
                      </p>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function AchievementBadge({ achievement, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/10 backdrop-blur rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-all ${
        !achievement.unlocked && 'opacity-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          achievement.unlocked ? 'bg-yellow-300' : 'bg-gray-400'
        }`}>
          {achievement.unlocked ? (
            <achievement.icon className="w-5 h-5 text-gray-800" />
          ) : (
            <Lock className="w-5 h-5 text-gray-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{achievement.title}</p>
          <p className="text-xs opacity-90 truncate">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}