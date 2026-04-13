import React from 'react';
import { FileText, Send, Eye, CheckCircle } from 'lucide-react';
import { useAgreementStats } from '../../hooks/useCRM';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';

export default function AgreementStatsWidget() {
  const { enabled } = useFeatureFlag('agreements_enabled');
  const { data: stats, isLoading } = useAgreementStats();

  if (!enabled || isLoading || !stats) return null;

  const weekly = stats.weekly || {};

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h2 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-1.5">
        <FileText size={14} />
        הסכמים
      </h2>

      <div className="grid grid-cols-4 gap-3">
        <StatBox
          icon={Send}
          label="נשלחו השבוע"
          value={weekly.sent_count || 0}
          color="#3B82F6"
        />
        <StatBox
          icon={Eye}
          label="נפתחו"
          value={weekly.opened_count || 0}
          color="#F59E0B"
        />
        <StatBox
          icon={CheckCircle}
          label="נחתמו"
          value={weekly.signed_count || 0}
          color="#22C55E"
        />
        <StatBox
          icon={FileText}
          label="אחוז חתימה"
          value={`${weekly.conversion_rate || 0}%`}
          color="#8B5CF6"
        />
      </div>

      {/* 30-day summary */}
      {stats.sent_count > 0 && (
        <p className="text-[10px] text-slate-400 mt-3 text-center">
          30 יום: {stats.sent_count} נשלחו, {stats.signed_count} נחתמו ({stats.conversion_rate}%)
        </p>
      )}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="text-center">
      <Icon size={14} className="mx-auto mb-1" style={{ color }} />
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}
