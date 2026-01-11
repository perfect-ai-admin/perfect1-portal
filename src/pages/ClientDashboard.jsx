import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, CheckCircle, Clock, AlertCircle, LogOut, Target, BookOpen, 
  MessageCircle, ChevronLeft, Briefcase, FileText, Users, Zap, 
  DollarSign, Calendar, BarChart3, Shield, Lightbulb, TrendingDown,
  Activity, ArrowUpRight, Award, Bot
} from 'lucide-react';
import SmartChat from '../components/client/SmartChat';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClientDashboard() {
  const [client, setClient] = useState(null);
  const [activeCategory, setActiveCategory] = useState('dashboard');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedClient = localStorage.getItem('client');
    if (!storedClient) {
      navigate(createPageUrl('ClientLogin'));
      return;
    }
    setClient(JSON.parse(storedClient));
  }, [navigate]);

  const { data: clientData, isLoading } = useQuery({
    queryKey: ['client', client?.id],
    queryFn: async () => {
      if (!client?.id) return null;
      const leads = await base44.entities.Lead.filter({ id: client.id });
      return leads[0] || null;
    },
    enabled: !!client?.id,
    refetchInterval: 30000
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }) => {
      const tasks = clientData?.client_tasks || [];
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, completed, completed_date: completed ? new Date().toISOString() : null } : t
      );
      return base44.entities.Lead.update(client.id, { client_tasks: updatedTasks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', client?.id] });
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('client');
    navigate(createPageUrl('ClientLogin'));
  };

  if (!client || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">טוען את מרכז הבקרה שלך...</p>
        </div>
      </div>
    );
  }

  const currentData = clientData || client;
  const businessStage = getBusinessStage(currentData);
  const healthStatus = getHealthStatus(currentData);

  const categories = [
    { 
      id: 'chat', 
      label: '💬 שיחה חכמה', 
      icon: <Bot className="w-5 h-5" />,
      color: 'from-green-600 to-green-700'
    },
    { 
      id: 'dashboard', 
      label: 'סקירה כללית', 
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-blue-600 to-blue-700'
    },
    { 
      id: 'next-steps', 
      label: 'השלב הבא', 
      icon: <Target className="w-5 h-5" />,
      color: 'from-green-600 to-green-700'
    },
    { 
      id: 'timeline', 
      label: 'לוח זמנים', 
      icon: <Calendar className="w-5 h-5" />,
      color: 'from-purple-600 to-purple-700'
    },
    { 
      id: 'financial', 
      label: 'כספים', 
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-emerald-600 to-emerald-700'
    },
    { 
      id: 'knowledge', 
      label: 'ידע', 
      icon: <BookOpen className="w-5 h-5" />,
      color: 'from-orange-600 to-orange-700'
    },
    { 
      id: 'marketing', 
      label: 'שיווק', 
      icon: <Users className="w-5 h-5" />,
      color: 'from-pink-600 to-pink-700'
    }
  ];

  return (
    <>
      <Helmet>
        <title>מרכז הבקרה העסקי שלך | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">שלום, {currentData.name} 👋</h1>
                <p className="text-gray-200 text-lg">מרכז הבקרה העסקי שלך - הכל במקום אחד</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <LogOut className="w-5 h-5 ml-2" />
                יציאה
              </Button>
            </div>

            {/* Category Navigation */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-white text-[#1E3A5F] shadow-lg scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {activeCategory === 'chat' && (
              <ChatView 
                key="chat" 
                data={currentData}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ['client', client?.id] })}
              />
            )}
            {activeCategory === 'dashboard' && (
              <DashboardView 
                key="dashboard" 
                data={currentData} 
                businessStage={businessStage}
                healthStatus={healthStatus}
              />
            )}
            {activeCategory === 'next-steps' && (
              <NextStepsView 
                key="next-steps" 
                data={currentData}
                updateTask={updateTaskMutation}
              />
            )}
            {activeCategory === 'timeline' && (
              <TimelineView key="timeline" data={currentData} />
            )}
            {activeCategory === 'financial' && (
              <FinancialView key="financial" data={currentData} />
            )}
            {activeCategory === 'knowledge' && (
              <KnowledgeView key="knowledge" data={currentData} />
            )}
            {activeCategory === 'marketing' && (
              <MarketingView key="marketing" data={currentData} businessStage={businessStage} />
            )}
          </AnimatePresence>

          {/* Floating Bot Button */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-8 left-8 z-50"
          >
            <button
              onClick={() => window.open('https://wa.me/972537703603?text=' + encodeURIComponent('היי, יש לי שאלה על העסק שלי'), '_blank')}
              className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <MessageCircle className="w-8 h-8" />
            </button>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              המלווה החכם שלך
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

// Chat View
function ChatView({ data, onUpdate }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-[calc(100vh-280px)]"
    >
      <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden">
        <SmartChat clientData={data} onUpdate={onUpdate} />
      </div>
    </motion.div>
  );
}

