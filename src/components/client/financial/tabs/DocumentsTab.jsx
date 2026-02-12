import React, { useState } from 'react';
import { FileText, Download, Plus, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ConnectAccountingSoftwareDialog from '../ConnectAccountingSoftwareDialog';
import useActiveAccountingProvider from '../../../hooks/useActiveAccountingProvider';

const TYPE_LABELS = { receipt: 'קבלה', invoice: 'חשבונית', invoice_receipt: 'חשבונית מס/קבלה', credit: 'זיכוי', issued: 'הופק' };
const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-800', created: 'bg-blue-100 text-blue-800',
  sent: 'bg-yellow-100 text-yellow-800', cancelled: 'bg-red-100 text-red-800',
  issued: 'bg-green-100 text-green-800', open: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-700',
};
const STATUS_LABELS = {
  paid: 'שולם', created: 'נוצר', sent: 'נשלח', cancelled: 'בוטל',
  issued: 'הופק', open: 'פתוח', closed: 'סגור',
};

export default function DocumentsTab({ data }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();
  const { fn, isConnected, isLoading: providerLoading, isVatExempt, providerId } = useActiveAccountingProvider();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['finbot-documents', providerId || 'none'],
    queryFn: () => {
      if (!isConnected || !providerId) return [];
      return base44.entities.FinbotDocument.filter({ provider: providerId }, '-issue_date', 500);
    },
    enabled: !providerLoading,
    refetchOnWindowFocus: true,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['finbot-customers', providerId || 'none'],
    queryFn: () => {
      if (!isConnected || !providerId) return [];
      return base44.entities.FinbotCustomer.filter({ provider: providerId }, '-created_date', 500);
    },
    enabled: !providerLoading,
  });

  const syncMutation = useMutation({
    mutationFn: () => {
      if (!fn?.syncPull) throw new Error('אין חיבור למערכת חשבונות');
      return base44.functions.invoke(fn.syncPull, { resource: 'documents' });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['finbot-documents', providerId || 'none'] });
      queryClient.invalidateQueries({ queryKey: ['finbot-documents-revenue'] });
      toast.success(`סונכרנו ${res.data?.synced_count || 0} מסמכים`);
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = filterType === 'all' ? documents : documents.filter(d => d.type === filterType);

  const formatCurrency = (amount) => amount != null ? `₪${Number(amount).toLocaleString('he-IL')}` : '-';

  // Calculate display values - if vat is missing and not exempt, compute it
  const getDocAmounts = (doc) => {
    const subtotal = Number(doc.subtotal) || 0;
    let vat = Number(doc.vat) || 0;
    let total = Number(doc.total) || 0;

    if (!vat && !isVatExempt && subtotal > 0) {
      vat = Math.round(subtotal * 0.18 * 100) / 100;
    }
    if (!total || total === subtotal) {
      total = Math.round((subtotal + vat) * 100) / 100;
    }
    return { subtotal, vat, total };
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3">
        <h2 className="text-lg font-bold text-blue-900">מסמכים</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
            {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="hidden md:inline">סנכרן</span>
          </Button>
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => {
            if (!isConnected) { setShowConnectDialog(true); } else { setShowCreateDialog(true); }
          }}>
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">הפק מסמך</span>
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'receipt', 'invoice', 'invoice_receipt', 'credit'].map(t => {
          const count = t === 'all' ? documents.length : documents.filter(d => d.type === t).length;
          return (
          <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {t === 'all' ? 'הכל' : TYPE_LABELS[t]} ({count})
          </button>
        );
      })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">{documents.length === 0 ? 'אין מסמכים עדיין. סנכרן ממערכת החשבונות או הפק מסמך חדש.' : 'אין מסמכים מסוג זה'}</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-right px-4 py-2 font-semibold">תאריך</th>
                  <th className="text-right px-4 py-2 font-semibold">סוג</th>
                  <th className="text-right px-4 py-2 font-semibold">לקוח</th>
                  <th className="text-right px-4 py-2 font-semibold">סכום</th>
                  <th className="text-right px-4 py-2 font-semibold">מע״מ</th>
                  <th className="text-right px-4 py-2 font-semibold">סה״כ</th>
                  <th className="text-right px-4 py-2 font-semibold">סטטוס</th>
                  <th className="text-right px-4 py-2 font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(doc => {
                  const amounts = getDocAmounts(doc);
                  return (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('he-IL') : '-'}</td>
                    <td className="px-4 py-3">{TYPE_LABELS[doc.type] || doc.type}</td>
                    <td className="px-4 py-3">{doc.customer_name || '-'}</td>
                    <td className="px-4 py-3">{formatCurrency(amounts.subtotal)}</td>
                    <td className="px-4 py-3">{formatCurrency(amounts.vat)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(amounts.total)}</td>
                    <td className="px-4 py-3">
                      {doc.status && <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-700'}`}>{STATUS_LABELS[doc.status] || doc.status}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {doc.pdf_url && (
                        <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 px-2"><Download className="w-3.5 h-3.5" /></Button>
                        </a>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {filtered.map(doc => {
              const amounts = getDocAmounts(doc);
              return (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{TYPE_LABELS[doc.type] || doc.type}</p>
                    <p className="text-xs text-gray-500">{doc.customer_name || '-'}</p>
                    <p className="text-xs text-gray-400 mt-1">{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('he-IL') : ''}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">{formatCurrency(amounts.total)}</p>
                    {amounts.vat > 0 && <p className="text-xs text-gray-400">מע״מ: {formatCurrency(amounts.vat)}</p>}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create Document Dialog */}
      <CreateDocumentDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        customers={customers}
        queryClient={queryClient}
        createDocFn={fn?.createDocument}
        isVatExempt={isVatExempt}
      />

      {/* Connect Accounting Dialog */}
      <ConnectAccountingSoftwareDialog
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        user={data}
        onConnect={() => queryClient.invalidateQueries()}
      />
    </motion.div>
  );
}

const PAYMENT_TYPE_OPTIONS = [
  { value: 'cash', label: 'מזומן' },
  { value: 'bank_transfer', label: 'העברה בנקאית' },
  { value: 'credit_card', label: 'אשראי' },
  { value: 'cheque', label: 'צ׳ק' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bit', label: 'ביט' },
  { value: 'paybox', label: 'פייבוקס' },
  { value: 'other', label: 'אחר' },
];

function CreateDocumentDialog({ open, onClose, customers, queryClient, createDocFn, isVatExempt }) {
  const [form, setForm] = useState({
    type: 'receipt',
    customer_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unit_price: 0 }],
    payment_type: 'cash',
    payment_amount: '',
    notes: ''
  });

  const needsPayment = ['receipt', 'invoice_receipt'].includes(form.type);

  const createMutation = useMutation({
    mutationFn: (data) => {
      const docNeedsPayment = ['receipt', 'invoice_receipt'].includes(data.type);
      const itemsTotal = data.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
      const fullAmount = isVatExempt ? itemsTotal : Math.round(itemsTotal * 1.18 * 100) / 100;
      const payAmount = data.payment_amount ? Number(data.payment_amount) : fullAmount;
      
      // Find iCount customer ID from selected customer
      const selectedCustomer = data.customer_id ? customers.find(c => c.id === data.customer_id) : null;
      const customerProviderId = selectedCustomer?.finbot_customer_id || null;
      
      const payload = {
        type: data.type,
        customer_id: data.customer_id,
        customer_provider_id: customerProviderId,
        issue_date: data.issue_date,
        items: data.items,
        notes: data.notes,
        ...(docNeedsPayment && {
          payment: [{
            date: data.issue_date,
            type: data.payment_type || 'cash',
            price: payAmount
          }]
        })
      };
      return base44.functions.invoke(createDocFn, payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['finbot-documents'] });
      queryClient.invalidateQueries({ queryKey: ['finbot-documents-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['finbot-customers'] });
      const pdfUrl = res.data?.finbot_response?.pdf_link || res.data?.document?.pdf_url || res.data?.pdf_url;
      if (pdfUrl) {
        toast.success('מסמך הופק בהצלחה!', { 
          action: { label: 'פתח PDF', onClick: () => window.open(pdfUrl, '_blank') }
        });
      } else {
        toast.success('מסמך נוצר בהצלחה');
      }
      onClose();
      setForm({ type: 'receipt', customer_id: '', issue_date: new Date().toISOString().split('T')[0], items: [{ description: '', quantity: 1, unit_price: 0 }], payment_type: 'cash', payment_amount: '', notes: '' });
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || err.message || 'שגיאה ביצירת מסמך';
      toast.error(msg);
    },
  });

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { description: '', quantity: 1, unit_price: 0 }] }));
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, value) => {
    setForm(p => ({ ...p, items: p.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));
  };

  const total = form.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>הפקת מסמך חדש</DialogTitle></DialogHeader>
        <div className="space-y-4" dir="rtl">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">סוג מסמך</label>
              <Select value={form.type} onValueChange={v => setForm(p => ({...p, type: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">קבלה</SelectItem>
                  <SelectItem value="invoice">חשבונית</SelectItem>
                  <SelectItem value="invoice_receipt">חשבונית מס/קבלה</SelectItem>
                  <SelectItem value="credit">זיכוי</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">תאריך</label>
              <Input type="date" value={form.issue_date} onChange={e => setForm(p => ({...p, issue_date: e.target.value}))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">לקוח</label>
            <Select value={form.customer_id} onValueChange={v => setForm(p => ({...p, customer_id: v}))}>
              <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
              <SelectContent>
                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">פריטים</label>
              <Button size="sm" variant="outline" onClick={addItem} className="h-7 text-xs gap-1"><Plus className="w-3 h-3" /> הוסף שורה</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">תיאור</label>}
                    <Input placeholder="תיאור" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} className="text-sm h-9" />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">כמות</label>}
                    <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} className="text-sm h-9" />
                  </div>
                  <div className="col-span-3">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">מחיר ליחידה</label>}
                    <Input type="number" min="0" step="0.01" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', Number(e.target.value))} className="text-sm h-9" />
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <span className="text-sm font-medium">₪{(item.quantity * item.unit_price).toLocaleString()}</span>
                    {form.items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-left mt-2 pt-2 border-t">
              {isVatExempt ? (
                <>
                  <span className="text-sm text-gray-600">סה״כ: </span>
                  <span className="font-bold">₪{total.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 mr-2">(עוסק פטור - ללא מע״מ)</span>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-600">סה״כ לפני מע״מ: </span>
                  <span className="font-bold">₪{total.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 mr-2">(+ מע״מ 18% ₪{(total * 0.18).toLocaleString()})</span>
                </>
              )}
            </div>
          </div>

          {needsPayment && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">אמצעי תשלום</label>
                <Select value={form.payment_type} onValueChange={v => setForm(p => ({...p, payment_type: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">סכום ששולם {isVatExempt ? '' : '(כולל מע״מ)'}</label>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder={isVatExempt 
                    ? `₪${total.toLocaleString()} (סה״כ)` 
                    : `₪${Math.round(total * 1.18).toLocaleString()} (כולל מע״מ 18%)`}
                  value={form.payment_amount} 
                  onChange={e => setForm(p => ({...p, payment_amount: e.target.value}))} 
                  className="text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">השאר ריק לתשלום מלא</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">הערות</label>
            <Textarea placeholder="הערות למסמך..." value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} rows={2} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button
            onClick={() => createMutation.mutate(form)}
            disabled={!form.items[0]?.description || createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <FileText className="w-4 h-4 ml-2" />}
            הפק מסמך
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}