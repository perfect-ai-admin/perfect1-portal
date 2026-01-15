import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import Tab Components
import BizPilotHeader from '../components/client/BizPilotHeader';
import MobileTabBar from '../components/client/MobileTabBar';
import SwipeableTabs from '../components/client/SwipeableTabs';
import PullToRefresh from '../components/client/PullToRefresh';
import ProgressTab from '../components/client/tabs/ProgressTab';
import BusinessTab from '../components/client/tabs/BusinessTab';
import FinancialTab from '../components/client/tabs/FinancialTab';
import GoalsTab from '../components/client/tabs/GoalsTab';
import MarketingTab from '../components/client/tabs/MarketingTab';
import MentorTab from '../components/client/tabs/MentorTab';
import FloatingActionButton from '../components/client/FloatingActionButton';
import Breadcrumbs from '../components/client/Breadcrumbs';
import { SkeletonHeader, SkeletonTabContent } from '../components/client/SkeletonLoaders';


export default function ClientDashboard() {
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('progress');
  const [language, setLanguage] = useState('he');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    try {
      const storedClient = localStorage.getItem('client');
      if (!storedClient) {
        navigate(createPageUrl('ClientLogin'));
        return;
      }
      const parsed = JSON.parse(storedClient);
      if (!parsed?.id || !parsed?.name) {
        throw new Error('Invalid client data');
      }
      setClient(parsed);
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('client');
      navigate(createPageUrl('ClientLogin'));
    }
  }, [navigate]);

  // Fetch client data
  const { data: clientData, isLoading, error: fetchError } = useQuery({
    queryKey: ['client', client?.id],
    queryFn: async () => {
      if (!client?.id) {
        return client;
      }
      try {
        const leads = await base44.entities.Lead.filter({ id: client.id });
        if (!leads || leads.length === 0) {
          console.warn('No leads found, using stored client data');
          return client;
        }
        return leads[0] || client;
      } catch (err) {
        console.error('Error fetching client data:', err);
        return client;
      }
    },
    enabled: !!client?.id,
    refetchInterval: 60000,
    retry: 1,
    staleTime: 10000,
    gcTime: 1000 * 60 * 5
  });

  const handleLogout = () => {
    localStorage.removeItem('client');
    navigate(createPageUrl('ClientLogin'));
  };

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['client', client?.id] });
      return new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh error:', error);
      return Promise.resolve();
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const tabOrder = ['progress', 'business', 'financial', 'goals', 'marketing', 'mentor'];

  const currentData = React.useMemo(() => {
    return clientData || client;
  }, [clientData, client]);

  const enrichedData = React.useMemo(() => ({
    ...currentData,
    business_state: currentData?.business_state || {
      stage: 'early_revenue',
      primary_challenge: 'no_leads',
      marketing_state: {
        current_phase: 'not_ready',
        active_channels: [],
        past_experiments: []
      },
      sales_state: {
        pipeline: {},
        conversion_rates: {},
        bottleneck: 'lead_gen'
      },
      operations_state: {
        workload_status: 'under_capacity',
        weekly_capacity: {}
      },
      performance_state: {
        active_goals: [],
        execution_rate: 0
      },
      focus_state: {
        current_strategic_focus: 'growth',
        active_initiatives: [],
        deferred_ideas: []
      },
      unified_recommendation: {
        single_next_action: 'התחל בערוץ שיווק אחד (פייסבוק או Google) למשך 30 יום',
        why_this_matters: 'אתה בתחילת דרך וצריך ללמוד מה עובד לפני שמרחיבים',
        what_not_doing_now: [
          'אתר חדש - זה יבוא אחרי שיש ביקוש',
          'העלאת מחירים - קודם תדע מה השוק מוכן לשלם',
          'קורסים נוספים - תתמקד בביצוע לא בלמידה'
        ]
      }
    }
  }), [currentData]);

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <BizPilotHeader activeTab="" onTabChange={() => {}} />
        <div className="flex-1 flex items-center justify-center p-4">
          <SkeletonTabContent />
        </div>
      </div>
    );
  }

  if (!currentData?.id || !currentData?.name || typeof currentData !== 'object') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center" dir="rtl">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-bold mb-2">נתונים חסרים</p>
            <p className="text-sm mb-4">לא ניתן לטעון את מרכז הניהול. אנא התחבר מחדש.</p>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-2 py-1 rounded"
              aria-label="חזור לעמוד הכניסה"
            >
              חזור לעמוד הכניסה
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>מרכז ניהול עסקי - {currentData.name} | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col" dir={language === 'he' ? 'rtl' : 'ltr'} lang={language}>
        {/* Header */}
        <header 
          className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow-lg sticky top-0 z-50"
          role="banner"
        >
          <div className="w-full px-3 sm:px-6 lg:px-8 py-4">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Avatar className="w-12 h-12 border-2 border-white/30 flex-shrink-0">
                  <AvatarFallback className="bg-white/20 text-white font-bold">
                    {currentData?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold truncate">שלום, {currentData?.name || 'משתמש'}</h1>
                  <p className="text-white/80 text-xs">מרכז הניהול העסקי</p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {typeof NotificationCenter === 'function' && <NotificationCenter />}

                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={toggleLanguage}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        aria-label="שינוי שפה"
                      >
                        <Globe className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{language === 'he' ? 'English' : 'עברית'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        aria-label="עזרה"
                      >
                        <HelpCircle className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>עזרה ותמיכה</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all" aria-label="תפריט">
                      <User className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 ml-2" />
                      יציאה
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tab Navigation - Desktop Only */}
            <div className="hidden md:block">
              {typeof TabNavigation === 'function' && <TabNavigation activeTab={activeTab} onChange={setActiveTab} />}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Desktop Only */}
          <nav className="hidden md:block w-64 bg-white border-l border-gray-200 overflow-y-auto">
            <DashboardSidebar activeTab={activeTab} onChange={setActiveTab} />
          </nav>

          {/* Main Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <PullToRefresh onRefresh={handleRefresh}>
              <main 
                className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6"
                role="main"
              >
                <div className="max-w-7xl mx-auto w-full">
                  {/* Breadcrumbs - Desktop */}
                  <div className="hidden md:block mb-6">
                    <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} />
                  </div>

                  {/* Desktop Tabs */}
                  <div className="hidden md:block">
                    {activeTab === 'progress' && <ProgressTab data={enrichedData} onNavigate={setActiveTab} />}
                    {activeTab === 'business' && <BusinessTab data={enrichedData} />}
                    {activeTab === 'financial' && <FinancialTab data={enrichedData} />}
                    {activeTab === 'goals' && <GoalsTab data={enrichedData} />}
                    {activeTab === 'marketing' && <MarketingTab data={enrichedData} />}
                    {activeTab === 'mentor' && <MentorTab data={enrichedData} />}
                  </div>

                  {/* Mobile Swipeable Tabs */}
                  <div className="md:hidden">
                    {typeof SwipeableTabs === 'function' && (
                      <SwipeableTabs 
                        activeTab={activeTab} 
                        onChange={setActiveTab}
                        tabs={tabOrder}
                      >
                        {typeof ProgressTab === 'function' && <ProgressTab data={enrichedData} onNavigate={setActiveTab} />}
                        {typeof BusinessTab === 'function' && <BusinessTab data={enrichedData} />}
                        {typeof FinancialTab === 'function' && <FinancialTab data={enrichedData} />}
                        {typeof GoalsTab === 'function' && <GoalsTab data={enrichedData} />}
                        {typeof MarketingTab === 'function' && <MarketingTab data={enrichedData} />}
                        {typeof MentorTab === 'function' && <MentorTab data={enrichedData} />}
                      </SwipeableTabs>
                    )}
                  </div>
                </div>
              </main>
            </PullToRefresh>
          </div>
        </div>

        {/* Mobile Bottom Tab Bar */}
        {typeof MobileTabBar === 'function' && <MobileTabBar activeTab={activeTab} onChange={setActiveTab} />}
      </div>
    </>
  );
}