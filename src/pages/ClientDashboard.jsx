import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GeneralErrorBoundary from '../components/GeneralErrorBoundary';
import { DialogStateProvider } from '../components/DialogStateContext';
import { 
  LogOut, HelpCircle, User, AlertCircle, Globe, ShoppingCart as ShoppingCartIcon,
  TrendingUp, BarChart3, Wallet, Target, Megaphone, MessageSquare, MapPin, Lightbulb, CreditCard
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Components
import TabNavigation from '../components/client/TabNavigation';
import MobileTabBar from '../components/client/MobileTabBar';
import SwipeableTabs from '../components/client/SwipeableTabs';
import PullToRefresh from '../components/client/PullToRefresh';
import NotificationCenter from '../components/client/NotificationCenter';
import FloatingActionButton from '../components/client/FloatingActionButton';
import Breadcrumbs from '../components/client/Breadcrumbs';
import ShoppingCart from '../components/client/shared/ShoppingCart';

import { SkeletonHeader, SkeletonTabContent } from '../components/client/SkeletonLoaders';

// Lazy Load Heavy Tabs
const ProgressTab = React.lazy(() => import('../components/client/tabs/ProgressTab'));
const BusinessTab = React.lazy(() => import('../components/client/tabs/BusinessTab'));
const FinancialTab = React.lazy(() => import('../components/client/tabs/FinancialTab'));
const GoalsTab = React.lazy(() => import('../components/client/tabs/GoalsTab'));
const MarketingTab = React.lazy(() => import('../components/client/tabs/MarketingTab'));
const MentorTab = React.lazy(() => import('../components/client/tabs/MentorTab'));
const SummaryTab = React.lazy(() => import('../components/client/tabs/SummaryTab'));


export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [goalsTabConfig, setGoalsTabConfig] = useState({ openAddGoal: false });
  
  const location = useLocation();

  // Handle tab change from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Reset goalsTabConfig when leaving goals tab
  React.useEffect(() => {
    if (activeTab !== 'goals') {
      setGoalsTabConfig({ openAddGoal: false });
    }
  }, [activeTab]);
  const [language, setLanguage] = useState('he');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check authentication with Base44 auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin('/ClientDashboard');
          return;
        }

        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin('/ClientDashboard');
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error('Auth check error:', error);
        base44.auth.redirectToLogin('/ClientDashboard');
      }
    };

    checkAuth();
  }, []);

  // Fetch user data
  const { data: userData, isLoading, error: fetchError } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user?.id) return user;
      try {
        const users = await base44.entities.User.filter({ id: user.id });
        if (!users || users.length === 0) {
          return user;
        }
        const freshUser = users[0] || user;
        localStorage.setItem('user', JSON.stringify(freshUser));
        return freshUser;
      } catch (err) {
        return user;
      }
    },
    enabled: !!user?.id,
    refetchInterval: false,
    refetchOnWindowFocus: false, // Don't refetch on every focus
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    gcTime: 1000 * 60 * 30 // 30 minutes cache
  });

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const tabOrder = ['summary', 'progress', 'business', 'financial', 'goals', 'marketing', 'mentor'];

  const currentData = React.useMemo(() => {
    return userData || user;
  }, [userData, user]);

  // Get permissions from user data - Enabled by default for visibility
  const permissions = React.useMemo(() => ({
    marketing: true,
    mentor: true,
    finance: true
  }), [currentData]);

  const enrichedData = React.useMemo(() => ({
    ...currentData,
    business_state: currentData?.business_state || {
      stage: null,
      primary_challenge: null,
      marketing_state: {
        current_phase: null,
        active_channels: [],
        past_experiments: []
      },
      sales_state: {
        pipeline: {},
        conversion_rates: {},
        bottleneck: null
      },
      operations_state: {
        workload_status: null,
        weekly_capacity: {}
      },
      performance_state: {
        active_goals: [],
        execution_rate: 0
      },
      focus_state: {
        current_strategic_focus: null,
        active_initiatives: [],
        deferred_ideas: []
      },
      unified_recommendation: null
    }
  }), [currentData]);

  if (!user) {
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

  if (!currentData?.id || !currentData?.full_name || typeof currentData !== 'object') {
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
    <DialogStateProvider>
      <GeneralErrorBoundary>
        <>
        <Helmet>
        <title>מרכז ניהול עסקי - {currentData.full_name} | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden" dir={language === 'he' ? 'rtl' : 'ltr'} lang={language}>
        {/* Header - Desktop & Mobile */}
        <header 
          className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow sticky top-0 z-50"
          role="banner"
        >
          <div className="w-full px-3 sm:px-6 lg:px-8">
            {/* Top Bar - 56px fixed height */}
            <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="w-9 h-9 border border-white/20 flex-shrink-0">
                <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
                  {currentData?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{currentData?.full_name || 'משתמש'}</p>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {typeof ShoppingCart === 'function' && <ShoppingCart />}
              
              <button
                onClick={() => navigate(createPageUrl('PricingPerfectBizAI'))}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/90 hover:text-white"
                title="מחירון ומסלולים"
              >
                <CreditCard className="w-6 h-6" />
              </button>

              {typeof NotificationCenter === 'function' && <NotificationCenter />}

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
               {typeof TabNavigation === 'function' && <TabNavigation activeTab={activeTab} onChange={setActiveTab} availableTabs={permissions && [
                    { id: 'summary', label: 'סיכום', icon: 'TrendingUp' },
                    { id: 'progress', label: 'מסע העסק', icon: 'MapPin' },
                    permissions.finance && { id: 'business', label: 'נתוני העסק', icon: 'BarChart3' },
                  permissions.finance && { id: 'financial', label: 'כספים', icon: 'Wallet' },
                  permissions.mentor && { id: 'goals', label: 'מטרות', icon: 'Target' },
                  permissions.marketing && { id: 'marketing', label: 'שיווק', icon: 'Megaphone' },
                  permissions.mentor && { id: 'mentor', label: 'מנטור', icon: 'Lightbulb' }
                ].filter(Boolean)} />}
             </div>
            </div>
        </header>

        {/* Main Content */}
         <div className="flex-1 flex overflow-hidden">
          {/* Main Area */}
           <div className="flex-1 flex flex-col overflow-hidden">
             <main 
               className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6"
               data-scroll-container="dashboard"
               role="main"
               style={{ scrollBehavior: 'smooth' }}
             >
               <div className="max-w-7xl mx-auto w-full">
                 {/* Breadcrumbs - Desktop */}
                 <div className="hidden md:block mb-6">
                   <Breadcrumbs activeTab={activeTab} onNavigate={setActiveTab} />
                 </div>

                 {/* Tabs - Dynamic based on permissions */}
                 <React.Suspense fallback={<div className="pt-8"><SkeletonTabContent /></div>}>
                   {activeTab === 'summary' && <SummaryTab data={enrichedData} />}
                   {activeTab === 'progress' && <ProgressTab data={enrichedData} user={enrichedData} onNavigate={(tab, config) => {
                     setActiveTab(tab);
                     if (tab === 'goals' && config) {
                       setGoalsTabConfig(config);
                     }
                   }} />}
                   {activeTab === 'business' && permissions.finance && <BusinessTab data={enrichedData} />}
                   {activeTab === 'financial' && permissions.finance && <FinancialTab data={enrichedData} />}
                   {activeTab === 'goals' && permissions.mentor && <GoalsTab user={currentData} data={enrichedData} openAddGoal={goalsTabConfig.openAddGoal} permissions={permissions} />}
                   {activeTab === 'marketing' && permissions.marketing && <MarketingTab data={enrichedData} />}
                   {activeTab === 'mentor' && permissions.mentor && <MentorTab data={enrichedData} />}
                 </React.Suspense>
                 </div>
                 </main>
           </div>
        </div>



        {/* Mobile Bottom Tab Bar */}
         {typeof MobileTabBar === 'function' && <MobileTabBar activeTab={activeTab} onChange={setActiveTab} availableTabs={permissions && [
            { id: 'progress', label: 'התקדמות', icon: TrendingUp },
            permissions.finance && { id: 'business', label: 'עסק', icon: BarChart3 },
           permissions.finance && { id: 'financial', label: 'כספים', icon: Wallet },
           permissions.mentor && { id: 'goals', label: 'מטרות', icon: Target },
           permissions.marketing && { id: 'marketing', label: 'שיווק', icon: Megaphone },
           permissions.mentor && { id: 'mentor', label: 'מנטור', icon: MessageSquare }
         ].filter(Boolean)} />}
        </div>
        </>
        </GeneralErrorBoundary>
        </DialogStateProvider>
        );
        }