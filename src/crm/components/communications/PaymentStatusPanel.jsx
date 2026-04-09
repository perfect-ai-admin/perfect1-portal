import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Send, RefreshCw, Check, X as XIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import { useLeadPaymentStatus, useCreatePaymentLink, useServiceCatalog } from '../../hooks/useCRM';

const STATUS_CONFIG = {
  none: { label: 'אין תשלום', color: 'bg-slate-100 text-slate-600', icon: CreditCard },
  link_sent: { label: 'קישור נשלח', color: 'bg-blue-100 text-blue-700', icon: Send },
  pending: { label: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  paid: { label: 'שולם', color: 'bg-green-100 text-green-700', icon: Check },
  failed: { label: 'נכשל', color: 'bg-red-100 text-red-700', icon: XIcon },
};

export default function PaymentStatusPanel({ leadId }) {
  const { data: paymentData, isLoading } = useLeadPaymentStatus(leadId);
  const createLink = useCreatePaymentLink();
  const { data: services = [] } = useServiceCatalog();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [productType, setProductType] = useState('');

  if (isLoading) return null;

  const status = paymentData?.payment_status || 'none';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.none;
  const StatusIcon = config.icon;

  const canSendLink = status === 'none' || status === 'failed' || status === 'link_sent';

  const handleCreateLink = () => {
    if (!amount || !productType) {
      toast.error('יש למלא סכום וסוג שירות');
      return;
    }
    const selectedService = services.find(s => s.slug === productType);
    createLink.mutate(
      {
        lead_id: leadId,
        amount: parseFloat(amount),
        product_type: productType,
        product_name: selectedService?.name || productType,
        send_via_whatsapp: true,
      },
      {
        onSuccess: () => {
          toast.success('קישור תשלום נשלח');
          setShowForm(false);
          setAmount('');
          setProductType('');
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
        <CreditCard size={14} />
        תשלום
      </h3>

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
          <StatusIcon size={12} />
          {config.label}
        </span>
      </div>

      {/* Payment details */}
      {paymentData?.payment_link_sent_at && (
        <p className="text-xs text-slate-400 mb-1">
          נשלח: {format(new Date(paymentData.payment_link_sent_at), 'dd/MM HH:mm', { locale: he })}
        </p>
      )}
      {paymentData?.paid_at && (
        <p className="text-xs text-green-600 mb-1">
          שולם: {format(new Date(paymentData.paid_at), 'dd/MM HH:mm', { locale: he })}
        </p>
      )}

      {/* Action */}
      {canSendLink && !showForm && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full mt-2 text-xs"
        >
          <Send size={12} className="ml-1" />
          {status === 'link_sent' ? 'שלח שוב' : 'שלח קישור לתשלום'}
        </Button>
      )}

      {/* Payment form */}
      {showForm && (
        <div className="mt-3 space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="סוג שירות" />
            </SelectTrigger>
            <SelectContent>
              {services.map(s => (
                <SelectItem key={s.slug || s.id} value={s.slug || s.id}>
                  {s.name} {s.base_price ? `(₪${s.base_price})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="סכום (₪)"
            className="text-xs"
            min="1"
            max="100000"
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateLink}
              disabled={createLink.isPending}
              className="flex-1 text-xs bg-green-600 hover:bg-green-700"
            >
              {createLink.isPending ? (
                <RefreshCw size={12} className="animate-spin ml-1" />
              ) : (
                <Send size={12} className="ml-1" />
              )}
              שלח ב-WhatsApp
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="text-xs">
              ביטול
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
