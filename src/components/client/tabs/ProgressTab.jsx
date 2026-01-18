import React, { useState } from 'react';
import { motion } from 'framer-motion';
import JourneyTimeline, { MILESTONES } from '../progress/JourneyTimeline';
import NextStepCard from '../progress/NextStepCard';
import StepImportancePanel from '../progress/StepImportancePanel';
import QuickStatsBar from '../progress/QuickStatsBar';
import AchievementsSystem from '../progress/AchievementsSystem';
import { ProgressTabHelp } from '../help/ContextualHelp';
import GoalsFloatingButton from '../GoalsFloatingButton';
import { Sparkles, Target, ArrowLeft, Rocket, RotateCcw, Check, Lock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import BusinessJourneyQuestionnaire from '../progress/BusinessJourneyQuestionnaire';
import DynamicTaskQuestionnaire from '../progress/DynamicTaskQuestionnaire';
import { useQueryClient } from '@tanstack/react-query';

export default function ProgressTab({ data, onNavigate }) {
  const queryClient = useQueryClient();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [activeTaskQuestionnaire, setActiveTaskQuestionnaire] = useState(null);
  
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
          className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">מסע העסק</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuestionnaire(true);
              }}
              className="mr-1 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
              title="התחל שאלון מחדש"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <motion.div
            animate={{ rotate: isMobileExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            ▼
          </motion.div>
        </button>

        <motion.div
          initial={false}
          animate={{ height: isMobileExpanded ? 'auto' : 0, opacity: isMobileExpanded ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pt-3 space-y-3 pb-1">
            {activeMilestones.map((milestone) => {
              let status = 'locked';
              if (milestone.status) {
                 if (milestone.status === 'completed') status = 'completed';
                 else if (milestone.status === 'in_progress') status = 'current';
              } else {
                 status = completedMilestones.includes(milestone.id) ? 'completed' 
                  : milestone.id === currentMilestone ? 'current' : 'locked';
              }

              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';

              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "relative overflow-hidden rounded-xl border p-4 transition-all duration-200",
                    isCurrent 
                      ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-100" 
                      : isCompleted 
                        ? "bg-white border-green-200" 
                        : "bg-white border-gray-100 opacity-70 grayscale-[0.5]"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-bold text-base leading-tight",
                        isCurrent ? "text-blue-900" : "text-gray-600"
                      )}>
                        {milestone.title}
                      </h3>
                    </div>
                    
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-colors",
                      isCurrent ? "bg-blue-500 text-white" :
                      isCompleted ? "bg-green-500 text-white" :
                      "bg-gray-100 text-gray-400"
                    )}>
                      {isCompleted ? <Check className="w-5 h-5" /> : 
                       isCurrent ? <Circle className="w-5 h-5 fill-current opacity-50" /> : 
                       <Lock className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
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
              <NextStepCard 
                step={nextStep} 
                onWhyClick={scrollToWhyMatters} 
                onAction={() => setActiveTaskQuestionnaire(nextStep)}
              />
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
                 <NextStepCard 
                    step={nextStep} 
                    onAction={() => setActiveTaskQuestionnaire(nextStep)}
                 />
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

      <Dialog open={!!activeTaskQuestionnaire} onOpenChange={(open) => !open && setActiveTaskQuestionnaire(null)}>
        <DialogContent className="max-w-md p-0 bg-transparent border-0 shadow-2xl">
          {activeTaskQuestionnaire && (
            <DynamicTaskQuestionnaire
              key={activeTaskQuestionnaire.id || 'dynamic-task-q'}
              task={activeTaskQuestionnaire}
              onComplete={() => {
                setActiveTaskQuestionnaire(null);
                // Optionally trigger celebration or refresh
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
    </>
  );
}