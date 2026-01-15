import React from 'react';
import { motion } from 'framer-motion';
import { 
  LogOut, HelpCircle, User, Bell, Globe, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TABS = [
  { id: 'progress', label: 'התקדמות', icon: '📊' },
  { id: 'business', label: 'העסק', icon: '🏢' },
  { id: 'financial', label: 'כספים', icon: '💰' },
  { id: 'goals', label: 'מטרות', icon: '🎯' },
  { id: 'marketing', label: 'שיווק', icon: '📢' },
  { id: 'mentor', label: 'מנטור', icon: '🤖' },
];

export default function DashboardHeader({ 
  clientName, 
  activeTab, 
  onTabChange, 
  onLogout,
  onLanguageToggle,
  language,
  isMobile,
  onNotifications
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white sticky top-0 z-50 shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Top Row: User Info + Actions */}
        <div className="flex items-center justify-between h-16 border-b border-white/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 border-2 border-white/30 flex-shrink-0">
              <AvatarFallback className="bg-white/20 text-white font-bold">
                {clientName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold truncate">
                {clientName || 'משתמש'}
              </h1>
              <p className="text-white/70 text-xs hidden sm:block">מרכז הניהול</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              onClick={onNotifications}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
              aria-label="הודעות"
            >
              <Bell className="w-5 h-5" />
            </button>

            <button 
              onClick={onLanguageToggle}
              className="p-2 hover:bg-white/10 rounded-lg transition-all hidden sm:flex"
              aria-label="שינוי שפה"
            >
              <Globe className="w-5 h-5" />
            </button>

            <button 
              className="p-2 hover:bg-white/10 rounded-lg transition-all hidden sm:flex"
              aria-label="עזרה"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all" aria-label="תפריט">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onLanguageToggle} className="sm:hidden">
                  <Globe className="w-4 h-4 ml-2" />
                  {language === 'he' ? 'English' : 'עברית'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="w-4 h-4 ml-2" />
                  יציאה
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tab Navigation - Desktop */}
        <div className="hidden md:flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-4 text-sm font-medium transition-all whitespace-nowrap relative group ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{tab.icon}</span>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white"
                  initial={false}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Navigation - Mobile */}
        <div className="md:hidden py-3 px-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-[#1E3A5F]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}