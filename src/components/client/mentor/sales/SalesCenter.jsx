import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  ShieldAlert, 
  PlayCircle, 
  BarChart2
} from 'lucide-react';
import SalesScriptsLibrary from '../SalesScripts'; // Reusing existing
import ObjectionMaster from './ObjectionMaster';
import SalesSimulator from './SalesSimulator';
import SalesAnalyticsDashboard from '../../sales/SalesAnalyticsDashboard';

export default function SalesCenter() {
  const [activeTab, setActiveTab] = useState('scripts');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">מרכז המכירות המתקדם</h2>
          <p className="text-gray-500">כלים חכמים, תסריטי AI וסימולציות לסגירת עסקאות</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4 bg-white border border-gray-200 p-1 h-auto gap-2">
          <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <BarChart2 className="w-5 h-5" />
            <span className="text-xs font-medium">דשבורד</span>
          </TabsTrigger>
          <TabsTrigger value="scripts" className="flex flex-col gap-1 py-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-medium">תסריטים</span>
          </TabsTrigger>
          <TabsTrigger value="objections" className="flex flex-col gap-1 py-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-medium">התנגדויות</span>
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex flex-col gap-1 py-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <PlayCircle className="w-5 h-5" />
            <span className="text-xs font-medium">סימולטור AI</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
            <TabsContent value="dashboard">
                <SalesAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="scripts">
                <SalesScriptsLibrary />
            </TabsContent>

            <TabsContent value="objections">
                <ObjectionMaster />
            </TabsContent>

            <TabsContent value="simulator">
                <SalesSimulator />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}