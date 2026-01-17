import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Wallet, Target, Lightbulb, MapPin, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_TABS = [
  {
    id: 'progress',
    label: 'מסע העסק',
    icon: MapPin
  },
  {
    id: 'business',
    label: 'נתוני העסק',
    icon: BarChart3
  },
  {
    id: 'financial',
    label: 'כספים',
    icon: Wallet
  },
  {
    id: 'goals',
    label: 'מטרות',
    icon: Target
  },
  {
    id: 'marketing',
    label: 'שיווק',
    icon: Megaphone
  },
  {
    id: 'mentor',
    label: 'מנטור',
    icon: Lightbulb
  }
];

export default function TabNavigation({ activeTab, onChange, availableTabs }) {
  const TABS = availableTabs || DEFAULT_TABS;
  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className="hidden md:flex gap-1 border-t border-white/10" 
        role="tablist"
        aria-label="ניווט תפריטים ראשי"
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative",
              activeTab === tab.id
                ? "text-white bg-white/5"
                : "text-white/70 hover:text-white/90"
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-label={tab.label}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                layoutId="activeTab"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" 
        role="tablist"
        aria-label="ניווט תפריטים ראשי (נייד)"
      >
        <div className="grid grid-cols-6 gap-1 p-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all",
                  activeTab === tab.id
                    ? "bg-[#1E3A5F] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-label={tab.label}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-[10px] font-medium leading-tight text-center">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export { DEFAULT_TABS as TABS };