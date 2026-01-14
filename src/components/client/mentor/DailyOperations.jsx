import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import DailyFocusScreen from './daily/DailyFocusScreen';
import WeeklyStructureScreen from './daily/WeeklyStructureScreen';
import FocusScreen from './daily/FocusScreen';
import LoadScreen from './daily/LoadScreen';
import ReviewScreen from './daily/ReviewScreen';
import { Calendar, Zap, Focus, Activity, CheckCircle } from 'lucide-react';

export default function DailyOperations({ data }) {
  const [focus, setFocus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaysFocus();
  }, []);

  const loadTodaysFocus = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const focusData = await base44.entities.DailyFocus.filter(
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
        await base44.entities.DailyFocus.update(focus.id, updates);
      } else {
        await base44.entities.DailyFocus.create(updatedFocus);
      }

      setFocus(updatedFocus);
    } catch (error) {
      console.error('Error saving focus:', error);
    }
  };

  if (loading) {
    return <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
          <TabsTrigger value="daily" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">היום</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">השבוע</span>
          </TabsTrigger>
          <TabsTrigger value="focus" className="gap-2">
            <Focus className="w-4 h-4" />
            <span className="hidden sm:inline">פוקוס</span>
          </TabsTrigger>
          <TabsTrigger value="load" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">עומס</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">סיכום</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <DailyFocusScreen focus={focus} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="weekly">
          <WeeklyStructureScreen />
        </TabsContent>

        <TabsContent value="focus">
          <FocusScreen focus={focus} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="load">
          <LoadScreen focus={focus} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="review">
          <ReviewScreen focus={focus} onSave={handleSave} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}