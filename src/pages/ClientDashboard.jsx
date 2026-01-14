import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LogOut, Bell, HelpCircle, User, 
  TrendingUp, DollarSign, FileText, Target,
  BarChart3, Wallet, Megaphone, Lightbulb, MapPin
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
                <button className="relative p-2 hover:bg-white/10 rounded-lg transition-all">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

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
          <AnimatePresence mode="wait">
            {activeTab === 'progress' && (
              <ProgressTab key="progress" data={currentData} />
            )}
            {activeTab === 'business' && (
              <BusinessTab key="business" data={currentData} />
            )}
            {activeTab === 'financial' && (
              <FinancialTab key="financial" data={currentData} />
            )}
            {activeTab === 'goals' && (
              <GoalsTab key="goals" data={currentData} />
            )}
            {activeTab === 'marketing' && (
              <MarketingTab key="marketing" data={currentData} />
            )}
            {activeTab === 'mentor' && (
              <MentorTab key="mentor" data={currentData} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}