import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import JourneyTimeline from '../progress/JourneyTimeline';
import StepImportancePanel from '../progress/StepImportancePanel';
import QuickStatsBar from '../progress/QuickStatsBar';
import { ProgressTabHelp } from '../help/ContextualHelp';
import GoalsFloatingButton from '../GoalsFloatingButton';
import { Sparkles, Target, ArrowLeft, Rocket, RotateCcw, Check, Lock, Circle, ChevronDown, RefreshCcw, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import BusinessJourneyQuestionnaire from '../progress/BusinessJourneyQuestionnaire';
import DynamicTaskQuestionnaire from '../progress/DynamicTaskQuestionnaire';
import GoalTemplatesFixed, { GOAL_TEMPLATES } from '../goals/GoalTemplatesFixed';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import HeroGoal from '../goals/HeroGoal';
import SecondaryGoals from '../goals/SecondaryGoals';
import RecommendedGoalCard from '../goals/RecommendedGoalCard';
import GoalSelectionConfirmation from '../goals/GoalSelectionConfirmation';
import { useAppAuth } from '@/components/hooks/useAppAuth';
import { useGoals, useUpdateGoal, useDeleteGoal, useCreateGoal, useGenerateGoalPlan } from '@/components/hooks/useGoals';
import { useBusinessJourney, JOURNEY_QUERY_KEY } from '@/components/hooks/useBusinessJourney';
import { queryKeys } from '@/components/hooks/useQueryKeys';

function NextStepCard({ step, onWhyClick, onAction, onNavigate }) {
  if (!step) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-green-700" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{step.title}</h3>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{step.description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onAction}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10 rounded-xl text-sm font-semibold"
        >
          <Play className="w-4 h-4 ml-1.5" />
          התחל עכשיו
        </Button>
        {onWhyClick && (
          <Button variant="outline" onClick={onWhyClick} className="h-10 rounded-xl text-sm">
            למה זה חשוב?
          </Button>
        )}
      </div>
    </div>
  );
}

const MILESTONES = [
  {
    id: 'registration',
    title: 'רישום עוסק פטור',
    description: 'פתיחת תיק במס הכנסה וביטוח לאומי',
    order: 1
  },
  {
    id: 'first_invoice',
    title: 'חשבונית ראשונה',
    description: 'יצירה והנפקה של החשבונית הראשונה שלך',
    order: 2
  },
  {
    id: 'first_client_payment',
    title: 'תשלום ראשון מלקוח',
    description: 'קבלת התשלום הראשון על העבודה שלך',
    order: 3
  },
  {
    id: 'monthly_report',
    title: 'דיווח חודשי ראשון',
    description: 'השלמת דיווח חודשי ראשון לרשויות',
    order: 4
  },
  {
    id: 'steady_income',
    title: 'הכנסה קבועה',
    description: '3 חודשים רצופים עם הכנסה',
    order: 5
  },
  {
    id: 'annual_report',
    title: 'דוח שנתי ראשון',
    description: 'השלמת דוח שנתי ראשון לרשויות המס',
    order: 6
  }
];

