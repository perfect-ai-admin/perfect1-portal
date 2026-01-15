import React, { useState } from 'react';
import { motion } from 'framer-motion';
import JourneyTimeline, { MILESTONES } from '../progress/JourneyTimeline';
import NextStepCard from '../progress/NextStepCard';
import QuickStatsBar from '../progress/QuickStatsBar';
import MilestoneCelebration from '../progress/MilestoneCelebration';
import MilestoneAnimation from '../progress/MilestoneAnimation';
import AchievementsSystem from '../progress/AchievementsSystem';
import SmartRecommendations from '../SmartRecommendations';
import WhyThisMattersPanel from '../progress/WhyThisMattersPanel';
import ProgressRing from '../business/ProgressRing';
import Sparkline from '../business/Sparkline';
import { ProgressTabHelp } from '../help/ContextualHelp';
import GoalsFloatingButton from '../GoalsFloatingButton';
import { Sparkles, Target } from 'lucide-react';

export default function ProgressTab({ data, onNavigate }) {
  const [celebratingMilestone, setCelebratingMilestone] = useState(null);
  
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
      <ProgressTabHelp />
      <GoalsFloatingButton onNavigate={onNavigate} />
      <MilestoneCelebration
        completedMilestones={completedMilestones}
        onGoalPrompt={() => onNavigate('goals')}
        onCelebrationComplete={(milestoneId) => {
          console.log('Celebrated:', milestoneId);
          if (completedMilestones.includes(milestoneId)) {
            setCelebratingMilestone(milestoneId);
          }
        }}
      />

      {celebratingMilestone && (
        <MilestoneAnimation 
          milestoneId={celebratingMilestone}
          onComplete={() => setCelebratingMilestone(null)}
        />
      )}
      
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

          {/* Why This Matters - Educational Panel */}
          <WhyThisMattersPanel currentMilestone={currentMilestone} />
        </div>

        {/* Right Sidebar - Achievements & Recommendations 25% */}
        <div className="lg:col-span-3 space-y-6">
          <AchievementsSystem compact={true} />

          {/* Smart Recommendations - Hidden on Desktop */}
          <div className="hidden">
            <SmartRecommendations compact={true} onNavigate={onNavigate} />
          </div>

          {/* Quick Actions - with Sparklines */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
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

            {/* Performance Sparkline */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-600 mb-2">ביצוע השבועות האחרונות</p>
              <Sparkline 
                data={[
                  { value: 45 },
                  { value: 52 },
                  { value: 48 },
                  { value: 61 },
                  { value: 58 },
                  { value: 67 }
                ]}
                color="#8B5CF6"
                width={180}
                height={50}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}