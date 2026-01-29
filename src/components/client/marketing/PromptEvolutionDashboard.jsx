import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, Brain, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function PromptEvolutionDashboard() {
    const [evolutionData, setEvolutionData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Get active prompt version
    const { data: activePrompt } = useQuery({
        queryKey: ['activePrompt'],
        queryFn: () => base44.functions.invoke('getActivePrompt'),
        refetchInterval: 60000 // Refresh every minute
    });

    // Get recent analyses
    const { data: recentAnalyses } = useQuery({
        queryKey: ['recentAnalyses'],
        queryFn: async () => {
            try {
                const result = await base44.entities.PageQualityAnalysis.filter({}, '-analysis_date', 20);
                return result || [];
            } catch (err) {
                console.error('Error fetching analyses:', err);
                return [];
            }
        },
        refetchInterval: 60000
    });

    // Trigger prompt evolution
    const handleEvolvePrompt = async () => {
        setLoading(true);
        try {
            const result = await base44.functions.invoke('evolvePrompt');
            alert(`✅ פרומט V${result.data?.new_version || 'N/A'} יצור בהצלחה!`);
        } catch (error) {
            alert(`❌ שגיאה: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const chartData = recentAnalyses?.map((analysis, idx) => ({
        name: `דף ${idx + 1}`,
        score: analysis.overall_quality_score,
        version: analysis.prompt_version_used
    })) || [];

    // Calculate average score by section
    const sectionAverages = {};
    recentAnalyses?.forEach(analysis => {
        if (analysis.section_scores) {
            Object.keys(analysis.section_scores).forEach(section => {
                if (!sectionAverages[section]) {
                    sectionAverages[section] = { sum: 0, count: 0 };
                }
                sectionAverages[section].sum += analysis.section_scores[section].score || 0;
                sectionAverages[section].count += 1;
            });
        }
    });

    const sectionChartData = Object.entries(sectionAverages).map(([section, data]) => ({
        section: section.replace(/_/g, ' '),
        average: (data.sum / data.count).toFixed(1)
    }));

    return (
        <div className="space-y-6 p-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-blue-600 font-semibold">גרסת פרומט</div>
                            <div className="text-2xl font-bold text-blue-900">
                                V{activePrompt?.data?.version || '—'}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-green-600 font-semibold">ציון כולל</div>
                            <div className="text-2xl font-bold text-green-900">
                                {activePrompt?.data?.avg_quality_score?.toFixed(1) || '—'}/100
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-purple-600 font-semibold">דפים שנוצרו</div>
                            <div className="text-2xl font-bold text-purple-900">
                                {activePrompt?.data?.pages_generated || '0'}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-white">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-amber-600 font-semibold">שיפורים</div>
                            <div className="text-2xl font-bold text-amber-900">
                                {activePrompt?.data?.improvements_log?.length || '0'}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Trend Chart */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">טרנד ציונים לאחרונה</h3>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="score" stroke="#3b82f6" name="ציון איכות" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        אין נתונים עדיין
                    </div>
                )}
            </Card>

            {/* Section Scores */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">ממוצע ציונים לפי סקשן</h3>
                {sectionChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sectionChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="section" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Bar dataKey="average" fill="#8b5cf6" name="ממוצע ציון" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        אין נתונים עדיין
                    </div>
                )}
            </Card>

            {/* Evolution Log */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">רישום שיפורים</h3>
                {activePrompt?.data?.improvements_log && activePrompt.data.improvements_log.length > 0 ? (
                    <div className="space-y-3">
                        {activePrompt.data.improvements_log.slice().reverse().map((log, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="font-semibold text-gray-900">{log.change}</div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(log.date).toLocaleDateString('he-IL')}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">{log.reason}</div>
                                <div className="text-xs text-gray-500 italic">{log.impact_on_next_pages}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-8">עדיין אין שיפורים</div>
                )}
            </Card>

            {/* Evolution Button */}
            <Button
                onClick={handleEvolvePrompt}
                disabled={loading || (recentAnalyses?.length || 0) < 3}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg"
            >
                {loading ? 'מעבד...' : (recentAnalyses?.length || 0) < 3 ? `יש צורך ב-${3 - (recentAnalyses?.length || 0)} דפים נוספים` : '🚀 שנה את הפרומט'}
            </Button>
        </div>
    );
}