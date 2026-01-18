import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadData();
    
    // Subscribe to changes in goals to keep the dashboard updated in real-time
    const unsubscribe = base44.entities.UserGoal.subscribe(() => {
        loadData();
    });
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      setUserName(user.full_name?.split(' ')[0] || 'חבר');
      
      const today = new Date().toISOString().split('T')[0];
      const focusData = await base44.entities.DailyFocus.filter({ date: today }, '-created_date', 1);
      
      if (focusData.length > 0) {
        setDailyFocus(focusData[0]);
      }

      // Robustly fetch the primary goal:
      // 1. Fetch all relevant goals for the user
      // 2. Look for explicit isPrimary=true
      // 3. Fallback to the most recent active/selected goal (matching Goals Tab logic)
      const allGoals = await base44.entities.UserGoal.filter({ user_id: user.id }, '-created_date', 50);
      const activeGoals = allGoals.filter(g => ['active', 'selected'].includes(g.status));
      
      let mainGoal = activeGoals.find(g => g.isPrimary);
      if (!mainGoal && activeGoals.length > 0) {
          mainGoal = activeGoals[0]; // Fallback to the top/most recent goal
      }
      setPrimaryGoal(mainGoal || null);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="col-span-2 md:col-span-1 border-l pl-4 border-gray-100">
            <span className="text-xs text-gray-500 block mb-1">המטרה הראשית</span>
            {primaryGoal ? (
                <>
                    <div className="flex flex-col gap-1 mb-2">
                        <span className="text-lg font-bold text-gray-900 leading-tight line-clamp-1" title={primaryGoal.title}>
                            {primaryGoal.title}
                        </span>
                        <div className="flex items-center gap-2">
                             <span className="text-xs text-green-600 font-medium">{Math.round(primaryGoal.progress || 0)}% הושלמו</span>
                             <span className="text-xs text-gray-400">({primaryGoal.current || 0}/{primaryGoal.target})</span>
                        </div>
                    </div>
                    <Progress value={primaryGoal.progress || 0} className="h-1.5 mt-auto bg-gray-100" indicatorClassName="bg-green-500" />
                </>
            ) : (
                <div className="flex flex-col h-full justify-center items-start">
                    <span className="text-sm text-gray-400 mb-2">לא הוגדרה מטרה ראשית</span>
                    <Button variant="link" className="p-0 h-auto text-indigo-600 text-xs" onClick={() => onNavigate('status')}>
                        הגדר עכשיו
                    </Button>
                </div>
            )}
        </div>
        <div className="border-l pl-4 border-gray-100 hidden md:block">
            <span className="text-xs text-gray-500 block mb-1">לידים חדשים</span>
            <span className="text-xl font-bold text-gray-900">24</span>
            <span className="text-xs text-green-600 block">+4 השבוע</span>
        </div>
        <div className="border-l pl-4 border-gray-100 hidden md:block">
            <span className="text-xs text-gray-500 block mb-1">שיחות מכירה</span>
            <span className="text-xl font-bold text-gray-900">8</span>
            <span className="text-xs text-gray-400 block">יעד שבועי: 10</span>
        </div>
        <div className="flex items-center justify-end">
            <Button 
                variant="ghost" 
                onClick={() => onNavigate('status')}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs h-8"
            >
                לדוח המלא <ArrowRight className="w-3 h-3 mr-1" />
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
            onClick={() => onNavigate('status')}
        >
            <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">שלב נוכחי</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">צמיחה</Badge>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>בריאות עסקית</span>
                        <span>85%</span>
                    </div>
                    <Progress value={85} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-600" />
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
                    <span className="text-3xl font-bold text-gray-900">4</span>
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
            onClick={() => onNavigate('status')}
        >
            <div className="mt-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">קמפיין ראשון עלה לאוויר</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Target className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">הוגדר יעד הכנסות</span>
                </div>
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