import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TrendingUp, Globe, Loader2, Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompetitorAnalyzer() {
  const [competitors, setCompetitors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [keyword, setKeyword] = useState('osek patur');

  const analyzeCompetitor = async () => {
    if (!newCompetitor.trim()) return;
    setIsLoading(true);

    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the competitor website: ${newCompetitor} for keyword "${keyword}". 
        Return JSON with: domain, title, meta_description, word_count, h1_tags (array), 
        has_schema (boolean), image_count, internal_links_count, external_links_count, notes.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            domain: { type: "string" },
            title: { type: "string" },
            meta_description: { type: "string" },
            word_count: { type: "number" },
            h1_tags: { type: "array", items: { type: "string" } },
            has_schema: { type: "boolean" },
            image_count: { type: "number" },
            internal_links_count: { type: "number" },
            external_links_count: { type: "number" },
            notes: { type: "string" }
          }
        }
      });

      const competitorData = await base44.entities.CompetitorData.create({
        domain: newCompetitor,
        url: newCompetitor,
        keyword: keyword,
        ...analysis,
        last_scanned: new Date().toISOString()
      });

      setCompetitors([...competitors, competitorData]);
      setNewCompetitor('');
    } catch (error) {
      alert('Failed to analyze competitor');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompetitors = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.CompetitorData.list('-last_scanned', 50);
      setCompetitors(data);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCompetitors();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200"
      >
        <h3 className="text-xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Competitor Analysis
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Keyword</label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., osek patur"
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Competitor Domain</label>
            <div className="flex gap-2">
              <Input
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                placeholder="e.g., competitor.co.il"
                className="h-10"
                onKeyPress={(e) => e.key === 'Enter' && analyzeCompetitor()}
              />
              <Button
                onClick={analyzeCompetitor}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {competitors.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-[#1E3A5F]">Analyzed Competitors ({competitors.length})</h4>
          {competitors.map(comp => (
            <Card key={comp.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <h5 className="font-bold text-gray-800">{comp.domain}</h5>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {comp.keyword}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Words: <strong>{comp.word_count || 'N/A'}</strong></p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Images: <strong>{comp.image_count || 0}</strong></p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Internal Links: <strong>{comp.internal_links_count || 0}</strong></p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Schema: <strong>{comp.has_schema ? '✅' : '❌'}</strong></p>
                    </div>
                  </div>

                  {comp.h1_tags && comp.h1_tags.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs font-semibold text-gray-700">H1 Tags:</p>
                      <p className="text-xs text-gray-600 mt-1">{comp.h1_tags.join(', ')}</p>
                    </div>
                  )}

                  {comp.notes && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-700">{comp.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {competitors.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No competitors analyzed yet. Add one to get started.</p>
        </div>
      )}
    </div>
  );
}