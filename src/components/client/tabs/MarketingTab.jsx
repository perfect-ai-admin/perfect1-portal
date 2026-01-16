import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Rocket, Users, TrendingUp, BookOpen, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BrandingSection from '../marketing/BrandingSection';
import BrandingTools from '../marketing/BrandingTools';
import CampaignSection from '../marketing/CampaignSection';
import GoogleSection from '../marketing/GoogleSection';
import ROISection from '../marketing/ROISection';
import LearnSection from '../marketing/LearnSection';
import LogoCreator from '../marketing/LogoCreator';
import CampaignBuilder from '../marketing/CampaignBuilder';
import BarChart from '../business/BarChart';
import Sparkline from '../business/Sparkline';
import LandingPageBuilder from '../marketing/LandingPageBuilder';

export default function MarketingTab({ data }) {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Marketing Tools Tabs */}
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8 bg-white border border-gray-200">
          <TabsTrigger value="branding" className="flex gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">מיתוג</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex gap-2">
            <Rocket className="w-4 h-4" />
            <span className="hidden sm:inline">קמפיינים</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Google</span>
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">ROI</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">לימוד</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
           <LandingPageBuilder />
           <div className="border-t pt-8">
             <h3 className="text-lg font-bold text-gray-900 mb-4">עוד כלים</h3>
             <BrandingTools businessName={data.name} />
           </div>
           <div className="border-t pt-8">
             <h3 className="text-lg font-bold text-gray-900 mb-4">תבניות נוספות</h3>
             <BrandingSection businessName={data.name} onActionStart={() => {}} />
           </div>
         </TabsContent>

        <TabsContent value="campaigns" className="bg-white rounded-lg border border-gray-200 p-6">
          <CampaignSection />
        </TabsContent>

        <TabsContent value="google" className="bg-white rounded-lg border border-gray-200 p-6">
          <GoogleSection />
        </TabsContent>

        <TabsContent value="roi" className="bg-white rounded-lg border border-gray-200 p-6">
          <ROISection />
        </TabsContent>

        <TabsContent value="learn">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <LearnSection />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}