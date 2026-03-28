import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


import { TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { entities } from '@/api/supabaseClient';

export default function SalesAnalyticsDashboard({ leadId }) {
  const [metrics, setMetrics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [leadId]);

  const loadData = async () => {
    try {
      const [interactionsData, metricsData, insightsData] = await Promise.all([
        entities.SalesInteraction.filter({ created_by: leadId }, '-date', 100),
        entities.SalesMetric.filter({ created_by: leadId }, '-period_date', 5),
        entities.SalesInsight.filter({ created_by: leadId }, '-period_date', 10)
      ]);

      setInteractions(interactionsData);
      setMetrics(metricsData?.[0]);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">עדיין אין נתוני מכירות</p>
        <p className="text-sm text-gray-500 mt-2">תחל בתיעוד שיחות כדי לראות תובנות</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard
          label="יחס סגירה"
          value={`${Math.round(metrics.close_rate || 0)}%`}
          icon={Target}
          color="blue"
          subtext={`${metrics.total_closures || 0} / ${metrics.total_interactions || 0}`}
        />
        <MetricCard
          label="שיחות כולל"
          value={metrics.total_interactions || 0}
          icon={TrendingUp}
          color="purple"
          subtext="בתקופה הנוכחית"
        />
        <MetricCard
          label="מחיר ממוצע"
          value={`₪${Math.round(metrics.avg_price || 0)}`}
          icon={CheckCircle}
          color="green"
          subtext={`סגור: ₪${Math.round(metrics.avg_sale_price || 0)}`}
        />
        <MetricCard
          label="התנגדות עיקרית"
          value={getObjectionLabel(metrics.most_common_objection)}
          icon={AlertCircle}
          color="orange"
          subtext={`${metrics.most_common_objection_count || 0} פעמים`}
        />
      </div>

      {/* Channel Performance */}
      {metrics.by_channel && Object.keys(metrics.by_channel).length > 0 && (
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 ביצועים לפי ערוץ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.by_channel).map(([channel, data]) => (
                <div key={channel} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">{getChannelIcon(channel)} {getChannelLabel(channel)}</span>
                    <Badge>{Math.round(data.rate || 0)}% סגירה</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.interactions || 0} שיחות • {data.closed || 0} עסקאות
                  </div>
                  <div className="mt-2 bg-white rounded h-2">
                    <div
                      className="bg-blue-500 h-full rounded"
                      style={{ width: `${Math.min(data.rate || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      {insights.length > 0 && (
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💡 תובנות חשובות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.slice(0, 5).map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <Badge variant={insight.priority === 'high' ? 'default' : 'secondary'}>
                    {insight.priority === 'high' ? '🔥' : '📌'} {insight.confidence_level}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                {insight.recommendation && (
                  <div className="bg-white rounded p-2 text-sm text-blue-900 border border-blue-200">
                    <strong>💪 המלצה:</strong> {insight.recommendation}
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Interactions Summary */}
      {interactions.length > 0 && (
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-gray-200">
          <CardHeader>
            <CardTitle>📝 שיחות אחרונות</CardTitle>
            <CardDescription>
              {interactions.length} שיחות תועדו
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {interactions.slice(0, 10).map((interaction) => (
                <div
                  key={interaction.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {interaction.contact_name || 'ללא שם'} {getChannelIcon(interaction.channel)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {interaction.service_type && `📋 ${interaction.service_type} • `}
                      {interaction.duration_minutes && `⏱️ ${interaction.duration_minutes} דק • `}
                      📅 {new Date(interaction.date).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <Badge variant={interaction.outcome === 'closed_won' ? 'default' : 'secondary'}>
                    {getOutcomeLabel(interaction.outcome)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, subtext }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600'
  };

  return (
    <div className={`rounded-xl p-4 border-2 ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtext && <p className="text-xs mt-1 opacity-70">{subtext}</p>}
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  );
}

function getChannelIcon(channel) {
  const icons = {
    phone: '☎️',
    whatsapp: '💬',
    meeting: '🤝',
    email: '📧',
    video_call: '📹'
  };
  return icons[channel] || '📞';
}

function getChannelLabel(channel) {
  const labels = {
    phone: 'טלפון',
    whatsapp: 'WhatsApp',
    meeting: 'פגישה',
    email: 'דוא״ל',
    video_call: 'וידאו'
  };
  return labels[channel] || channel;
}

function getOutcomeLabel(outcome) {
  const labels = {
    closed_won: '✅ סגור',
    closed_lost: '❌ נפל',
    followup: '🔄 מעקב',
    pending: '⏳ בהמתנה'
  };
  return labels[outcome] || outcome;
}

function getObjectionLabel(objection) {
  const labels = {
    price: '💰 מחיר',
    timing: '⏰ עכשיו',
    need_to_think: '🤔 חשיבה',
    trust: '🤝 אמון',
    competitor: '🏆 מתחרה',
    other: 'אחר',
    none: 'אין'
  };
  return labels[objection] || objection;
}