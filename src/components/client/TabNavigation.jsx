import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Wallet, Target, Megaphone, Lightbulb, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  {
    id: 'progress',
    label: 'המסע העסקי שלי',
    icon: MapPin,
    color: 'from-blue-600 to-blue-700'
  },
  {
    id: 'business',
    label: 'נתוני העסק שלי',
    icon: BarChart3,
    color: 'from-purple-600 to-purple-700'
  },
  {
    id: 'financial',
    label: 'ניהול כספים',
    icon: Wallet,
    color: 'from-emerald-600 to-emerald-700'
  },
  {
    id: 'goals',
    label: 'המטרות שלי',
    icon: Target,
    color: 'from-orange-600 to-orange-700'
  },
  {
    id: 'marketing',
    label: 'לגדל את העסק',
    icon: Megaphone,
    color: 'from-pink-600 to-pink-700'
  },
  {
    id: 'mentor',
    label: 'שאל את המנטור',
    icon: Lightbulb,
    color: 'from-indigo-600 to-indigo-700'
  }
];

export default function TabNavigation({ activeTab, onChange }) {
  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className="hidden md:flex gap-3 overflow-x-auto pb-2" 
        role="tablist"
        aria-label="ניווט תפריטים ראשי"
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-white text-[#1E3A5F] shadow-lg scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={tab.label}
              tabIndex={activeTab === tab.id ? 0 : -1}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
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

export { TABS };