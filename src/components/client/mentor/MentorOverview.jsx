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
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function MentorOverview() {
  const queryClient = useQueryClient();
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);

  const { data: goals, isLoading } = useQuery({
    queryKey: ['userGoals', 'active'],
    queryFn: async () => {
        const user = await base44.auth.me();
        return base44.entities.UserGoal.filter({ 
            user_id: user.id, 
            status: 'active' 
        });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserGoal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGoals'] });
      toast.success('המטרה עודכנה בהצלחה');
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (title) => {
        // קריאה לפונקציית בבקנד שמייצרת תוכנית עבודה עם AI
        const response = await base44.functions.invoke('generateGoalPlan', { title });
        return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGoals'] });
      setShowNewGoalDialog(false);
      toast.success('מטרה חדשה נוצרה בהצלחה! המנטור בנה לך תוכנית עבודה.');
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
  
  // חישוב סטטוס דינמי לכותרת
  const getHeaderStatus = () => {
    if (activeGoalsCount === 0) return "אין כרגע מטרות פעילות. זה הזמן להתחיל!";
    const stuckGoals = goals?.filter(g => g.progress === 0 || !g.tasks?.some(t => t.isCompleted)).length || 0;
    if (stuckGoals > 0) return `אתה עובד על ${activeGoalsCount} מטרות. שים לב, ${stuckGoals} מטרות עדיין בשלב ההתחלה.`;
    return `אתה עובד על ${activeGoalsCount} מטרות פעילות ומתקדם יפה!`;
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">טוען נתונים...</div>;

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">
      
      {/* 1. Header Section */}
      <div className="text-right space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-[#1E3A5F]">
          תמונת מצב – העבודה על המטרות שלך
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          {getHeaderStatus()}
        </p>
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
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-[#1E3A5F] mb-1">{goal.title}</h3>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor}`}>
                                    {statusLabel}
                                </div>
                            </div>
                            <div className="text-left">
                                <span className="text-xs font-bold text-gray-500">
                                    {completedTasks.length} / {goal.tasks?.length || 0}
                                </span>
                            </div>
                        </div>

                        {/* Progress Summary */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-2">
                                {completedTasks.length > 0 
                                    ? `בוצעו ${completedTasks.length} משימות מתוך ${goal.tasks?.length}`
                                    : 'טרם בוצעו משימות במטרה זו'
                                }
                            </p>
                            <Progress value={goal.progress} className="h-1.5" />
                        </div>

                        {/* 4. Next Step (Critical CTA) */}
                        {nextTask ? (
                            <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
                                <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold text-sm">
                                    <Play className="w-4 h-4 fill-indigo-800" />
                                    הצעד הבא במטרה זו
                                </div>
                                <div className="font-medium text-gray-900 mb-3 text-lg leading-tight">
                                    {nextTask.title}
                                </div>
                                <Button 
                                    onClick={() => handleToggleTask(goal, nextTask.id)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 text-sm font-bold shadow-sm"
                                >
                                    סמן כבוצע והתקדם
                                </Button>
                            </div>
                        ) : (goal.tasks && goal.tasks.length > 0) ? (
                            <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100 text-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <div className="font-bold text-green-800">כל המשימות הושלמו!</div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 text-center">
                                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                                <div className="font-bold text-gray-600">בונה תוכנית עבודה...</div>
                                <div className="text-xs text-gray-500 mt-1">המנטור מכין עבורך את המשימות</div>
                            </div>
                        )}

                        {/* 3. Work Plan (Tasks List) */}
                        <div className="space-y-3 flex-1">
                            <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider">תוכנית עבודה</h4>
                            
                            {/* Open Tasks */}
                            <div className="space-y-2">
                                {openTasks.slice(0, 3).map(task => (
                                    <div key={task.id} className="flex items-start gap-3 group">
                                        <button 
                                            onClick={() => handleToggleTask(goal, task.id)}
                                            className="mt-0.5 text-gray-300 hover:text-indigo-600 transition-colors flex-shrink-0"
                                        >
                                            <Circle className="w-5 h-5" />
                                        </button>
                                        <span className="text-gray-700 text-sm leading-relaxed pt-0.5">
                                            {task.title}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Completed Tasks (Collapsed/Subtle) */}
                            {completedTasks.length > 0 && (
                                <div className="pt-2 border-t border-gray-100 mt-2">
                                    <div className="space-y-2 opacity-60">
                                        {completedTasks.slice(0, 2).map(task => (
                                            <div key={task.id} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span className="text-gray-500 text-sm line-through pt-0.5">
                                                    {task.title}
                                                </span>
                                            </div>
                                        ))}
                                        {completedTasks.length > 2 && (
                                            <div className="text-xs text-gray-400 pr-8">
                                                + עוד {completedTasks.length - 2} משימות שהושלמו
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

        {/* 6. New Goal Button */}
        <Card className="border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer min-h-[400px]" onClick={() => setShowNewGoalDialog(true)}>
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">פתיחת מטרה חדשה</h3>
            <p className="text-gray-500 text-center max-w-xs">
                הגדר יעד חדש והמערכת תבנה עבורך תוכנית עבודה מותאמת אישית
            </p>
        </Card>
      </div>

      <CreateGoalDialog 
        open={showNewGoalDialog} 
        onOpenChange={setShowNewGoalDialog}
        onSubmit={(title) => createGoalMutation.mutate(title)}
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