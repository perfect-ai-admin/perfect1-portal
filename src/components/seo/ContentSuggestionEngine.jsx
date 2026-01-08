import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Lightbulb, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContentSuggestionEngine() {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('BlogPost');

  const generateSuggestions = async () => {
    setIsLoading(true);

    try {
      // Get current content
      const [blogPosts, professions] = await Promise.all([
        base44.entities.BlogPost.list('-updated_date', 20),
        base44.entities.Profession.list('-updated_date', 20)
      ]);

      const contents = selectedEntity === 'BlogPost' ? blogPosts : professions;

      // Get competitor data for benchmarking
      const competitors = await base44.entities.CompetitorData.list('-last_scanned', 10);

      const generatedSuggestions = [];

      for (const content of contents.slice(0, 5)) {
        const analysisPrompt = `Analyze this ${selectedEntity} content and competitor data to suggest SEO improvements.

Content: Title="${content.title || content.name}", Word Count=${content.word_count || '?'}, Keyword="${content.keywords ? content.keywords[0] : 'N/A'}"

Competitor Benchmarks (${competitors.length} analyzed):
- Avg word count: ${Math.round(competitors.reduce((sum, c) => sum + (c.word_count || 0), 0) / competitors.length)}
- Avg images: ${Math.round(competitors.reduce((sum, c) => sum + (c.image_count || 0), 0) / competitors.length)}
- Has schema: ${competitors.filter(c => c.has_schema).length}/${competitors.length}

Provide 3 actionable SEO improvement suggestions in JSON format.`;

        const suggestions = await base44.integrations.Core.InvokeLLM({
          prompt: analysisPrompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    current: { type: "string" },
                    suggested: { type: "string" },
                    reasoning: { type: "string" },
                    impact: { type: "string" }
                  }
                }
              }
            }
          }
        });

        // Save suggestions to database
        for (const sugg of suggestions.suggestions) {
          const saved = await base44.entities.ContentSuggestion.create({
            entity_type: selectedEntity,
            entity_id: content.id,
            entity_title: content.title || content.name,
            keyword: content.keywords?.[0] || 'N/A',
            suggestion_type: sugg.type,
            current_value: sugg.current,
            suggested_value: sugg.suggested,
            reasoning: sugg.reasoning,
            potential_impact: sugg.impact.toLowerCase(),
            competitor_benchmark: { competitor_count: competitors.length }
          });
          generatedSuggestions.push(saved);
        }
      }

      setSuggestions(generatedSuggestions);
    } catch (error) {
      alert('Failed to generate suggestions: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const markImplemented = async (suggestionId) => {
    await base44.entities.ContentSuggestion.update(suggestionId, { implemented: true });
    setSuggestions(suggestions.map(s => s.id === suggestionId ? { ...s, implemented: true } : s));
  };

  const impactColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-blue-100 text-blue-700 border-blue-300'
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200"
      >
        <h3 className="text-xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Content Improvement Suggestions
        </h3>

        <div className="flex gap-3">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="BlogPost">Blog Posts</option>
            <option value="Profession">Professions</option>
          </select>

          <Button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Suggestions
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <h4 className="font-bold text-[#1E3A5F]">Suggestions ({suggestions.length})</h4>
            {suggestions.map(sugg => (
              <motion.div
                key={sugg.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <Card className={`p-4 ${sugg.implemented ? 'opacity-60' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-semibold text-gray-800">{sugg.entity_title}</h5>
                        <p className="text-xs text-gray-600 mt-1">{sugg.suggestion_type.replace(/_/g, ' ').toUpperCase()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-bold border ${impactColors[sugg.potential_impact]}`}>
                        {sugg.potential_impact.toUpperCase()} Impact
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-red-50 p-2 rounded border-l-4 border-red-300">
                        <p className="text-xs font-semibold text-gray-700">Current:</p>
                        <p className="text-xs text-gray-600 mt-1 truncate">{sugg.current_value}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded border-l-4 border-green-300">
                        <p className="text-xs font-semibold text-gray-700">Suggested:</p>
                        <p className="text-xs text-gray-600 mt-1 truncate">{sugg.suggested_value}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-gray-700"><strong>Why:</strong> {sugg.reasoning}</p>
                    </div>

                    {!sugg.implemented && (
                      <Button
                        onClick={() => markImplemented(sugg.id)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Implemented
                      </Button>
                    )}
                    {sugg.implemented && (
                      <div className="text-center py-2 bg-green-100 text-green-700 rounded text-sm font-semibold">
                        ✅ Implemented
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {suggestions.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No suggestions generated yet. Click the button above to analyze your content.</p>
        </div>
      )}
    </div>
  );
}