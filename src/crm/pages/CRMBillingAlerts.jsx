import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, History, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useBillingAlerts, useResolveAlert, useOpenAlertCount, useBillingHistory } from '../hooks/useCRM';

const ALERT_TYPE_LABELS = {
  missing_monthly_charge: 'חיוב חודשי חסר',
  charged_while_paused: 'חויב בזמן השהייה',
};

const SUB_STATUS_BADGES = {
  active: { label: 'פעיל', color: 'bg-green-100 text-green-700' },
  paused: { label: 'מושהה', color: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'מבוטל', color: 'bg-red-100 text-red-700' },
  failed: { label: 'נכשל', color: 'bg-red-100 text-red-800' },
};

function BillingHistoryDialog({ open, onOpenChange, subscriptionId }) {
  const { data: history, isLoading } = useBillingHistory(subscriptionId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader><DialogTitle>היסטוריית חיובים</DialogTitle></DialogHeader>
        {isLoading ? (
          <p className="text-center py-4 text-slate-500">טוען...</p>
        ) : !history?.length ? (
          <p className="text-center py-4 text-slate-500">אין חיובים</p>
        ) : (
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b"><th className="p-2 text-right">תאריך</th><th className="p-2 text-right">סכום</th><th className="p-2 text-right">סטטוס</th></tr></thead>
              <tbody>
                {history.map(tx => (
                  <tr key={tx.id} className="border-b">
                    <td className="p-2">{tx.charge_date}</td>
                    <td className="p-2">₪{tx.amount}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.status === 'success' ? 'הצלחה' : 'נכשל'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function CRMBillingAlerts() {
  const [resolvedFilter, setResolvedFilter] = useState('open');
  const [resolveDialog, setResolveDialog] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [historySubId, setHistorySubId] = useState(null);
  const navigate = useNavigate();

  const filters = {
    ...(resolvedFilter === 'open' ? { resolved: false } : {}),
    ...(resolvedFilter === 'resolved' ? { resolved: true } : {}),
  };

  const { data: alerts, isLoading } = useBillingAlerts(filters);
  const { data: openCount } = useOpenAlertCount();
  const resolveAlert = useResolveAlert();

  const handleResolve = async () => {
    if (!resolveDialog) return;
    try {
      await resolveAlert.mutateAsync({ alert_id: resolveDialog, notes: resolveNotes });
      toast.success('התראה סומנה כטופלה');
      setResolveDialog(null);
      setResolveNotes('');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">התראות בילינג</h1>
          {openCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{openCount}</span>
          )}
        </div>
      </div>

      {/* KPI */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3 w-fit">
        <div className="p-2 rounded-lg bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p className="text-xs text-slate-500">התראות פתוחות</p>
          <p className="text-xl font-bold text-slate-800">{openCount ?? '—'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">פתוחות בלבד</SelectItem>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="resolved">טופלו</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">טוען התראות...</div>
      ) : !alerts?.length ? (
        <div className="text-center py-12 text-slate-400">
          {resolvedFilter === 'open' ? 'אין התראות פתוחות — הכל תקין!' : 'אין התראות'}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-right font-medium text-slate-600">לקוח</th>
                <th className="p-3 text-right font-medium text-slate-600">תוכנית</th>
                <th className="p-3 text-right font-medium text-slate-600">סכום</th>
                <th className="p-3 text-right font-medium text-slate-600">סוג התראה</th>
                <th className="p-3 text-right font-medium text-slate-600">סטטוס מנוי</th>
                <th className="p-3 text-right font-medium text-slate-600">תאריך</th>
                <th className="p-3 text-right font-medium text-slate-600">סטטוס</th>
                <th className="p-3 text-right font-medium text-slate-600">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => {
                const subBadge = SUB_STATUS_BADGES[alert.sub_status] || {};
                return (
                  <tr key={alert.id} className={`border-b border-slate-100 ${alert.resolved ? 'opacity-60' : 'hover:bg-red-50/30'}`}>
                    <td className="p-3">
                      <div className="font-medium">{alert.lead_name || '—'}</div>
                      <div className="text-xs text-slate-400">{alert.lead_phone}</div>
                    </td>
                    <td className="p-3">{alert.plan_name || '—'}</td>
                    <td className="p-3 font-medium">₪{alert.monthly_price}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        {ALERT_TYPE_LABELS[alert.alert_type] || alert.alert_type}
                      </span>
                    </td>
                    <td className="p-3">
                      {subBadge.label ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${subBadge.color}`}>{subBadge.label}</span>
                      ) : '—'}
                    </td>
                    <td className="p-3 text-slate-500 text-xs">{new Date(alert.created_at).toLocaleDateString('he-IL')}</td>
                    <td className="p-3">
                      {alert.resolved ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">טופל</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">פתוח</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {!alert.resolved && (
                          <Button variant="ghost" size="sm" onClick={() => setResolveDialog(alert.id)} title="סמן כטופל">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        {alert.subscription_id && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/CRM/subscriptions')} title="פתח מנויים">
                              <ExternalLink className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setHistorySubId(alert.subscription_id)} title="היסטוריית חיובים">
                              <History className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={!!resolveDialog} onOpenChange={() => { setResolveDialog(null); setResolveNotes(''); }}>
        <DialogContent className="sm:max-w-sm" dir="rtl">
          <DialogHeader><DialogTitle>סימון התראה כטופלה</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} placeholder="הערות (אופציונלי) — מה נעשה?" rows={3} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setResolveDialog(null)}>ביטול</Button>
              <Button onClick={handleResolve} disabled={resolveAlert.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                {resolveAlert.isPending ? 'שומר...' : 'סמן כטופל'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Billing History Dialog */}
      <BillingHistoryDialog open={!!historySubId} onOpenChange={() => setHistorySubId(null)} subscriptionId={historySubId} />
    </div>
  );
}
