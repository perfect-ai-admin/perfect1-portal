import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/supabaseClient';
import { PIPELINE_STAGES, LOST_REASON_CATEGORIES } from '../constants/pipeline';

export default function CRMSettings() {
  const { data: services = [] } = useQuery({
    queryKey: ['service-catalog-all'],
    queryFn: () => entities.ServiceCatalog.list('sort_order'),
  });

  const { data: reasons = [] } = useQuery({
    queryKey: ['lost-reasons-all'],
    queryFn: () => entities.LostReason.list('sort_order'),
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-all'],
    queryFn: () => entities.AiAgent.list('name'),
  });

  const categoryLabels = Object.fromEntries(LOST_REASON_CATEGORIES.map(c => [c.value, c.label]));

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-xl font-bold text-[#1E3A5F]">הגדרות CRM</h1>

      {/* Pipeline Stages */}
      <section>
        <h2 className="text-sm font-medium text-slate-500 mb-3">שלבי Pipeline</h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 text-right">שלב</th>
                <th className="p-3 text-right">SLA (שעות)</th>
                <th className="p-3 text-right">סוג</th>
              </tr>
            </thead>
            <tbody>
              {PIPELINE_STAGES.map(stage => (
                <tr key={stage.slug} className="border-b border-slate-100">
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    {stage.label}
                  </td>
                  <td className="p-3">{stage.slaHours || '-'}</td>
                  <td className="p-3 text-slate-500">{stage.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Service Catalog */}
      <section>
        <h2 className="text-sm font-medium text-slate-500 mb-3">קטלוג שירותים ({services.length})</h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 text-right">שירות</th>
                <th className="p-3 text-right">קטגוריה</th>
                <th className="p-3 text-right">מחיר בסיס</th>
                <th className="p-3 text-right">ימים</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-slate-500">{s.category}</td>
                  <td className="p-3">{s.base_price ? `${s.base_price} ש"ח` : '-'}</td>
                  <td className="p-3">{s.estimated_duration_days || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lost Reasons */}
      <section>
        <h2 className="text-sm font-medium text-slate-500 mb-3">סיבות סגירה ({reasons.length})</h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 text-right">קטגוריה</th>
                <th className="p-3 text-right">סיבה</th>
                <th className="p-3 text-right">ניתן להחזיר?</th>
                <th className="p-3 text-right">ימים למעקב</th>
              </tr>
            </thead>
            <tbody>
              {reasons.map(r => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="p-3 text-slate-500">{categoryLabels[r.category] || r.category}</td>
                  <td className="p-3">{r.reason_text}</td>
                  <td className="p-3">{r.is_recoverable ? 'כן' : 'לא'}</td>
                  <td className="p-3">{r.follow_up_days || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Agents */}
      <section>
        <h2 className="text-sm font-medium text-slate-500 mb-3">נציגים ({agents.length})</h2>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-3 text-right">שם</th>
                <th className="p-3 text-right">סטטוס</th>
                <th className="p-3 text-right">מקסימום לידים</th>
                <th className="p-3 text-right">יעד יומי</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.availability_status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {a.availability_status || 'available'}
                    </span>
                  </td>
                  <td className="p-3">{a.max_leads || 50}</td>
                  <td className="p-3">{a.daily_target || 10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
