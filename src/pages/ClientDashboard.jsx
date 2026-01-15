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
import DashboardHeader from '../components/client/DashboardHeader';
import PullToRefresh from '../components/client/PullToRefresh';
import ProgressTab from '../components/client/tabs/ProgressTab';
import BusinessTab from '../components/client/tabs/BusinessTab';
import FinancialTab from '../components/client/tabs/FinancialTab';
import GoalsTab from '../components/client/tabs/GoalsTab';
import MarketingTab from '../components/client/tabs/MarketingTab';
import MentorTab from '../components/client/tabs/MentorTab';
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

      <div className="min-h-screen bg-gray-50 flex flex-col" dir={language === 'he' ? 'rtl' : 'ltr'} lang={language}>
        {/* Header with Integrated Navigation */}
        <DashboardHeader
          clientName={currentData?.name}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          onLanguageToggle={toggleLanguage}
          language={language}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <PullToRefresh onRefresh={handleRefresh}>
            <main 
              className="flex-1 overflow-y-auto w-full"
              role="main"
            >
              <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                  {/* Tab Content - Unified for Desktop & Mobile */}
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'progress' && <ProgressTab data={enrichedData} onNavigate={setActiveTab} />}
                    {activeTab === 'business' && <BusinessTab data={enrichedData} />}
                    {activeTab === 'financial' && <FinancialTab data={enrichedData} />}
                    {activeTab === 'goals' && <GoalsTab data={enrichedData} />}
                    {activeTab === 'marketing' && <MarketingTab data={enrichedData} />}
                    {activeTab === 'mentor' && <MentorTab data={enrichedData} />}
                  </motion.div>
                </div>
              </div>
            </main>
          </PullToRefresh>
        </div>
      </div>
    </>
  );
}