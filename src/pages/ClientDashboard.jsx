import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LogOut, HelpCircle, User, AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import Tab Components
import TabNavigation from '../components/client/TabNavigation';
import MobileTabBar from '../components/client/MobileTabBar';
import SwipeableTabs from '../components/client/SwipeableTabs';
import PullToRefresh from '../components/client/PullToRefresh';
import ProgressTab from '../components/client/tabs/ProgressTab';
import BusinessTab from '../components/client/tabs/BusinessTab';
import FinancialTab from '../components/client/tabs/FinancialTab';
import GoalsTab from '../components/client/tabs/GoalsTab';
import MarketingTab from '../components/client/tabs/MarketingTab';
import MentorTab from '../components/client/tabs/MentorTab';
import NotificationCenter from '../components/client/NotificationCenter';
import FloatingActionButton from '../components/client/FloatingActionButton';
import DashboardSidebar from '../components/client/DashboardSidebar';
import Breadcrumbs from '../components/client/Breadcrumbs';
import { SkeletonHeader, SkeletonTabContent } from '../components/client/SkeletonLoaders';


export default function ClientDashboard() {
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('progress');
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
        return client; // Return stored client as fallback
      }
      try {
        const leads = await base44.entities.Lead.filter({ id: client.id });
        if (!leads || leads.length === 0) {
          console.warn('No leads found, using stored client data');
          return client; // Fallback to stored client
        }
        return leads[0] || client;
      } catch (err) {
        console.error('Error fetching client data:', err);
        // Return stored client instead of throwing
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

  const tabOrder = ['progress', 'business', 'financial', 'goals', 'marketing', 'mentor'];

  // Use clientData if available, otherwise fallback to stored client
  const currentData = React.useMemo(() => {
    return clientData || client;
  }, [clientData, client]);

  // Mock business state for demonstration if doesn't exist
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

  // Loading State - Skeleton (only show while waiting for initial data)
  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <SkeletonHeader />
            </div>
            <div className="h-12 bg-white/10 rounded-lg" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonTabContent />
        </div>
      </div>
    );
  }

  // Validate essential data
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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl" lang="he">
         {/* Header with staggered entrance */}
         <header 
         className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow-xl sticky top-0 z-50"
         role="banner"
         aria-label="כותרת עמוד"
         >
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
             {/* Top Bar */}
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
               <div className="flex items-center gap-4 w-full sm:w-auto flex-shrink-0">
                  <Avatar className="w-14 h-14 border-2 border-white/30 ring-2 ring-white/20 flex-shrink-0" aria-hidden="true">
                    <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                      {currentData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                 <div className="flex-1 min-w-0">
                     <h1 className="text-2xl sm:text-3xl font-bold truncate">שלום, {currentData?.name || 'משתמש'} 👋</h1>
                     <p className="text-white/80 text-sm">מרכז הניהול העסקי שלך</p>
                   </div>
               </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications - Safe render */}
                {typeof NotificationCenter === 'function' && <NotificationCenter />}

                {/* Help */}
                 <button 
                   className="p-2 hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1E3A5F]"
                   aria-label="עזרה ותמיכה"
                   title="עזרה ותמיכה"
                 >
                   <HelpCircle className="w-6 h-6" aria-hidden="true" />
                 </button>

                {/* User Menu */}
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <button 
                       className="p-2 hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1E3A5F]"
                       aria-label="תפריט חשבון משתמש"
                       aria-haspopup="true"
                       aria-expanded="false"
                     >
                       <User className="w-6 h-6" aria-hidden="true" />
                     </button>
                   </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
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

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sidebar - Desktop Only */}
        <nav className="hidden md:block md:col-span-1" aria-label="ניווט צד">
          <DashboardSidebar activeTab={activeTab} onChange={setActiveTab} />
        </nav>

          {/* Main Content */}
          <main 
            id="main-content" 
            className="md:col-span-3 pb-24 md:pb-8"
            role="main"
            aria-label="תוכן ראשי"
          >
            {/* Breadcrumbs */}
            <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} />

            {/* Desktop: Regular tabs */}
            <div className="hidden md:block">
            {activeTab === 'progress' && (
              <div key="progress">
                {typeof ProgressTab === 'function' && <ProgressTab data={enrichedData} onNavigate={setActiveTab} />}
              </div>
            )}
            {activeTab === 'business' && (
              <div key="business">
                {typeof BusinessTab === 'function' && <BusinessTab data={enrichedData} />}
              </div>
            )}
            {activeTab === 'financial' && (
              <div key="financial">
                {typeof FinancialTab === 'function' && <FinancialTab data={enrichedData} />}
              </div>
            )}
            {activeTab === 'goals' && (
              <div key="goals">
                {typeof GoalsTab === 'function' && <GoalsTab data={enrichedData} />}
              </div>
            )}
            {activeTab === 'marketing' && (
              <div key="marketing">
                {typeof MarketingTab === 'function' && <MarketingTab data={enrichedData} />}
              </div>
            )}
            {activeTab === 'mentor' && (
              <div key="mentor">
                {typeof MentorTab === 'function' && <MentorTab data={enrichedData} />}
              </div>
            )}
          </div>

          {/* Mobile: Swipeable tabs */}
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
            </main>
            </div>

            {/* Mobile Bottom Tab Bar */}
            {typeof MobileTabBar === 'function' && <MobileTabBar activeTab={activeTab} onChange={setActiveTab} />}

            {/* Mobile Sidebar */}
            <DashboardSidebar activeTab={activeTab} onChange={setActiveTab} />
            </div>
            </>
            );
            }