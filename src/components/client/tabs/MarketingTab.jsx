import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Rocket, Users, TrendingUp, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BrandingSection from '../marketing/BrandingSection';
import CampaignSection from '../marketing/CampaignSection';
import GoogleSection from '../marketing/GoogleSection';
import ROISection from '../marketing/ROISection';
import LearnSection from '../marketing/LearnSection';

export default function MarketingTab({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >


      {/* Marketing Tools Tabs */}
      <Tabs defaultValue="brand" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="brand">
            <Palette className="w-4 h-4 ml-2" />
            מיתוג
          </TabsTrigger>
          <TabsTrigger value="campaign">
            <Rocket className="w-4 h-4 ml-2" />
            קמפיין
          </TabsTrigger>
          <TabsTrigger value="gbp">
            <Users className="w-4 h-4 ml-2" />
            Google
          </TabsTrigger>
          <TabsTrigger value="roi">
            <TrendingUp className="w-4 h-4 ml-2" />
            ROI
          </TabsTrigger>
          <TabsTrigger value="education">
            <BookOpen className="w-4 h-4 ml-2" />
            לימוד
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">סטודיו למיתוג - יצירת לוגו</h3>
            <LogoCreator businessName={data.name} />
          </div>
        </TabsContent>

        <TabsContent value="campaign">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">בונה קמפיינים</h3>
            <CampaignBuilder />
          </div>
        </TabsContent>

        <TabsContent value="gbp">
          <GoogleBusinessProfile />
        </TabsContent>

        <TabsContent value="roi">
           <div className="space-y-6">
             <MarketingROITracker data={data} />
             {/* ROI Chart Visualization */}
             <div className="bg-white rounded-2xl shadow-lg p-8">
               <h3 className="text-2xl font-bold text-gray-900 mb-6">ביצוע ערוצי השיווק</h3>
               <BarChart 
                 data={[
                   { name: 'Google Ads', ROI: 285, Cost: 1200 },
                   { name: 'Facebook', ROI: 215, Cost: 800 },
                   { name: 'Instagram', ROI: 165, Cost: 600 },
                   { name: 'טלפון', ROI: 320, Cost: 0 }
                 ]}
                 dataKeys={['ROI', 'Cost']}
                 colors={['#22C55E', '#F59E0B']}
               />
             </div>

             {/* Channel Performance Trends */}
             <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white rounded-2xl shadow-lg p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">מגמת Google Ads</h3>
                 <Sparkline 
                   data={[
                     { value: 25 },
                     { value: 35 },
                     { value: 42 },
                     { value: 38 },
                     { value: 52 },
                     { value: 48 }
                   ]}
                   color="#3B82F6"
                   width={200}
                   height={60}
                 />
               </div>
               <div className="bg-white rounded-2xl shadow-lg p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">מגמת Facebook</h3>
                 <Sparkline 
                   data={[
                     { value: 18 },
                     { value: 24 },
                     { value: 28 },
                     { value: 22 },
                     { value: 32 },
                     { value: 35 }
                   ]}
                   color="#3B82F6"
                   width={200}
                   height={60}
                 />
               </div>
             </div>
           </div>
         </TabsContent>

        <TabsContent value="education">
          <div className="grid md:grid-cols-2 gap-6">
            <EducationCard
              title="שיווק לעצמאים 101"
              description="המדריך המלא לשיווק עסק קטן"
              duration="15 דקות"
            />
            <EducationCard
              title="רשתות חברתיות ביעילות"
              description="איך לנהל רשתות בלי לבזבז זמן"
              duration="10 דקות"
            />
            <EducationCard
              title="המלצות שמביאות לקוחות"
              description="איך לבקש המלצות ולהשתמש בהן"
              duration="8 דקות"
            />
            <EducationCard
              title="מדידת ROI"
              description="איך לדעת אם השיווק שלך עובד"
              duration="12 דקות"
            />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}