import React, { useState } from 'react';
import { Download, FileText, Loader2, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import useActiveAccountingProvider from '../../../hooks/useActiveAccountingProvider';

const REPORT_TYPES = [
  { id: 'dashboard', name: 'סיכום חודשי', description: 'הכנסות, הוצאות ורווח', icon: BarChart3, color: 'from-blue-500 to-indigo-500' },
  { id: 'customers', name: 'דוח לקוחות', description: 'רשימת לקוחות מסונכרנים', icon: Users, color: 'from-green-500 to-teal-500' },
];

export default function ReportsTab({ data }) {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  const [periodStart, setPeriodStart] = useState(firstOfMonth);
  const [periodEnd, setPeriodEnd] = useState(today);
  const [reportResult, setReportResult] = useState(null);
  const [activeReportType, setActiveReportType] = useState(null);
  const { fn } = useActiveAccountingProvider();

  const fetchMutation = useMutation({
    mutationFn: ({ report_type }) => {
      if (!fn?.fetchReports) throw new Error('אין חיבור למערכת חשבונות');
      return base44.functions.invoke(fn.fetchReports, { report_type, period_start: periodStart, period_end: periodEnd });
    },
    onSuccess: (res, variables) => {
      const result = res.data?.reportRun;
      if (result?.status === 'success') {
        setReportResult(result.result);
        setActiveReportType(variables.report_type);
        toast.success('הדוח הופק בהצלחה');
      } else {
        toast.error(result?.last_error || 'שגיאה בהפקת הדוח');
      }
    },
    onError: (err) => toast.error(err.message || 'שגיאה בהפקת הדוח'),
  });

  const exportCSV = () => {
    if (!reportResult) return;
    const data = Array.isArray(reportResult) ? reportResult : reportResult.rows || reportResult.items || [reportResult];
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${activeReportType}_${periodStart}_${periodEnd}.csv`;
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
        <h2 className="text-lg font-bold text-purple-900">דוחות</h2>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">מתאריך</label>
          <Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="w-40 h-9 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">עד תאריך</label>
          <Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="w-40 h-9 text-sm" />
        </div>
        <div className="flex gap-1">
          {[
            { label: 'חודש נוכחי', start: firstOfMonth, end: today },
            { label: 'שנה נוכחית', start: `${now.getFullYear()}-01-01`, end: today },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => { setPeriodStart(p.start); setPeriodEnd(p.end); }}
              className="px-3 py-2 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          const isLoading = fetchMutation.isPending && fetchMutation.variables?.report_type === report.id;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-gray-300 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${report.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{report.name}</p>
                  <p className="text-xs text-gray-500">{report.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={() => fetchMutation.mutate({ report_type: report.id })}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                הפק דוח
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Report Results */}
      {reportResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              תוצאות: {REPORT_TYPES.find(r => r.id === activeReportType)?.name}
            </h3>
            <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={exportCSV}>
              <Download className="w-3 h-3" /> ייצוא CSV
            </Button>
          </div>
          <p className="text-xs text-gray-500">{periodStart} — {periodEnd}</p>

          {reportResult?.local_summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 mb-1">הכנסות</p>
                <p className="text-lg font-bold text-green-800">₪{(reportResult.local_summary.total_income || 0).toLocaleString()}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-600 mb-1">הוצאות</p>
                <p className="text-lg font-bold text-red-800">₪{(reportResult.local_summary.total_expenses || 0).toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 mb-1">רווח</p>
                <p className="text-lg font-bold text-blue-800">₪{(reportResult.local_summary.profit || 0).toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 mb-1">לקוחות</p>
                <p className="text-lg font-bold text-purple-800">{reportResult.local_summary.customers_count || 0}</p>
              </div>
            </div>
          )}

          {renderReportResult(reportResult?.finbot_data || reportResult)}
        </motion.div>
      )}
    </motion.div>
  );
}

function renderReportResult(result) {
  if (!result) return null;

  const rows = Array.isArray(result) ? result : (result.rows || result.items || null);
  
  if (rows && rows.length > 0) {
    const headers = Object.keys(rows[0]);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{headers.map(h => <th key={h} className="text-right px-3 py-2 font-medium text-gray-700">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {headers.map(h => <td key={h} className="px-3 py-2 text-gray-600">{typeof row[h] === 'number' ? row[h].toLocaleString() : String(row[h] ?? '-')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (typeof result === 'object') {
    const entries = Object.entries(result).filter(([_, v]) => typeof v !== 'object');
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {entries.map(([key, value]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">{key}</p>
            <p className="text-lg font-bold text-gray-900">{typeof value === 'number' ? `₪${value.toLocaleString()}` : String(value)}</p>
          </div>
        ))}
      </div>
    );
  }

  return <pre className="bg-gray-50 rounded p-3 text-xs overflow-auto max-h-80 text-left" dir="ltr">{JSON.stringify(result, null, 2)}</pre>;
}