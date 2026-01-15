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
    why: 'זה הצעד שהופך אותך מעצמאי בתיאוריה לעסק אמיתי. חשבונית ראשונה היא האבן הראשונה בבניין העסק שלך.',
    icon: <Target className="w-10 h-10" />,
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

        {/* Quick Stats Bar - Always Visible */}
        <QuickStatsBar stats={quickStats} className="mb-2" />

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
          <NextStepCard step={nextStep} onAction={nextStep.action} />

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">פעולות מהירות</h3>
            <button className="w-full text-right px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all text-blue-700 text-sm font-medium">
              צור חשבונית
            </button>
            <button className="w-full text-right px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all text-purple-700 text-sm font-medium">
              הוסף מטרה
            </button>
            <button className="w-full text-right px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-all text-green-700 text-sm font-medium">
              שאל את המנטור
            </button>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}