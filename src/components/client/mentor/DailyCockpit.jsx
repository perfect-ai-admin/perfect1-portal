import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Target, 
  MessageSquare, 
  BarChart2, 
  ListTodo, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Trophy,
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Skeleton } from '@/components/ui/skeleton';

export default function DailyCockpit({ onNavigate }) {
  const [dailyFocus, setDailyFocus] = useState(null);
  const [primaryGoal, setPrimaryGoal] = useState(null);
  const [allGoals, setAllGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [businessState, setBusinessState] = useState(null);

  useEffect(() => {
    loadUserData();
    
    // Subscribe to DailyFocus updates
    const unsubscribeFocus = base44.entities.DailyFocus.subscribe(() => {
        loadUserData();
    });
    return () => {
        unsubscribeFocus();
    };
  }, []);

  const loadUserData = async () => {
    try {
      const user = await base44.auth.me();
      setUserName(user.full_name?.split(' ')[0] || 'חבר');
      setBusinessState(user.business_state);
      
      const today = new Date().toISOString().split('T')[0];
      const focusData = await base44.entities.DailyFocus.filter({ date: today }, '-created_date', 1);
      
      if (focusData.length > 0) {
        setDailyFocus(focusData[0]);
      } else {
        setDailyFocus(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Use useQuery for goals to ensure sync with GoalsTab
  const { data: fetchedGoals, isLoading: isLoadingGoals, refetch: refetchGoals } = useQuery({
    queryKey: ['userGoals'], // Using general key to match GoalsTab invalidation
    queryFn: async () => {
        const user = await base44.auth.me();
        if (!user) return [];
        return await base44.entities.UserGoal.filter({ user_id: user.id }, '-created_date', 50);
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Effect to process goals when fetched
  useEffect(() => {
    if (fetchedGoals) {
        setAllGoals(fetchedGoals);
        
        // Filter goals: active, selected, or completed
        const relevantGoals = fetchedGoals.filter(g => ['active', 'selected', 'completed'].includes(g.status));
        
        // 1. Look for explicit primary goal
        let mainGoal = relevantGoals.find(g => g.isPrimary);
        
        // 2. If no primary, look for the most recent active/selected one
        if (!mainGoal) {
            mainGoal = relevantGoals.find(g => ['active', 'selected'].includes(g.status));
        }

        // 3. If still no goal, fallback to the most recent completed one
        if (!mainGoal && relevantGoals.length > 0) {
            mainGoal = relevantGoals[0];
        }

        setPrimaryGoal(mainGoal || null);
        setLoading(false);
    }
  }, [fetchedGoals]);

  // Subscribe to changes in goals
  useEffect(() => {
      const unsubscribe = base44.entities.UserGoal.subscribe(() => {
          refetchGoals();
      });
      return () => unsubscribe();
  }, [refetchGoals]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 18) return 'צהריים טובים';
    return 'ערב טוב';
  };

  if (loading) return <CockpitSkeleton />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Results Tracker Widget */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Goal Title & Progress */}
        <div className="flex-1 min-w-0 md:pl-6 md:border-l border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">המטרה הראשית</span>
                {primaryGoal && (
                    <span className="text-xs text-green-600 font-medium">{Math.round(primaryGoal.progress || 0)}% הושלמו</span>
                )}
            </div>
            
            {primaryGoal ? (
                <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight truncate" title={primaryGoal.title}>
                        {primaryGoal.title}
                    </h3>
                    <Progress value={primaryGoal.progress || 0} className="h-2 bg-gray-100" indicatorClassName="bg-gradient-to-l from-green-500 to-emerald-400" />
                </div>
            ) : (
                <div className="flex items-center gap-3 py-2">
                    <span className="text-gray-400 text-sm">לא הוגדרה מטרה ראשית</span>
                    <Button variant="link" className="p-0 h-auto text-indigo-600 text-sm font-medium" onClick={() => onNavigate('status')}>
                        הגדר עכשיו
                    </Button>
                </div>
            )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:flex items-center gap-8 md:gap-12 px-2 md:px-6 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
            <div className="flex flex-col items-start min-w-[80px]">
                <span className="text-xs text-gray-500 mb-1">מצב נוכחי</span>
                <span className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
                    {primaryGoal ? (primaryGoal.current || 0).toLocaleString() : '-'}
                </span>
                <span className="text-[10px] text-gray-400">התקדמות בפועל</span>
            </div>

            <div className="w-px h-10 bg-gray-100 hidden md:block"></div>

            <div className="flex flex-col items-start min-w-[80px]">
                <span className="text-xs text-gray-500 mb-1">יעד סופי</span>
                <span className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
                    {primaryGoal ? (primaryGoal.target || 0).toLocaleString() : '-'}
                </span>
                <span className="text-[10px] text-gray-400">המטרה שלך</span>
            </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end md:justify-start">
            <Button 
                variant="ghost" 
                onClick={() => onNavigate('status')}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl gap-2 pl-2 pr-4 group h-10"
            >
                <span className="font-medium text-sm">לדוח המלא</span>
                <div className="bg-indigo-100 p-1.5 rounded-full group-hover:bg-indigo-200 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                </div>
            </Button>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 md:p-12 shadow-2xl"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4 max-w-lg">
            <Badge className="bg-white/20 text-indigo-100 hover:bg-white/30 border-none px-3 py-1">
              <Sparkles className="w-3 h-3 mr-2 text-yellow-300" />
              המרכז לניהול העסק
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {getTimeGreeting()}, {userName}!
            </h1>
            <p className="text-indigo-200 text-lg leading-relaxed">
              היום הוא יום מצוין לקדם את העסק. המנטור האישי שלך מוכן עם תובנות חדשות עבורך.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button 
                onClick={() => onNavigate('chat')}
                className="bg-white text-indigo-900 hover:bg-indigo-50 border-none h-12 px-6 rounded-xl font-bold shadow-lg shadow-indigo-900/20"
              >
                <MessageSquare className="w-5 h-5 ml-2" />
                התייעץ עם המנטור
              </Button>
              <Button 
                onClick={() => onNavigate('plan')}
                variant="outline"
                className="bg-indigo-900/50 border-indigo-400 text-white hover:bg-indigo-900/70 h-12 px-6 rounded-xl"
              >
                <ListTodo className="w-5 h-5 ml-2" />
                למשימות שלי
              </Button>
            </div>
          </div>

          {/* Daily Focus Card - Floating */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-2 text-indigo-200 mb-4 text-sm font-medium">
              <Target className="w-4 h-4" />
              המיקוד היומי שלך
            </div>
            
            {dailyFocus ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white leading-snug">
                  {dailyFocus.primary_focus || 'עדיין לא הוגדר מיקוד להיום'}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {dailyFocus.primary_focus && (
                        <div className="flex items-center gap-2 text-sm text-indigo-200 bg-indigo-900/40 p-2 rounded-lg w-fit px-3">
                            <Calendar className="w-3 h-3" />
                            <span>{dailyFocus.estimated_time || 60} דק'</span>
                        </div>
                    )}
                    {primaryGoal && (
                        <div className="flex items-center gap-2 text-sm text-indigo-100 bg-white/10 p-2 rounded-lg w-fit px-3 border border-white/10">
                            <Target className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{primaryGoal.title}</span>
                        </div>
                    )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                    <BrainCircuit className="w-6 h-6 text-indigo-300" />
                </div>
                <p className="text-indigo-100">מה הדבר האחד שיקדם אותך היום?</p>
                <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-none"
                    onClick={() => onNavigate('plan')}
                >
                    הגדר מיקוד יומי
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl opacity-50 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl opacity-50 mix-blend-overlay"></div>
      </motion.div>

      {/* Quick Stats / Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard 
            title="תמונת מצב עסקית" 
            icon={BarChart2} 
            color="text-blue-600" 
            bg="bg-blue-50"
            onClick={() => onNavigate('business')}
        >
            <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">שלב נוכחי</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {businessState?.stage === 'early_revenue' ? 'הכנסות ראשונות' :
                         businessState?.stage === 'growing' ? 'צמיחה' :
                         businessState?.stage === 'stable' ? 'יציב' :
                         businessState?.stage === 'pre_revenue' ? 'לפני הכנסות' :
                         'לא הוגדר'}
                    </Badge>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>ביצוע מטרות</span>
                        <span>{Math.round(primaryGoal?.progress || 0)}%</span>
                    </div>
                    <Progress value={primaryGoal?.progress || 0} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-600" />
                </div>
            </div>
        </StatusCard>

        <StatusCard 
            title="משימות פתוחות" 
            icon={ListTodo} 
            color="text-emerald-600" 
            bg="bg-emerald-50"
            onClick={() => onNavigate('plan')}
        >
            <div className="mt-4 flex items-end justify-between">
                <div>
                    <span className="text-3xl font-bold text-gray-900">
                        {dailyFocus?.secondary_tasks?.filter(t => !['completed', 'cancelled', 'deferred'].includes(t.status))?.length || 0}
                    </span>
                    <span className="text-gray-500 text-sm mr-2">משימות להיום</span>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
            </div>
        </StatusCard>

        <StatusCard 
            title="הישגים החודש" 
            icon={Trophy} 
            color="text-amber-600" 
            bg="bg-amber-50"
            onClick={() => onNavigate('goals')}
        >
            <div className="mt-4">
                {allGoals.filter(g => g.status === 'completed').length > 0 ? (
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Trophy className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {allGoals.filter(g => g.status === 'completed').length} מטרות הושלמו
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 mb-2 opacity-60">
                         <div className="p-2 bg-gray-100 rounded-lg">
                            <Sparkles className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500">אין הישגים עדיין</span>
                    </div>
                )}
                
                {allGoals.length > 0 && (
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Target className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                             {allGoals.filter(g => ['active', 'selected'].includes(g.status)).length} מטרות פעילות
                        </span>
                    </div>
                )}
            </div>
        </StatusCard>
      </div>
    </div>
  );
}

function StatusCard({ title, icon: Icon, children, color, bg, onClick }) {
    return (
        <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-gray-100 group relative overflow-hidden"
            onClick={onClick}
        >
            <div className="flex items-center justify-between relative z-10">
                <h3 className="font-bold text-gray-900">{title}</h3>
                <div className={`p-2 rounded-xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
            <div className="relative z-10">
                {children}
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${bg} opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
        </Card>
    );
}

function CockpitSkeleton() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Skeleton className="h-[300px] w-full rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        </div>
    );
}