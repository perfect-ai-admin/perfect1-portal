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
        {/* Tab Navigation */}
        <div className="mb-6">
          {/* Desktop Tabs */}
          <div className="hidden md:flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="text-sm flex items-center gap-2 py-2 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 data-[state=active]:text-white transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden grid grid-cols-4 gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold text-center">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile More Button */}
          <div className="md:hidden mt-2">
            <button
              onClick={() => setActiveTab('more')}
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${
                activeTab === 'more'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">⋯</span>
              <span className="text-xs font-semibold">עוד</span>
            </button>
          </div>
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