import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp, TrendingDown, Minus, DollarSign, Users, Target, Clock,
  AlertTriangle, Activity, ArrowUpRight, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { supabase } from '@/api/supabaseClient';

// =====================================================================
// DATA — CEO-grade dashboard query.
// Pulls leads + payments + sessions in parallel and computes:
//   - North-star KPIs (revenue, new customers, conversion, velocity)
//   - Last-30-day funnel (leads → greeted → replied → paid)
//   - Top revenue sources (by revenue, not count)
//   - Daily revenue time-series
//   - Hour-of-day & day-of-week patterns
//   - Pipeline distribution
//   - Action items (failed payments, stuck high-value leads)
// =====================================================================
async function fetchCEODashboard() {
  const now = new Date();
  const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const since60d = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [leadsRes, paymentsRes, sessionsRes, abandonedRes] = await Promise.all([
    supabase.from('leads').select('id, name, phone, source_page, utm_source, pipeline_stage, status, created_at, updated_at, bot_current_step, bot_messages_count, agent_id, do_not_contact')
      .gte('created_at', since60d.toISOString())
      .not('phone', 'is', null).neq('phone', ''),
    supabase.from('payments').select('id, lead_id, amount, status, created_at, product_type, payment_method, failure_reason')
      .gte('created_at', since60d.toISOString()),
    supabase.from('bot_sessions').select('id, lead_id, current_step, completed_at, last_message_at, created_at')
      .gte('created_at', since30d.toISOString()),
    supabase.from('bot_sessions').select('id', { count: 'exact', head: true })
      .is('completed_at', null)
      .in('current_step', ['opening', 'entry_menu'])
      .lt('last_message_at', new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString())
      .gte('created_at', since30d.toISOString()),
  ]);

  const leads = leadsRes?.data || [];
  const payments = paymentsRes?.data || [];
  const sessions = sessionsRes?.data || [];

  // ===== North-star KPIs =====
  const completedPayments = payments.filter((p) => p.status === 'completed');
  const failedPayments = payments.filter((p) => p.status === 'failed');
  const pendingPayments = payments.filter((p) => p.status === 'pending');

  const paymentsThisMonth = completedPayments.filter((p) => new Date(p.created_at) >= startOfMonth);
  const paymentsLastMonth = completedPayments.filter((p) => {
    const d = new Date(p.created_at);
    return d >= startOfPrevMonth && d < startOfMonth;
  });

  const revenueThisMonth = paymentsThisMonth.reduce((s, p) => s + Number(p.amount || 0), 0);
  const revenueLastMonth = paymentsLastMonth.reduce((s, p) => s + Number(p.amount || 0), 0);
  const newPayingThisMonth = paymentsThisMonth.length;
  const newPayingLastMonth = paymentsLastMonth.length;

  // 30-day window for conversion rate
  const leads30d = leads.filter((l) => new Date(l.created_at) >= since30d);
  const paid30d = completedPayments.filter((p) => new Date(p.created_at) >= since30d);
  const conversionRate30d = leads30d.length > 0 ? (paid30d.length / leads30d.length) * 100 : 0;

  // 60-30 day window for comparison
  const leads60to30 = leads.filter((l) => {
    const d = new Date(l.created_at);
    return d >= since60d && d < since30d;
  });
  const paid60to30 = completedPayments.filter((p) => {
    const d = new Date(p.created_at);
    return d >= since60d && d < since30d;
  });
  const conversionRatePrev30d = leads60to30.length > 0 ? (paid60to30.length / leads60to30.length) * 100 : 0;

  // Average days from lead-created to payment-completed
  const paidByLead = new Map();
  completedPayments.forEach((p) => { if (p.lead_id) paidByLead.set(p.lead_id, p.created_at); });
  const daysToPayValues = [];
  leads.forEach((l) => {
    const paidAt = paidByLead.get(l.id);
    if (paidAt) {
      const days = (new Date(paidAt) - new Date(l.created_at)) / (24 * 60 * 60 * 1000);
      if (days >= 0 && days < 60) daysToPayValues.push(days);
    }
  });
  const avgDaysToPay = daysToPayValues.length > 0
    ? daysToPayValues.reduce((a, b) => a + b, 0) / daysToPayValues.length
    : 0;

  // ===== Funnel (last 30 days) =====
  const greetedLeadsIds = new Set(sessions.map((s) => s.lead_id).filter(Boolean));
  const repliedLeadsIds = new Set(
    sessions.filter((s) => (s.current_step !== 'opening' && s.current_step !== 'entry_menu') || s.completed_at)
      .map((s) => s.lead_id).filter(Boolean)
  );
  const paidLeadsIds = new Set(paid30d.map((p) => p.lead_id).filter(Boolean));

  const funnel = {
    new_leads: leads30d.length,
    greeted: leads30d.filter((l) => greetedLeadsIds.has(l.id)).length,
    replied: leads30d.filter((l) => repliedLeadsIds.has(l.id)).length,
    paid: leads30d.filter((l) => paidLeadsIds.has(l.id)).length,
  };

  // ===== Daily revenue (last 30 days) =====
  const dailyRevenue = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const dayPayments = completedPayments.filter((p) => {
      const d = new Date(p.created_at);
      return d >= day && d < next;
    });
    dailyRevenue.push({
      date: day.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
      revenue: dayPayments.reduce((s, p) => s + Number(p.amount || 0), 0),
      payments: dayPayments.length,
    });
  }

  // ===== Sources by revenue (last 30 days) =====
  const sourceMap = new Map();
  leads30d.forEach((l) => {
    const src = l.utm_source || l.source_page || 'ישיר';
    if (!sourceMap.has(src)) sourceMap.set(src, { source: src, leads: 0, paid: 0, revenue: 0 });
    const entry = sourceMap.get(src);
    entry.leads++;
    if (paidLeadsIds.has(l.id)) {
      entry.paid++;
      const lp = paid30d.find((p) => p.lead_id === l.id);
      if (lp) entry.revenue += Number(lp.amount || 0);
    }
  });
  const sourcesByRevenue = Array.from(sourceMap.values())
    .map((s) => ({
      ...s,
      conversion_rate: s.leads > 0 ? (s.paid / s.leads) * 100 : 0,
      revenue_per_lead: s.leads > 0 ? s.revenue / s.leads : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ===== Day-of-week conversion =====
  const dayOfWeekStats = Array(7).fill(0).map((_, i) => ({
    day_idx: i,
    day: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][i],
    leads: 0, paid: 0, rate: 0,
  }));
  leads30d.forEach((l) => {
    const d = new Date(l.created_at).getDay();
    dayOfWeekStats[d].leads++;
    if (paidLeadsIds.has(l.id)) dayOfWeekStats[d].paid++;
  });
  dayOfWeekStats.forEach((d) => {
    d.rate = d.leads > 0 ? Math.round((d.paid / d.leads) * 100) : 0;
  });

  // ===== Hour-of-day distribution =====
  const hourlyLeads = Array(24).fill(0);
  leads30d.forEach((l) => {
    hourlyLeads[new Date(l.created_at).getHours()]++;
  });
  const hourlyData = hourlyLeads.map((count, hour) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    leads: count,
  }));

  // ===== Pipeline distribution (all 60-day leads, not just 30) =====
  const pipelineCounts = {};
  leads.forEach((l) => {
    const stage = l.pipeline_stage || 'unknown';
    pipelineCounts[stage] = (pipelineCounts[stage] || 0) + 1;
  });

  // ===== Action items =====
  const failedPayments24h = failedPayments.filter((p) =>
    new Date(p.created_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
  );
  const pendingPayments24h = pendingPayments.filter((p) =>
    new Date(p.created_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
  );

  return {
    generated_at: now.toISOString(),
    north_star: {
      revenue_month: revenueThisMonth,
      revenue_last_month: revenueLastMonth,
      new_paying_month: newPayingThisMonth,
      new_paying_last_month: newPayingLastMonth,
      conversion_rate_30d: conversionRate30d,
      conversion_rate_prev_30d: conversionRatePrev30d,
      avg_days_to_pay: avgDaysToPay,
      total_revenue_60d: completedPayments.reduce((s, p) => s + Number(p.amount || 0), 0),
    },
    funnel,
    daily_revenue: dailyRevenue,
    sources_by_revenue: sourcesByRevenue,
    day_of_week: dayOfWeekStats,
    hourly: hourlyData,
    pipeline: { counts: pipelineCounts, total: leads.length },
    action_items: {
      failed_payments_24h: failedPayments24h.length,
      pending_payments_24h: pendingPayments24h.length,
      stuck_no_bot: abandonedRes?.count || 0,
    },
  };
}

// =====================================================================
// UI HELPERS
// =====================================================================
function fmtCurrency(n) {
  return `₪${Math.round(n).toLocaleString('he-IL')}`;
}

function pctChange(value, prev) {
  if (!prev) return value > 0 ? 100 : 0;
  return Math.round(((value - prev) / prev) * 100);
}

function HeroKpi({ icon: Icon, label, value, prev, format = (v) => v, accent = 'blue' }) {
  const accents = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };
  const change = prev !== undefined ? pctChange(value, prev) : null;
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${accents[accent]} p-5 text-white shadow-lg`}>
      <Icon className="h-6 w-6 opacity-90 mb-3" />
      <div className="text-3xl font-bold tracking-tight">{format(value)}</div>
      <div className="text-sm opacity-90 mt-1">{label}</div>
      {change !== null && !(prev === 0 && value === 0) && (
        <div className="mt-2">
          {change === 0 ? (
            <span className="text-xs opacity-90">ללא שינוי</span>
          ) : change > 0 ? (
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">↑ +{change}% מהחודש שעבר</span>
          ) : (
            <span className="text-xs font-semibold bg-black/20 px-2 py-0.5 rounded">↓ {change}% מהחודש שעבר</span>
          )}
        </div>
      )}
    </div>
  );
}

function FunnelStage({ label, value, prev, color, isFirst = false }) {
  const conversion = prev !== undefined && prev > 0 ? Math.round((value / prev) * 100) : null;
  return (
    <div className="flex-1 min-w-[120px]">
      <div className={`p-4 rounded-lg ${color} text-white`}>
        <div className="text-3xl font-bold">{value.toLocaleString('he-IL')}</div>
        <div className="text-xs mt-1 opacity-90">{label}</div>
      </div>
      {!isFirst && conversion !== null && (
        <div className="text-center mt-2 text-xs font-semibold text-slate-600">
          {conversion}% המרה משלב קודם
        </div>
      )}
    </div>
  );
}

const STAGE_COLORS = {
  won: 'bg-emerald-500', converted: 'bg-emerald-500',
  lost: 'bg-red-400', disqualified: 'bg-red-400', not_interested: 'bg-red-300',
  qualified: 'bg-blue-500', proposal_sent: 'bg-blue-400',
  new_lead: 'bg-slate-400', follow_up: 'bg-amber-400',
};

// =====================================================================
// MAIN COMPONENT
// =====================================================================
export default function CRMDashboard() {
  const navigate = useNavigate();
  const [showAllSources, setShowAllSources] = React.useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['crm-ceo-dashboard'],
    queryFn: fetchCEODashboard,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500">טוען דשבורד...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700 font-semibold">שגיאה בטעינה</p>
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const { north_star, funnel, daily_revenue, sources_by_revenue, day_of_week, hourly, pipeline, action_items } = data;
  const visibleSources = showAllSources ? sources_by_revenue : sources_by_revenue.slice(0, 6);
  const hasRevenueData = daily_revenue.some((d) => d.revenue > 0);
  const hasFunnelData = funnel.new_leads > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      <Helmet><title>דשבורד מנכ״ל — CRM</title></Helmet>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">דשבורד מנכ״ל</h1>
          <p className="text-sm text-slate-500 mt-1">
            התמונה הגדולה — הכנסות, המרות, מקורות · עדכון כל דקה
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/CRM/bot-health')}>
            <Activity className="ml-2 h-4 w-4" />
            בריאות הבוט
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/CRM/leads')}>
            <Users className="ml-2 h-4 w-4" />
            כל הלידים
          </Button>
        </div>
      </div>

      {/* === HERO ROW: 4 North-Star KPIs === */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">החודש הזה</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <HeroKpi icon={DollarSign} label="הכנסות החודש" value={north_star.revenue_month} prev={north_star.revenue_last_month} format={fmtCurrency} accent="emerald" />
          <HeroKpi icon={Users} label="לקוחות משלמים חדשים" value={north_star.new_paying_month} prev={north_star.new_paying_last_month} accent="blue" />
          <HeroKpi icon={Target} label="המרה (30 יום)" value={north_star.conversion_rate_30d} prev={north_star.conversion_rate_prev_30d} format={(v) => `${v.toFixed(1)}%`} accent="purple" />
          <HeroKpi icon={Clock} label="ימים עד תשלום (ממוצע)" value={north_star.avg_days_to_pay} format={(v) => v > 0 ? `${v.toFixed(1)} ימים` : '—'} accent="amber" />
        </div>
      </div>

      {/* === ACTION ITEMS BAR === */}
      {(action_items.failed_payments_24h > 0 || action_items.pending_payments_24h > 0 || action_items.stuck_no_bot > 0) && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardContent className="py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <AlertTriangle className="h-5 w-5 text-amber-700 flex-shrink-0" />
              <span className="font-semibold text-amber-900">דורש את תשומת ליבך:</span>
              {action_items.failed_payments_24h > 0 && (
                <Badge className="bg-red-100 text-red-700">{action_items.failed_payments_24h} תשלומים נכשלו (24ש')</Badge>
              )}
              {action_items.pending_payments_24h > 0 && (
                <Badge className="bg-amber-100 text-amber-700">{action_items.pending_payments_24h} תשלומים תקועים pending</Badge>
              )}
              {action_items.stuck_no_bot > 0 && (
                <Badge className="bg-amber-100 text-amber-700 cursor-pointer" onClick={() => navigate('/CRM/bot-health')}>
                  {action_items.stuck_no_bot} שיחות נטושות
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* === GROWTH FUNNEL === */}
      {hasFunnelData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#1E3A5F]" />
              משפך הכנסות — 30 הימים האחרונים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 items-start">
              <FunnelStage label="לידים חדשים" value={funnel.new_leads} color="bg-blue-500" isFirst />
              <FunnelStage label="קיבלו ברכה" value={funnel.greeted} prev={funnel.new_leads} color="bg-blue-400" />
              <FunnelStage label="הגיבו לבוט" value={funnel.replied} prev={funnel.greeted} color="bg-amber-400" />
              <FunnelStage label="שילמו 💰" value={funnel.paid} prev={funnel.new_leads} color="bg-emerald-500" />
            </div>
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
              <span>סה״כ הכנסות במשפך (60 יום): <strong className="text-emerald-600">{fmtCurrency(north_star.total_revenue_60d)}</strong></span>
              <span>ערך לקוח ממוצע: <strong>{fmtCurrency(funnel.paid > 0 ? north_star.total_revenue_60d / funnel.paid : 0)}</strong></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* === DAILY REVENUE CHART === */}
      {hasRevenueData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              הכנסות יומיות — 30 ימים אחרונים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={daily_revenue} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} reversed />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => v >= 1000 ? `${v/1000}K` : v} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                  formatter={(v, name) => [name === 'revenue' ? fmtCurrency(v) : v, name === 'revenue' ? 'הכנסות' : 'עסקאות']}
                  labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* === SOURCES + DAY-OF-WEEK === */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowUpRight className="h-5 w-5 text-[#1E3A5F]" />
              מקורות הכנסה (30 יום)
            </CardTitle>
            <p className="text-sm text-slate-500">ממוין לפי הכנסה — לא לפי כמות לידים</p>
          </CardHeader>
          <CardContent>
            {sources_by_revenue.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">אין נתונים מספיקים עדיין</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-right text-slate-500 text-xs">
                        <th className="p-2 font-medium">מקור</th>
                        <th className="p-2 font-medium text-center">לידים</th>
                        <th className="p-2 font-medium text-center">שילמו</th>
                        <th className="p-2 font-medium text-center">המרה</th>
                        <th className="p-2 font-medium text-left">הכנסות</th>
                        <th className="p-2 font-medium text-left">₪/ליד</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleSources.map((s) => (
                        <tr key={s.source} className="border-b hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-900 max-w-[200px] truncate" title={s.source}>{s.source}</td>
                          <td className="p-2 text-center text-slate-700">{s.leads}</td>
                          <td className="p-2 text-center font-semibold text-slate-900">{s.paid}</td>
                          <td className="p-2 text-center">
                            <Badge className={s.conversion_rate >= 5 ? 'bg-emerald-100 text-emerald-700' : s.conversion_rate >= 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}>
                              {s.conversion_rate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="p-2 text-left font-bold text-emerald-700">{fmtCurrency(s.revenue)}</td>
                          <td className="p-2 text-left text-slate-600 text-xs">{s.revenue_per_lead > 0 ? fmtCurrency(s.revenue_per_lead) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {sources_by_revenue.length > 6 && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAllSources(!showAllSources)} className="mt-2 w-full">
                    {showAllSources ? <><ChevronUp className="ml-1 h-4 w-4" /> הצג פחות</> : <><ChevronDown className="ml-1 h-4 w-4" /> הצג כל {sources_by_revenue.length} המקורות</>}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-[#1E3A5F]" />
              המרה לפי יום בשבוע
            </CardTitle>
          </CardHeader>
          <CardContent>
            {day_of_week.every((d) => d.leads === 0) ? (
              <p className="text-sm text-slate-400 text-center py-6">אין נתונים מספיקים</p>
            ) : (
              <div className="space-y-2">
                {day_of_week.map((d) => {
                  const maxLeads = Math.max(...day_of_week.map((x) => x.leads), 1);
                  const widthPct = (d.leads / maxLeads) * 100;
                  return (
                    <div key={d.day_idx} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-semibold text-slate-700">{d.day}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden relative">
                        <div className="bg-blue-500 h-full" style={{ width: `${widthPct}%` }} />
                        <span className="absolute inset-0 flex items-center justify-end pl-2 text-xs font-semibold text-slate-700">{d.leads}</span>
                      </div>
                      <span className={`w-12 text-xs text-left font-semibold ${d.rate >= 5 ? 'text-emerald-600' : d.rate >= 1 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {d.rate}%
                      </span>
                    </div>
                  );
                })}
                <p className="text-xs text-slate-500 mt-3 pt-2 border-t">המספר = לידים · האחוז = שיעור המרה לתשלום</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === HOUR-OF-DAY === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-[#1E3A5F]" />
            מתי לידים מגיעים — לפי שעה (30 יום)
          </CardTitle>
          <p className="text-sm text-slate-500">השעות החזקות — שם כדאי שיהיה כיסוי מלא של נציגים</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourly} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} interval={1} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [v, 'לידים']}
              />
              <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                {hourly.map((entry, index) => {
                  const isBusinessHours = index >= 8 && index < 18;
                  return <Cell key={`cell-${index}`} fill={isBusinessHours ? '#3b82f6' : '#94a3b8'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span>שעות פעילות (8-18)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-400 rounded-sm"></span>מחוץ לשעות הפעילות</span>
          </div>
        </CardContent>
      </Card>

      {/* === PIPELINE DISTRIBUTION === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-[#1E3A5F]" />
            פילוח לידים לפי סטטוס ({pipeline.total} לידים ב-60 יום)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(pipeline.counts).sort((a, b) => b[1] - a[1]).map(([stage, count]) => {
              const widthPct = (count / pipeline.total) * 100;
              const color = STAGE_COLORS[stage] || 'bg-slate-300';
              return (
                <div key={stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{stage}</span>
                    <span className="font-semibold text-slate-900">{count} <span className="text-xs text-slate-400">({Math.round(widthPct)}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`${color} h-2.5 rounded-full`} style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-slate-400 text-center pb-4">
        עדכון אחרון: {new Date(data.generated_at).toLocaleString('he-IL', { hour12: false })}
      </div>
    </div>
  );
}
