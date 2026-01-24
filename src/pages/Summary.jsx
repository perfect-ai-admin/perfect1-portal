import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Rocket, Brain, Zap, Award, ArrowRight, Lightbulb, Users, DollarSign, Target, TrendingUp, 
  Crown, Shield, Sparkles, LogOut, HelpCircle, Globe, CreditCard, LogIn, User
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

  const stageLabels = {
    pre_revenue: 'לפני הכנסה ראשונה',
    early_revenue: 'הכנסה ראשונה',
    growing: 'בגדילה',
    stable: 'יציב',
    declining: 'בירידה',
    crisis: 'במשבר'
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
        <title>סיכום - {user.full_name} | Perfect One</title>
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
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-8 pb-12">          <div className="max-w-4xl mx-auto w-full">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white py-16 px-6 sm:px-8 rounded-2xl overflow-hidden mb-12"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              </div>

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span className="text-sm font-medium">מצב העסק שלך</span>
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl font-black mb-4 leading-tight"
                >
                  אתה נמצא בשלב:
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 mt-2">
                    {stageLabels[stage]}
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed"
                >
                  בהתאם לתשובות שלך, בנינו תוכנית מסודרת שתעזור לך להצליח בשלב זה של העסק
                </motion.p>
              </div>
            </motion.div>

            {/* Journey Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">המסע שלך להצלחה</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-8">
                תהליך מובנה שמוכח שעובד - מהגדרת מטרה ועד להשגת תוצאות
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {journeyStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-6 h-full border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-bold text-gray-400">שלב {idx + 1}</div>
                            <h3 className="font-bold text-gray-900 text-lg">{stage.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{stage.description}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Why Mentor Section */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12 px-6 sm:px-8 rounded-2xl mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  למה אתה צריך מנטור עסקי?
                </h2>
                <p className="text-lg text-gray-600">
                  ההבדל בין עסק שמצליח לעסק שנכשל לא תמיד בעבודה הקשה - אלא בכיוון הנכון
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: Brain, title: 'החלטות חכמות', desc: 'קבלת החלטות מבוססות נתונים' },
                  { icon: Target, title: 'מיקוד ברור', desc: 'הפסקת בזבוז זמן על דברים לא חשובים' },
                  { icon: TrendingUp, title: 'גדילה מהירה', desc: 'קיצור דרך להצלחה' },
                  { icon: Shield, title: 'תמיכה מקצועית', desc: 'מישהו שתומך בך בכל זמן' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-6 bg-white border-2 border-purple-200 hover:border-purple-400">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 sm:p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white border-0 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                </div>

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <Rocket className="w-4 h-4" />
                    <span className="text-sm font-semibold">הצעד הראשון שלך</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black mb-4">
                    בואו נתחיל עכשיו
                  </h2>
                  <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                    התחל את המטרה הראשונה שבחרנו עבורך וקבל תוכנית פעולה מפורטת. המנטור שלך ילווה אותך בכל שלב.
                  </p>

                  <Button
                    onClick={() => navigate(createPageUrl('ClientDashboard') + '?tab=goals')}
                    size="lg"
                    className="h-14 px-8 bg-white text-indigo-600 hover:bg-gray-100 font-bold text-lg shadow-xl"
                  >
                    <Sparkles className="w-5 h-5 ml-2" />
                    התחל את המטרה הראשונה
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}