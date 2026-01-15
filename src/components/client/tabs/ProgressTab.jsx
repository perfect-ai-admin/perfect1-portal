import React, { useState } from 'react';
import { motion } from 'framer-motion';
import JourneyTimeline, { MILESTONES } from '../progress/JourneyTimeline';
import NextStepCard from '../progress/NextStepCard';
import QuickStatsBar from '../progress/QuickStatsBar';
import MilestoneCelebration from '../progress/MilestoneCelebration';
import AchievementsSystem from '../progress/AchievementsSystem';
import SmartRecommendations from '../SmartRecommendations';
import { Sparkles, Target } from 'lucide-react';

export default function ProgressTab({ data, onNavigate }) {
  // Mock data - יש להחליף בנתונים אמיתיים
  const completedMilestones = ['registration'];
  const currentMilestone = 'first_invoice';
  
  const quickStats = {
    monthlyRevenue: '₪12,500',
    activeGoals: '3',
    pendingInvoices: '2',
    urgentActions: '1'
  };

  const nextStep = {
    title: 'צור את החשבונית הראשונה שלך',
    why: 'זה הצעד שהופך אותך מעצמאי בתיאוריה לעסק אמיתי. חשבונית ראשונה היא האבן הראשונה בבניין העסק שלך.',
    icon: <Target className="w-10 h-10" />,
    action: () => {
      onNavigate('financial');
    }
  };

  return (
    <>
      <MilestoneCelebration
        completedMilestones={completedMilestones}
        onGoalPrompt={() => onNavigate('goals')}
        onCelebrationComplete={(milestoneId) => console.log('Celebrated:', milestoneId)}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* Quick Stats Bar - Always at Top */}
        <QuickStatsBar stats={quickStats} />

      {/* Main Grid - Desktop */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Journey Timeline - Left 40% */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              המסע שלך
            </h2>
            <JourneyTimeline 
              completedMilestones={completedMilestones}
              currentMilestone={currentMilestone}
            />
          </div>
        </div>

        {/* Center Column - Next Steps 35% */}
        <div className="lg:col-span-4 space-y-6">
          <NextStepCard step={nextStep} onAction={nextStep.action} />
          
          {/* Why This Matters */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💡 למה זה חשוב?</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              כל שלב במסע העסקי שלך בנוי על הקודם. ההתקדמות המסודרת מבטיחה שלא תפספס שום דבר חשוב 
              ושהעסק שלך יהיה על בסיס יציב.
            </p>
            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                <strong>טיפ:</strong> אל תדלג על שלבים כדי לזרז - כל שלב חשוב להצלחה ארוכת טווח
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Achievements & Recommendations 25% */}
        <div className="lg:col-span-3 space-y-6">
          <AchievementsSystem compact={true} />

          {/* Smart Recommendations */}
          <SmartRecommendations compact={true} onNavigate={onNavigate} />

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">פעולות מהירות</h3>
            <div className="space-y-2">
              <button className="w-full text-right px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all text-blue-700 font-medium">
                צור חשבונית חדשה
              </button>
              <button className="w-full text-right px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all text-purple-700 font-medium">
                הוסף מטרה חדשה
              </button>
              <button className="w-full text-right px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-all text-green-700 font-medium">
                דבר עם המנטור
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}