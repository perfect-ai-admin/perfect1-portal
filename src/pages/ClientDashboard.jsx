import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, CheckCircle, Clock, AlertCircle, LogOut, 
  Zap, Target, BookOpen, MessageCircle, ArrowLeft, ChevronLeft, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClientDashboard() {
  const [client, setClient] = useState(null);
  const [showTask, setShowTask] = useState(null);
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
          <p className="text-gray-600">טוען את האזור האישי שלך...</p>
        </div>
      </div>
    );
  }

  const currentData = clientData || client;
  const businessStage = getBusinessStage(currentData);
  const healthStatus = getHealthStatus(currentData);
  const nextSteps = getNextSteps(currentData);
  const tasks = currentData.client_tasks || [];
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <>
      <Helmet>
        <title>מרכז הבקרה העסקי שלך | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">שלום, {currentData.name} 👋</h1>
                <p className="text-gray-200">ברוך הבא למרכז הבקרה העסקי שלך</p>
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
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Main Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">מה קורה בעסק עכשיו</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Business Type */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">סוג העסק</p>
                    <p className="text-xl font-bold text-gray-900">
                      {currentData.category === 'osek_patur' ? 'עוסק פטור' : 
                       currentData.category === 'monthly_support' ? 'ליווי חודשי' : 
                       'לקוח פעיל'}
                    </p>
                  </div>

                  {/* Current Stage */}
                  <div className="text-center">
                    <div className={`w-16 h-16 ${businessStage.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      {businessStage.icon}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">שלב נוכחי</p>
                    <p className="text-xl font-bold text-gray-900">{businessStage.label}</p>
                  </div>

                  {/* Health Status */}
                  <div className="text-center">
                    <div className={`w-16 h-16 ${healthStatus.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      {healthStatus.icon}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">מצב כללי</p>
                    <p className="text-xl font-bold text-gray-900">{healthStatus.label}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Step Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">השלב הבא שלך</h2>
                  <p className="text-xl mb-6 leading-relaxed">{nextSteps.main}</p>
                  
                  {nextSteps.actions.length > 0 && (
                    <div className="space-y-3">
                      {nextSteps.actions.map((action, idx) => (
                        <div key={idx} className="bg-white/20 backdrop-blur rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="font-bold">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-lg mb-1">{action.title}</p>
                              <p className="text-sm opacity-90 mb-2">{action.why}</p>
                              <p className="text-xs opacity-75">⏱️ {action.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Smart Tasks */}
          {activeTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">משימות חכמות</h2>
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
                          <p className="text-gray-700 mb-3 leading-relaxed">{task.description}</p>
                          
                          {task.why && (
                            <div className="bg-blue-50 border-r-4 border-blue-400 p-3 rounded mb-3">
                              <p className="text-sm text-blue-900">
                                <strong>למה זה חשוב:</strong> {task.why}
                              </p>
                            </div>
                          )}

                          {task.impact && (
                            <div className="bg-yellow-50 border-r-4 border-yellow-400 p-3 rounded mb-3">
                              <p className="text-sm text-yellow-900">
                                <strong>מה יקרה אם לא תטפל:</strong> {task.impact}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-4">
                            <Button
                              onClick={() => updateTaskMutation.mutate({ taskId: task.id, completed: true })}
                              className="bg-[#27AE60] hover:bg-[#2ECC71]"
                            >
                              <CheckCircle className="w-5 h-5 ml-2" />
                              סימון כבוצע
                            </Button>
                            {task.help_link && (
                              <Button
                                variant="outline"
                                onClick={() => setShowTask(task)}
                              >
                                עזרה
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {task.urgency && (
                          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            task.urgency === 'high' ? 'bg-red-100 text-red-700' :
                            task.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.urgency === 'high' ? 'דחוף' :
                             task.urgency === 'medium' ? 'חשוב' : 'רגיל'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Knowledge Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">מה חשוב לדעת עכשיו</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <KnowledgeCard
                title="איך לדעת אם אתה רווחי"
                description="הסבר פשוט איך לבדוק את הרווחיות האמיתית שלך"
                icon={<TrendingUp className="w-6 h-6" />}
                color="from-blue-500 to-blue-600"
                readTime="3 דק'"
              />
              <KnowledgeCard
                title="ניהול נכון של הוצאות"
                description="מה מותר לנכות ומה לא - בלי טעויות"
                icon={<BookOpen className="w-6 h-6" />}
                color="from-green-500 to-green-600"
                readTime="2 דק'"
              />
            </div>
          </motion.div>

          {/* Business Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">המדדים שלך</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <MetricCard
                label="מגמת רווחיות"
                value="עולה"
                trend="positive"
                icon={<TrendingUp className="w-6 h-6" />}
              />
              <MetricCard
                label="עומס מול יכולת"
                value="מאוזן"
                trend="neutral"
                icon={<Target className="w-6 h-6" />}
              />
              <MetricCard
                label="שליטה כללית"
                value="גבוהה"
                trend="positive"
                icon={<CheckCircle className="w-6 h-6" />}
              />
            </div>
          </motion.div>

          {/* Progress History */}
          {completedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">מה כבר השגת</h2>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-3">
                  {completedTasks.slice(0, 5).map((task, idx) => (
                    <div key={idx} className="flex items-center gap-3 pb-3 border-b border-gray-200 last:border-0">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{task.title}</p>
                        {task.completed_date && (
                          <p className="text-xs text-gray-500">
                            הושלם ב-{new Date(task.completed_date).toLocaleDateString('he-IL')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Bot Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">צריך עזרה או יש שאלה?</h3>
              <p className="text-lg mb-6 opacity-90">המלווה החכם שלנו זמין לך 24/7</p>
              <Button
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto"
                onClick={() => window.open('https://wa.me/972537703603?text=' + encodeURIComponent('היי, יש לי שאלה על העסק שלי'), '_blank')}
              >
                <MessageCircle className="w-6 h-6 ml-2" />
                פתח שיחה עם הבוט
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {showTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={() => setShowTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{showTask.title}</h3>
                <Button variant="ghost" onClick={() => setShowTask(null)}>
                  ✕
                </Button>
              </div>
              <div className="prose max-w-none" dir="rtl">
                <p className="text-gray-700 leading-relaxed">{showTask.help_content || showTask.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function KnowledgeCard({ title, description, icon, color, readTime }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
      <div className={`bg-gradient-to-r ${color} p-6`}>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-700 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">⏱️ {readTime}</span>
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, icon }) {
  const colors = {
    positive: 'from-green-500 to-emerald-500',
    neutral: 'from-blue-500 to-cyan-500',
    negative: 'from-red-500 to-orange-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className={`w-12 h-12 bg-gradient-to-r ${colors[trend]} rounded-full flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Helper functions
function getBusinessStage(client) {
  const stages = {
    new: { 
      label: 'התחלה', 
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-100'
    },
    contacted: { 
      label: 'בתהליך הקמה', 
      icon: <Clock className="w-8 h-8 text-yellow-600" />,
      color: 'bg-yellow-100'
    },
    in_progress: { 
      label: 'התייצבות', 
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      color: 'bg-green-100'
    },
    qualified: { 
      label: 'צמיחה', 
      icon: <Target className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-100'
    },
    converted: { 
      label: 'מבוסס', 
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      color: 'bg-green-100'
    }
  };
  
  return stages[client.status] || stages.new;
}

function getHealthStatus(client) {
  // Simple logic - can be enhanced
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

function getNextSteps(client) {
  // This should be AI-generated based on client data, but for now we'll use simple logic
  const status = client.status;
  
  if (status === 'new' || status === 'contacted') {
    return {
      main: 'בוא נתחיל בצורה נכונה - פתיחת התיק והכנת התשתית',
      actions: [
        {
          title: 'פתיחת תיק במס הכנסה',
          why: 'זה הבסיס לכל התנהלות חוקית',
          time: '3-5 ימי עסקים'
        },
        {
          title: 'רישום בביטוח לאומי',
          why: 'חובה חוקית ומגן עליך מקנסות',
          time: 'שבוע אחד'
        },
        {
          title: 'הקמת מערכת חשבוניות',
          why: 'כדי שתוכל להתחיל לעבוד באופן רשמי',
          time: '2-3 ימים'
        }
      ]
    };
  }
  
  if (status === 'in_progress') {
    return {
      main: 'העסק בתנועה - עכשיו חשוב לשמור על סדר ולהתחיל לתכנן צמיחה',
      actions: [
        {
          title: 'ארגון הוצאות והכנסות',
          why: 'כדי לדעת בדיוק מה המצב הכלכלי שלך',
          time: 'פעילות שוטפת'
        },
        {
          title: 'תכנון מס מקדים',
          why: 'להימנע מהפתעות בסוף השנה',
          time: 'פגישה אחת'
        }
      ]
    };
  }
  
  return {
    main: 'אתה במצב טוב! עכשיו נתמקד בשמירה על היציבות והמשך צמיחה',
    actions: [
      {
        title: 'סקירה תקופתית',
        why: 'לוודא שהכל עובד חלק',
        time: 'רבעון'
      }
    ]
  };
}