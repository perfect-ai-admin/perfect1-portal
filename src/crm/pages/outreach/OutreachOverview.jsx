import React from 'react';
import { useOutreachOverview, useOutreachTasks } from '../../hooks/useOutreach';
import OutreachKPICard from '../../components/outreach/OutreachKPICard';
import OutreachStatusBadge from '../../components/outreach/OutreachStatusBadge';
import { Globe, Send, Mail, MessageCircle, AlertTriangle, CheckCircle2, Activity, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { WEBSITE_STATUSES } from '../../constants/outreach';
import { useNavigate } from 'react-router-dom';

export default function OutreachOverview() {
  const { data: overview, isLoading } = useOutreachOverview();
  const { data: tasks = [] } = useOutreachTasks({ status: 'open' });
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  const o = overview || {};

  const statusChartData = WEBSITE_STATUSES
    .filter(s => (o.statusBreakdown?.[s.slug] || 0) > 0)
    .map(s => ({ name: s.label, value: o.statusBreakdown?.[s.slug] || 0, fill: s.color }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1E3A5F]">סקירת Outreach</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <OutreachKPICard icon={Globe} label="אתרים" value={o.totalWebsites || 0} subtitle={`${o.approvedWebsites || 0} מאושרים`} />
        <OutreachKPICard icon={Target} label="קמפיינים פעילים" value={o.activeCampaigns || 0} color="#8B5CF6" />
        <OutreachKPICard icon={Send} label="נשלחו" value={o.totalSent || 0} color="#3B82F6" />
        <OutreachKPICard icon={MessageCircle} label="תשובות" value={o.totalReplied || 0} color="#22C55E" />
        <OutreachKPICard icon={Activity} label="Reply Rate" value={`${o.replyRate || 0}%`} color="#06B6D4" />
        <OutreachKPICard icon={AlertTriangle} label="Bounce Rate" value={`${o.bounceRate || 0}%`} color={o.bounceRate > 5 ? '#EF4444' : '#6B7280'} />
        <OutreachKPICard icon={CheckCircle2} label="שיתופי פעולה" value={o.wonDeals || 0} color="#22C55E" />
        <OutreachKPICard icon={Mail} label="משימות פתוחות" value={o.openTasks || 0} color="#F59E0B" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send/Reply Trend */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">מגמת שליחה ותשובות (30 יום)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={o.trend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="sent" stroke="#3B82F6" name="נשלחו" strokeWidth={2} />
              <Line type="monotone" dataKey="replied" stroke="#22C55E" name="תשובות" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">התפלגות סטטוס אתרים</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" name="אתרים" radius={[0, 4, 4, 0]}>
                {statusChartData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Replies + Open Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Replies */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">תשובות אחרונות</h3>
            <button onClick={() => navigate('/CRM/outreach/inbox')} className="text-xs text-blue-600 hover:underline">הצג הכל</button>
          </div>
          {(o.recentReplies || []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">אין תשובות עדיין</p>
          ) : (
            <div className="space-y-2">
              {(o.recentReplies || []).map(r => (
                <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <OutreachStatusBadge value={r.intent} type="intent" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{r.subject || 'ללא נושא'}</p>
                    <p className="text-xs text-slate-400">{new Date(r.received_at).toLocaleDateString('he-IL')}</p>
                  </div>
                  <OutreachStatusBadge value={r.sentiment} type="sentiment" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Tasks */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">משימות פתוחות</h3>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">אין משימות פתוחות</p>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{t.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{t.outreach_websites?.domain || '—'}</p>
                    <p className="text-xs text-slate-400">{t.due_date ? new Date(t.due_date).toLocaleDateString('he-IL') : 'ללא תאריך'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
