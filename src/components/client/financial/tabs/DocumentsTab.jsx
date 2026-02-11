import React, { useState } from 'react';
import { FileText, Download, Plus, Send, MoreVertical, Filter, Loader2, RefreshCw, Receipt, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ConnectAccountingSoftwareDialog from '../ConnectAccountingSoftwareDialog';

const TYPE_LABELS = { receipt: 'קבלה', invoice_receipt: 'חשבונית מס/קבלה', credit: 'זיכוי' };
const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-800', created: 'bg-blue-100 text-blue-800',
  sent: 'bg-yellow-100 text-yellow-800', cancelled: 'bg-red-100 text-red-800',
};

export default function DocumentsTab({ data }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();
  const isConnected = data?.accounting_software?.is_active;

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['finbot-documents'],
    queryFn: () => base44.entities.FinbotDocument.list('-created_date', 200),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['finbot-customers'],
    queryFn: () => base44.entities.FinbotCustomer.list('-created_date', 200),
  });

  const syncMutation = useMutation({
    mutationFn: () => base44.functions.invoke('finbotSyncPull', { resource: 'documents' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['finbot-documents'] });
      toast.success(`סונכרנו ${res.data?.synced_count || 0} מסמכים`);
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = filterType === 'all' ? documents : documents.filter(d => d.type === filterType);

  const formatCurrency = (amount) => amount != null ? `₪${Number(amount).toLocaleString('he-IL')}` : '-';

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
        {['all', 'receipt', 'invoice_receipt', 'credit'].map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {t === 'all' ? 'הכל' : TYPE_LABELS[t]}
          </button>
        ))}
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
                {filtered.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('he-IL') : '-'}</td>
                    <td className="px-4 py-3">{TYPE_LABELS[doc.type] || doc.type}</td>
                    <td className="px-4 py-3">{doc.customer_name || '-'}</td>
                    <td className="px-4 py-3">{formatCurrency(doc.subtotal)}</td>
                    <td className="px-4 py-3">{formatCurrency(doc.vat)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(doc.total)}</td>
                    <td className="px-4 py-3">
                      {doc.status && <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-700'}`}>{doc.status}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {doc.pdf_url && (
                        <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-7 px-2"><Download className="w-3.5 h-3.5" /></Button>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {filtered.map(doc => (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{TYPE_LABELS[doc.type] || doc.type}</p>
                    <p className="text-xs text-gray-500">{doc.customer_name || '-'}</p>
                    <p className="text-xs text-gray-400 mt-1">{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('he-IL') : ''}</p>
                  </div>
                  <p className="font-bold text-sm">{formatCurrency(doc.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Document Dialog */}
      <CreateDocumentDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        customers={customers}
        queryClient={queryClient}
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

function CreateDocumentDialog({ open, onClose, customers, queryClient }) {
  const [form, setForm] = useState({
    type: 'receipt',
    customer_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, unit_price: 0 }],
    payment_type: 'cash',
    notes: ''
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      // Build payment array from form
      const total = data.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
      const payload = {
        ...data,
        payment: [{
          date: data.issue_date,
          type: data.payment_type,
          price: total
        }]
      };
      delete payload.payment_type;
      return base44.functions.invoke('finbotCreateDocument', payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['finbot-documents'] });
      const pdfUrl = res.data?.finbot_response?.pdf_link || res.data?.document?.pdf_url;
      if (pdfUrl) {
        toast.success('מסמך הופק בהצלחה!', { 
          action: { label: 'פתח PDF', onClick: () => window.open(pdfUrl, '_blank') }
        });
      } else {
        toast.success('מסמך נוצר בהצלחה');
      }
      onClose();
      setForm({ type: 'receipt', customer_id: '', issue_date: new Date().toISOString().split('T')[0], items: [{ description: '', quantity: 1, unit_price: 0 }], payment_type: 'cash', notes: '' });
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
              <span className="text-sm text-gray-600">סה״כ לפני מע״מ: </span>
              <span className="font-bold">₪{total.toLocaleString()}</span>
              <span className="text-xs text-gray-400 mr-2">(+ מע״מ ₪{(total * 0.17).toLocaleString()})</span>
            </div>
          </div>

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