export default function ProgressTab({ data, onNavigate, user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Hooks
  const { data: currentUserData } = useAppAuth();
  const { data: activeJourney } = useBusinessJourney(user?.id);
  
  // Fetch all goals and filter locally (consistent with GoalsTab)
  const { data: allGoals = [] } = useGoals(user?.id ? { user_id: user.id } : {});
  
  const activeGoals = React.useMemo(() => {
    return allGoals.filter(g => ['active', 'selected', 'completed'].includes(g.status));
  }, [allGoals]);

  // Mutations
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const createGoalMutation = useCreateGoal();
  const generateGoalPlanMutation = useGenerateGoalPlan();

  // Subscribe to goal changes
  React.useEffect(() => {
    const unsubscribe = base44.entities.UserGoal.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    });
    return () => unsubscribe();
  }, [queryClient]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [activeTaskQuestionnaire, setActiveTaskQuestionnaire] = useState(null);
  
  // State for Goal Creation specific to Step
  const [showGoalCreation, setShowGoalCreation] = useState(false);
  const [goalTemplateForStep, setGoalTemplateForStep] = useState(null);
  const [showGoalSelectionConfirmation, setShowGoalSelectionConfirmation] = useState(false);

  // Use dynamic tasks from Active Journey if available
  // Fallback to User entity (legacy), then to Default Milestones
  const activeMilestones = activeJourney?.tasks?.length > 0 
    ? activeJourney.tasks
    : (currentUserData?.client_tasks?.length > 0 ? currentUserData.client_tasks : MILESTONES);

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
    // Only count truly active goals for the stats display
    activeGoals: activeGoals?.filter(g => g.status === 'active').length.toString() || '0',
    pendingInvoices: '0',
    urgentActions: '0'
  };

  const handleGoalStatusChange = async (goal, newStatus) => {
      await updateGoalMutation.mutateAsync({ id: goal.id, status: newStatus });
  };

  const handleGoalEdit = (goal) => {
      onNavigate('goals', { editGoal: goal });
  };

  const handleGoalDelete = async (goalId) => {
      if (confirm('האם אתה בטוח שברצונך למחוק מטרה זו?')) {
          await deleteGoalMutation.mutateAsync(goalId);
      }
  };

  const primaryGoal = activeGoals.find(g => g.isPrimary) || activeGoals[0];
  const secondaryGoalsList = activeGoals.filter(g => g.id !== primaryGoal?.id);

  const isJourneyCompleted = currentUserData?.business_journey_completed;

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(false);

  const scrollToWhyMatters = () => {
    setWhyExpanded(true);
  };

  const handleQuestionnaireComplete = async () => {
    setShowQuestionnaire(false);
    await queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
    await queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
  };

  const handleResetJourney = async () => {
    if (!confirm('האם אתה בטוח שברצונך לאפס את המסע העסקי ולהתחיל מחדש?')) {
      return;
    }
    
    try {
      await base44.functions.invoke('resetBusinessJourney');
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
      await queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      toast.success('המסע אופס בהצלחה!');
    } catch (error) {
      console.error('Error resetting journey:', error);
      toast.error('אירעה שגיאה באיפוס המסע');
    }
  };

  // Smart mapping function
  const getGoalTemplateForTask = (task) => {
    // Basic structure for custom template
    const baseTemplate = {
      id: `task_goal_${task.id}`,
      name: task.title,
      icon: Target,
      color: 'from-blue-500 to-indigo-600',
      description: task.description || 'המטרה הבאה שלך במסע העסקי',
      defaultTitle: task.title,
      examples: [
        { title: `להשלים את "${task.title}" בהצלחה` },
        { title: `לסיים את "${task.title}" עד סוף החודש` }
      ],
      questions: [
        { id: 'blocker', label: 'מה האתגר העיקרי שמונע ממך לסיים את זה?', placeholder: 'לדוגמה: חוסר זמן / ידע...' },
        { id: 'success_criteria', label: 'איך תדע שהמשימה הושלמה בהצלחה?', placeholder: 'לדוגמה: כשהלקוח ישלם...' }
      ]
    };

    // Specific overrides based on TASK TYPE (New Architecture)
    // Fallback to keywords for legacy support
    const type = task.task_type;
    const title = task.title || '';

    if (type === 'CUSTOMER_ACQUISITION' || (!type && (title.includes('לקוח') || title.includes('ראשון')))) {
       baseTemplate.name = 'גיוס הלקוח הראשון';
       baseTemplate.icon = Sparkles;
       baseTemplate.questions = [
         { id: 'who', label: 'מי הלקוח האידיאלי הראשון שלך?', placeholder: 'לדוגמה: חברים / משפחה...' },
         { id: 'offer', label: 'מה השירות שאתה הולך להציע לו?', placeholder: 'לדוגמה: ייעוץ במחיר מוזל...' }
       ];
    } 
    else if (type === 'SETUP' || (!type && (title.includes('עוסק פטור') || title.includes('תיק')))) {
       baseTemplate.name = 'פתיחת תיק עוסק פטור';
       baseTemplate.questions = [
         { id: 'bureaucracy', label: 'האם כבר נרשמת באתר רשות המסים?', placeholder: 'כן / לא / בתהליך' },
         { id: 'date', label: 'מתי אתה מתכנן לסיים את הרישום?', placeholder: 'לדוגמה: יום ראשון הקרוב' }
       ];
    } 
    else if (type === 'STRATEGY' || (!type && (title.includes('רעיון') || title.includes('גיבוש')))) {
       baseTemplate.name = 'גיבוש הרעיון העסקי';
       baseTemplate.questions = [
         { id: 'core_idea', label: 'במשפט אחד, מה הרעיון?', placeholder: 'לדוגמה: עסק לצילום אירועים...' },
         { id: 'validation', label: 'איך תבדוק אם אנשים רוצים את זה?', placeholder: 'לדוגמה: אשאל 5 חברים...' }
       ];
    }
    else if (type === 'MOMENTUM') {
       baseTemplate.name = 'משימת מומנטום: ' + task.title;
       baseTemplate.icon = Rocket; // Highlighted icon
       baseTemplate.color = 'from-orange-500 to-red-600'; // Highlighted color
       baseTemplate.questions = [
         { id: 'quick_win', label: 'האם ביצעת את הפעולה המהירה?', placeholder: 'כן, שלחתי / כתבתי / עשיתי...' },
         { id: 'feeling', label: 'איך ההרגשה לעשות צעד ראשון?', placeholder: 'מעולה / מלחיץ...' }
       ];
    }

    return baseTemplate;
  };

  const handleStartNextStep = () => {
    if (!nextStep) return;
    const template = getGoalTemplateForTask(nextStep);
    setGoalTemplateForStep(template);
    setShowGoalCreation(true);
  };

  const handleStartTask = (task) => {
    if (!task) return;
    const template = getGoalTemplateForTask(task);
    setGoalTemplateForStep(template);
    setShowGoalCreation(true);
  };

  const handleGoalCreated = async (newGoal) => {
    // Close dialog IMMEDIATELY
    setShowGoalCreation(false);
    setGoalTemplateForStep(null);
    setShowGoalSelectionConfirmation(true);

    try {
      // Create goal in DB immediately WITHOUT waiting for AI
      // Use hook
      const createdGoal = await createGoalMutation.mutateAsync({
        ...newGoal,
        user_id: user?.id,
        status: 'active',
        plan_summary: 'בונה תוכנית...',
        tasks: []
      });

      // Generate AI plan in background without blocking
      setTimeout(async () => {
        try {
          const activeGoalsCount = activeGoals?.filter(g => g.status === 'active').length || 0;

          // Call backend function via direct invoke (because this specific flow handles existing ID and complex context, 
          // and useGenerateGoalPlan hook might be too simple/different signature. 
          // Or we can use the hook if it supports passing goalId.
          // The current hook useGenerateGoalPlan expects goalData and returns data.
          // I'll stick to direct invoke here for the specific "background update" pattern,
          // BUT invalidate queries at the end.
          
          await base44.functions.invoke('generateGoalPlan', { 
            goalId: createdGoal.id,
            title: createdGoal.title,
            goalData: {
              ...newGoal,
              id: createdGoal.id,
              _context: {
                activeGoalsCount,
                goalPosition: activeGoalsCount + 1,
                businessState: currentUserData?.business_state,
                businessJourneyAnswers: currentUserData?.business_journey_answers
              }
            }
          });

          // Invalidate
          queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.user.me });
        } catch (error) {
          console.error("Error generating plan:", error);
        }
      }, 100);

    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  // Check if user has recommended goal (First task of journey)
  // We prioritize the ACTUAL first task of the journey over the generic recommended_goal
  const firstJourneyTask = currentUserData?.client_tasks?.[0];
  
  // Define the "Recommended Goal" as the current journey step
  const recommendedGoal = firstJourneyTask ? {
    goal_id: 'journey_step_' + firstJourneyTask.id,
    title: firstJourneyTask.title,
    description: firstJourneyTask.description,
    reason: currentUserData?.business_state?.description || 'זה הצעד הראשון בתוכנית הצמיחה שלך',
    isJourneyTask: true,
    originalTask: firstJourneyTask
  } : null;

  // Check if this specific journey task has been converted to a goal already
  // We check if any active goal has the same title or is linked to this task ID
  const hasCreatedRecommendedGoal = activeGoals?.some(g => 
    g.title === firstJourneyTask?.title || 
    g.category === `task_${firstJourneyTask?.id}` ||
    g.category === `task_goal_${firstJourneyTask?.id}`
  );

  // Check if there are ANY active goals currently
  const hasAnyActiveGoal = activeGoals?.some(g => g.status === 'active');

  // Determine if Next Step Card should be shown
  const isNextStepSameAsRecommended = recommendedGoal && nextStep && recommendedGoal.originalTask?.id === nextStep.id;
  const shouldShowNextStep = nextStep && (
      !recommendedGoal || 
      (hasCreatedRecommendedGoal && !isNextStepSameAsRecommended)
  );

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

      {/* Journey Timeline - Mobile */}
      <div className="lg:hidden mb-3">
        <JourneyTimeline onStartTask={handleStartTask} onResetJourney={handleResetJourney} />
      </div>

      {/* Recommended Goal - Mobile */}
      {recommendedGoal && !hasCreatedRecommendedGoal && !hasAnyActiveGoal && (
        <div className="lg:hidden mb-3">
           <RecommendedGoalCard 
             recommendedGoal={recommendedGoal}
             onStart={() => {
                if (recommendedGoal.isJourneyTask) {
                   const template = getGoalTemplateForTask(recommendedGoal.originalTask);
                   setGoalTemplateForStep(template);
                   setShowGoalCreation(true);
                } else {
                   const template = GOAL_TEMPLATES.find(t => t.id === recommendedGoal.goal_id);
                   setGoalTemplateForStep(template);
                   setShowGoalCreation(true);
                }
             }}
             onNavigate={onNavigate}
           />
        </div>
      )}

      {/* Goal Selection Confirmation - Mobile */}
      {showGoalSelectionConfirmation && (
        <div className="lg:hidden mb-3">
          <GoalSelectionConfirmation onContinue={() => setShowGoalSelectionConfirmation(false)} />
        </div>
      )}

      {/* Next Step Card - Mobile - Hide if shown as Recommended Goal */}
      {!showGoalSelectionConfirmation && shouldShowNextStep && (
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
                onAction={handleStartNextStep}
                onNavigate={onNavigate}
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
        {/* Journey Timeline - Desktop */}
        <div className="lg:col-span-6">
           <JourneyTimeline onStartTask={handleStartTask} onResetJourney={handleResetJourney} />
        </div>

        {/* Right Column - Next Step & Actions 50% */}
         <div className="lg:col-span-6 space-y-4">
           {/* Stats - Desktop Only */}
           <div className="hidden lg:block">
             <QuickStatsBar stats={quickStats} />
           </div>

           {/* Recommended Goal - Desktop */}
           {recommendedGoal && !hasCreatedRecommendedGoal && !hasAnyActiveGoal && (
             <RecommendedGoalCard 
               recommendedGoal={recommendedGoal}
               onStart={() => {
                  if (recommendedGoal.isJourneyTask) {
                     const template = getGoalTemplateForTask(recommendedGoal.originalTask);
                     setGoalTemplateForStep(template);
                     setShowGoalCreation(true);
                  } else {
                     const template = GOAL_TEMPLATES.find(t => t.id === recommendedGoal.goal_id);
                     setGoalTemplateForStep(template);
                     setShowGoalCreation(true);
                  }
               }}
               onNavigate={onNavigate}
             />
           )}

           {/* Goal Selection Confirmation - Desktop */}
           {showGoalSelectionConfirmation && (
              <GoalSelectionConfirmation onContinue={() => setShowGoalSelectionConfirmation(false)} />
           )}

           {/* Next Step - Hide if shown as Recommended Goal */}
           {!showGoalSelectionConfirmation && shouldShowNextStep && (
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
                    onAction={handleStartNextStep}
                    onNavigate={onNavigate}
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

           {/* Active Goals Section - Desktop Fixed Open */}
           {activeGoals.length > 0 && (
             <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
               <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                 <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded flex items-center justify-center">
                     <Target className="w-4 h-4 text-white" />
                   </div>
                   המטרות שלי
                 </h2>
                 <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onNavigate('goals')}
                    className="text-purple-600 hover:bg-purple-50 text-xs font-medium"
                 >
                    לכל המטרות
                    <ArrowLeft className="w-3 h-3 mr-1" />
                 </Button>
               </div>
               
               <div className="p-5 space-y-4">
                   {primaryGoal && (
                      <HeroGoal 
                        goal={primaryGoal} 
                        onStatusChange={handleGoalStatusChange}
                        onEdit={handleGoalEdit}
                        onDelete={handleGoalDelete}
                      />
                   )}
                   {secondaryGoalsList.length > 0 && (
                      <SecondaryGoals 
                        goals={secondaryGoalsList}
                        onStatusChange={handleGoalStatusChange}
                        onEdit={handleGoalEdit}
                        onDelete={handleGoalDelete}
                        showHeader={false}
                      />
                   )}
               </div>
             </div>
           )}
         </div>
      </div>



      <Dialog open={showQuestionnaire} onOpenChange={setShowQuestionnaire}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:p-0 bg-white border-0 shadow-2xl rounded-2xl">
          <BusinessJourneyQuestionnaire 
            onComplete={handleQuestionnaireComplete}
            userId={currentUserData?.id}
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

      {/* Specific Goal Creation Dialog for Current Step */}
      {showGoalCreation && goalTemplateForStep && (
        <GoalTemplatesFixed
          user={user}
          onCreateGoal={handleGoalCreated}
          onClose={() => setShowGoalCreation(false)}
          initialTemplate={goalTemplateForStep}
        />
      )}
    </motion.div>
    </>
  );
}