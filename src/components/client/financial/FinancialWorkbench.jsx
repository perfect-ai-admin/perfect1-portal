import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, DollarSign, Users, TrendingUp, Link2, CreditCard } from 'lucide-react';
import QuickActionsBar from './QuickActionsBar';
import FinanceInbox from './FinanceInbox';
import DocumentsTab from './tabs/DocumentsTab';
import ExpensesTab from './tabs/ExpensesTab';
import CustomersTab from './tabs/CustomersTab';
import CollectionsTab from './tabs/CollectionsTab';
import ReportsTab from './tabs/ReportsTab';
import ConnectionsTab from './tabs/ConnectionsTab';

export default function FinancialWorkbench({ data }) {
  const [activeTab, setActiveTab] = useState('documents');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleQuickAction = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Tabs configuration - reordered per UX spec
  const tabs = [
    { value: 'documents', label: 'מסמכים', icon: FileText },
    { value: 'expenses', label: 'הוצאות', icon: DollarSign },
    { value: 'customers', label: 'לקוחות', icon: Users },
    { value: 'reports', label: 'דוחות', icon: TrendingUp },
  ];

  const mobileMoreTabs = [
    { value: 'collections', label: 'גבייה', icon: CreditCard },
    { value: 'connections', label: 'חיבורים', icon: Link2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Quick Actions Bar */}
      <QuickActionsBar onActionComplete={handleQuickAction} />

      {/* Finance Inbox */}
      <FinanceInbox key={refreshKey} data={data} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation - Horizontal scroll on mobile */}
        <div className="mb-4 -mx-4 md:mx-0">
          <TabsList className="w-full md:w-auto flex gap-1 h-auto p-2 bg-gray-100 rounded-none md:rounded-lg justify-start md:justify-end overflow-x-auto md:overflow-visible px-4 md:px-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="text-xs md:text-sm flex-col gap-1 py-2 px-3 md:px-2 whitespace-nowrap flex-shrink-0"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline text-[11px]">{tab.label}</span>
                  <span className="md:hidden text-[10px]">{tab.label.substring(0, 2)}</span>
                </TabsTrigger>
              );
            })}
            
            {/* Mobile More Menu */}
            <TabsTrigger 
              value="more"
              className="text-xs md:hidden flex-col gap-1 py-2 px-3 flex-shrink-0"
            >
              <span>⋯</span>
              <span className="text-[10px]">עוד</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <TabsContent value="documents" className="m-0">
            <DocumentsTab data={data} />
          </TabsContent>

          <TabsContent value="expenses" className="m-0">
            <ExpensesTab data={data} />
          </TabsContent>

          <TabsContent value="customers" className="m-0">
            <CustomersTab data={data} />
          </TabsContent>

          <TabsContent value="reports" className="m-0">
            <ReportsTab data={data} />
          </TabsContent>

          {/* Mobile More Tabs */}
          <TabsContent value="more" className="m-0">
            <div className="space-y-4">
              {mobileMoreTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-700" />
                    <span className="font-medium text-gray-900">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="m-0">
            <CollectionsTab data={data} />
          </TabsContent>

          <TabsContent value="connections" className="m-0">
            <ConnectionsTab data={data} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}