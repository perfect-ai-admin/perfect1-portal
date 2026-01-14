import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LogOut, HelpCircle, User
} from 'lucide-react';
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
import ProgressTab from '../components/client/tabs/ProgressTab';
import BusinessTab from '../components/client/tabs/BusinessTab';
import FinancialTab from '../components/client/tabs/FinancialTab';
import GoalsTab from '../components/client/tabs/GoalsTab';
import MarketingTab from '../components/client/tabs/MarketingTab';
import MentorTab from '../components/client/tabs/MentorTab';
import NotificationCenter from '../components/client/NotificationCenter';
import QuickInvoiceButton from '../components/client/financial/QuickInvoiceButton';
import BusinessStateIndicator from '../components/client/business/BusinessStateIndicator';
import StateConflictAlert from '../components/client/business/StateConflictAlert';

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

  const handleLogout = () => {
    localStorage.removeItem('client');
    navigate(createPageUrl('ClientLogin'));
  };

  // Loading State
  if (!client || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 font-semibold">טוען את מרכז הבקרה שלך...</p>
          <p className="text-gray-500 mt-2">מכין את כל הנתונים</p>
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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border-2 border-white/30">
                  <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                    {currentData.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">שלום, {currentData.name} 👋</h1>
                  <p className="text-white/80">מרכז הניהול העסקי שלך</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <NotificationCenter />

                {/* Help */}
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <HelpCircle className="w-6 h-6" />
                </button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                      <User className="w-6 h-6" />
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

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          {/* Business State Indicators - Top Level */}
          <div className="mb-6 grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <BusinessStateIndicator businessState={enrichedData?.business_state} />
            </div>
            <div>
              <StateConflictAlert businessState={enrichedData?.business_state} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'progress' && (
              <ProgressTab key="progress" data={enrichedData} onNavigate={setActiveTab} />
            )}
            {activeTab === 'business' && (
              <BusinessTab key="business" data={enrichedData} />
            )}
            {activeTab === 'financial' && (
              <FinancialTab key="financial" data={enrichedData} />
            )}
            {activeTab === 'goals' && (
              <GoalsTab key="goals" data={enrichedData} />
            )}
            {activeTab === 'marketing' && (
              <MarketingTab key="marketing" data={enrichedData} />
            )}
            {activeTab === 'mentor' && (
              <MentorTab key="mentor" data={enrichedData} />
            )}
          </AnimatePresence>
        </div>

        {/* Quick Invoice Floating Button */}
        <QuickInvoiceButton />
      </div>
    </>
  );
}