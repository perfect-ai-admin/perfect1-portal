import React, { useState, useEffect } from 'react';
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
import { SkeletonHeader, SkeletonTabContent } from '../components/client/SkeletonLoaders';


export default function ClientDashboard() {
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('progress');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    const storedClient = localStorage.getItem('client');
    if (!storedClient) {
      navigate(createPageUrl('ClientLogin'));
      return;
    }
    setClient(JSON.parse(storedClient));
  }, [navigate]);

  // Fetch client data
  const { data: clientData, isLoading, error: fetchError } = useQuery({
    queryKey: ['client', client?.id],
    queryFn: async () => {
      if (!client?.id) return null;
      try {
        const leads = await base44.entities.Lead.filter({ id: client.id });
        if (!leads || leads.length === 0) {
          throw new Error('לא נמצאו נתוני לקוח');
        }
        return leads[0];
      } catch (err) {
        console.error('Error fetching client data:', err);
        throw err;
      }
    },
    enabled: !!client?.id,
    refetchInterval: 30000,
    retry: 2,
    staleTime: 5000
  });

  const handleLogout = () => {
    localStorage.removeItem('client');
    navigate(createPageUrl('ClientLogin'));
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['client', client?.id]);
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const tabOrder = ['progress', 'business', 'financial', 'goals', 'marketing', 'mentor'];

  // Loading State - Skeleton
  if (!client || isLoading) {
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

  const currentData = clientData || client;

  // Mock business state for demonstration if doesn't exist
  const enrichedData = {
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
  };

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
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Top Bar */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Avatar className="w-14 h-14 border-2 border-white/30 ring-2 ring-white/20">
                    <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                      {currentData.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold">שלום, {currentData.name} 👋</h1>
                  <p className="text-white/80 text-sm">מרכז הניהול העסקי שלך</p>
                </motion.div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <NotificationCenter />

                {/* Help */}
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <HelpCircle className="w-6 h-6" />
                </motion.button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <User className="w-6 h-6" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 ml-2" />
                      יציאה
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>

            {/* Tab Navigation - Desktop Only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block"
            >
              <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <PullToRefresh onRefresh={handleRefresh}>
          <main 
            id="main-content" 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8"
            role="main"
            aria-label="תוכן ראשי"
          >
            {/* Desktop: Regular tabs with fade animation */}
            <div className="hidden md:block">
              <AnimatePresence mode="wait">
                {activeTab === 'progress' && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProgressTab data={enrichedData} onNavigate={setActiveTab} />
                  </motion.div>
                )}
                {activeTab === 'business' && (
                  <motion.div
                    key="business"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BusinessTab data={enrichedData} />
                  </motion.div>
                )}
                {activeTab === 'financial' && (
                  <motion.div
                    key="financial"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FinancialTab data={enrichedData} />
                  </motion.div>
                )}
                {activeTab === 'goals' && (
                  <motion.div
                    key="goals"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GoalsTab data={enrichedData} />
                  </motion.div>
                )}
                {activeTab === 'marketing' && (
                  <motion.div
                    key="marketing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MarketingTab data={enrichedData} />
                  </motion.div>
                )}
                {activeTab === 'mentor' && (
                  <motion.div
                    key="mentor"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MentorTab data={enrichedData} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile: Swipeable tabs */}
            <div className="md:hidden">
              <SwipeableTabs 
                activeTab={activeTab} 
                onChange={setActiveTab}
                tabs={tabOrder}
              >
                <ProgressTab data={enrichedData} onNavigate={setActiveTab} />
                <BusinessTab data={enrichedData} />
                <FinancialTab data={enrichedData} />
                <GoalsTab data={enrichedData} />
                <MarketingTab data={enrichedData} />
                <MentorTab data={enrichedData} />
              </SwipeableTabs>
            </div>
          </main>
        </PullToRefresh>

        {/* Mobile Bottom Tab Bar */}
        <MobileTabBar activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </>
  );
}