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
import TabNavigation from '@/components/client/TabNavigation';
import NotificationCenter from '@/components/client/NotificationCenter';
import ShoppingCart from '@/components/client/shared/ShoppingCart';

export default function Summary() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [language, setLanguage] = useState('he');
  const navigate = useNavigate();

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
            
            {/* 1. Hero Section: Personal Diagnosis */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] text-white py-12 px-6 sm:px-10 rounded-3xl overflow-hidden mb-10 shadow-xl"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    
                    {/* Stage & Challenge */}
                    <div className="flex-1 text-center md:text-right">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6 border border-white/20">
                            <Brain className="w-4 h-4 text-amber-300" />
                            <span className="text-sm font-medium tracking-wide">תוצאות האבחון העסקי שלך</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                            העסק שלך בשלב: <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-100">
                                {stageLabels[stage]}
                            </span>
                        </h1>

                        {primaryChallenge && (
                            <div className="bg-white/10 rounded-2xl p-4 mt-6 border border-white/10 backdrop-blur-sm inline-block w-full md:max-w-xl">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Target className="w-5 h-5 text-red-200" />
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            האתגר המרכזי שזיהינו: {challengeLabels[primaryChallenge]}
                                        </h3>
                                        <p className="text-blue-100 text-sm leading-relaxed">
                                            {challengeDescriptions[primaryChallenge]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Unified Recommendation Highlight */}
                    {unifiedRecommendation?.single_next_action && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full md:w-[320px] bg-white text-[#1E3A5F] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-60"></div>
                            
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">המיקוד שלך כרגע</h3>
                            <div className="text-2xl font-black leading-tight mb-4">
                                {unifiedRecommendation.single_next_action}
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-700">זה הדבר שיביא לשינוי הגדול ביותר</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-700">כל השאר יכול לחכות כרגע</span>
                                </div>
                            </div>

                            <Button 
                                onClick={() => navigate(createPageUrl('ClientDashboard') + '?tab=goals')}
                                className="w-full bg-[#1E3A5F] hover:bg-[#162B47] text-white font-bold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                התחל לפעול עכשיו
                                <ArrowRight className="w-4 h-4 mr-2" />
                            </Button>
                        </motion.div>
                    )}
                </div>
              </div>
            </motion.div>

            {/* 1.5 Diagnostic Report Detail */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
               <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">דוח מצב קיים</h2>
                      <p className="text-gray-500">ניתוח מעמיק של העסק נכון להיום</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Marketing Status */}
                      <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <Megaphone className="w-5 h-5" />
                              </div>
                              <h3 className="font-bold text-gray-900">שיווק</h3>
                          </div>
                          <div className="space-y-2">
                              <p className="text-sm text-gray-500">סטטוס נוכחי</p>
                              <div className="font-semibold text-blue-900">
                                  {{
                                      'not_ready': 'טרם בשל לשיווק',
                                      'testing': 'בשלב הטסטים',
                                      'scaling': 'בצמיחה והרחבה',
                                      'optimizing': 'באופטימיזציה',
                                      'paused': 'פעילות מושהית'
                                  }[businessState?.marketing_state?.current_phase] || 'טרם הוגדר'}
                              </div>
                              <p className="text-xs text-gray-400">
                                  {businessState?.marketing_state?.active_channels?.length > 0 
                                      ? `${businessState.marketing_state.active_channels.length} ערוצים פעילים`
                                      : 'אין ערוצים פעילים'
                                  }
                              </p>
                          </div>
                      </div>

                      {/* Sales Status */}
                      <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                  <DollarSign className="w-5 h-5" />
                              </div>
                              <h3 className="font-bold text-gray-900">מכירות</h3>
                          </div>
                          <div className="space-y-2">
                              <p className="text-sm text-gray-500">צוואר בקבוק עיקרי</p>
                              <div className="font-semibold text-green-900">
                                  {{
                                      'lead_gen': 'כמות לידים',
                                      'qualification': 'איכות לידים',
                                      'closing': 'סגירת עסקאות',
                                      'none': 'הכל תקין'
                                  }[businessState?.sales_state?.bottleneck] || 'טרם זוהה'}
                              </div>
                              <div className="w-full bg-green-100 rounded-full h-1.5 mt-2">
                                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                              </div>
                          </div>
                      </div>

                      {/* Operations Status */}
                      <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                  <Zap className="w-5 h-5" />
                              </div>
                              <h3 className="font-bold text-gray-900">תפעול ועומס</h3>
                          </div>
                          <div className="space-y-2">
                              <p className="text-sm text-gray-500">מצב עומס נוכחי</p>
                              <div className="font-semibold text-purple-900">
                                  {{
                                      'under_capacity': 'יש מקום לעבודה',
                                      'optimal': 'עומס אופטימלי',
                                      'near_limit': 'קרוב לקצה',
                                      'overloaded': 'עומס יתר'
                                  }[businessState?.operations_state?.workload_status] || 'לא ידוע'}
                              </div>
                              <p className="text-xs text-gray-400">
                                  {businessState?.operations_state?.workload_status === 'overloaded' 
                                      ? 'נדרשת התייעלות דחופה' 
                                      : 'יש יכולת לקלוט לקוחות'}
                              </p>
                          </div>
                      </div>

                      {/* Focus Status */}
                      <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                          <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                  <Target className="w-5 h-5" />
                              </div>
                              <h3 className="font-bold text-gray-900">מיקוד אסטרטגי</h3>
                          </div>
                          <div className="space-y-2">
                              <p className="text-sm text-gray-500">הכיוון הנוכחי</p>
                              <div className="font-semibold text-amber-900">
                                  {{
                                      'growth': 'צמיחה והתרחבות',
                                      'stability': 'ייצוב המערכת',
                                      'optimization': 'שיפור רווחיות',
                                      'survival': 'הישרדות וחירום'
                                  }[businessState?.focus_state?.current_strategic_focus] || 'כללי'}
                              </div>
                              <div className="flex gap-1 mt-2">
                                  {[1,2,3].map(i => (
                                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i === 1 ? 'bg-amber-400' : 'bg-amber-100'}`} />
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
               </div>
            </motion.div>

            {/* 2. The Plan: Your Personal Roadmap */}
            {clientTasks.length > 0 && (
                <div className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">תוכנית הפעולה שבנינו עבורך</h2>
                        <p className="text-gray-600 mt-2">צעד אחר צעד, מהמצב הנוכחי ועד ליעד</p>
                    </div>

                    <div className="space-y-4">
                        {clientTasks.map((task, idx) => {
                            // First task is "Current", others are "Future"
                            const isCurrent = idx === 0;
                            return (
                                <motion.div
                                    key={task.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-300 ${
                                        isCurrent 
                                        ? 'bg-white border-blue-500 shadow-xl scale-[1.02] z-10' 
                                        : 'bg-white border-transparent hover:border-gray-200 shadow-sm opacity-80 hover:opacity-100'
                                    }`}
                                >
                                    {/* Line connector */}
                                    {idx < clientTasks.length - 1 && (
                                        <div className="absolute top-1/2 right-[2.25rem] w-0.5 h-[calc(100%+16px)] bg-gray-100 -z-10 translate-y-1/2"></div>
                                    )}

                                    {/* Number/Icon */}
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold border-4 ${
                                        isCurrent 
                                        ? 'bg-blue-600 border-blue-100 text-white shadow-lg' 
                                        : 'bg-gray-100 border-white text-gray-400'
                                    }`}>
                                        {idx + 1}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-bold text-lg ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {task.title}
                                            </h3>
                                            {isCurrent && (
                                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    עכשיו
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-sm">{task.description}</p>
                                    </div>

                                    {isCurrent ? (
                                        <Button 
                                            onClick={() => navigate(createPageUrl('ClientDashboard') + '?tab=goals')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md whitespace-nowrap hidden sm:flex"
                                        >
                                            התחל משימה
                                        </Button>
                                    ) : (
                                        <Lock className="w-5 h-5 text-gray-300 hidden sm:block" />
                                    )}
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

            {/* Bottom Sticky CTA on Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:hidden z-40">
                <Button 
                    onClick={() => navigate(createPageUrl('ClientDashboard') + '?tab=goals')}
                    className="w-full bg-[#1E3A5F] text-white font-bold h-12 rounded-xl shadow-lg"
                >
                    התחל את המשימה הראשונה
                </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}