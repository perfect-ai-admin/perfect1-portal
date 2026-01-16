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
  const whyMattersRef = React.useRef(null);
  
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

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const scrollToWhyMatters = () => {
    if (whyMattersRef.current) {
      whyMattersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      {/* Quick Stats - Mobile First */}
      <div className="lg:hidden -mt-2">
        <QuickStatsBar stats={quickStats} />
      </div>

      {/* Mobile Collapsed View */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="w-full bg-white rounded-lg shadow-md border border-gray-100 p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">מסע העסק</h2>
          </div>
          <motion.div
            animate={{ rotate: isMobileExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-gray-500"
          >
            ▼
          </motion.div>
        </button>

        {isMobileExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 space-y-1.5"
          >
            {MILESTONES.map((milestone) => {
              const status = completedMilestones.includes(milestone.id) ? 'completed' 
                : milestone.id === currentMilestone ? 'current' : 'locked';
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';

              return (
                <div
                  key={milestone.id}
                  className={`bg-white rounded-lg p-2.5 border text-sm ${
                    isCurrent ? 'border-blue-500 bg-blue-50' : 
                    isCompleted ? 'border-green-500 bg-green-50' : 
                    'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                      isCompleted ? 'bg-green-500' : 
                      isCurrent ? 'bg-blue-500' : 
                      'bg-gray-300'
                    }`}>
                      {isCompleted ? '✓' : isCurrent ? '○' : '🔒'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-[11px]">{milestone.title}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Next Step Card - Mobile */}
      <div className="lg:hidden">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-3">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-green-600 rounded flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            השלב הבא שלך
          </h2>
          <NextStepCard step={nextStep} onWhyClick={scrollToWhyMatters} />
        </div>
      </div>

      {/* Why This Matters - Mobile */}
      <div className="lg:hidden" ref={whyMattersRef}>
        <StepImportancePanel step={nextStep} />
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6">
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
           {/* Stats - Desktop Only */}
           <div className="hidden lg:block">
             <QuickStatsBar stats={quickStats} />
           </div>

           {/* Next Step */}
           <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded flex items-center justify-center">
                 <Target className="w-4 h-4 text-white" />
               </div>
               השלב הבא
             </h2>
             <NextStepCard step={nextStep} />
           </div>

           {/* Why This Matters */}
           <StepImportancePanel step={nextStep} />
         </div>
      </div>

      {/* Goals Button - Mobile Only - Bottom */}
      <div className="lg:hidden">
        <GoalsFloatingButton onNavigate={onNavigate} />
      </div>
    </motion.div>
    </>
  );
}