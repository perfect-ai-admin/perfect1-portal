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
      className="space-y-4 md:space-y-8"
    >
      {/* Marketing Tools Tabs */}
      <Tabs defaultValue="branding" className="w-full flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 md:gap-0 mb-4 md:mb-8 bg-transparent p-0">
          <TabsTrigger value="branding" className="flex flex-col gap-2 md:gap-1 py-3 md:py-2 px-2 md:px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Palette className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">מיתוג</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex flex-col gap-2 md:gap-1 py-3 md:py-2 px-2 md:px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Rocket className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">קמפיינים</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex flex-col gap-2 md:gap-1 py-3 md:py-2 px-2 md:px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">Google</span>
          </TabsTrigger>
          <TabsTrigger value="roi" className="hidden md:flex flex-col gap-1 py-2 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">ROI</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="hidden md:flex flex-col gap-1 py-2 px-4 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">לימוד</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
          <BrandingSection businessName={data.name} onActionStart={() => {}} />
        </TabsContent>

        <TabsContent value="campaigns" className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
          <CampaignSection />
        </TabsContent>

        <TabsContent value="google" className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
          <GoogleSection />
        </TabsContent>

        <TabsContent value="roi" className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
          <ROISection />
        </TabsContent>

        <TabsContent value="learn" className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
          <LearnSection />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}