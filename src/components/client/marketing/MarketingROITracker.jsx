import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Target, LineChart, PieChart, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '../business/formatters';

export default function MarketingROITracker({ data }) {
  const [timeRange, setTimeRange] = useState('30');
  const [campaigns, setCampaigns] = useState([]);
  const [roiAnalysis, setRoiAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Mock data - בפרודקשן יתחבר לנתוני SalesInteraction ו-Lead
    const mockCampaigns = [
      {
        id: 1,
        name: 'פרסום פייסבוק - יוני',
        channel: 'facebook',
        spend: 1500,
        leads: 45,
        conversions: 12,
        revenue: 8400,
        roi: 460,
        cpl: 33.33,
        cpa: 125,
        status: 'active',
        attribution: {
          direct: 5,
          assisted: 4,
          lastClick: 12
        }
      },
      {
        id: 2,
        name: 'גוגל מודעות - יוני',
        channel: 'google',
        spend: 2200,
        leads: 32,
        conversions: 8,
        revenue: 5600,
        roi: 154,
        cpl: 68.75,
        cpa: 275,
        status: 'active',
        attribution: {
          direct: 3,
          assisted: 3,
          lastClick: 8
        }
      },
      {
        id: 3,
        name: 'וואטסאפ אורגני',
        channel: 'whatsapp',
        spend: 0,
        leads: 28,
        conversions: 15,
        revenue: 10500,
        roi: Infinity,
        cpl: 0,
        cpa: 0,
        status: 'active',
        attribution: {
          direct: 15,
          assisted: 0,
          lastClick: 15
        }
      },
      {
        id: 4,
        name: 'אינסטגרם - מאי',
        channel: 'instagram',
        spend: 800,
        leads: 18,
        conversions: 3,
        revenue: 2100,
        roi: 162,
        cpl: 44.44,
        cpa: 266.67,
        status: 'paused',
        attribution: {
          direct: 1,
          assisted: 2,
          lastClick: 3
        }
      }
    ];

    setCampaigns(mockCampaigns);

    // חישוב ניתוח ROI כללי
    const totalSpend = mockCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalRevenue = mockCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    const totalLeads = mockCampaigns.reduce((sum, c) => sum + c.leads, 0);
    const totalConversions = mockCampaigns.reduce((sum, c) => sum + c.conversions, 0);
    const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

    setRoiAnalysis({
      totalSpend,
      totalRevenue,
      totalLeads,
      totalConversions,
      overallROI,
      avgCPL: totalSpend / totalLeads,
      avgCPA: totalSpend / totalConversions,
      conversionRate: (totalConversions / totalLeads) * 100
    });

    // יצירת המלצות אוטומטיות
    generateRecommendations(mockCampaigns, {
      totalSpend,
      totalRevenue,
      overallROI
    });
  }, [timeRange]);

  const generateRecommendations = (campaigns, analysis) => {
    const recs = [];

    // מצא ערוץ עם ROI הכי גבוה
    const bestChannel = campaigns
      .filter(c => c.roi !== Infinity && c.status === 'active')
      .sort((a, b) => b.roi - a.roi)[0];

    if (bestChannel && bestChannel.roi > 200) {
      recs.push({
        type: 'scale',
        priority: 'high',
        title: `הגדל תקציב ב${bestChannel.name}`,
        description: `ROI של ${formatPercentage(bestChannel.roi, 0)} - שווה להשקיע יותר בערוץ הזה`,
        impact: 'high',
        icon: TrendingUp,
        action: 'scale_budget'
      });
    }

    // מצא ערוץ עם ROI נמוך
    const worstChannel = campaigns
      .filter(c => c.status === 'active' && c.roi < 100)
      .sort((a, b) => a.roi - b.roi)[0];

    if (worstChannel) {
      recs.push({
        type: 'optimize',
        priority: 'medium',
        title: `שפר ביצועים ב${worstChannel.name}`,
        description: `ROI של ${formatPercentage(worstChannel.roi, 0)} - נמוך מהממוצע. בדוק מסרים ו-targeting`,
        impact: 'medium',
        icon: Target,
        action: 'optimize_campaign'
      });
    }

    // בדוק ערוצים אורגניים
    const organicChannels = campaigns.filter(c => c.spend === 0 && c.conversions > 5);
    if (organicChannels.length > 0) {
      recs.push({
        type: 'maintain',
        priority: 'low',
        title: 'המשך עם ערוצים אורגניים',
        description: `${organicChannels[0].name} מביא ${organicChannels[0].conversions} המרות בחינם!`,
        impact: 'high',
        icon: CheckCircle,
        action: 'maintain_organic'
      });
    }

    // המלצה כללית על בסיס ROI
    if (analysis.overallROI < 150) {
      recs.push({
        type: 'alert',
        priority: 'high',
        title: 'ROI כללי נמוך',
        description: `ROI כללי של ${formatPercentage(analysis.overallROI, 0)}. שקול לעצור קמפיינים לא רווחיים`,
        impact: 'critical',
        icon: AlertCircle,
        action: 'review_all'
      });
    }

    setRecommendations(recs);
  };

  const getChannelColor = (channel) => {
    const colors = {
      facebook: 'bg-blue-500',
      google: 'bg-red-500',
      instagram: 'bg-pink-500',
      whatsapp: 'bg-green-500',
      linkedin: 'bg-blue-700'
    };
    return colors[channel] || 'bg-gray-500';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
      critical: 'bg-red-200 text-red-900 font-bold'
    };
    return badges[priority] || badges.low;
  };

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" role="heading" aria-level="2">
            מעקב ROI שיווקי
          </h2>
          <p className="text-gray-600 mt-1">ניתוח ביצועי קמפיינים והמלצות מבוססות נתונים</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40" aria-label="בחר טווח זמן">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 ימים אחרונים</SelectItem>
            <SelectItem value="30">30 ימים אחרונים</SelectItem>
            <SelectItem value="90">90 ימים אחרונים</SelectItem>
            <SelectItem value="365">שנה אחרונה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall ROI Summary */}
      {roiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ROI כללי</p>
                  <p className={`text-2xl font-bold ${roiAnalysis.overallROI > 200 ? 'text-green-600' : roiAnalysis.overallROI > 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {formatPercentage(roiAnalysis.overallROI, 0)}
                  </p>
                </div>
                {roiAnalysis.overallROI > 150 ? (
                  <TrendingUp className="w-8 h-8 text-green-600" aria-hidden="true" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" aria-hidden="true" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">הוצאה כוללת</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(roiAnalysis.totalSpend)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">הכנסה כוללת</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(roiAnalysis.totalRevenue)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">שיעור המרה</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPercentage(roiAnalysis.conversionRate, 1)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">קמפיינים</TabsTrigger>
          <TabsTrigger value="attribution">מודלי ייחוס</TabsTrigger>
          <TabsTrigger value="recommendations">המלצות</TabsTrigger>
        </TabsList>

        {/* Campaigns Performance */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" aria-hidden="true" />
                ביצועי קמפיינים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getChannelColor(campaign.channel)}`} />
                        <div>
                          <h4 className="font-bold text-gray-900">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">
                            {campaign.leads} לידים • {campaign.conversions} המרות
                          </p>
                        </div>
                      </div>
                      <Badge className={campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {campaign.status === 'active' ? 'פעיל' : 'מושהה'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">הוצאה</p>
                        <p className="font-bold text-gray-900">{formatCurrency(campaign.spend)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">הכנסה</p>
                        <p className="font-bold text-green-600">{formatCurrency(campaign.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ROI</p>
                        <p className={`font-bold ${campaign.roi > 200 ? 'text-green-600' : campaign.roi > 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {campaign.roi === Infinity ? '∞' : formatPercentage(campaign.roi, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">עלות לליד</p>
                        <p className="font-bold text-gray-900">{formatCurrency(campaign.cpl)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">עלות להמרה</p>
                        <p className="font-bold text-gray-900">
                          {campaign.cpa === 0 ? 'חינם' : formatCurrency(campaign.cpa)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attribution Models */}
        <TabsContent value="attribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" aria-hidden="true" />
                מודלי ייחוס - כיצד מתרחשות ההמרות?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <h4 className="font-bold text-gray-900 mb-3">{campaign.name}</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">המרות ישירות</p>
                        <p className="text-2xl font-bold text-blue-600">{campaign.attribution.direct}</p>
                        <p className="text-xs text-gray-500 mt-1">לקוח הגיע ישירות מהמודעה</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">השפעה עקיפה</p>
                        <p className="text-2xl font-bold text-purple-600">{campaign.attribution.assisted}</p>
                        <p className="text-xs text-gray-500 mt-1">תרם למסע הלקוח</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">קליק אחרון</p>
                        <p className="text-2xl font-bold text-green-600">{campaign.attribution.lastClick}</p>
                        <p className="text-xs text-gray-500 mt-1">נקודת המגע האחרונה</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                  מה זה אומר?
                </h4>
                <p className="text-sm text-blue-800">
                  <strong>המרות ישירות:</strong> לקוח ראה את המודעה ולחץ והתקשר מיד.<br />
                  <strong>השפעה עקיפה:</strong> המודעה תרמה למסע הלקוח אבל לא היתה נקודת המגע האחרונה.<br />
                  <strong>קליק אחרון:</strong> המודעה היתה הפעולה האחרונה לפני ההמרה.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" aria-hidden="true" />
                המלצות מבוססות נתונים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" aria-hidden="true" />
                    <p className="font-semibold">כל הקמפיינים מתפקדים מצוין!</p>
                    <p className="text-sm">אין המלצות דחופות כרגע</p>
                  </div>
                ) : (
                  recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          rec.priority === 'high' || rec.priority === 'critical'
                            ? 'bg-red-100'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-100'
                            : 'bg-green-100'
                        }`}>
                          <rec.icon className={`w-6 h-6 ${
                            rec.priority === 'high' || rec.priority === 'critical'
                              ? 'text-red-600'
                              : rec.priority === 'medium'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`} aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">{rec.title}</h4>
                            <Badge className={getPriorityBadge(rec.priority)}>
                              {rec.priority === 'high' ? 'חשוב' : rec.priority === 'critical' ? 'קריטי' : rec.priority === 'medium' ? 'בינוני' : 'רגיל'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">השפעה צפויה:</span>
                            <Badge variant="outline" className="text-xs">
                              {rec.impact === 'high' ? 'גבוהה' : rec.impact === 'critical' ? 'קריטית' : rec.impact === 'medium' ? 'בינונית' : 'נמוכה'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}