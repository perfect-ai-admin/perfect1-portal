import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LogOut, HelpCircle, User, Globe, ShoppingCart as ShoppingCartIcon,
  CreditCard
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Components
import NotificationCenter from '../components/client/NotificationCenter';
import ShoppingCart from '../components/client/shared/ShoppingCart';
import SummaryTab from '../components/client/tabs/SummaryTab';

export default function Summary() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('he');
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin('/Summary');
          return;
        }

        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin('/Summary');
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error('Auth check error:', error);
        base44.auth.redirectToLogin('/Summary');
      }
    };

    checkAuth();
  }, []);

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
        <div className="text-gray-600">טוען...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>סיכום - {user.full_name} | Perfect One</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden" dir={language === 'he' ? 'rtl' : 'ltr'} lang={language}>
        {/* Header - Same as ClientDashboard */}
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
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name || 'משתמש'}</p>
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
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <SummaryTab data={user} />
        </main>
      </div>
    </>
  );
}