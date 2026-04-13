import React, { useState } from 'react';
import { CreditCard, Users, TrendingUp, AlertTriangle, XCircle, Plus, Pause, Play, Trash2, History, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  useSubscriptions,
  useSubscriptionKPIs,
  useCreateSubscription,
  useCreateSubscriptionWithCard,
  useUpdateSubscription,
  useBillingHistory,
  usePipelineLeads,
} from '../hooks/useCRM';

const STATUS_BADGES = {
  active: { label: 'פעיל', color: 'bg-green-100 text-green-700' },
  paused: { label: 'מושהה', color: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'מבוטל', color: 'bg-red-100 text-red-700' },
  failed: { label: 'נכשל', color: 'bg-red-100 text-red-800' },
  pending_first_charge: { label: 'ממתין לתשלום', color: 'bg-blue-100 text-blue-700' },
};

function KPICard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function CreateSubscriptionDialog({ open, onOpenChange }) {
  const [leadId, setLeadId] = useState('');
  const [planName, setPlanName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [mode, setMode] = useState('link'); // 'link' | 'card'
  const [ccno, setCcno] = useState('');
  const [expdate, setExpdate] = useState('');
  const [cvv, setCvv] = useState('');
  const [myid, setMyid] = useState('');
  const [contactName, setContactName] = useState('');
  const createSub = useCreateSubscription();
  const createSubWithCard = useCreateSubscriptionWithCard();
  const { data: leads } = usePipelineLeads({});

  const clearForm = () => {
    setLeadId(''); setPlanName(''); setMonthlyPrice('');
    setCcno(''); setExpdate(''); setCvv(''); setMyid(''); setContactName('');
  };

  const handleCreate = async () => {
    if (!leadId || !planName || !monthlyPrice) {
      toast.error('יש למלא את כל השדות');
      return;
    }

    if (mode === 'card') {
      if (!ccno || !expdate || !cvv || !myid || !contactName) {
        toast.error('יש למלא את כל פרטי הכרטיס');
        return;
      }
      try {
        const result = await createSubWithCard.mutateAsync({
          lead_id: leadId,
          plan_name: planName,
          monthly_price: Number(monthlyPrice),
          ccno: ccno.replace(/\s/g, ''),
          expdate: expdate.replace('/', ''),
          cvv,
          myid,
          contact_name: contactName,
        });
        toast.success(`מנוי נוצר — כרטיס *${result.card_last4}`);
        onOpenChange(false);
        clearForm();
      } catch (err) {
        toast.error(`שגיאה: ${err.message}`);
      }
    } else {
      try {
        const result = await createSub.mutateAsync({
          lead_id: leadId,
          plan_name: planName,
          monthly_price: Number(monthlyPrice),
          send_via_whatsapp: sendWhatsapp,
        });
        toast.success('מנוי נוצר — קישור תשלום נשלח');
        if (result?.payment_link) {
          navigator.clipboard?.writeText(result.payment_link);
          toast.success('קישור הועתק');
        }
        onOpenChange(false);
        clearForm();
      } catch (err) {
        toast.error(`שגיאה: ${err.message}`);
      }
    }
  };

  const isPending = createSub.isPending || createSubWithCard.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) clearForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת מנוי חדש</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setMode('link')} className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'link' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
              שלח לינק
            </button>
            <button onClick={() => setMode('card')} className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
              <Lock className="w-3 h-3 inline ml-1" />הזן כרטיס
            </button>
          </div>

          {/* Lead + Plan + Amount */}
          <div>
            <label className="text-sm font-medium mb-1 block">ליד</label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger><SelectValue placeholder="בחר ליד" /></SelectTrigger>
              <SelectContent>
                {(leads || []).slice(0, 50).map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name} — {l.phone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">שם תוכנית</label>
            <Input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="למשל: הנהלת חשבונות חודשית" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">סכום חודשי (₪)</label>
            <Input type="number" value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} placeholder="299" />
          </div>

          {/* Link mode — WhatsApp toggle */}
          {mode === 'link' && (
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={sendWhatsapp} onChange={e => setSendWhatsapp(e.target.checked)} id="wa-toggle" />
              <label htmlFor="wa-toggle" className="text-sm">שלח קישור תשלום ב-WhatsApp</label>
            </div>
          )}

          {/* Card mode — card fields */}
          {mode === 'card' && (
            <div className="space-y-3 border rounded-lg p-3 bg-slate-50">
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                פרטי הכרטיס מועברים בצורה מוצפנת ישירות לטרנזילה ואינם נשמרים במערכת.
              </p>
              <div>
                <label className="text-sm font-medium mb-1 block">מספר כרטיס</label>
                <Input value={ccno} onChange={e => setCcno(e.target.value.replace(/[^\d\s]/g, '').slice(0, 19))} placeholder="4580 1234 5678 9012" inputMode="numeric" dir="ltr" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">תוקף (MM/YY)</label>
                  <Input value={expdate} onChange={e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2); setExpdate(v); }} placeholder="12/27" inputMode="numeric" dir="ltr" />
                </div>
                <div className="w-24">
                  <label className="text-sm font-medium mb-1 block">CVV</label>
                  <Input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" inputMode="numeric" type="password" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ת.ז. בעל הכרטיס</label>
                <Input value={myid} onChange={e => setMyid(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="123456789" inputMode="numeric" dir="ltr" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">שם בעל הכרטיס</label>
                <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="ישראל ישראלי" />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => { clearForm(); onOpenChange(false); }}>ביטול</Button>
            <Button onClick={handleCreate} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isPending ? 'מעבד...' : mode === 'card' ? 'צור מנוי וחייב עכשיו' : 'צור מנוי'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BillingHistoryDialog({ open, onOpenChange, subscriptionId }) {
  const { data: history, isLoading } = useBillingHistory(subscriptionId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>היסטוריית חיובים</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p className="text-center py-4 text-slate-500">טוען...</p>
        ) : !history?.length ? (
          <p className="text-center py-4 text-slate-500">אין חיובים עדיין</p>
        ) : (
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-2 text-right">תאריך</th>
                  <th className="p-2 text-right">סכום</th>
                  <th className="p-2 text-right">סטטוס</th>
                </tr>
              </thead>
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

export default function CRMSubscriptions() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [historySubId, setHistorySubId] = useState(null);
  const [pauseDialog, setPauseDialog] = useState(null);
  const [pauseReason, setPauseReason] = useState('');

  const { data: subs, isLoading } = useSubscriptions({ status: statusFilter || undefined });
  const { data: kpis } = useSubscriptionKPIs();
  const updateSub = useUpdateSubscription();

  const filtered = (subs || []).filter(s => {
    if (!search) return true;
    return s.lead_name?.includes(search) || s.lead_phone?.includes(search) || s.plan_name?.includes(search);
  });

  const handlePause = async (id) => {
    try {
      await updateSub.mutateAsync({ id, status: 'paused', pause_reason: pauseReason });
      toast.success('מנוי הושהה');
      toast('חשוב: יש לבטל גם בממשק My Tranzila', { icon: '⚠️' });
      setPauseDialog(null);
      setPauseReason('');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResume = async (id) => {
    try {
      await updateSub.mutateAsync({ id, status: 'active' });
      toast.success('מנוי הופעל מחדש');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('האם לבטל את המנוי? שים לב שצריך לבטל גם ב-My Tranzila.')) return;
    try {
      await updateSub.mutateAsync({ id, status: 'cancelled', cancellation_reason: 'ביטול ידני מ-CRM' });
      toast.success('מנוי בוטל');
      toast('חשוב: יש לבטל גם בממשק My Tranzila', { icon: '⚠️' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">מנויים</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 ml-1" /> יצירת מנוי
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={Users} label="מנויים פעילים" value={kpis?.active_count ?? '—'} color="#22C55E" />
        <KPICard icon={TrendingUp} label="הכנסה חודשית" value={kpis?.mrr ? `₪${kpis.mrr.toLocaleString()}` : '—'} color="#3B82F6" />
        <KPICard icon={AlertTriangle} label="כשלים החודש" value={kpis?.failed_this_month ?? '—'} color="#F59E0B" />
        <KPICard icon={XCircle} label="ביטולים החודש" value={kpis?.cancelled_this_month ?? '—'} color="#EF4444" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם, טלפון או תוכנית..."
          className="w-64"
        />
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="כל הסטטוסים" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="active">פעיל</SelectItem>
            <SelectItem value="paused">מושהה</SelectItem>
            <SelectItem value="cancelled">מבוטל</SelectItem>
            <SelectItem value="failed">נכשל</SelectItem>
            <SelectItem value="pending_first_charge">ממתין</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">טוען מנויים...</div>
      ) : !filtered.length ? (
        <div className="text-center py-12 text-slate-400">אין מנויים</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-right font-medium text-slate-600">לקוח</th>
                <th className="p-3 text-right font-medium text-slate-600">תוכנית</th>
                <th className="p-3 text-right font-medium text-slate-600">סכום</th>
                <th className="p-3 text-right font-medium text-slate-600">חיוב אחרון</th>
                <th className="p-3 text-right font-medium text-slate-600">חיוב הבא</th>
                <th className="p-3 text-right font-medium text-slate-600">כרטיס</th>
                <th className="p-3 text-right font-medium text-slate-600">סטטוס</th>
                <th className="p-3 text-right font-medium text-slate-600">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sub => {
                const badge = STATUS_BADGES[sub.status] || STATUS_BADGES.active;
                return (
                  <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-medium">{sub.lead_name || '—'}</div>
                      <div className="text-xs text-slate-400">{sub.lead_phone}</div>
                    </td>
                    <td className="p-3">{sub.plan_name}</td>
                    <td className="p-3 font-medium">₪{sub.monthly_price}</td>
                    <td className="p-3 text-slate-500">{sub.last_charge_date || '—'}</td>
                    <td className="p-3 text-slate-500">{sub.next_charge_date || '—'}</td>
                    <td className="p-3 text-slate-500 font-mono text-xs">
                      {sub.card_last4 ? `${sub.card_brand || ''} *${sub.card_last4}` : '—'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setHistorySubId(sub.id)} title="היסטוריה">
                          <History className="w-4 h-4" />
                        </Button>
                        {sub.status === 'active' && (
                          <Button variant="ghost" size="sm" onClick={() => setPauseDialog(sub.id)} title="השהה">
                            <Pause className="w-4 h-4 text-yellow-600" />
                          </Button>
                        )}
                        {sub.status === 'paused' && (
                          <Button variant="ghost" size="sm" onClick={() => handleResume(sub.id)} title="הפעל">
                            <Play className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        {(sub.status === 'active' || sub.status === 'paused') && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(sub.id)} title="בטל">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
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

      {/* Dialogs */}
      <CreateSubscriptionDialog open={showCreate} onOpenChange={setShowCreate} />
      <BillingHistoryDialog open={!!historySubId} onOpenChange={() => setHistorySubId(null)} subscriptionId={historySubId} />

      {/* Pause Dialog */}
      <Dialog open={!!pauseDialog} onOpenChange={() => { setPauseDialog(null); setPauseReason(''); }}>
        <DialogContent className="sm:max-w-sm" dir="rtl">
          <DialogHeader><DialogTitle>השהיית מנוי</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={pauseReason} onChange={e => setPauseReason(e.target.value)} placeholder="סיבת השהייה (אופציונלי)" />
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">חשוב: השהייה כאן היא סימון פנימי בלבד. יש לבטל גם בממשק My Tranzila.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPauseDialog(null)}>ביטול</Button>
              <Button onClick={() => handlePause(pauseDialog)} className="bg-yellow-500 hover:bg-yellow-600 text-white">השהה</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
