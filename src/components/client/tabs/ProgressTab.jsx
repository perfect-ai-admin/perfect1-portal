import React, { useState } from 'react';
import { motion } from 'framer-motion';
import JourneyTimeline, { MILESTONES } from '../progress/JourneyTimeline';
import NextStepCard from '../progress/NextStepCard';
import StepImportancePanel from '../progress/StepImportancePanel';
import QuickStatsBar from '../progress/QuickStatsBar';
import AchievementsSystem from '../progress/AchievementsSystem';
import { ProgressTabHelp } from '../help/ContextualHelp';
import GoalsFloatingButton from '../GoalsFloatingButton';
import { Sparkles, Target, ArrowLeft, Rocket, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import BusinessJourneyQuestionnaire from '../progress/BusinessJourneyQuestionnaire';
import { useQueryClient } from '@tanstack/react-query';

export default function ProgressTab({ data, onNavigate }) {
  const queryClient = useQueryClient();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  
  // Use dynamic tasks if available, otherwise default milestones
  const activeMilestones = data?.client_tasks?.length > 0 
    ? data.client_tasks 
    : MILESTONES;

  // Determine current/completed based on status field in tasks
  const currentTask = activeMilestones.find(t => t.status === 'in_progress' || t.status === 'pending');
  const nextStep = currentTask || activeMilestones[0];
  
  // For legacy/default milestones
  const completedMilestones = [];
  const currentMilestone = nextStep?.id;
  const whyMattersRef = React.useRef(null);
  const [whyExpanded, setWhyExpanded] = useState(false);
  
  const quickStats = {
    monthlyRevenue: '₪0',
    activeGoals: '0',
    pendingInvoices: '0',
    urgentActions: '0'
  };

  const isJourneyCompleted = data?.business_journey_completed;

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const scrollToWhyMatters = () => {
    setWhyExpanded(true);
  };

  const handleQuestionnaireComplete = () => {
    setShowQuestionnaire(false);
    queryClient.invalidateQueries({ queryKey: ['user', data.id] });
  };

  if (!isJourneyCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Rocket className="w-12 h-12 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ברוכים הבאים למסע העסקי שלך!
          </h1>
          
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            כדי שנוכל לבנות לך את התוכנית המדויקת ביותר,
            אנחנו צריכים להכיר את העסק שלך קצת יותר לעומק.
            זה לוקח פחות מ-2 דקות.
          </p>

          <Button 
            size="lg" 
            onClick={() => setShowQuestionnaire(true)}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            התחל את המסע
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </motion.div>

        <Dialog open={showQuestionnaire} onOpenChange={setShowQuestionnaire}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-0 bg-white border-0 shadow-2xl rounded-2xl">
            <BusinessJourneyQuestionnaire 
              onComplete={handleQuestionnaireComplete}
              userId={data?.id}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

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
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuestionnaire(true);
              }}
              className="mr-2 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
              title="התחל שאלון מחדש"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
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
            {activeMilestones.map((milestone) => {
              let status = 'locked';
              if (milestone.status) {
                 if (milestone.status === 'completed') status = 'completed';
                 else if (milestone.status === 'in_progress') status = 'current';
              } else {
                 // Fallback
                 status = completedMilestones.includes(milestone.id) ? 'completed' 
                  : milestone.id === currentMilestone ? 'current' : 'locked';
              }

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
      {nextStep && (
        <>
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
          <div className="lg:hidden">
            <StepImportancePanel 
              ref={whyMattersRef} 
              step={nextStep} 
              isExpanded={whyExpanded}
              onExpandChange={setWhyExpanded}
            />
          </div>
        </>
      )}

      {/* Desktop Grid */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6">
        {/* Journey Timeline - Left 50% */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                המסע שלך
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionnaire(true)}
                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 gap-2 h-8"
                title="התחל שאלון מחדש"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs">שאלון מחדש</span>
              </Button>
            </div>
            {data?.business_state && (
              <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-800 font-semibold">{data.business_state.name}</div>
                <div className="text-xs text-blue-600 mt-1">{data.business_state.description}</div>
                <div className="text-xs font-bold text-blue-700 mt-2">המטרה: {data.business_state.goal}</div>
              </div>
            )}
            <JourneyTimeline 
              completedMilestones={completedMilestones}
              currentMilestone={currentMilestone}
              milestones={activeMilestones}
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
           {nextStep && (
             <>
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
             </>
           )}
           
           {!nextStep && (
             <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 text-center py-12">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Target className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">אין צעד הבא מוגדר</h3>
               <p className="text-gray-500">התחל על ידי הגדרת מטרות חדשות או עדכון הסטטוס העסקי שלך.</p>
             </div>
           )}
         </div>
      </div>

      {/* Goals Button - Mobile Only - Bottom */}
      <div className="lg:hidden">
        <GoalsFloatingButton 
          onNavigate={onNavigate}
          onAddGoal={() => {
            onNavigate('goals', { openAddGoal: true });
          }}
        />
      </div>

      <Dialog open={showQuestionnaire} onOpenChange={setShowQuestionnaire}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-0 bg-white border-0 shadow-2xl rounded-2xl">
          <BusinessJourneyQuestionnaire 
            onComplete={handleQuestionnaireComplete}
            userId={data?.id}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
    </>
  );
}