import React, { useState } from 'react';
import { FileText, Loader2, BarChart3, Receipt, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import useActiveAccountingProvider from '../../../hooks/useActiveAccountingProvider';
import PnLReport from '../reports/PnLReport';
import VATReport from '../reports/VATReport';
import IncomeReport from '../reports/IncomeReport';

const REPORT_TYPES = [
  { id: 'pnl', name: 'דוח רווח והפסד', description: 'הכנסות, ניכויים ומקדמות מס', icon: BarChart3, color: 'from-blue-500 to-indigo-500' },
  { id: 'vat', name: 'דוח מע״מ', description: 'עסקאות, תשומות ומע״מ לתשלום', icon: Receipt, color: 'from-purple-500 to-pink-500' },
  { id: 'income', name: 'דוח הכנסות', description: 'פירוט מסמכים לפי תאריכים', icon: TrendingUp, color: 'from-green-500 to-teal-500' },
];

const QUICK_PERIODS = [
  { label: 'חודש נוכחי', getRange: () => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
  }},
  { label: 'חודש קודם', getRange: () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: first.toISOString().split('T')[0], end: last.toISOString().split('T')[0] };
  }},
  { label: 'רבעון נוכחי', getRange: () => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3);
    return { start: new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
  }},
  { label: 'שנה נוכחית', getRange: () => {
    const now = new Date();
    return { start: `${now.getFullYear()}-01-01`, end: now.toISOString().split('T')[0] };
  }},
  { label: 'שנה קודמת', getRange: () => {
    const y = new Date().getFullYear() - 1;
    return { start: `${y}-01-01`, end: `${y}-12-31` };
  }},
];

export default function ReportsTab({ data }) {
  const now = new Date();
  const [periodStart, setPeriodStart] = useState(`${now.getFullYear()}-01-01`);
  const [periodEnd, setPeriodEnd] = useState(now.toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [activeReportType, setActiveReportType] = useState(null);
  const { fn, isConnected } = useActiveAccountingProvider();

  const fetchMutation = useMutation({
    mutationFn: ({ report_type }) => {
      if (!isConnected) throw new Error('אין חיבור למערכת חשבונות');
      return base44.functions.invoke('acctFetchReports', { report_type, period_start: periodStart, period_end: periodEnd });
    },
    onSuccess: (res, variables) => {
      const responseData = res.data?.data;
      if (responseData?.status) {
        setReportData(responseData);
        setActiveReportType(variables.report_type);
        toast.success('הדוח הופק בהצלחה');
      } else {
        toast.error(responseData?.error_description || res.data?.error || 'שגיאה בהפקת הדוח');
      }
    },
    onError: (err) => toast.error(err.message || 'שגיאה בהפקת הדוח'),
  });

  const applyQuickPeriod = (period) => {
    const { start, end } = period.getRange();
    setPeriodStart(start);
    setPeriodEnd(end);
  };

  const renderReport = () => {
    if (!reportData || !activeReportType) return null;
    switch (activeReportType) {
      case 'pnl': return <PnLReport data={reportData} />;
      case 'vat': return <VATReport data={reportData} />;
      case 'income': return <IncomeReport data={reportData} />;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
        <h2 className="text-lg font-bold text-purple-900">דוחות</h2>
        <p className="text-xs text-purple-600 mt-0.5">הפק דוחות ישירות ממערכת החשבונות שלך</p>
      </div>

      {!isConnected ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          יש להתחבר למערכת חשבונות כדי להפיק דוחות
        </div>
      ) : (
        <>
          {/* Period Selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">בחר תקופה</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_PERIODS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyQuickPeriod(p)}
                  className="px-3 py-1.5 text-xs rounded-full border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 font-medium transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">מתאריך</label>
                <Input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="w-40 h-9 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">עד תאריך</label>
                <Input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="w-40 h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Report Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {REPORT_TYPES.map((report) => {
              const Icon = report.icon;
              const isLoading = fetchMutation.isPending && fetchMutation.variables?.report_type === report.id;
              const isActive = activeReportType === report.id;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${isActive ? 'border-blue-400 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => !isLoading && fetchMutation.mutate({ report_type: report.id })}
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
                    variant={isActive ? 'default' : 'outline'}
                    onClick={(e) => { e.stopPropagation(); fetchMutation.mutate({ report_type: report.id }); }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    {isActive ? 'רענן דוח' : 'הפק דוח'}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Report Results */}
          <AnimatePresence mode="wait">
            {reportData && activeReportType && (
              <motion.div
                key={activeReportType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-gray-200 rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {REPORT_TYPES.find(r => r.id === activeReportType)?.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(periodStart).toLocaleDateString('he-IL')} — {new Date(periodEnd).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
                {renderReport()}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}