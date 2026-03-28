import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailyFocusScreen from './daily/DailyFocusScreen';
import WeeklyStructureScreen from './daily/WeeklyStructureScreen';
import FocusScreen from './daily/FocusScreen';
import LoadScreen from './daily/LoadScreen';
import ReviewScreen from './daily/ReviewScreen';
import { Zap, Calendar, Target, Activity, CheckCircle2 } from 'lucide-react';
import { entities } from '@/api/supabaseClient';

export default function DailyOperations({ data }) {
  const [focus, setFocus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaysFocus();
  }, []);

  const loadTodaysFocus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const focusData = await entities.DailyFocus.filter(
        { date: today },
        '-created_date',
        1
      );
      if (focusData.length > 0) {
        setFocus(focusData[0]);
      } else {
        setFocus({ date: today });
      }
    } catch (error) {
      console.error('Error loading focus:', error);
      setFocus({ date: new Date().toISOString().split('T')[0] });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const updatedFocus = { ...focus, ...updates, date: today };

      if (focus?.id) {
        await entities.DailyFocus.update(focus.id, updates);
      } else {
        await entities.DailyFocus.create(updatedFocus);
      }

      setFocus(updatedFocus);
    } catch (error) {
      console.error('Error saving focus:', error);
    }
  };

  if (loading) {
    return <div className="h-96 bg-gray-100 rounded-3xl animate-pulse" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col"
    >
      <Tabs defaultValue="daily" className="w-full flex-1 flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 mb-6 inline-flex w-fit mx-auto sticky top-0 z-20">
            <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabTrigger value="daily" icon={Zap} label="היום" />
            <TabTrigger value="weekly" icon={Calendar} label="השבוע" />
            <TabTrigger value="focus" icon={Target} label="פוקוס" />
            <TabTrigger value="load" icon={Activity} label="עומס" />
            <TabTrigger value="review" icon={CheckCircle2} label="סיכום" />
            </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10">
            <TabsContent value="daily" className="mt-0 h-full">
            <DailyFocusScreen focus={focus} onSave={handleSave} />
            </TabsContent>

            <TabsContent value="weekly" className="mt-0 h-full">
            <WeeklyStructureScreen />
            </TabsContent>

            <TabsContent value="focus" className="mt-0 h-full">
            <FocusScreen focus={focus} onSave={handleSave} />
            </TabsContent>

            <TabsContent value="load" className="mt-0 h-full">
            <LoadScreen focus={focus} onSave={handleSave} />
            </TabsContent>

            <TabsContent value="review" className="mt-0 h-full">
            <ReviewScreen focus={focus} onSave={handleSave} />
            </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}

function TabTrigger({ value, icon: Icon, label }) {
    return (
        <TabsTrigger 
            value={value} 
            className="rounded-xl px-4 py-2 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 text-gray-500 hover:text-gray-900 transition-all gap-2"
        >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
        </TabsTrigger>
    )
}