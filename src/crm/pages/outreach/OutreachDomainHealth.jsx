import React from 'react';
import { useOutreachDomainHealth } from '../../hooks/useOutreach';
import { SPAM_WARNING_LEVELS } from '../../constants/outreach';
import { Mail, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function OutreachDomainHealth() {
  const { data: domains = [], isLoading } = useOutreachDomainHealth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#1E3A5F]">בריאות דומיין</h1>

      {domains.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Mail size={40} className="mx-auto mb-2 text-slate-300" />
          <p>אין נתונים עדיין</p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map(d => {
            const warning = SPAM_WARNING_LEVELS.find(w => w.value === d.spam_warning_level);
            const bouncePercent = (Number(d.bounce_rate) * 100).toFixed(1);
            const replyPercent = (Number(d.reply_rate) * 100).toFixed(1);

            return (
              <div key={d.id} className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-[#1E3A5F]" />
                    <h2 className="text-lg font-semibold text-slate-800">{d.sending_domain}</h2>
                  </div>
                  <span
                    className="text-sm px-3 py-1 rounded-full font-medium"
                    style={{ backgroundColor: `${warning?.color || '#6B7280'}15`, color: warning?.color || '#6B7280' }}
                  >
                    {warning?.label || d.spam_warning_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">{d.total_sent}</p>
                    <p className="text-xs text-slate-400">נשלחו</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{d.total_replied}</p>
                    <p className="text-xs text-slate-400">ענו</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{d.total_bounced}</p>
                    <p className="text-xs text-slate-400">חזרו</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${Number(bouncePercent) > 5 ? 'text-red-500' : Number(bouncePercent) > 3 ? 'text-amber-500' : 'text-green-600'}`}>
                      {bouncePercent}%
                    </p>
                    <p className="text-xs text-slate-400">Bounce Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{replyPercent}%</p>
                    <p className="text-xs text-slate-400">Reply Rate</p>
                  </div>
                </div>

                {/* Health Bar */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-400">Bounce Rate</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          Number(bouncePercent) > 5 ? 'bg-red-500' : Number(bouncePercent) > 3 ? 'bg-amber-400' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(Number(bouncePercent) * 10, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {Number(bouncePercent) > 3 && (
                  <div className={`mt-3 p-3 rounded-lg ${Number(bouncePercent) > 5 ? 'bg-red-50' : 'bg-amber-50'}`}>
                    {Number(bouncePercent) > 5 ? (
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-red-500" />
                        <span className="text-sm text-red-700 font-medium">Bounce rate חריג — מומלץ לעצור שליחה מיידית ולבדוק את רשימת אנשי הקשר</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <span className="text-sm text-amber-700 font-medium">Bounce rate גבוה — שקול להאט את קצב השליחה ולוודא תקינות מיילים</span>
                      </div>
                    )}
                  </div>
                )}

                {Number(bouncePercent) <= 3 && d.total_sent > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-green-50 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-sm text-green-700 font-medium">בריאות הדומיין תקינה</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
