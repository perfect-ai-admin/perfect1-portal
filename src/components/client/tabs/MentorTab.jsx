import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home,
  MessageSquare, 
  BarChart2, 
  ListTodo, 
  Settings,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import DailyCockpit from '../mentor/DailyCockpit';
import MentorChat from '../mentor/MentorChat';
import Insights from '../mentor/Insights'; // Reusing existing for now, will rename/wrap if needed
import DailyOperations from '../mentor/DailyOperations'; // Using as "The Plan" base for now
import SalesCenter from '../mentor/sales/SalesCenter';

export default function MentorTab({ data }) {
  const [activeView, setActiveView] = useState('cockpit'); // cockpit, chat, status, plan, sales

  const MENU_ITEMS = [
    { id: 'cockpit', label: 'המיקוד היומי', icon: Home },
    { id: 'chat', label: 'המנטור האישי', icon: MessageSquare },
    { id: 'sales', label: 'מרכז המכירות', icon: BarChart2 },
    { id: 'status', label: 'תמונת מצב', icon: Settings },
    { id: 'plan', label: 'התוכנית שלי', icon: ListTodo },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'cockpit':
        return <DailyCockpit onNavigate={setActiveView} />;
      case 'chat':
        return (
            <div className="h-[calc(100vh-200px)] md:h-[600px]">
                <MentorChat clientData={data} />
            </div>
        );
      case 'sales':
        return <SalesCenter />;
      case 'status':
        return <Insights />;
      case 'plan':
        return <DailyOperations data={data} />;
      default:
        return <DailyCockpit onNavigate={setActiveView} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col md:flex-row gap-6"
    >
      {/* Sidebar Navigation - Desktop */}
      <div className="hidden md:flex flex-col w-64 bg-white rounded-2xl border border-gray-100 p-4 h-fit sticky top-4 shadow-sm">
        <div className="mb-6 px-2">
            <h2 className="text-xl font-bold text-gray-900">אזור המנטור</h2>
            <p className="text-xs text-gray-500">העוזר האישי החכם שלך</p>
        </div>
        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Navigation Header */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900">אזור המנטור</h2>
            <span className="text-gray-300">|</span>
            <span className="text-indigo-600 font-medium">
                {MENU_ITEMS.find(i => i.id === activeView)?.label}
            </span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%]">
            <div className="mt-8 space-y-2">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-right ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="bg-white/50 rounded-3xl min-h-[500px]">
             {renderContent()}
        </div>
      </div>
    </motion.div>
  );
}