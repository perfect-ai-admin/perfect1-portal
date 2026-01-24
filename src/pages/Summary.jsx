import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Rocket, Brain, Zap, Award, ArrowRight, Lightbulb, Users, DollarSign, Target, TrendingUp, 
  Crown, Shield, Sparkles, LogOut, HelpCircle, Globe, CreditCard, LogIn, User, Check, Map, Lock, Megaphone
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import GoalTemplatesFixed, { GOAL_TEMPLATES } from '@/components/client/goals/GoalTemplatesFixed';
import TabNavigation from '@/components/client/TabNavigation';
import NotificationCenter from '@/components/client/NotificationCenter';
import ShoppingCart from '@/components/client/shared/ShoppingCart';

export default function Summary() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [language, setLanguage] = useState('he');
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [recommendedGoal, setRecommendedGoal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const clientTasks = user?.client_tasks || [];
    
    if (clientTasks.length > 0) {
      const firstTask = clientTasks[0];
      
      const customTemplate = {
        id: firstTask.id || 'custom_task_1',
        name: firstTask.title,
        description: firstTask.description,
        icon: Target,
        color: 'from-blue-500 to-blue-600',
        questions: [
          { id: 'q1', label: 'מה הצעד המעשי הראשון לביצוע המשימה?', placeholder: 'לדוגמה: לכתוב טיוטה / להרים טלפון' },
          { id: 'q2', label: 'מתי אתה מתכנן להשלים אותה?', placeholder: 'לדוגמה: עד סוף השבוע' }
        ],
        defaultTitle: firstTask.title
      };
      
      setRecommendedGoal(customTemplate);
    } else if (GOAL_TEMPLATES && GOAL_TEMPLATES.length > 0) {
      setRecommendedGoal(GOAL_TEMPLATES[0]);
    }
  }, [user]);

  const handleCreateGoal = async (goalData) => {
    try {
      await base44.entities.UserGoal.create({
        ...goalData,
        user_id: user.id
      });
      setShowGoalDialog(false);
      navigate(createPageUrl('ClientDashboard') + '?tab=goals');
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
        } else {
          base44.auth.redirectToLogin('/Summary');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, []);

  const handleTabChange = (tabId) => {
    // Navigate to dashboard with specific tab, unless it's the current summary tab which we are on
    if (tabId === 'summary') return;
    navigate(`${createPageUrl('ClientDashboard')}?tab=${tabId}`);
  };

  const handleLogout = async () => {
     await base44.auth.logout();
  };

  const toggleLanguage = () => {
    const newLang = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">טוען...</p>
        </div>
      </div>
    );
  }

  const businessState = user?.business_state || {};
  const stage = businessState?.stage || 'unknown';
  const primaryChallenge = businessState?.primary_challenge;
  const unifiedRecommendation = businessState?.unified_recommendation || {};
  const clientTasks = user?.client_tasks || [];

  const stageLabels = {
    pre_revenue: 'לפני הכנסה ראשונה',
    early_revenue: 'הכנסה ראשונה',
    growing: 'בגדילה',
    stable: 'יציב',
    declining: 'בירידה',
    crisis: 'במשבר'
  };

  const challengeLabels = {
    no_leads: 'חוסר בלידים איכותיים',
    low_conversion: 'קושי בסגירת עסקאות',
    overload: 'עומס ולחץ תפעולי',
    cash_flow: 'בעיות תזרים מזומנים',
    retention: 'נטישת לקוחות',
    focus: 'חוסר מיקוד עסקי'
  };

  const challengeDescriptions = {
    no_leads: 'העסק זקוק ליותר פניות רלוונטיות כדי לצמוח.',
    low_conversion: 'יש פניות, אבל הן לא הופכות לכסף בקופה.',
    overload: 'אתה עובד קשה מדי ולא מצליח להתפנות לפיתוח העסק.',
    cash_flow: 'יש פער בין העבודה שנעשית לבין הכסף שנכנס לבנק.',
    retention: 'לקוחות לא חוזרים או עוזבים מהר מדי.',
    focus: 'יש המון רעיונות וכיוונים, אבל חסר מסלול אחד ברור.'
  };

  const journeyStages = [
    { 
      icon: Rocket, 
      title: 'קביעת מטרה', 
      description: 'נבחר יחד את המטרה הכי חשובה לעסק שלך',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      icon: Brain, 
      title: 'בניית תוכנית', 
      description: 'המערכת תבנה תוכנית פעולה מותאמת אישית',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      icon: Zap, 
      title: 'ליווי יומיומי', 
      description: 'המנטור העסקי ילווה אותך בכל צעד',
      color: 'from-amber-500 to-amber-600'
    },
    { 
      icon: Award, 
      title: 'השגת תוצאות', 
      description: 'נעקוב אחר ההתקדמות ונחגוג הצלחות',
      color: 'from-green-500 to-green-600'
    }
  ];

  // Default permissions if not available
  const permissions = {
    marketing: true,
    mentor: true,
    finance: true
  };

  return (
    <>
      <Helmet>
        <title>אבחון וסיכום - {user.full_name} | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#F8F9FA]" dir={language === 'he' ? 'rtl' : 'ltr'}>
        {/* Header - Replica of Pricing/Dashboard Header */}
        <header 
          className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow sticky top-0 z-50"
          role="banner"
        >
          <div className="w-full px-3 sm:px-6 lg:px-8">
            {/* Top Bar - 56px fixed height */}
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(-1)} 
                  className="text-white hover:bg-white/10 hover:text-white p-2 h-auto rounded-full transition-colors mr-1"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
                
                <Avatar className="w-9 h-9 border border-white/20 flex-shrink-0">
                  <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.full_name}</p>
                </div>
              </div>

              {/* Right Icons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <ShoppingCart />
                
                <button
                  onClick={() => navigate(createPageUrl('PricingPerfectBizAI'))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/90 hover:text-white"
                  title="מחירון ומסלולים"
                >
                  <CreditCard className="w-6 h-6" />
                </button>

                <NotificationCenter />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-white/10 rounded transition-colors" aria-label="תפריט">
                      <User className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={toggleLanguage} className="text-sm">
                      <Globe className="w-4 h-4 ml-2" />
                      {language === 'he' ? 'English' : 'עברית'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">
                      <HelpCircle className="w-4 h-4 ml-2" />
                      עזרה
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600">
                      <LogOut className="w-4 h-4 ml-2" />
                      יציאה
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tab Navigation - Desktop Only */}
            <div className="hidden md:block">
              <TabNavigation 
                activeTab={activeTab} 
                onChange={handleTabChange} 
                availableTabs={[
                  { id: 'progress', label: 'מסע העסק', icon: 'MapPin' },
                  permissions.finance && { id: 'business', label: 'נתוני העסק', icon: 'BarChart3' },
                  permissions.finance && { id: 'financial', label: 'כספים', icon: 'Wallet' },
                  permissions.mentor && { id: 'goals', label: 'מטרות', icon: 'Target' },
                  permissions.marketing && { id: 'marketing', label: 'שיווק', icon: 'Megaphone' },
                  permissions.mentor && { id: 'mentor', label: 'מנטור', icon: 'Lightbulb' }
                ].filter(Boolean)} 
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-8 pb-12">
          <div className="max-w-4xl mx-auto w-full">
            
            {/* 1. Hero Section: Super Minimalist Typography */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 mb-8"
            >
              <div className="flex flex-col lg:flex-row items-start justify-between gap-16">
                  
                  {/* Left Side: Pure Typography */}
                  <div className="flex-1 max-w-3xl">
                      <span className="text-blue-600 font-bold tracking-wide uppercase mb-3 block">
                        תוצאות האבחון העסקי שלך
                      </span>

                      <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                          העסק בשלב <br />
                          <span className="text-blue-600">
                              {stageLabels[stage]}
                          </span>
                      </h1>

                      <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mb-10 font-light">
                        על בסיס הנתונים שהזנת, זיהינו שזהו השלב הקריטי ביותר בצמיחה שלך. 
                        בנינו עבורך תוכנית עבודה מותאמת אישית שתעזור לך לעבור לשלב הבא.
                      </p>

                      {primaryChallenge && (
                          <div className="pl-6 border-l-4 border-orange-400">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  האתגר האסטרטגי: {challengeLabels[primaryChallenge]}
                              </h3>
                              <p className="text-gray-500">
                                  {challengeDescriptions[primaryChallenge]}
                              </p>
                          </div>
                      )}
                  </div>

                  {/* Right Side: Recommendation - Clean */}
                  {unifiedRecommendation?.single_next_action && (
                      <div className="w-full lg:w-[380px] pt-4">
                          <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                המהלך האסטרטגי הבא
                              </h3>
                              
                              <div className="text-2xl font-bold text-gray-900 leading-snug mb-6">
                                  {unifiedRecommendation.single_next_action}
                              </div>
                              
                              <Button 
                                  onClick={() => navigate(createPageUrl('ClientDashboard') + '?tab=goals')}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-lg transition-all"
                              >
                                  מעבר לביצוע
                                  <ArrowRight className="w-4 h-4 mr-2" />
                              </Button>
                          </div>
                      </div>
                  )}
              </div>
            </motion.div>

            {/* 1.5 Diagnostic Report Detail - Professional Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
               <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">דוח מצב קיים</h2>
                        <p className="text-gray-500 mt-1">תמונת מצב עדכנית של ביצועי העסק</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        מעודכן להיום
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Marketing Status */}
                      <div className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 relative">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-gray-700">שיווק</h3>
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  <Megaphone className="w-5 h-5" />
                              </div>
                          </div>
                          <div className="space-y-1">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">סטטוס נוכחי</p>
                              <div className="font-bold text-xl text-gray-900">
                                  {{
                                      'not_ready': 'טרם בשל',
                                      'testing': 'בטסטים',
                                      'scaling': 'בצמיחה',
                                      'optimizing': 'אופטימיזציה',
                                      'paused': 'מושהה'
                                  }[businessState?.marketing_state?.current_phase] || 'טרם הוגדר'}
                              </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="w-4 h-4 text-gray-400" />
                              {businessState?.marketing_state?.active_channels?.length > 0 
                                  ? `${businessState.marketing_state.active_channels.length} ערוצים פעילים`
                                  : 'אין ערוצים פעילים'
                              }
                          </div>
                      </div>

                      {/* Sales Status */}
                      <div className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 relative">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-gray-700">מכירות</h3>
                              <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                  <DollarSign className="w-5 h-5" />
                              </div>
                          </div>
                          <div className="space-y-1">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">צוואר בקבוק</p>
                              <div className="font-bold text-xl text-gray-900">
                                  {{
                                      'lead_gen': 'כמות לידים',
                                      'qualification': 'איכות לידים',
                                      'closing': 'סגירת עסקאות',
                                      'none': 'הכל תקין'
                                  }[businessState?.sales_state?.bottleneck] || 'בבדיקה'}
                              </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                              </div>
                          </div>
                      </div>

                      {/* Operations Status */}
                      <div className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 relative">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-gray-700">תפעול</h3>
                              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                  <Zap className="w-5 h-5" />
                              </div>
                          </div>
                          <div className="space-y-1">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">עומס עבודה</p>
                              <div className="font-bold text-xl text-gray-900">
                                  {{
                                      'under_capacity': 'פנוי לעבודה',
                                      'optimal': 'אופטימלי',
                                      'near_limit': 'גבוה',
                                      'overloaded': 'עומס יתר'
                                  }[businessState?.operations_state?.workload_status] || 'לא ידוע'}
                              </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                              {businessState?.operations_state?.workload_status === 'overloaded' 
                                  ? <span className="text-red-500 flex items-center gap-1"><Shield className="w-3 h-3"/> נדרשת התייעלות</span>
                                  : <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3"/> יש קיבולת</span>}
                          </div>
                      </div>

                      {/* Focus Status */}
                      <div className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 relative">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-gray-700">אסטרטגיה</h3>
                              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                  <Target className="w-5 h-5" />
                              </div>
                          </div>
                          <div className="space-y-1">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">מיקוד</p>
                              <div className="font-bold text-xl text-gray-900">
                                  {{
                                      'growth': 'צמיחה',
                                      'stability': 'יציבות',
                                      'optimization': 'רווחיות',
                                      'survival': 'חירום'
                                  }[businessState?.focus_state?.current_strategic_focus] || 'כללי'}
                              </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-1">
                              {[1,2,3].map(i => (
                                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 2 ? 'bg-amber-400' : 'bg-gray-100'}`} />
                              ))}
                          </div>
                      </div>
                  </div>
               </div>
            </motion.div>

            {/* 2. The Plan: Your Personal Roadmap */}
            {clientTasks.length > 0 && (
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
                            <Map className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">מפת הדרכים שלך להצלחה</h2>
                        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                            תוכנית עבודה מדויקת שלוקחת אותך מהמצב הנוכחי (שלב {stageLabels[stage]}) 
                            ועד ליעד שהגדרנו.
                        </p>
                    </div>

                    {/* Desktop View - Horizontal Graph */}
                    <div className="hidden md:block relative px-4">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
                        <div className="absolute top-1/2 right-0 h-1 bg-blue-500 -translate-y-1/2 z-0 rounded-full transition-all duration-1000" style={{ width: '15%' }}></div>
                        
                        <div className="relative z-10 grid grid-cols-4 gap-4">
                            {clientTasks.map((task, idx) => {
                                const isCurrent = idx === 0;
                                return (
                                    <motion.div 
                                        key={task.id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.15 }}
                                        className="flex flex-col items-center text-center group"
                                    >
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center border-4 mb-4 transition-all duration-300 relative
                                            ${isCurrent 
                                                ? 'bg-blue-600 border-blue-200 text-white scale-125 shadow-lg shadow-blue-200' 
                                                : 'bg-white border-gray-200 text-gray-400 group-hover:border-blue-300'
                                            }
                                        `}>
                                            {isCurrent ? <TrendingUp className="w-5 h-5" /> : idx + 1}
                                            
                                            {isCurrent && (
                                                <div className="absolute -top-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm whitespace-nowrap animate-bounce">
                                                    אנחנו כאן
                                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
                                                </div>
                                            )}
                                        </div>

                                        <div className={`p-4 rounded-xl transition-all duration-300 w-full min-h-[140px] flex flex-col justify-between
                                            ${isCurrent 
                                                ? 'bg-blue-50 border border-blue-100 shadow-sm' 
                                                : 'bg-white border border-transparent hover:border-gray-100'
                                            }
                                        `}>
                                            <div>
                                                <h3 className={`font-bold text-sm mb-2 ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {task.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 line-clamp-3">
                                                    {task.description}
                                                </p>
                                            </div>
                                            
                                            {isCurrent && (
                                                <Button 
                                                    onClick={() => setShowGoalDialog(true)}
                                                    size="sm"
                                                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                                >
                                                    התחל עכשיו
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mobile View - Vertical Graph - Refined UX */}
                    <div className="md:hidden relative pr-2">
                        {/* Elegant Connection Line */}
                        <div className="absolute top-6 bottom-6 right-[27px] w-[2px] bg-gradient-to-b from-blue-600 via-gray-200 to-transparent opacity-20"></div>
                        
                        {clientTasks.map((task, idx) => {
                            const isCurrent = idx === 0;
                            return (
                                <motion.div
                                    key={task.id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="relative flex gap-5 mb-6 last:mb-0"
                                >
                                    {/* Timeline Node */}
                                    <div className={`
                                        relative z-10 w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-500
                                        ${isCurrent 
                                            ? 'bg-white border-4 border-blue-50 text-blue-600 shadow-xl shadow-blue-100 scale-100' 
                                            : 'bg-white border border-gray-100 text-gray-300'
                                        }
                                    `}>
                                        {isCurrent ? <Target className="w-6 h-6" /> : <span className="text-sm font-medium text-gray-400">{idx + 1}</span>}
                                        
                                        {/* Subtle Pulse for Current */}
                                        {isCurrent && (
                                            <span className="absolute inset-0 rounded-full border border-blue-100 animate-ping opacity-75"></span>
                                        )}
                                    </div>

                                    {/* Content Card */}
                                    <div className={`flex-1 rounded-2xl p-5 transition-all duration-300
                                        ${isCurrent 
                                            ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100' 
                                            : 'bg-transparent border border-transparent opacity-70 grayscale'
                                        }
                                    `}>
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className={`text-base font-bold ${isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {task.title}
                                            </h3>
                                        </div>
                                        
                                        <p className={`text-sm leading-relaxed mb-4 ${isCurrent ? 'text-gray-500' : 'text-gray-400 line-clamp-2'}`}>
                                            {task.description}
                                        </p>
                                        
                                        {isCurrent && (
                                            <Button 
                                                onClick={() => setShowGoalDialog(true)}
                                                className="w-full bg-gray-900 text-white hover:bg-black rounded-xl h-11 text-sm font-medium shadow-lg shadow-gray-200 transition-transform active:scale-95"
                                            >
                                                התחל את המשימה
                                                <ArrowRight className="w-4 h-4 mr-2" />
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}


            {/* 3. Why Us Section - Reassurance */}
            <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl p-8 md:p-12 text-center border border-gray-100 shadow-sm mb-12">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  אנחנו איתך לאורך כל הדרך
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  התוכנית שבנינו לך היא לא סתם רשימת משימות. היא מבוססת על ניתוח של אלפי עסקים דומים, 
                  ומותאמת בדיוק לקצב וליכולות שלך. המנטור שלנו ילווה אותך, יזכיר לך מה חשוב, 
                  ויעזור לך לקבל החלטות נכונות.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {[
                        { label: 'ליווי אישי', icon: Users },
                        { label: 'תוכנית ברורה', icon: Map },
                        { label: 'מיקוד יומי', icon: Target },
                        { label: 'תוצאות בשטח', icon: TrendingUp }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2">
                            <item.icon className="w-6 h-6 text-blue-500" />
                            <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Desktop Bottom CTA */}
            <div className="hidden md:block mt-8 mb-16">
                <div className="bg-[#1E3A5F] rounded-2xl p-10 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
                    
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-black mb-4">מוכנים לצאת לדרך?</h2>
                        <p className="text-blue-100 text-lg mb-8">
                            התוכנית מוכנה, היעדים ברורים. בוא נתחיל את השינוי כבר היום.
                        </p>
                        <Button 
                            onClick={() => setShowGoalDialog(true)}
                            size="lg"
                            className="bg-white text-[#1E3A5F] hover:bg-gray-100 font-bold text-lg px-10 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            התחל את המשימה הראשונה
                            <ArrowRight className="w-5 h-5 mr-2" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Sticky CTA on Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden z-40">
                <Button 
                    onClick={() => setShowGoalDialog(true)}
                    className="w-full bg-[#1E3A5F] text-white font-bold h-12 rounded-xl shadow-lg"
                >
                    התחל את המשימה הראשונה
                </Button>
            </div>
            
            {showGoalDialog && recommendedGoal && (
                <GoalTemplatesFixed
                  onCreateGoal={handleCreateGoal}
                  onClose={() => setShowGoalDialog(false)}
                  user={user}
                  initialTemplate={recommendedGoal}
                />
            )}
          </div>
        </main>
      </div>
    </>
  );
}