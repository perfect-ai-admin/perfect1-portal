import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  Target, 
  Megaphone, 
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mobile Bottom Tab Bar (section 8)
// Minimum touch targets: 44px
export default function MobileTabBar({ activeTab, onChange, availableTabs }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  const defaultTabs = [
    { id: 'progress', label: 'התקדמות', icon: TrendingUp },
    { id: 'business', label: 'עסק', icon: BarChart3 },
    { id: 'financial', label: 'כספים', icon: Wallet },
    { id: 'goals', label: 'מטרות', icon: Target },
    { id: 'marketing', label: 'שיווק', icon: Megaphone },
    { id: 'mentor', label: 'מנטור', icon: MessageSquare }
  ];

  const tabs = availableTabs || defaultTabs;

  const visibleTabs = tabs.slice(0, Math.min(5, tabs.length));
  const hiddenTabs = tabs.slice(5);

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 pb-safe"
      role="navigation"
      aria-label="ניווט ראשי"
    >
      <div className="grid grid-cols-6 h-20">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] active:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              role="tab"
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
                  className={`w-6 h-6 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                  aria-hidden="true"
                />
              </motion.div>
              <span 
                 className={`text-xs font-semibold ${
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

        {/* More Menu for additional tabs */}
         {hiddenTabs.length > 0 && (
           <div>
             <DropdownMenu open={isMoreOpen} onOpenChange={setIsMoreOpen}>
               <DropdownMenuTrigger asChild>
                 <button
                   className="relative flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] active:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                   aria-label="עוד אפשרויות"
                   aria-haspopup="true"
                   aria-expanded={isMoreOpen}
                 >
                   <MoreHorizontal className={`w-6 h-6 ${isMoreOpen ? 'text-blue-600' : 'text-gray-500'}`} aria-hidden="true" />
                   <span className="text-xs font-semibold text-gray-500">עוד</span>
                 </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" side="top" className="mb-16">
                 {hiddenTabs.map((tab) => {
                   const Icon = tab.icon;
                   const isActive = activeTab === tab.id;
                   return (
                     <DropdownMenuItem 
                       key={tab.id}
                       onClick={() => {
                         onChange(tab.id);
                         setIsMoreOpen(false);
                       }}
                       className={isActive ? 'bg-blue-50 text-blue-600' : ''}
                     >
                       <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                       {tab.label}
                     </DropdownMenuItem>
                   );
                 })}
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
         )}
      </div>
    </nav>
  );
}