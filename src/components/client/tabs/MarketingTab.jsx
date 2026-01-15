import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Rocket, Users, TrendingUp, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BrandingSection from '../marketing/BrandingSection';
import CampaignSection from '../marketing/CampaignSection';
import GoogleSection from '../marketing/GoogleSection';
import ROISection from '../marketing/ROISection';
import LearnSection from '../marketing/LearnSection';
import LogoCreator from '../marketing/LogoCreator';
import CampaignBuilder from '../marketing/CampaignBuilder';
import BarChart from '../business/BarChart';
import Sparkline from '../business/Sparkline';

export default function MarketingTab({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-0 h-full flex flex-col"
    >
      {/* Marketing Tools Tabs */}
      <Tabs defaultValue="branding" className="w-full flex flex-col h-full">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-2 md:px-0">
          <TabsContent value="branding" className="md:bg-white md:rounded-lg md:border md:border-gray-200 md:p-6 p-0 mt-0 md:mt-0">
            <BrandingSection businessName={data.name} onActionStart={() => {}} />
          </TabsContent>

          <TabsContent value="campaigns" className="md:bg-white md:rounded-lg md:border md:border-gray-200 md:p-6 p-0 mt-0 md:mt-0">
            <CampaignSection />
          </TabsContent>

          <TabsContent value="google" className="md:bg-white md:rounded-lg md:border md:border-gray-200 md:p-6 p-0 mt-0 md:mt-0">
            <GoogleSection />
          </TabsContent>

          <TabsContent value="roi" className="md:bg-white md:rounded-lg md:border md:border-gray-200 md:p-6 p-0 mt-0 md:mt-0">
            <ROISection />
          </TabsContent>

          <TabsContent value="learn" className="md:bg-white md:rounded-lg md:border md:border-gray-200 md:p-6 p-0 mt-0 md:mt-0">
            <LearnSection />
          </TabsContent>
        </div>

        {/* Tabs at Bottom */}
        <TabsList className="grid w-full grid-cols-5 gap-1 md:gap-2 p-1 md:p-4 bg-white md:bg-white border-t md:border md:border-gray-200 md:mt-6 sticky bottom-0 md:static">
          <TabsTrigger value="branding" className="flex flex-col gap-0.5 md:flex-row md:gap-2 p-1 md:p-3 text-xs md:text-sm h-auto md:h-auto">
            <Palette className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden md:inline">מיתוג</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex flex-col gap-0.5 md:flex-row md:gap-2 p-1 md:p-3 text-xs md:text-sm h-auto md:h-auto">
            <Rocket className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden md:inline">קמפיינים</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex flex-col gap-0.5 md:flex-row md:gap-2 p-1 md:p-3 text-xs md:text-sm h-auto md:h-auto">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden md:inline">Google</span>
          </TabsTrigger>
          <TabsTrigger value="roi" className="flex flex-col gap-0.5 md:flex-row md:gap-2 p-1 md:p-3 text-xs md:text-sm h-auto md:h-auto">
            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden md:inline">ROI</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex flex-col gap-0.5 md:flex-row md:gap-2 p-1 md:p-3 text-xs md:text-sm h-auto md:h-auto">
            <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden md:inline">לימוד</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </motion.div>
  );
}