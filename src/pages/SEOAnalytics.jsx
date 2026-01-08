import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Link2, Lightbulb } from 'lucide-react';
import CompetitorAnalyzer from '../components/seo/CompetitorAnalyzer';
import ContentSuggestionEngine from '../components/seo/ContentSuggestionEngine';
import BrokenLinkChecker from '../components/seo/BrokenLinkChecker';

export default function SEOAnalytics() {
  const [activeTab, setActiveTab] = useState('competitors');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            🚀 Advanced SEO Analytics
          </h1>
          <p className="text-lg opacity-90">
            Competitor analysis, content optimization, and link auditing
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="competitors" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Competitors</span>
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Suggestions</span>
              </TabsTrigger>
              <TabsTrigger value="links" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <span className="hidden sm:inline">Links</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="competitors" className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Competitor Analysis:</strong> Monitor top-ranking competitors for your target keywords. 
                  Analyze their SEO strategy including title tags, meta descriptions, content length, schema markup, and more.
                </p>
              </div>
              <CompetitorAnalyzer />
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>AI-Powered Suggestions:</strong> Get intelligent recommendations to improve your content based on 
                  competitor benchmarks and SEO best practices. Implemented via LLM analysis.
                </p>
              </div>
              <ContentSuggestionEngine />
            </TabsContent>

            <TabsContent value="links" className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Link Audit:</strong> Scan your entire website for broken links, 404 errors, timeouts, and DNS failures.
                  Track fixes and maintain site health.
                </p>
              </div>
              <BrokenLinkChecker />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}