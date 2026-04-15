import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRMDashboard } from '../hooks/useCRM';
import { STAGE_MAP, OPEN_STAGES } from '../constants/pipeline';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  Users, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, UserX, Activity,
  DollarSign, Target, Calendar, Flame, Snowflake, Thermometer, BarChart3
} from 'lucide-react';
import AgreementStatsWidget from '../components/shared/AgreementStatsWidget';

export default function CRMDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useCRMDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const {
    kpis, stage_counts, top_agents, today_tasks, recent_activity,
    trend_7d = [], temperature = { hot: 0, warm: 0, cold: 0 },
    top_sources = [], month_compare = {}, stale_leads = [],
  } = data;

  const fmtMoney = (n) => {
    const v = Number(n) || 0;
    if (v >= 1_000_000) return `₪${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1000) return `₪${(v / 1000).toFixed(1)}K`;
    return `₪${v.toLocaleString('he-IL')}`;
  };
  const maxTrend = Math.max(...trend_7d.map(d => d.new_leads), 1);
  const tempTotal = (temperature.hot || 0) + (temperature.warm || 0) + (temperature.cold || 0);
  const maxSource = Math.max(...top_sources.map(s => s.total), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1E3A5F]">דשבורד CRM</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          icon={Users}
          label="חדשים היום"
          value={kpis.new_today}
          color="#3B82F6"
        />
        <KPICard
          icon={Clock}
          label="בטיפול"
          value={kpis.active_leads}
          color="#F59E0B"
        />
        <KPICard
          icon={CheckCircle}
          label="נסגרו"
          value={kpis.converted}
          color="#22C55E"
        />
        <KPICard
          icon={TrendingUp}
          label="המרה"
          value={`${kpis.conversion_rate}%`}
          color="#8B5CF6"
        />
        <KPICard
          icon={AlertTriangle}
          label="חריגות SLA"
          value={kpis.sla_breaches}
          color="#EF4444"
          highlight={kpis.sla_breaches > 0}
        />
        <KPICard
          icon={UserX}
          label="ללא טיפול"
          value={kpis.no_activity}
          color="#F97316"
          highlight={kpis.no_activity > 0}
        />
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          icon={DollarSign}
          label="שווי Pipeline פתוח"
          value={fmtMoney(kpis.pipeline_value)}
          color="#0EA5E9"
        />
        <KPICard
          icon={Target}
          label="שווי הומר (סה״כ)"
          value={fmtMoney(kpis.converted_value)}
          color="#10B981"
        />
        <KPICard
          icon={Target}
          label="הומר החודש"
          value={fmtMoney(kpis.converted_value_month)}
          color="#14B8A6"
        />
        <KPICard
          icon={BarChart3}
          label="עסקה ממוצעת"
          value={fmtMoney(kpis.avg_deal_size)}
          color="#6366F1"
        />
        <KPICard
          icon={Calendar}
          label="זמן לסגירה (ימים)"
          value={kpis.avg_days_to_close}
          color="#A855F7"
        />
      </div>

      {/* Month comparison */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-medium text-slate-500 mb-4">השוואת חודש</h2>
        <div className="grid grid-cols-2 gap-4">
          <MonthCompareBlock
            label="לידים חדשים"
            current={month_compare.new_this_month}
            previous={month_compare.new_prev_month}
            changePct={month_compare.leads_change_pct}
          />
          <MonthCompareBlock
            label="המרות"
            current={month_compare.conv_this_month}
            previous={month_compare.conv_prev_month}
            changePct={month_compare.conv_change_pct}
          />
        </div>
      </div>

      {/* Trend chart (7 days) */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-medium text-slate-500 mb-4">מגמה - 7 ימים אחרונים</h2>
        <div className="flex items-end justify-between gap-2 h-40">
          {trend_7d.map((d, i) => {
            const h = Math.max((d.new_leads / maxTrend) * 100, 4);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-600">{d.new_leads}</span>
                <div className="w-full bg-slate-100 rounded-t flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-[#1E3A5F] to-[#3B82F6] rounded-t transition-all duration-500"
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Temperature + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-medium text-slate-500 mb-4">טמפרטורת לידים פעילים</h2>
          <div className="space-y-3">
            <TempBar icon={Flame} color="#EF4444" label="חם" count={temperature.hot} total={tempTotal} />
            <TempBar icon={Thermometer} color="#F59E0B" label="פושר" count={temperature.warm} total={tempTotal} />
            <TempBar icon={Snowflake} color="#3B82F6" label="קר" count={temperature.cold} total={tempTotal} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-medium text-slate-500 mb-4">מקורות מובילים</h2>
          {top_sources.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">אין נתונים</p>
          ) : (
            <div className="space-y-2">
              {top_sources.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs w-20 text-slate-600 truncate" title={s.name}>{s.name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-[#8B5CF6] to-[#6366F1] rounded-full flex items-center justify-end px-2"
                      style={{ width: `${Math.max((s.total / maxSource) * 100, 6)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{s.total}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-left">{s.rate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stale leads */}
      {stale_leads.length > 0 && (
        <div className="bg-white rounded-lg border border-amber-200 bg-amber-50/30 p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="text-sm font-medium text-slate-700">לידים מוזנחים - דורשים טיפול</h2>
          </div>
          <div className="space-y-2">
            {stale_leads.map(lead => (
              <div
                key={lead.id}
                onClick={() => navigate(`/CRM/leads/${lead.id}`)}
                className="flex items-center justify-between p-3 bg-white border border-amber-100 rounded-lg hover:bg-amber-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">
                    {lead.days_old}ד
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{lead.name}</p>
                    <p className="text-xs text-slate-400">
                      {STAGE_MAP[lead.stage]?.label || lead.stage} · ללא מגע {lead.days_old} ימים
                    </p>
                  </div>
                </div>
                <span className="text-xs text-amber-600 font-medium">פתח ליד ←</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-medium text-slate-500 mb-4">התפלגות Pipeline</h2>
          <div className="space-y-2">
            {OPEN_STAGES.map(stage => {
              const count = stage_counts[stage.slug] || 0;
              const maxCount = Math.max(...Object.values(stage_counts).map(Number), 1);
              const width = Math.max((count / maxCount) * 100, 4);

              return (
                <div key={stage.slug} className="flex items-center gap-3">
                  <span className="text-xs w-24 text-slate-600 flex-shrink-0">{stage.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end px-2 transition-all duration-500"
                      style={{ width: `${width}%`, backgroundColor: stage.color }}
                    >
                      <span className="text-xs font-bold text-white">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Agents */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-medium text-slate-500 mb-4">ביצועי נציגים</h2>
          {top_agents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">אין נתונים</p>
          ) : (
            <div className="space-y-3">
              {top_agents.map((agent, i) => (
                <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{agent.name}</p>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>פעילים: {agent.active}</span>
                      <span>נסגרו: {agent.converted}</span>
                      <span>סה"כ: {agent.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agreements Widget */}
      <AgreementStatsWidget />

      {/* Today's Tasks */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-medium text-slate-500 mb-4">משימות להיום</h2>
        {today_tasks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">אין משימות להיום</p>
        ) : (
          <div className="space-y-2">
            {today_tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer"
                onClick={() => task.lead_id && navigate(`/CRM/leads/${task.lead_id}`)}
              >
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-slate-400">
                    {task.priority === 'urgent' && '(!) '}
                    {task.due_date && new Date(task.due_date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-slate-400" />
          <h2 className="text-sm font-medium text-slate-500">פעילות אחרונה</h2>
        </div>
        {(recent_activity || []).length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">אין פעילות אחרונה</p>
        ) : (
          <div className="space-y-2">
            {(recent_activity || []).slice(0, 10).map((item, i) => {
              const fromStage = item.from_stage ? STAGE_MAP[item.from_stage] : null;
              const toStage = item.to_stage ? STAGE_MAP[item.to_stage] : null;
              return (
                <div
                  key={item.id || i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => item.lead_id && navigate(`/CRM/leads/${item.lead_id}`)}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-300" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      <span className="font-medium">{item.lead_name || 'ליד'}</span>
                      {fromStage && toStage && (
                        <span className="text-slate-400 mx-1">
                          עבר מ-{fromStage.label} ← {toStage.label}
                        </span>
                      )}
                      {item.agent_name && (
                        <span className="text-xs text-slate-400"> ע"י {item.agent_name}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    {item.created_at
                      ? format(new Date(item.created_at), 'dd/MM HH:mm', { locale: he })
                      : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color, highlight }) {
  return (
    <div className={`bg-white rounded-lg border p-4 ${
      highlight ? 'border-red-200 bg-red-50' : 'border-slate-200'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function MonthCompareBlock({ label, current = 0, previous = 0, changePct = 0 }) {
  const up = changePct >= 0;
  const ArrowIcon = up ? TrendingUp : TrendingDown;
  const color = up ? '#10B981' : '#EF4444';
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[#1E3A5F]">{current}</span>
        <span className="text-xs text-slate-400 mb-1">מול {previous}</span>
      </div>
      <div className="flex items-center gap-1 mt-1" style={{ color }}>
        <ArrowIcon size={14} />
        <span className="text-xs font-bold">{up ? '+' : ''}{changePct}%</span>
      </div>
    </div>
  );
}

function TempBar({ icon: Icon, color, label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} style={{ color }} />
      <span className="text-xs w-12 text-slate-600">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
        <div
          className="h-full rounded-full flex items-center justify-end px-2 transition-all duration-500"
          style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }}
        >
          <span className="text-xs font-bold text-white">{count}</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 w-10 text-left">{pct}%</span>
    </div>
  );
}
