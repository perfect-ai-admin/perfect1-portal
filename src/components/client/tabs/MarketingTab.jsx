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
import BusinessStateIndicator from '../business/BusinessStateIndicator';
import UnifiedRecommendationPanel from '../business/UnifiedRecommendationPanel';

export default function MarketingTab({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Growth Status Bar */}
      <div className="space-y-4">
        <BusinessStateIndicator 
          stage={data?.business_state?.stage || 'early_revenue'}
          challenge={data?.business_state?.primary_challenge || 'no_leads'}
        />
        <UnifiedRecommendationPanel 
          recommendation={data?.business_state?.unified_recommendation}
        />
      </div>

      {/* Marketing Tools Tabs */}
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full md:grid-cols-5 grid-cols-3 mb-8 bg-white border border-gray-200 gap-1">
          <TabsTrigger value="branding" className="flex gap-1 text-xs md:text-sm">
            <Palette className="w-4 h-4" />
            <span>מיתוג</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex gap-1 text-xs md:text-sm">
            <Rocket className="w-4 h-4" />
            <span>קמפיינים</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex gap-1 text-xs md:text-sm">
            <Users className="w-4 h-4" />
            <span>Google</span>
          </TabsTrigger>
          <TabsTrigger value="roi" className="hidden md:flex gap-1 text-xs md:text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>ROI</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="hidden md:flex gap-1 text-xs md:text-sm">
            <BookOpen className="w-4 h-4" />
            <span>לימוד</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="bg-white rounded-lg border border-gray-200 p-6">
          <BrandingSection businessName={data.name} onActionStart={() => {}} />
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

        <TabsContent value="education">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <LearnSection />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}