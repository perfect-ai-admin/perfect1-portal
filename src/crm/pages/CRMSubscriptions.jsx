import React, { useState, useRef, useCallback } from 'react';
import { CreditCard, Users, TrendingUp, AlertTriangle, XCircle, Plus, Pause, Play, Trash2, History, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import TranzilaIframe from '@/components/checkout/TranzilaIframe';
import { invokeFunction, supabase } from '@/api/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSubscriptions,
  useSubscriptionKPIs,
  useCreateSubscription,
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
  // Step 1: form fields, Step 2: iframe payment
  const [step, setStep] = useState(1);
  const [leadId, setLeadId] = useState('');
  const [planName, setPlanName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [mode, setMode] = useState('link'); // 'link' | 'card'
  const [recurPayments, setRecurPayments] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const confirmedRef = useRef(false);
  const createSub = useCreateSubscription();
  const { data: leads } = usePipelineLeads({});

  const clearForm = () => {
    setStep(1); setLeadId(''); setPlanName(''); setMonthlyPrice('');
    setRecurPayments(''); setIframeUrl(''); setSubscriptionId('');
    setPaymentId(''); setLoading(false); setPaymentSuccess(false);
    confirmedRef.current = false;
  };

  // Handle "שלח לינק" mode
  const handleSendLink = async () => {
    if (!leadId || !planName || !monthlyPrice) {
      toast.error('יש למלא את כל השדות');
      return;
    }
    setLoading(true);
    try {
      const result = await createSub.mutateAsync({
        lead_id: leadId,
        plan_name: planName,
        monthly_price: Number(monthlyPrice),
        send_via_whatsapp: sendWhatsapp,
        recur_payments: recurPayments ? Number(recurPayments) : undefined,
      });
      toast.success('מנוי נוצר — קישור תשלום נשלח!');
      if (result?.payment_link) {
        try { await navigator.clipboard?.writeText(result.payment_link); } catch {}
        toast.success('קישור הועתק ללוח');
      }
      onOpenChange(false);
      clearForm();
    } catch (err) {
      toast.error(`שגיאה: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle "הזן כרטיס" mode — step 1: create subscription + load iframe
  const handleStartCardPayment = async () => {
    if (!leadId || !planName || !monthlyPrice) {
      toast.error('יש למלא את כל השדות');
      return;
    }
    setLoading(true);
    try {
      // Create subscription + get Tranzila iframe URL (reuses crmCreateSubscription)
      const result = await invokeFunction('crmCreateSubscription', {
        lead_id: leadId,
        plan_name: planName,
        monthly_price: Number(monthlyPrice),
        send_via_whatsapp: false, // Don't send WhatsApp — agent enters card directly
        recur_payments: recurPayments ? Number(recurPayments) : undefined,
      });

      if (!result?.payment_link || !result?.subscription_id) {
        throw new Error('לא התקבל קישור תשלום');
      }

      setSubscriptionId(result.subscription_id);
      setPaymentId(result.payment_id);
      setIframeUrl(result.payment_link);
      setStep(2);
    } catch (err) {
      toast.error(`שגיאה: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Called when TranzilaIframe detects successful payment
  const handlePaymentDetected = useCallback(async (confirmationCode) => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    // Confirm payment via our edge function
    try {
      await invokeFunction('tranzilaConfirmPayment', {
        payment_id: paymentId,
        transaction_id: confirmationCode || '',
        tranzila_response: '000',
      });
    } catch {
      // Webhook will handle it if client confirm fails
    }

    setPaymentSuccess(true);
    toast.success('תשלום התקבל — המנוי פעיל!');
  }, [paymentId]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) clearForm(); onOpenChange(v); }}>
      <DialogContent className={`${step === 2 ? 'sm:max-w-xl' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto`} dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {paymentSuccess ? 'מנוי נוצר בהצלחה!' : step === 2 ? 'הזנת פרטי כרטיס' : 'יצירת מנוי חדש'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 2 success */}
        {paymentSuccess && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-lg font-bold text-green-700">התשלום התקבל!</p>
            <p className="text-slate-500">המנוי פעיל והחיוב החוזר יתבצע ב-15 לכל חודש.</p>
            <Button onClick={() => { onOpenChange(false); clearForm(); }} className="bg-green-600 hover:bg-green-700 text-white">
              סגור
            </Button>
          </div>
        )}

        {/* Step 2: iframe */}
        {step === 2 && !paymentSuccess && (
          <div className="space-y-3">
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              פרטי הכרטיס מוזנים ישירות בטופס המאובטח של Tranzila. המערכת לא שומרת או רואה את פרטי הכרטיס.
            </p>
            <TranzilaIframe
              iframeUrl={iframeUrl}
              paymentId={paymentId}
              onPaymentDetected={handlePaymentDetected}
              confirmedRef={confirmedRef}
              id="subscription-tranzila-iframe"
            />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => { setStep(1); setIframeUrl(''); }}>
                חזור
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: form */}
        {step === 1 && !paymentSuccess && (
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setMode('link')} className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'link' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                שלח לינק ללקוח
              </button>
              <button onClick={() => setMode('card')} className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <Lock className="w-3 h-3 inline ml-1" />הזן כרטיס עכשיו
              </button>
            </div>

            {/* Lead */}
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

            {/* Plan */}
            <div>
              <label className="text-sm font-medium mb-1 block">שם תוכנית</label>
              <Input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="למשל: הנהלת חשבונות חודשית" />
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium mb-1 block">סכום חודשי (₪)</label>
              <Input type="number" value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} placeholder="299" />
            </div>

            {/* Recur payments */}
            <div>
              <label className="text-sm font-medium mb-1 block">מספר תשלומים</label>
              <div className="flex gap-2 items-center">
                <Input type="number" value={recurPayments} onChange={e => setRecurPayments(e.target.value)} placeholder="ללא הגבלה" className="w-32" min="1" max="999" />
                <span className="text-xs text-slate-400">{recurPayments ? `${recurPayments} חיובים` : 'חיוב חודשי ללא הגבלה'}</span>
              </div>
            </div>

            {/* Link mode — WhatsApp toggle */}
            {mode === 'link' && (
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={sendWhatsapp} onChange={e => setSendWhatsapp(e.target.checked)} id="wa-toggle" />
                <label htmlFor="wa-toggle" className="text-sm">שלח קישור תשלום ב-WhatsApp</label>
              </div>
            )}

            {/* Card mode — info */}
            {mode === 'card' && (
              <p className="text-xs text-slate-500 bg-slate-50 rounded p-2">
                בשלב הבא ייפתח טופס תשלום מאובטח של Tranzila. הזן את פרטי הכרטיס ישירות בטופס.
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => { clearForm(); onOpenChange(false); }}>ביטול</Button>
              {mode === 'link' ? (
                <Button onClick={handleSendLink} disabled={loading || createSub.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading || createSub.isPending ? <><Loader2 className="w-4 h-4 animate-spin ml-1" /> שולח...</> : 'צור מנוי ושלח לינק'}
                </Button>
              ) : (
                <Button onClick={handleStartCardPayment} disabled={loading} className="bg-[#1E3A5F] hover:bg-[#16324f] text-white">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-1" /> מכין טופס...</> : 'המשך להזנת כרטיס'}
                </Button>
              )}
            </div>
          </div>
        )}
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

  const qc = useQueryClient();
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
    if (!confirm('האם לבטל את המנוי?\n\nשים לב: יש לבטל גם בממשק My Tranzila כדי לעצור חיובים.')) return;
    try {
      await updateSub.mutateAsync({ id, status: 'cancelled', cancellation_reason: 'ביטול ידני מ-CRM' });
      toast.success('מנוי בוטל');
      toast('חשוב: יש לבטל גם בממשק My Tranzila', { icon: '⚠️' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('האם למחוק את המנוי לצמיתות?\n\nפעולה זו אינה ניתנת לביטול.')) return;
    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw new Error(error.message);
      toast.success('מנוי נמחק');
      // Refresh
      qc.invalidateQueries({ queryKey: ['crm-subscriptions'] });
      qc.invalidateQueries({ queryKey: ['crm-subscription-kpis'] });
    } catch (err) {
      toast.error(`שגיאה: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1E3A5F]">מנויים <span className="text-xs text-slate-300 font-normal">v2.1</span></h1>
        <Button size="sm" onClick={() => setShowCreate(true)} className="bg-[#1E3A5F] hover:bg-[#16324f]">
          <Plus className="w-4 h-4 ml-1" /> יצירת מנוי
        </Button>
      </div>

      {/* KPI Cards + Create Button */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard icon={Users} label="מנויים פעילים" value={kpis?.active_count ?? '—'} color="#22C55E" />
        <KPICard icon={TrendingUp} label="הכנסה חודשית" value={kpis?.mrr ? `₪${kpis.mrr.toLocaleString()}` : '—'} color="#3B82F6" />
        <KPICard icon={AlertTriangle} label="כשלים החודש" value={kpis?.failed_this_month ?? '—'} color="#F59E0B" />
        <KPICard icon={XCircle} label="ביטולים החודש" value={kpis?.cancelled_this_month ?? '—'} color="#EF4444" />
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#1E3A5F] hover:bg-[#16324f] text-white rounded-lg border border-[#1E3A5F] p-4 flex items-center justify-center gap-2 transition-colors col-span-2 md:col-span-1"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold text-sm">יצירת מנוי</span>
        </button>
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
        <div className="text-center py-16 space-y-4">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-400 text-lg">אין מנויים עדיין</p>
          <Button onClick={() => setShowCreate(true)} className="bg-[#1E3A5F] hover:bg-[#16324f] text-white">
            <Plus className="w-4 h-4 ml-1" /> צור מנוי ראשון
          </Button>
        </div>
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
                      <div className="flex gap-1 flex-wrap">
                        <Button variant="ghost" size="sm" onClick={() => setHistorySubId(sub.id)} title="היסטוריית חיובים">
                          <History className="w-4 h-4 ml-1" /><span className="text-xs hidden md:inline">היסטוריה</span>
                        </Button>
                        {sub.status === 'active' && (
                          <Button variant="ghost" size="sm" onClick={() => setPauseDialog(sub.id)} title="השהה מנוי" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                            <Pause className="w-4 h-4 ml-1" /><span className="text-xs hidden md:inline">השהה</span>
                          </Button>
                        )}
                        {sub.status === 'paused' && (
                          <Button variant="ghost" size="sm" onClick={() => handleResume(sub.id)} title="הפעל מחדש" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                            <Play className="w-4 h-4 ml-1" /><span className="text-xs hidden md:inline">הפעל</span>
                          </Button>
                        )}
                        {(sub.status === 'active' || sub.status === 'paused') && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(sub.id)} title="בטל מנוי" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                            <XCircle className="w-4 h-4 ml-1" /><span className="text-xs hidden md:inline">בטל</span>
                          </Button>
                        )}
                        {(sub.status === 'cancelled' || sub.status === 'failed') && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(sub.id)} title="מחק לצמיתות" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 ml-1" /><span className="text-xs hidden md:inline">מחק</span>
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
