import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import HeroGoal from '../goals/HeroGoal';
import FirstGoalFlow from '../goals/FirstGoalFlow';
import SecondaryGoals from '../goals/SecondaryGoals';
import BusinessRoadmap from '../goals/BusinessRoadmap';
import GoalTemplates, { GOAL_TEMPLATES } from '../goals/GoalTemplatesFixed';
import LimitUpgradeDialog from '../goals/LimitUpgradeDialog';
import SimpleDialog from '../SimpleDialog';
import { Plus, Sparkles, Target, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Hooks
import { useGoals, useUpdateGoal, useDeleteGoal, useGenerateGoalPlan, useCreateGoal } from '@/components/hooks/useGoals';

export default function GoalsTab({ user, data, openAddGoal = false }) {
  const queryClient = useQueryClient();
  
  // Mutations
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const createGoalMutation = useCreateGoal();
  const generateGoalPlanMutation = useGenerateGoalPlan();

  // Query - Fetch goals using hook
  // We use useMemo to ensure filters object reference is stable if needed, though useGoals handles it
  const { data: fetchedGoals = [], isLoading } = useGoals(user?.id ? { user_id: user.id } : {});

  // Clean, memoized goals list from Server State
  const goals = useMemo(() => {
    return fetchedGoals.filter(g => g.title && g.title.trim() !== '')
      .sort((a, b) => {
        // Sort optimistic items to top if needed, or by creation date
        if (a.isOptimistic && !b.isOptimistic) return -1;
        if (!a.isOptimistic && b.isOptimistic) return 1;
        return new Date(b.created_date || 0) - new Date(a.created_date || 0);
      });
  }, [fetchedGoals]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const processedOpenAddGoal = useRef(false);

  const goalsLoaded = !isLoading;

  // Check for recommended goal (First task of journey)
  const firstJourneyTask = user?.client_tasks?.[0];
  
  // Define the "Recommended Goal" as the current journey step
  const recommendedGoal = useMemo(() => firstJourneyTask ? {
    goal_id: 'journey_step_' + firstJourneyTask.id,
    name: firstJourneyTask.title,
    title: firstJourneyTask.title,
    description: firstJourneyTask.description,
    reason: user?.business_state?.description || 'זה הצעד הראשון בתוכנית הצמיחה שלך',
    icon: Target,
    color: 'from-purple-500 to-indigo-600',
    isJourneyTask: true,
    originalTask: firstJourneyTask
  } : null, [firstJourneyTask, user?.business_state?.description]);

  // Check if this specific journey task has been converted to a goal already
  const hasStartedRecommendedGoal = useMemo(() => goals.some(g => 
    g.title === firstJourneyTask?.title || 
    g.category === `task_${firstJourneyTask?.id}` ||
    g.category === `task_goal_${firstJourneyTask?.id}`
  ), [goals, firstJourneyTask]);

  // Check if there are ANY active goals currently
  const hasAnyActiveGoal = useMemo(() => goals.some(g => ['active', 'in_progress', 'selected'].includes(g.status)), [goals]);
  
  // Only show recommendation if goals are loaded and no active goals exist
  const resolvedRecommendedTemplate = goalsLoaded && recommendedGoal && !hasStartedRecommendedGoal && !hasAnyActiveGoal
    ? recommendedGoal
    : null;

  // Handle openAddGoal prop once goals are loaded
  useEffect(() => {
    if (openAddGoal && goalsLoaded && !processedOpenAddGoal.current) {
      processedOpenAddGoal.current = true;
      handleShowAddGoal();
    }
  }, [openAddGoal, goalsLoaded]);

  // Reset processed ref if openAddGoal becomes false (user navigated away and back)
  useEffect(() => {
    if (!openAddGoal) {
      processedOpenAddGoal.current = false;
    }
  }, [openAddGoal]);

  const handleShowAddGoal = () => {
    // Log override if recommendation exists and not taken
    if (recommendedGoal && !hasStartedRecommendedGoal) {
       console.log('User overrode recommendation', { 
         recommended: recommendedGoal.goal_id, 
         user_id: user.id 
       });
    }

    const limit = user?.goals_limit;
    
    // Check if unlimited (Full plan has null)
    const isUnlimited = limit === null;
    
    // If not unlimited, check if reached limit
    if (!isUnlimited) {
      const actualLimit = limit || 1; // Default to 1 if undefined
      const activeGoalsCount = goals.filter(g => ['active', 'in_progress', 'selected'].includes(g.status)).length;
      if (activeGoalsCount >= actualLimit) {
        setShowUpgradeDialog(true);
        return;
      }
    }
    
    setShowAddGoal(true);
  };

  const handleStartRecommended = () => {
    // Check limit before starting
    const limit = user?.goals_limit;
    const isUnlimited = limit === null;
    if (!isUnlimited) {
      const actualLimit = limit || 1;
      const activeGoalsCount = goals.filter(g => ['active', 'in_progress', 'selected'].includes(g.status)).length;
      
      if (activeGoalsCount >= actualLimit) {
        setShowUpgradeDialog(true);
        return;
      }
    }

    if (resolvedRecommendedTemplate) {
       setEditingGoal(null);
       
       if (resolvedRecommendedTemplate.isJourneyTask) {
          // Create a template object from the task
          const taskTemplate = {
            id: `task_goal_${resolvedRecommendedTemplate.originalTask.id}`,
            name: resolvedRecommendedTemplate.name,
            icon: Target,
            color: 'from-purple-500 to-indigo-600',
            description: resolvedRecommendedTemplate.description,
            defaultTitle: resolvedRecommendedTemplate.name,
            examples: [
              { title: `להשלים את "${resolvedRecommendedTemplate.name}" בהצלחה` }
            ],
            questions: [
              { id: 'blocker', label: 'מה האתגר העיקרי שמונע ממך לסיים את זה?', placeholder: 'לדוגמה: חוסר זמן / ידע...' },
              { id: 'success_criteria', label: 'איך תדע שהמשימה הושלמה בהצלחה?', placeholder: 'לדוגמה: כשהלקוח ישלם...' }
            ]
          };
          
          setSpecificTemplate(taskTemplate);
       }
       
       setShowAddGoal(true);
    }
  };
  
  const [specificTemplate, setSpecificTemplate] = useState(null);

  const handleSelectRoadmapStep = (task) => {
      // Check if already active
      const isActive = goals.some(g => 
        g.title === task.title || 
        g.category === `task_${task.id}` ||
        g.category === `task_goal_${task.id}`
      );

      if (isActive) return;

      // Check limit
      const limit = user?.goals_limit;
      const isUnlimited = limit === null;
      if (!isUnlimited) {
         const actualLimit = limit || 1;
         const activeGoalsCount = goals.filter(g => ['active', 'in_progress', 'selected'].includes(g.status)).length;

         if (activeGoalsCount >= actualLimit) {
           setShowUpgradeDialog(true);
           return;
         }
      }

      const taskTemplate = {
        id: `task_goal_${task.id}`,
        name: task.title,
        icon: Target,
        color: 'from-blue-500 to-indigo-600',
        description: task.description,
        defaultTitle: task.title,
        examples: [
          { title: `להשלים את "${task.title}" בהצלחה` }
        ],
        questions: [
          { id: 'blocker', label: 'מה האתגר העיקרי שמונע ממך לסיים את זה?', placeholder: 'לדוגמה: חוסר זמן / ידע...' },
          { id: 'success_criteria', label: 'איך תדע שהמשימה הושלמה בהצלחה?', placeholder: 'לדוגמה: כשהלקוח ישלם...' }
        ]
      };

      setSpecificTemplate(taskTemplate);
      setShowAddGoal(true);
  };

  // Find first goal with is_first_goal flag OR just the first goal
  const firstGoalWithMentorFlow = goals.find(g => g.is_first_goal);
  const heroGoal = firstGoalWithMentorFlow || goals[0];
  const secondaryGoals = goals.filter(g => g.id !== heroGoal?.id);

  const handleStatusChange = async (goal, nextStatus) => {
    try {
      await updateGoalMutation.mutateAsync({ id: goal.id, status: nextStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleEditGoal = (goal) => {
     setEditingGoal(goal);
     setShowAddGoal(true);
   };

  const handleDeleteGoal = async (goalId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המטרה הזו?')) {
      return;
    }

    try {
      await deleteGoalMutation.mutateAsync(goalId);
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const handleCreateGoal = async (newGoal, isEditing = false) => {
    try {
      if (isEditing) {
         setIsCreatingGoal(true);
         // Use update hook
         await updateGoalMutation.mutateAsync(newGoal);
         
         setShowAddGoal(false);
         setEditingGoal(null);
         setIsCreatingGoal(false);
      } else {
         // Check if this is the FIRST goal ever for this user
         const isFirstGoalEver = goals.length === 0 && !goals.some(g => g.is_first_goal);
         
         const goalToCreate = { 
           ...newGoal, 
           user_id: user.id,
           plan_summary: 'בונה את תוכנית הפעולה שלך...', // Initial optimistic state
           is_first_goal: isFirstGoalEver, // סימון אוטומטי של מטרה ראשונה
           flow_step: isFirstGoalEver ? 1 : undefined // אם זו המטרה הראשונה, נתחיל את הפלואו
         };

         // Show creating state in modal only
         setIsCreatingGoal(true);

         // Close dialog immediately - optimistic update will show the goal in the list
         setShowAddGoal(false);
         setEditingGoal(null);

         // Create the goal (Hook handles optimistic update + server create + plan generation if needed)
         const createdGoal = await createGoalMutation.mutateAsync(goalToCreate);
         
         // Trigger AI Plan generation in background (if it wasn't part of create logic)
         // Note: The useCreateGoal hook handles invalidation, but we might want to trigger the plan generation separately 
         // if it's a heavy operation that shouldn't block creation.
         // However, relying on the hook sequence is safer.
         
         if (createdGoal?.id && !createdGoal.id.toString().startsWith('temp_')) {
            generateGoalPlanMutation.mutate(goalToCreate);
         }
         
         setIsCreatingGoal(false);
      }
    } catch (error) {
       console.error("Error saving goal:", error);
       setIsCreatingGoal(false);
    }
  };

  return (
    <>
      {showAddGoal && (
        <GoalTemplates
        user={user}
        onCreateGoal={handleCreateGoal}
        onClose={() => {
          setShowAddGoal(false);
          setEditingGoal(null);
          setSpecificTemplate(null);
        }}
        hasPrimaryGoal={goals.some(g => g.isPrimary && g.id !== editingGoal?.id)}
        editingGoal={editingGoal}
        initialTemplate={specificTemplate}
        existingGoals={goals}
        />
      )}

      <LimitUpgradeDialog 
        isOpen={showUpgradeDialog} 
        onClose={() => setShowUpgradeDialog(false)} 
        limit={user?.goals_limit || 1}
      />

      <div className="container mx-auto max-w-4xl p-0 md:p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-8"
        >
          
          {/* Header Section */}
          <div className="flex items-end justify-between px-1 mb-6">
             <div>
               <h1 className="text-2xl font-bold text-gray-900">המטרות שלי בפועל</h1>
               <p className="text-gray-500 text-sm mt-1">
                 {goals.length > 0 
                   ? `יש לך ${goals.length} מטרות פעילות שאתה עובד עליהן כרגע.` 
                   : 'כאן יופיעו המטרות הפעילות שבחרת להתמקד בהן.'}
               </p>
             </div>
             <Button 
                onClick={handleShowAddGoal}
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all rounded-full px-4"
              >
                <Plus className="w-4 h-4 ml-2" />
                מטרה חדשה
              </Button>
          </div>

          {/* Recommended Goal - Special Section */}
          {resolvedRecommendedTemplate && !hasStartedRecommendedGoal && (
            <div className="mb-6">
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm relative overflow-hidden">
                 {/* Header Tag */}
                 <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                       <Sparkles className="w-3.5 h-3.5" />
                       המלצה אישית
                    </span>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex-shrink-0">
                       <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${resolvedRecommendedTemplate.color} flex items-center justify-center shadow-sm`}>
                          <resolvedRecommendedTemplate.icon className="w-7 h-7 text-white" />
                       </div>
                    </div>

                    <div className="flex-1">
                       <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                          {resolvedRecommendedTemplate.name}
                       </h3>
                       <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {resolvedRecommendedTemplate.description}
                       </p>

                       {/* Why - Minimal */}
                       <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-4">
                          <p className="text-xs text-gray-600">
                             <span className="font-bold text-purple-700 block mb-1">למה עכשיו?</span>
                             {resolvedRecommendedTemplate.reason}
                          </p>
                       </div>

                       <Button 
                         onClick={handleStartRecommended}
                         className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white h-10 px-6 rounded-lg font-medium text-sm shadow-sm"
                       >
                         <Plus className="w-4 h-4 ml-2" />
                         התחל מטרה זו
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Hero Goal - with First Goal Mentor Flow */}
          {heroGoal && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">הפוקוס העיקרי שלך</p>
              </div>
              {heroGoal.is_first_goal && heroGoal.flow_step ? (
                <FirstGoalFlow 
                  goal={heroGoal}
                  onComplete={() => {
                    queryClient.invalidateQueries({ queryKey: ['goals'] });
                  }}
                />
              ) : (
                <HeroGoal 
                  goal={heroGoal}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                  isLoading={heroGoal.isLoading || heroGoal.isOptimistic}
                />
              )}
            </div>
          )}

          {/* Secondary Goals */}
          {secondaryGoals.length > 0 && (
            <SecondaryGoals 
              goals={secondaryGoals}
              onStatusChange={handleStatusChange}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          )}

          {/* Business Roadmap - Shows the deep process (Minimalist at bottom) */}
          {user?.business_journey_completed && user?.client_tasks && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <BusinessRoadmap 
                 user={user} 
                 tasks={user.client_tasks} 
                 onSelectStep={handleSelectRoadmapStep}
                 activeGoals={goals}
                 onShowUpgrade={() => setShowUpgradeDialog(true)}
                 goalLimit={user?.goals_limit}
              />
            </div>
          )}

          {/* Empty State - Only if no roadmap either, or simply simplified */}
          {goals.length === 0 && !user?.business_journey_completed && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">אין מטרות עדיין</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">מטרות הן המצפן של העסק. בוא נגדיר את היעד הבא שלך ונתחיל לנוע לעברו.</p>
              <Button onClick={handleShowAddGoal} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                <Plus className="w-5 h-5 ml-2" />
                צור מטרה ראשונה
              </Button>
            </motion.div>
          )}

        </motion.div>
      </div>
    </>
  );
}