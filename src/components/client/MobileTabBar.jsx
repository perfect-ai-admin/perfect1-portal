import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  Target, 
  Megaphone, 
  MessageSquare 
} from 'lucide-react';

// Mobile Bottom Tab Bar (section 8)
// Minimum touch targets: 44px
export default function MobileTabBar({ activeTab, onChange }) {
  const tabs = [
    { id: 'progress', label: 'התקדמות', icon: TrendingUp },
    { id: 'business', label: 'עסק', icon: BarChart3 },
    { id: 'financial', label: 'כספים', icon: Wallet },
    { id: 'goals', label: 'מטרות', icon: Target },
    { id: 'marketing', label: 'שיווק', icon: Megaphone },
    { id: 'mentor', label: 'מנטור', icon: MessageSquare }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 pb-safe">
      <div className="grid grid-cols-6 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] active:bg-gray-50 transition-colors"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon 
                  className={`w-5 h-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                />
              </motion.div>
              <span 
                className={`text-[10px] font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}