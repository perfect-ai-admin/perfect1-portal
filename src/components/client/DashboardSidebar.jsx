import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, CreditCard, Target, Megaphone, 
  Zap, Menu, X, ChevronRight 
} from 'lucide-react';

const TABS = [
  { id: 'progress', label: 'התקדמות', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
  { id: 'business', label: 'עסקי', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
  { id: 'financial', label: 'כספי', icon: CreditCard, color: 'from-green-500 to-green-600' },
  { id: 'goals', label: 'מטרות', icon: Target, color: 'from-orange-500 to-orange-600' },
  { id: 'marketing', label: 'שיווק', icon: Megaphone, color: 'from-pink-500 to-pink-600' },
  { id: 'mentor', label: 'מנטור', icon: Zap, color: 'from-indigo-500 to-indigo-600' }
];

export default function DashboardSidebar({ activeTab, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabChange = (tabId) => {
    onChange(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-24 left-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          aria-label={isOpen ? 'סגור תפריט ניווט' : 'פתח תפריט ניווט'}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className="hidden md:flex flex-col w-64 bg-white rounded-xl shadow-lg p-6 h-fit sticky top-24 space-y-2" 
        role="complementary"
        aria-label="תפריט צד ניווט"
      >
        <h3 className="text-sm font-bold text-gray-700 text-right mb-4 px-3">תפריטים</h3>
        <nav className="space-y-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 text-right ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <ChevronRight className={`w-4 h-4 ${isActive ? 'visible' : 'invisible'}`} aria-hidden="true" />
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="font-medium">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-xl z-40 md:hidden flex flex-col p-6"
              role="complementary"
              aria-label="תפריט צד ניווט (נייד)"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">תפריטים</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                  aria-label="סגור תפריט ניווט"
                >
                  <X className="w-6 h-6 text-gray-600" aria-hidden="true" />
                </button>
              </div>

              <nav className="space-y-2 flex-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      whileHover={{ x: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-right ${
                        isActive
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={tab.label}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="border-t pt-4 text-xs text-gray-500 text-center">
                מרכז הניהול שלך
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}