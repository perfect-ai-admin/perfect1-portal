import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HeroGoal from '../goals/HeroGoal';
import SecondaryGoals from '../goals/SecondaryGoals';
import GoalTemplates, { GOAL_TEMPLATES } from '../goals/GoalTemplatesFixed';
// GoalsCatalog removed
import LimitUpgradeDialog from '../goals/LimitUpgradeDialog';
import { Plus, Sparkles, Target, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';

export default function GoalsTab({ user, data, openAddGoal = false }) {
  const queryClient = useQueryClient();
  const [goals, setGoals] = useState([]);
  const [userGoals, setUserGoals] = useState([]);
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const goalsTopRef = useRef(null);
  const processedOpenAddGoal = useRef(false);

  // Check for recommended goal (First task of journey)
  const firstJourneyTask = user?.client_tasks?.[0];
  
  // Define the "Recommended Goal" as the current journey step
  const recommendedGoal = firstJourneyTask ? {
    goal_id: 'journey_step_' + firstJourneyTask.id,
    name: firstJourneyTask.title,
    title: firstJourneyTask.title,
    description: firstJourneyTask.description,
    reason: user?.business_state?.description || 'זה הצעד הראשון בתוכנית הצמיחה שלך',
    icon: Target,
    color: 'from-purple-500 to-indigo-600',
    isJourneyTask: true,
    originalTask: firstJourneyTask
  } : null;

  // Check if this specific journey task has been converted to a goal already
  const hasStartedRecommendedGoal = userGoals.some(g => 
    g.title === firstJourneyTask?.title || 
    g.category === `task_${firstJourneyTask?.id}`
  );
  
  const resolvedRecommendedTemplate = recommendedGoal && !hasStartedRecommendedGoal
    ? recommendedGoal
    : null;


  useEffect(() => {
    if (user?.id) {
      loadUserGoals();
    }
  }, [user?.id]);

  const loadUserGoals = async () => {
    try {
      const ug = await base44.entities.UserGoal.filter({ user_id: user.id });
      // Filter out invalid goals (no title)
      const validGoals = ug.filter(g => g.title && g.title.trim() !== '');
      setUserGoals(validGoals);
      setGoals(validGoals);
      setGoalsLoaded(true);
    } catch (error) {
      console.error('Error loading user goals:', error);
      setGoalsLoaded(true);
    }
  };

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
       // Log to analytics or console as requested
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
      if (goals.length >= actualLimit) {
        setShowUpgradeDialog(true);
        return;
      }
    }
    
    setShowAddGoal(true);
  };

  const handleStartRecommended = () => {
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

  const heroGoal = goals[0];
  const secondaryGoals = goals.slice(1);

  const handleStatusChange = async (goal, nextStatus) => {
    // Optimistic update
    const previousGoals = goals;
    setGoals(prev => prev.map(g => 
      g.id === goal.id 
        ? { ...g, status: nextStatus }
        : g
    ));

    try {
      await base44.entities.UserGoal.update(goal.id, { status: nextStatus });
      queryClient.invalidateQueries({ queryKey: ['activeGoals'] });
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert if failed
      setGoals(previousGoals);
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

    // Optimistic update
    const previousGoals = goals;
    setGoals(prev => prev.filter(g => g.id !== goalId));

    try {
      await base44.entities.UserGoal.delete(goalId);
      // Refresh both local and active goals
      await loadUserGoals();
      queryClient.invalidateQueries({ queryKey: ['activeGoals'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    } catch (error) {
      console.error("Failed to delete goal:", error);
      // Revert if failed
      setGoals(previousGoals);
    }
  };

  const handleCreateGoal = async (newGoal, isEditing = false) => {
    try {
      if (isEditing) {
         setIsCreatingGoal(true);
         await base44.entities.UserGoal.update(newGoal.id, newGoal);
         await loadUserGoals();
         setShowAddGoal(false);
         setEditingGoal(null);
         setIsCreatingGoal(false);
      } else {
         const goalToCreate = { ...newGoal, user_id: user.id };

         // Show creating state
         setIsCreatingGoal(true);

         // Add optimistic goal with loading indicator
         const tempId = 'temp_' + Date.now();
         const optimisticGoal = { 
           ...goalToCreate, 
           id: tempId, 
           tasks: [],
           isLoading: true,
           plan_summary: 'בונה את תוכנית הפעולה שלך...'
         };

         if (newGoal.isPrimary) {
            setGoals(prev => [optimisticGoal, ...prev.filter(g => !g.isPrimary)]);
         } else {
            setGoals(prev => [...prev, optimisticGoal]);
         }

         // Close dialog immediately
         setShowAddGoal(false);
         setEditingGoal(null);

         // Create goal in background
         const response = await base44.functions.invoke('generateGoalPlan', { goalData: goalToCreate });
         const created = response.data;

         // Reload all goals to get the real data
         await loadUserGoals();
         setIsCreatingGoal(false);
      }

      // Invalidate all goal-related queries
      queryClient.invalidateQueries({ queryKey: ['activeGoals'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    } catch (error) {
       console.error("Error saving goal:", error);
       setGoals(prev => prev.filter(g => !g.id.toString().startsWith('temp_')));
       setIsCreatingGoal(false);
       await loadUserGoals();
       throw error;
    }
  };

  return (
    <>
      {/* Mobile Sheet */}
      <div className="md:hidden">
        <Sheet open={showAddGoal} onOpenChange={setShowAddGoal}>
          <SheetContent 
            side="bottom" 
            className="h-[95vh] max-h-[95vh] p-0 border-0 rounded-t-2xl flex flex-col top-[5vh]"
          >
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
                initialTemplate={specificTemplate || (!editingGoal && resolvedRecommendedTemplate && !hasStartedRecommendedGoal ? resolvedRecommendedTemplate : null)}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Dialog */}
      <div className="hidden md:block">
        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogContent className="p-0 border-0 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col gap-0 w-full sm:max-w-2xl bg-white">
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
                initialTemplate={specificTemplate || (!editingGoal && resolvedRecommendedTemplate && !hasStartedRecommendedGoal ? resolvedRecommendedTemplate : null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

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
          <div className="flex items-end justify-between px-1">
             <div>
               <h1 className="text-2xl font-bold text-gray-900">המטרות שלי</h1>
               <p className="text-gray-500 text-sm mt-1">
                 {goals.length > 0 
                   ? `יש לך ${goals.length} מטרות פעילות. תן בראש! 💪` 
                   : 'זה הזמן להגדיר מטרות חדשות ולהתחיל לצמוח 🌱'}
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
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 fill-purple-100" />
                מטרה מומלצת להתחלה
              </h2>
              
              <div className="bg-white rounded-xl p-6 border-2 border-purple-100 shadow-md relative overflow-hidden">
                 {/* Badge */}
                 <div className="absolute top-4 left-4 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-100 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                    Recommended · Not Started
                 </div>

                 <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                       <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${resolvedRecommendedTemplate.color} flex items-center justify-center shadow-lg transform rotate-3`}>
                          <resolvedRecommendedTemplate.icon className="w-8 h-8 text-white" />
                       </div>
                    </div>

                    <div className="flex-1">
                       <h3 className="text-xl font-black text-gray-900 mb-2">
                          {resolvedRecommendedTemplate.name}
                       </h3>
                       <p className="text-gray-600 mb-4 leading-relaxed max-w-xl">
                          {resolvedRecommendedTemplate.description}
                          <br/>
                          <span className="text-sm text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block">
                             למה בחרנו בזה? {resolvedRecommendedTemplate.reason}
                          </span>
                       </p>

                       <Button 
                         onClick={handleStartRecommended}
                         className="bg-gray-900 hover:bg-black text-white shadow-lg hover:shadow-xl transition-all h-11 px-6 rounded-lg font-medium"
                       >
                         <Plus className="w-4 h-4 ml-2" />
                         התחל את המטרה המומלצת
                       </Button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Hero Goal */}
          {heroGoal && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">הפוקוס העיקרי שלך</p>
              </div>
              <HeroGoal 
                goal={heroGoal}
                onStatusChange={handleStatusChange}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                isLoading={heroGoal.isLoading || heroGoal.id?.toString().startsWith('temp_')}
              />
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

          {/* Empty State */}
          {goals.length === 0 && (
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