import React, { useState } from 'react';
import { motion } from 'framer-motion';
import JourneyTimeline, { MILESTONES } from '../progress/JourneyTimeline';
import NextStepCard from '../progress/NextStepCard';
import StepImportancePanel from '../progress/StepImportancePanel';
import QuickStatsBar from '../progress/QuickStatsBar';
import AchievementsSystem from '../progress/AchievementsSystem';
import { ProgressTabHelp } from '../help/ContextualHelp';
import GoalsFloatingButton from '../GoalsFloatingButton';
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
    why: 'זה הצעד שהופך אותך מעצמאי בתיאוריה לעסק אמיתי.',
    icon: <Target className="w-10 h-10" />,
    reasons: [
      {
        type: 'planning',
        title: 'רגע מכנון',
        description: 'החשבונית הראשונה היא הקודה שדה אתרה רשימה. "זעמ" - לא רק בתיאוריה - במציאות.'
      },
      {
        type: 'impact',
        title: 'מה זה אומר על השקע',
        description: 'לקוח שנוודים = משכנתא שלנו ששירות שלך השקע הממשי לרישום השקע.'
      },
      {
        type: 'tracking',
        title: 'למה לעקוב אחרי זה',
        description: 'כל שחברות משפרות משימות חלוק מבטוח. מחפש נכון. זה ההמיתחיד שיעוזור לך לצמוח.'
      },
      {
        type: 'remember',
        title: 'מה חשוב לזכור',
        description: 'חשבונית רישונה לא היחידה וגם אינה סוף. חשבון מצטבר ממעשים ברורים.'
      }
    ],
    action: () => {
      onNavigate('financial');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* Goals Button - Mobile Only */}
        <GoalsFloatingButton onNavigate={onNavigate} />

      {/* Main Grid - Desktop */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Journey Timeline - Left 50% */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              המסע שלך
            </h2>
            <JourneyTimeline 
              completedMilestones={completedMilestones}
              currentMilestone={currentMilestone}
            />
          </div>
        </div>

        {/* Right Column - Next Step & Actions 50% */}
         <div className="lg:col-span-6 space-y-4">
           {/* Placeholder for future content */}
         </div>
      </div>
    </motion.div>
    </>
  );
}