// Dashboard View
function DashboardView({ data, businessStage, healthStatus }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatusCard
          title="מצב העסק"
          value={healthStatus.label}
          icon={healthStatus.icon}
          color={healthStatus.color}
          description="הערכה כללית"
        />
        <StatusCard
          title="שלב התפתחות"
          value={businessStage.label}
          icon={businessStage.icon}
          color={businessStage.color}
          description="איפה אתה עכשיו"
        />
        <StatusCard
          title="רמת פוקוס"
          value="גבוהה"
          icon={<Zap className="w-8 h-8 text-yellow-600" />}
          color="bg-yellow-100"
          description="התמקדות במטרות"
        />
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-3">התובנה שלך היום</h2>
            <p className="text-xl leading-relaxed opacity-95">
              {getMainInsight(data)}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">מדדי ליבה</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="מגמת רווחיות"
            value="עולה"
            change="+12%"
            trend="up"
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <MetricCard
            label="עומס עבודה"
            value="מאוזן"
            change="יציב"
            trend="neutral"
            icon={<Activity className="w-6 h-6" />}
          />
          <MetricCard
            label="שליטה כלכלית"
            value="טובה"
            change="+8%"
            trend="up"
            icon={<Shield className="w-6 h-6" />}
          />
          <MetricCard
            label="קצב ביצוע"
            value="קבוע"
            change="85%"
            trend="neutral"
            icon={<Award className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">פעילות אחרונה</h2>
        <div className="space-y-4">
          {getRecentActivity(data).map((activity, idx) => (
            <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
              <div className={`w-12 h-12 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Next Steps View
function NextStepsView({ data, updateTask }) {
  const nextSteps = getNextSteps(data);
  const tasks = data.client_tasks || [];
  const activeTasks = tasks.filter(t => !t.completed);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Main Action */}
      <div className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Target className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">הפעולה הבאה שלך</h1>
            <p className="text-2xl mb-8 leading-relaxed">{nextSteps.main}</p>
            
            {nextSteps.actions.length > 0 && (
              <div className="space-y-4">
                <p className="text-lg font-semibold opacity-90">הצעדים הקונקרטיים:</p>
                {nextSteps.actions.map((action, idx) => (
                  <div key={idx} className="bg-white/20 backdrop-blur rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                        <p className="text-base opacity-95 mb-3">{action.why}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{action.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">משימות פעילות ({activeTasks.length})</h2>
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={updateTask} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Timeline View
function TimelineView({ data }) {
  const timeline = getWeeklyTimeline(data);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">לוח הזמנים שלך</h1>
        <p className="text-gray-600 mb-8">מסלול התקדמות שבועי מותאם אישית</p>

        <div className="space-y-8">
          {timeline.map((week, idx) => (
            <div key={idx} className="relative">
              {/* Week Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{week.title}</h3>
                  <p className="text-sm text-gray-600">{week.dates}</p>
                </div>
              </div>

              {/* Week Tasks */}
              <div className="mr-6 border-r-2 border-gray-200 pr-8 space-y-4">
                {week.tasks.map((task, taskIdx) => (
                  <div key={taskIdx} className="relative">
                    <div className="absolute -right-[41px] w-4 h-4 bg-white border-4 border-blue-600 rounded-full"></div>
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">{task.title}</h4>
                          <p className="text-sm text-gray-700 mb-3">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {task.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {task.day}
                            </span>
                          </div>
                        </div>
                        {task.status === 'completed' && (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Financial View
function FinancialView({ data }) {
  const financialData = getFinancialOverview(data);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">התמונה הכלכלית</h1>
        <p className="text-gray-600 mb-8">סקירה פשוטה של המצב הכספי שלך</p>

        {/* Main Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">הכנסות</p>
                <p className="text-2xl font-bold text-gray-900">{financialData.income}</p>
              </div>
            </div>
            <p className="text-sm text-green-700">+15% מהחודש הקודם</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">הוצאות</p>
                <p className="text-2xl font-bold text-gray-900">{financialData.expenses}</p>
              </div>
            </div>
            <p className="text-sm text-blue-700">תקין</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">רווח נקי</p>
                <p className="text-2xl font-bold text-gray-900">{financialData.profit}</p>
              </div>
            </div>
            <p className="text-sm text-purple-700">מצוין!</p>
          </div>
        </div>

        {/* Financial Tips */}
        <div className="bg-yellow-50 border-r-4 border-yellow-400 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">טיפ חכם להחודש</h3>
              <p className="text-gray-700 leading-relaxed">
                {financialData.tip}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">תשלומים קרובים</h3>
          <div className="space-y-3">
            {financialData.upcomingPayments.map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{payment.title}</p>
                  <p className="text-sm text-gray-600">{payment.date}</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{payment.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Knowledge View
function KnowledgeView({ data }) {
  const knowledgeItems = getRelevantKnowledge(data);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">מרכז הידע שלך</h1>
            <p className="text-lg opacity-90">מידע רלוונטי לשלב שלך</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {knowledgeItems.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
            <div className={`bg-gradient-to-r ${item.color} p-6`}>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4 leading-relaxed">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {item.readTime}
                </span>
                <ArrowUpRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Marketing View
function MarketingView({ data, businessStage }) {
  const isReady = businessStage.label === 'צמיחה' || businessStage.label === 'מבוסס';
  const marketingActions = getMarketingActions(data, isReady);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {!isReady ? (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">עדיין לא הזמן לשיווק</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                כדי שהשיווק יצליח, חשוב קודם לוודא שהעסק מוכן. בשלב הנוכחי שלך, עדיף להתמקד בבניית תשתית יציבה.
              </p>
              <p className="text-base text-gray-600">
                נחזור לנושא השיווק כשתגיע לשלב הצמיחה 🚀
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">הצעות שיווקיות</h1>
                <p className="text-lg opacity-90">פעולות קטנות שיכולות לעשות הבדל גדול</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {marketingActions.map((action, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-gray-700 mb-3">{action.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>קושי: {action.difficulty}</span>
                      <span>•</span>
                      <span>השפעה: {action.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

// Helper Components
function StatusCard({ title, value, icon, color, description }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 text-center mb-2">{title}</p>
      <p className="text-2xl font-bold text-gray-900 text-center mb-1">{value}</p>
      <p className="text-xs text-gray-500 text-center">{description}</p>
    </div>
  );
}

function MetricCard({ label, value, change, trend, icon }) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-blue-100'} rounded-full flex items-center justify-center ${trendColors[trend]}`}>
          {icon}
        </div>
        <span className={`text-sm font-semibold ${trendColors[trend]}`}>{change}</span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TaskCard({ task, onComplete }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
          <p className="text-gray-700 leading-relaxed">{task.description}</p>
        </div>
        {task.urgency && (
          <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
            task.urgency === 'high' ? 'bg-red-100 text-red-700' :
            task.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {task.urgency === 'high' ? 'דחוף' :
             task.urgency === 'medium' ? 'חשוב' : 'רגיל'}
          </span>
        )}
      </div>

      {task.why && (
        <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded mb-4">
          <p className="text-sm text-blue-900">
            <strong>למה חשוב:</strong> {task.why}
          </p>
        </div>
      )}

      <Button
        onClick={() => onComplete.mutate({ taskId: task.id, completed: true })}
        className="bg-[#27AE60] hover:bg-[#2ECC71] w-full"
      >
        <CheckCircle className="w-5 h-5 ml-2" />
        השלמתי את זה
      </Button>
    </div>
  );
}

// Helper Functions
function getBusinessStage(client) {
  const stages = {
    new: { 
      label: 'התחלה', 
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-100'
    },
    contacted: { 
      label: 'הקמה', 
      icon: <FileText className="w-8 h-8 text-yellow-600" />,
      color: 'bg-yellow-100'
    },
    in_progress: { 
      label: 'התייצבות', 
      icon: <Activity className="w-8 h-8 text-green-600" />,
      color: 'bg-green-100'
    },
    qualified: { 
      label: 'צמיחה', 
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-100'
    },
    converted: { 
      label: 'מבוסס', 
      icon: <Award className="w-8 h-8 text-emerald-600" />,
      color: 'bg-emerald-100'
    }
  };
  return stages[client.status] || stages.new;
}

function getHealthStatus(client) {
  const status = client.status;
  if (status === 'converted' || status === 'qualified') {
    return {
      label: 'מצוין',
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      color: 'bg-green-100'
    };
  }
  if (status === 'in_progress') {
    return {
      label: 'טוב',
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-100'
    };
  }
  return {
    label: 'בהתחלה',
    icon: <Clock className="w-8 h-8 text-yellow-600" />,
    color: 'bg-yellow-100'
  };
}

function getMainInsight(client) {
  const insights = {
    new: 'העסק שלך רק מתחיל - זה הזמן לבנות תשתית חזקה שתישא אותך קדימה',
    contacted: 'אתה בתהליך - המפתח הוא סבלנות וביצוע עקבי של השלבים',
    in_progress: 'העסק שלך בתנועה! עכשיו חשוב לשמור על קצב ולא לפספס פרטים',
    qualified: 'אתה בשלב צמיחה - זה הזמן לחשוב חכם על הרחבה',
    converted: 'העסק שלך מבוסס ויציב - המטרה עכשיו היא שמירה והמשך שיפור'
  };
  return insights[client.status] || insights.new;
}

function getNextSteps(client) {
  const status = client.status;
  
  if (status === 'new' || status === 'contacted') {
    return {
      main: 'בואו נתחיל בצורה נכונה - פתיחת התיק והכנת התשתית',
      actions: [
        {
          title: 'פתיחת תיק במס הכנסה',
          why: 'זה הבסיס לכל התנהלות חוקית - בלי זה אתה לא יכול לעבוד רשמית',
          time: '3-5 ימי עסקים'
        },
        {
          title: 'רישום בביטוח לאומי',
          why: 'חובה חוקית שמגנה עליך מקנסות כבדים ונותנת לך זכויות',
          time: 'שבוע אחד'
        },
        {
          title: 'הקמת מערכת חשבוניות',
          why: 'כדי שתוכל להתחיל לעבוד ולהכניס כסף באופן רשמי',
          time: '2-3 ימים'
        }
      ]
    };
  }
  
  if (status === 'in_progress') {
    return {
      main: 'העסק בתנועה - עכשיו חשוב לשמור על סדר ולהתחיל לתכנן',
      actions: [
        {
          title: 'ארגון הוצאות והכנסות',
          why: 'כדי לדעת בדיוק איפה הכסף נמצא ולקבל החלטות נכונות',
          time: 'פעילות שוטפת'
        },
        {
          title: 'תכנון מס חכם',
          why: 'להימנע מהפתעות בסוף השנה ולחסוך כסף',
          time: 'פגישה אחת'
        }
      ]
    };
  }
  
  return {
    main: 'אתה במצב טוב! עכשיו נתמקד בשמירה על היציבות וצמיחה חכמה',
    actions: [
      {
        title: 'סקירה תקופתית',
        why: 'לוודא שהכל עובד חלק ושאין בעיות מתפתחות',
        time: 'פעם ברבעון'
      },
      {
        title: 'בחינת הזדמנויות צמיחה',
        why: 'לזהות איפה אפשר להרוויח יותר בלי להסתכן',
        time: 'פגישה חודשית'
      }
    ]
  };
}

function getRecentActivity(client) {
  return [
    {
      title: 'עדכון מסמכים',
      time: 'לפני 2 ימים',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-100'
    },
    {
      title: 'תשלום לביטוח לאומי',
      time: 'לפני שבוע',
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      color: 'bg-green-100'
    },
    {
      title: 'פגישת ליווי',
      time: 'לפני שבועיים',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-100'
    }
  ];
}

function getWeeklyTimeline(client) {
  return [
    {
      title: 'שבוע 1 - תשתית',
      dates: '1-7 בחודש',
      tasks: [
        {
          title: 'פתיחת התיק',
          description: 'רישום במס הכנסה וביטוח לאומי',
          duration: '3 ימים',
          day: 'ראשון-רביעי',
          status: 'completed'
        },
        {
          title: 'הכנת מסמכים',
          description: 'איסוף כל המסמכים הנדרשים',
          duration: '2 ימים',
          day: 'חמישי-שישי'
        }
      ]
    },
    {
      title: 'שבוע 2 - הקמה',
      dates: '8-14 בחודש',
      tasks: [
        {
          title: 'הקמת מערכת חשבוניות',
          description: 'בחירת מערכת והדרכה',
          duration: '2 ימים',
          day: 'ראשון-שני'
        },
        {
          title: 'הגדרת תהליכים',
          description: 'איך לנהל הכנסות והוצאות',
          duration: '3 ימים',
          day: 'רביעי-שישי'
        }
      ]
    }
  ];
}

function getFinancialOverview(client) {
  return {
    income: '₪42,000',
    expenses: '₪28,000',
    profit: '₪14,000',
    tip: 'כדאי לבדוק אם אתה מנצל את כל ההוצאות המותרות בניכוי - זה יכול לחסוך לך אלפי שקלים במס',
    upcomingPayments: [
      { title: 'ביטוח לאומי', date: '15 בחודש', amount: '₪2,400' },
      { title: 'מקדמת מס', date: '20 בחודש', amount: '₪3,200' }
    ]
  };
}

function getRelevantKnowledge(client) {
  return [
    {
      title: 'איך לדעת אם אתה רווחי',
      description: 'הסבר פשוט וברור איך לחשב את הרווחיות האמיתית שלך, מעבר למה שנכנס לחשבון',
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      color: 'from-green-500 to-green-600',
      readTime: '4 דקות'
    },
    {
      title: 'ניהול נכון של הוצאות',
      description: 'מה מותר לנכות, מה אסור, ואיך לעשות את זה נכון כדי למקסם חיסכון במס',
      icon: <DollarSign className="w-8 h-8 text-white" />,
      color: 'from-blue-500 to-blue-600',
      readTime: '3 דקות'
    },
    {
      title: 'תכנון מס חכם',
      description: 'איך לתכנן את השנה כדי לשלם פחות מס באופן חוקי לחלוטין',
      icon: <Shield className="w-8 h-8 text-white" />,
      color: 'from-purple-500 to-purple-600',
      readTime: '5 דקות'
    },
    {
      title: 'טעויות נפוצות להימנע מהן',
      description: 'הטעויות שעצמאים עושים והכי עולות להם כסף - ואיך להימנע מהן',
      icon: <AlertCircle className="w-8 h-8 text-white" />,
      color: 'from-red-500 to-red-600',
      readTime: '4 דקות'
    }
  ];
}

function getMarketingActions(client, isReady) {
  if (!isReady) return [];
  
  return [
    {
      title: 'שיפור נוכחות דיגיטלית',
      description: 'עדכון קבוע של פרופילים ברשתות חברתיות עם תוכן איכותי',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      difficulty: 'קל',
      impact: 'בינונית'
    },
    {
      title: 'בניית המלצות',
      description: 'לבקש מלקוחות מרוצים המלצה או ביקורת - זה עובד יותר מכל פרסום',
      icon: <Award className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      difficulty: 'קל מאוד',
      impact: 'גבוהה'
    },
    {
      title: 'שיתופי פעולה',
      description: 'מציאת עסקים משלימים ועבודה משותפת - זה מרחיב את החשיפה',
      icon: <Target className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      difficulty: 'בינוני',
      impact: 'גבוהה'
    }
  ];
}