import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Play, 
  AlertCircle,
  ArrowLeft,
  Target,
  Clock,
  CheckSquare,
  Zap,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import GoalTemplatesFixed from '../goals/GoalTemplatesFixed';
import LimitUpgradeDialog from '../goals/LimitUpgradeDialog';
import BusinessRoadmap from '../goals/BusinessRoadmap';
import FirstGoalFlow from '../goals/FirstGoalFlow';

export default function MentorOverview() {
  const queryClient = useQueryClient();
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [showGoalTemplates, setShowGoalTemplates] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(null);
  const [specificTemplate, setSpecificTemplate] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => await base44.auth.me()
  });

  const { data: goals, isLoading, refetch: refetchGoals } = useQuery({
    queryKey: ['userGoals', 'active'],
    queryFn: async () => {
        const user = await base44.auth.me();
        return base44.entities.UserGoal.filter({ 
            user_id: user.id, 
            status: 'active' 
        });
    }
  });

  // Find active first goal
  const activeFirstGoal = goals?.find(g => 
    g.is_first_goal && 
    (g.status === 'active' || g.status === 'in_progress') &&
    (g.flow_step || 1) < 8 
  );

  const { data: userPlan } = useQuery({
    queryKey: ['userPlan', user?.plan_id],
    queryFn: async () => {
      if (!user?.plan_id) return null;
      return await base44.entities.Plan.filter({ id: user.plan_id });
    },
    enabled: !!user?.plan_id
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGoals'] });
      toast.success('המטרה עודכנה בהצלחה');
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async ({ title, goalId, goalData }) => {
        const currentUser = await base44.auth.me();
        const activeGoalsCount = goals?.length || 0;
        
        // Create goal in DB first
        const goalToCreate = {
          ...goalData,
          user_id: currentUser.id,
          status: 'active',
          plan_summary: 'בונה תוכנית...',
          tasks: []
        };
        
        const createdGoal = await base44.entities.UserGoal.create(goalToCreate);
        
        // Generate plan in background
        setTimeout(async () => {
          try {
            await base44.functions.invoke('generateGoalPlan', { 
              goalId: createdGoal.id,
              title: createdGoal.title,
              goalData: {
                ...goalData,
                id: createdGoal.id,
                _context: {
                  activeGoalsCount,
                  goalPosition: activeGoalsCount + 1,
                  businessState: currentUser?.business_state,
                  businessJourneyAnswers: currentUser?.business_journey_answers
                }
              }
            });
            
            queryClient.invalidateQueries({ queryKey: ['userGoals'] });
          } catch (error) {
            console.error("Error generating plan:", error);
          }
        }, 100);
        
        return createdGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGoals'] });
      setShowNewGoalDialog(false);
      setShowGoalTemplates(false);
      toast.success('מטרה חדשה נוצרה בהצלחה!');
    },
    onError: (error) => {
        console.error(error);
        toast.error('שגיאה ביצירת המטרה. נסה שוב.');
    }
  });

  const handleToggleTask = (goal, taskId) => {
    const updatedTasks = goal.tasks.map(t => 
        t.id === taskId 
            ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : null } 
            : t
    );
    
    // חישוב מחדש של ההתקדמות
    const completedCount = updatedTasks.filter(t => t.isCompleted).length;
    const progress = Math.round((completedCount / updatedTasks.length) * 100);

    updateGoalMutation.mutate({
        id: goal.id,
        data: {
            ...goal,
            tasks: updatedTasks,
            progress
        }
    });
  };

  const activeGoalsCount = goals?.length || 0;
  const plan = userPlan?.[0];
  const goalsLimit = plan?.goals_limit ?? 1; // Default to 1 if no plan
  const canAddGoal = goalsLimit === null || activeGoalsCount < goalsLimit;
  
  // חישוב סטטוס דינמי לכותרת
  const getHeaderStatus = () => {
    if (activeGoalsCount === 0) return "אין כרגע מטרות פעילות. זה הזמן להתחיל!";
    const stuckGoals = goals?.filter(g => g.progress === 0 || !g.tasks?.some(t => t.isCompleted)).length || 0;
    if (stuckGoals > 0) return `אתה עובד על ${activeGoalsCount} מטרות. שים לב, ${stuckGoals} מטרות עדיין בשלב ההתחלה.`;
    return `אתה עובד על ${activeGoalsCount} מטרות פעילות ומתקדם יפה!`;
  };

  const handleOpenGoalCreation = () => {
    if (!canAddGoal) {
      setCurrentLimit(goalsLimit);
      setShowLimitDialog(true);
    } else {
      setSpecificTemplate(null);
      setShowGoalTemplates(true);
    }
  };

  const handleSelectRoadmapStep = (task) => {
      // Check if already active
      const isActive = goals?.some(g => 
        g.title === task.title || 
        g.category === `task_${task.id}` ||
        g.category === `task_goal_${task.id}`
      );
      
      if (isActive) return;

      if (!canAddGoal) {
         setCurrentLimit(goalsLimit);
         setShowLimitDialog(true);
         return;
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
      setShowGoalTemplates(true);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">טוען נתונים...</div>;

  if (activeFirstGoal) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto" dir="rtl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            הצעד הראשון שלך
          </h1>
          <p className="text-gray-500">
            אנחנו מתחילים בצעד אחד, מדויק וממוקד.
          </p>
        </div>
        
        <Card className="p-6 md:p-10 border-blue-100 bg-white shadow-lg rounded-3xl">
          <FirstGoalFlow 
            goal={activeFirstGoal} 
            onComplete={async (finalData) => {
              // 1. Create tasks from the flow steps
              const tasks = [];
              
              // Task 1: Mental Mapping (Completed)
              tasks.push({
                id: `task_${Date.now()}_1`,
                title: 'מיפוי מנטלי',
                why: 'יצירת סדר ובהירות ראשונית',
                definition_of_done: 'מיפוי 3 נקודות חיוביות וחסם אחד',
                effort: 'קל',
                status: 'done',
                isCompleted: true,
                completedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
              });

              // Task 2: Micro Action (Active)
              if (finalData?.micro_action) {
                tasks.push({
                   id: `task_${Date.now()}_2`,
                   title: finalData.micro_action,
                   why: 'יצירת תנועה ראשונה ושבירת הקיפאון',
                   definition_of_done: 'ביצוע הפעולה הקטנה שנבחרה (עד 10 דקות)',
                   effort: 'קל',
                   status: 'todo',
                   isCompleted: false,
                   createdAt: new Date().toISOString(),
                   momentum: true
                });
              }

              // Task 3: Closure / Insight (Completed)
              tasks.push({
                id: `task_${Date.now()}_3`,
                title: 'דיוק ותובנה',
                why: 'חיבור רגשי והבנת המשמעות',
                definition_of_done: 'ניסוח תובנה ודירוג תחושת הבהירות',
                effort: 'קל',
                status: 'done',
                isCompleted: true,
                completedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
              });

              // Update Goal with tasks and status
              await base44.entities.UserGoal.update(activeFirstGoal.id, { 
                  flow_step: 8,
                  tasks: tasks,
                  plan_summary: finalData?.insight || 'יצאנו לדרך עם מיקרו-פעולה ראשונה!',
                  status: 'active'
              });
              
              refetchGoals();
              toast.success('התוכנית מוכנה! בהצלחה בצעד הראשון');
            }} 
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100/50">
        <div>
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                תמונת המצב שלי
                </h1>
                {activeGoalsCount > 0 && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 px-2.5 py-0.5 rounded-full font-medium">
                        {activeGoalsCount} מטרות פעילות
                    </Badge>
                )}
            </div>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">
                {getHeaderStatus()}
            </p>
        </div>

        {activeGoalsCount > 0 && (
            <Button 
                onClick={handleOpenGoalCreation}
                className="bg-gray-900 hover:bg-black text-white rounded-full px-6 h-11 shadow-sm hover:shadow-md transition-all flex-shrink-0"
            >
                <Plus className="w-4 h-4 ml-2" />
                מטרה חדשה
            </Button>
        )}
      </div>

      {/* 2. Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals?.map(goal => {
            const completedTasks = goal.tasks?.filter(t => t.isCompleted) || [];
            const openTasks = goal.tasks?.filter(t => !t.isCompleted) || [];
            const nextTask = openTasks[0]; // המשימה הפתוחה הראשונה
            
            // חישוב סטטוס טקסטואלי
            let statusLabel = 'מתקדם';
            let statusColor = 'text-green-600 bg-green-50';
            if (goal.progress === 0) {
                statusLabel = 'בהמתנה';
                statusColor = 'text-gray-600 bg-gray-100';
            } else if (goal.progress < 30) {
                statusLabel = 'בהתחלה';
                statusColor = 'text-blue-600 bg-blue-50';
            } else if (openTasks.length > 0 && goal.updated_date && (new Date() - new Date(goal.updated_date)) > 86400000 * 7) {
                 statusLabel = 'תקוע';
                 statusColor = 'text-red-600 bg-red-50';
            }

            return (
                <Card key={goal.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 flex flex-col">
                        {/* Goal Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">{goal.title}</h3>
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColor}`}>
                                    {statusLabel}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-3">
                                <span className="text-2xl font-bold text-gray-900">
                                    {completedTasks.length}
                                </span>
                                <span className="text-xs text-gray-500">
                                    מתוך {goal.tasks?.length || 0}
                                </span>
                            </div>
                        </div>

                        {/* Progress Summary */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-600">
                                    {completedTasks.length > 0 
                                        ? `${completedTasks.length} משימות הושלמו`
                                        : 'עוד לא התחלת'
                                    }
                                </p>
                                <span className="text-xs font-bold text-gray-900">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                        </div>

                        {/* Next Step CTA */}
                        {nextTask ? (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-5 border border-blue-100">
                                <div className="flex items-center gap-2 mb-2.5">
                                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                                    </div>
                                    <span className="text-xs font-bold text-blue-900">הצעד הבא</span>
                                </div>
                                <p className="font-semibold text-gray-900 mb-3.5 text-base leading-snug">
                                    {nextTask.title}
                                </p>
                                <Button 
                                    onClick={() => handleToggleTask(goal, nextTask.id)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
                                >
                                    <CheckCircle2 className="w-4 h-4 ml-2" />
                                    סיימתי את המשימה
                                </Button>
                            </div>
                        ) : (goal.tasks && goal.tasks.length > 0) ? (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 mb-5 border border-green-200 text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                                </div>
                                <div className="font-bold text-green-900 text-base">המטרה הושלמה! 🎉</div>
                                <p className="text-xs text-green-700 mt-1">כל הכבוד על השלמת כל המשימות</p>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-5 mb-5 border border-gray-200 text-center">
                                <Clock className="w-10 h-10 text-gray-400 mx-auto mb-3 animate-pulse" />
                                <div className="font-semibold text-gray-700 mb-1">בונה תוכנית...</div>
                                <div className="text-xs text-gray-500 mb-4">המנטור מכין את המשימות</div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => createGoalMutation.mutate({ title: goal.title, goalId: goal.id })}
                                    className="text-sm h-9 font-medium"
                                >
                                    בנה תוכנית עכשיו
                                </Button>
                            </div>
                        )}

                        {/* Work Plan */}
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">המשימות שלי</h4>
                                {goal.plan_summary && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-sm text-right bg-gray-900 text-white p-4 text-sm leading-relaxed rounded-xl" dir="rtl">
                                                <p className="font-bold mb-2 text-blue-300">💡 ההיגיון מאחורי התוכנית</p>
                                                <p className="text-gray-100">{goal.plan_summary}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            
                            {/* Open Tasks */}
                            <div className="space-y-2.5">
                                {openTasks.slice(0, 3).map(task => {
                                    const isMomentum = task.momentum;
                                    const effortColors = {
                                        'קל': 'bg-green-100 text-green-800 border-green-200',
                                        'בינוני': 'bg-amber-100 text-amber-800 border-amber-200',
                                        'קשה': 'bg-red-100 text-red-800 border-red-200'
                                    };
                                    
                                    return (
                                        <div 
                                            key={task.id} 
                                            className={`
                                                relative border-2 rounded-xl p-3.5 transition-all active:scale-[0.98]
                                                ${isMomentum ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}
                                            `}
                                        >
                                            <div className="flex items-start gap-3">
                                                <button 
                                                    onClick={() => handleToggleTask(goal, task.id)}
                                                    className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
                                                >
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors" />
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className="font-semibold text-gray-900 text-sm leading-tight">
                                                            {task.title}
                                                        </span>
                                                        {isMomentum && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="bg-amber-900 text-white">
                                                                        ⚡ משימת מומנטום - 48 שעות
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                    {task.why && (
                                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
                                                            {task.why}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {task.effort && (
                                                            <Badge variant="outline" className={`text-[11px] h-5 px-2 font-medium border ${effortColors[task.effort] || 'bg-gray-100 text-gray-700'}`}>
                                                                {task.effort}
                                                            </Badge>
                                                        )}
                                                        {task.definition_of_done && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors">
                                                                            <CheckSquare className="w-3 h-3" />
                                                                            <span className="font-medium">איך סיימנו?</span>
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="max-w-xs text-right bg-gray-900 text-white p-3 rounded-lg" dir="rtl">
                                                                        <p className="font-bold text-xs mb-1.5 text-blue-300">✓ הגדרת סיום</p>
                                                                        <p className="text-xs leading-relaxed">{task.definition_of_done}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Completed Tasks */}
                            {completedTasks.length > 0 && (
                                <div className="pt-3 border-t border-gray-200 mt-3">
                                    <div className="space-y-2 opacity-70">
                                        {completedTasks.slice(0, 2).map(task => (
                                            <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50">
                                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-600 text-sm line-through leading-relaxed">
                                                    {task.title}
                                                </span>
                                            </div>
                                        ))}
                                        {completedTasks.length > 2 && (
                                            <div className="text-xs text-gray-500 pr-7 font-medium">
                                                ✓ ועוד {completedTasks.length - 2} משימות שהושלמו
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* 5. Gap/Stuck Identification */}
                    {statusLabel === 'תקוע' && (
                        <div className="bg-red-50 p-4 border-t border-red-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                נראה שקצת נתקענו כאן
                            </div>
                            <Button variant="link" className="text-red-700 text-xs font-bold p-0 h-auto">
                                לחדד את התוכנית?
                            </Button>
                        </div>
                    )}
                </Card>
            );
        })}

        {/* New Goal Card - Only show when no active goals */}
        {activeGoalsCount === 0 && (
            <Card 
                className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all rounded-2xl flex flex-col items-center justify-center p-8 md:p-10 cursor-pointer min-h-[400px] group active:scale-[0.98]" 
                onClick={handleOpenGoalCreation}
            >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                    <Plus className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">מטרה חדשה</h3>
                <p className="text-sm md:text-base text-gray-600 text-center max-w-xs leading-relaxed">
                    הגדר יעד חדש והמערכת תיצור עבורך תוכנית עבודה מותאמת אישית
                </p>
            </Card>
        )}
      </div>

      {/* Business Journey Roadmap */}
      {user?.business_journey_completed && user?.client_tasks && (
          <div className="mt-12 pt-10 border-t border-gray-100 max-w-4xl mx-auto">
              <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-gray-900">המסע העסקי שלך</h2>
                  <p className="text-gray-500 text-sm mt-1">המפה המלאה להצלחה של העסק שלך</p>
              </div>
              <BusinessRoadmap 
                  user={user} 
                  tasks={user.client_tasks} 
                  onSelectStep={handleSelectRoadmapStep}
                  activeGoals={goals || []}
                  onShowUpgrade={() => {
                      setCurrentLimit(goalsLimit);
                      setShowLimitDialog(true);
                  }}
                  goalLimit={goalsLimit}
              />
          </div>
      )}

      {/* Goal Templates - Mobile Sheet */}
      <div className="md:hidden">
        <Sheet open={showGoalTemplates} onOpenChange={setShowGoalTemplates}>
          <SheetContent 
            side="bottom" 
            className="h-[95vh] max-h-[95vh] p-0 border-0 rounded-t-2xl flex flex-col top-[5vh]"
          >
            {showGoalTemplates && (
              <GoalTemplatesFixed
                user={user}
                onCreateGoal={async (newGoal) => {
                  setShowGoalTemplates(false);
                  createGoalMutation.mutate({ title: newGoal.title, goalData: newGoal });
                }}
                onClose={() => {
                    setShowGoalTemplates(false);
                    setSpecificTemplate(null);
                }}
                hasPrimaryGoal={false}
                initialTemplate={specificTemplate}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Goal Templates - Desktop Dialog */}
      <div className="hidden md:block">
        <Dialog open={showGoalTemplates} onOpenChange={setShowGoalTemplates}>
          <DialogContent className="p-0 border-0 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col gap-0 w-full sm:max-w-2xl bg-white">
            {showGoalTemplates && (
              <GoalTemplatesFixed
                user={user}
                onCreateGoal={async (newGoal) => {
                  setShowGoalTemplates(false);
                  createGoalMutation.mutate({ title: newGoal.title, goalData: newGoal });
                }}
                onClose={() => {
                    setShowGoalTemplates(false);
                    setSpecificTemplate(null);
                }}
                hasPrimaryGoal={false}
                initialTemplate={specificTemplate}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Limit Upgrade Dialog */}
      <LimitUpgradeDialog 
        isOpen={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
        limit={currentLimit}
      />
    </div>
  );
}

function CreateGoalDialog({ open, onOpenChange, onSubmit }) {
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (title.trim()) {
            setIsSubmitting(true);
            await onSubmit(title);
            setIsSubmitting(false);
            setTitle('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>הגדרת מטרה חדשה</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4" dir="rtl">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">מה המטרה שלך?</label>
                        <Input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="לדוגמה: להשיג 5 לקוחות חדשים החודש"
                            className="text-lg"
                            autoFocus
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                <span>המנטור מנתח את המטרה ובונה תוכנית עבודה...</span>
                            </div>
                        ) : (
                            "לאחר יצירת המטרה, המנטור ינתח אותה ויבנה עבורך תוכנית עבודה מדויקת."
                        )}
                    </div>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !title.trim()} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold"
                    >
                        {isSubmitting ? 'בונה תוכנית...' : 'צא לדרך'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}