import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRMDashboard } from '../hooks/useCRM';
import { STAGE_MAP, OPEN_STAGES } from '../constants/pipeline';
import {
  Users, TrendingUp, AlertTriangle, CheckCircle, Clock, UserX
} from 'lucide-react';

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

  const { kpis, stage_counts, top_agents, today_tasks } = data;

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
