import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Zap, TrendingUp, Calendar, BarChart3, CheckCircle2, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import MentorConversation from '../mentor/MentorConversation';
import Insights from '../mentor/Insights';
import Sales from '../mentor/Sales';
import Daily from '../mentor/Daily';
import History from '../mentor/History';
import Actions from '../mentor/Actions';
import Resources from '../mentor/Resources';

export default function MentorTab({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* Tabs */}
      <Tabs defaultValue="conversations" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6 bg-white border border-gray-100">
          <TabsTrigger value="conversations" className="flex gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">שיחים</span>
          </TabsTrigger>

          <TabsTrigger value="insights" className="flex gap-2">
            <Zap className="w-5 h-5" />
            <span className="hidden sm:inline">ניתוחים</span>
          </TabsTrigger>

          <TabsTrigger value="sales" className="flex gap-2 hidden md:flex">
            <TrendingUp className="w-5 h-5" />
            <span className="hidden lg:inline">מכירות</span>
          </TabsTrigger>

          <TabsTrigger value="daily" className="flex gap-2 hidden md:flex">
            <Calendar className="w-5 h-5" />
            <span className="hidden lg:inline">יום יום</span>
          </TabsTrigger>

          <TabsTrigger value="history" className="hidden lg:flex gap-2">
            <BarChart3 className="w-5 h-5" />
            היסטוריה
          </TabsTrigger>

          <TabsTrigger value="actions" className="hidden lg:flex gap-2">
            <CheckCircle2 className="w-5 h-5" />
            פעולות
          </TabsTrigger>

          <TabsTrigger value="resources" className="hidden lg:flex gap-2">
            <BookOpen className="w-5 h-5" />
            משאבים
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex items-center justify-center px-4 py-4">
          <TabsContent value="conversations" className="h-full w-full max-w-4xl">
            <div className="bg-white rounded-lg border border-gray-200 h-full overflow-hidden shadow-lg" dir="rtl">
              <MentorConversation />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="h-full">
            <div className="bg-white rounded-lg border border-gray-100 h-full overflow-hidden">
              <Insights />
            </div>
          </TabsContent>

          <TabsContent value="sales" className="h-full">
            <div className="bg-white rounded-lg border border-gray-100 h-full overflow-hidden">
              <Sales />
            </div>
          </TabsContent>

          <TabsContent value="daily" className="h-full">
            <div className="bg-white rounded-lg border border-gray-100 h-full overflow-hidden">
              <Daily />
            </div>
          </TabsContent>

          <TabsContent value="history" className="h-full">
            <div className="bg-white rounded-lg border border-gray-100 h-full overflow-hidden">
              <History />
            </div>
          </TabsContent>

          <TabsContent value="actions" className="h-full">
            <div className="bg-white rounded-lg border border-gray-100 h-full overflow-hidden">
              <Actions />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="h-full">
            <div className="bg-white rounded-lg border border-gray-100 h-full overflow-hidden">
              <Resources />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}