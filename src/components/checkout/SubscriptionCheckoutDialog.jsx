import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ArrowRight, ShieldCheck, X, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '@/api/supabaseClient';
import { trackBeginCheckout, trackSubscriptionPurchase } from '@/components/tracking/EventTracker';
import useTranzilaPayment from './useTranzilaPayment';
import TranzilaIframe from './TranzilaIframe';

let cachedUser = null;

export default function SubscriptionCheckoutDialog({ open, onClose, product, onPaymentSuccess }) {
  const [user, setUser] = useState(cachedUser);
  const [paymentStep, setPaymentStep] = useState('summary');

  const { iframeUrl, paymentId, isCreating, createPayment, confirmPayment, manualCheck, reset, confirmedRef } = useTranzilaPayment({
    onSuccess: async (pid) => {
      trackSubscriptionPurchase({
        paymentId: pid,
        product_name: product?.name || '',
        tier_name: product?.tierName || '',
        billing_cycle: product?.billingCycle || 'monthly',
        amount: product?.price || 0,
        is_recurring: product?.isRecurring,
        payment_method: 'tranzila'
      });
      toast.success('התשלום בוצע בהצלחה! 🎉');
      if (onPaymentSuccess) await onPaymentSuccess(pid);
      onClose();
    },
  });

  useEffect(() => {
    if (!open || cachedUser) return;
    auth.me().then(u => { cachedUser = u; setUser(u); }).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open) {
      setPaymentStep('summary');
      reset();
      if (cachedUser) setUser(cachedUser);
    }
  }, [open, reset]);

  const amount = product?.price || 0;
  const isRecurring = product?.isRecurring;

  const getRecurringParams = () => {
    if (!isRecurring) return {};
    const d = new Date();
    const n = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const recurStartDate = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    return {
      recur_payments: '998',
      recur_sum: String(amount),
      recur_transaction: '4_approved',
      recur_start_date: recurStartDate,
    };
  };

  const handleProceed = async () => {
    if (!product) return;
    trackBeginCheckout(product);
    const result = await createPayment({
      product_type: 'plan',
      product_name: product.name,
      amount,
      product_id: product.productId || '',
      user,
      iframeParams: getRecurringParams(),
    });
    if (result) setPaymentStep('payment');
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0" dir="rtl">
        <DialogTitle className="sr-only">תשלום</DialogTitle>

        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {paymentStep === 'summary' ? 'סיכום הזמנה' : 'תשלום מאובטח'}
          </h2>
          <button onClick={onClose} aria-label="סגור דיאלוג" className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {!product ? (
            <div className="text-center py-8"><p className="text-gray-500">המוצר לא נמצא</p></div>
          ) : paymentStep === 'summary' ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-bold text-base">{product.name}</h3>
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>ניתן לביטול בכל עת</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-b py-3">
                <span className="font-bold text-base">סה"כ לתשלום</span>
                <span className="text-2xl font-black text-[#27AE60]">₪{amount}</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-gray-400">אמצעי תשלום:</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200 text-[11px] font-semibold text-[#1A1F71]">
                    <svg viewBox="0 0 48 16" className="h-3.5" fill="none"><path d="M17.7 1.2l-3.5 13.5h-2.8L14.9 1.2h2.8zm14.3 8.7l1.5-4 .8 4h-2.3zm3.1 4.8h2.6L35.4 1.2h-2.4c-.5 0-1 .3-1.2.8l-4.2 12.7h2.9l.6-1.6h3.6l.4 1.6zm-7.4-4.4c0-3.5-4.8-3.7-4.8-5.2 0-.5.5-1 1.5-1.1.5-.1 1.9-.1 3.5.7l.6-2.9C27.3 1.3 25.9 1 24.2 1c-2.8 0-4.7 1.5-4.7 3.6 0 1.6 1.4 2.4 2.5 3 1.1.5 1.5.9 1.5 1.4 0 .7-.9 1.1-1.7 1.1-1.5 0-2.3-.4-3-.7l-.5 2.9c.7.3 1.9.6 3.2.6 2.9 0 4.8-1.5 4.8-3.6zM12 1.2L7.5 14.7H4.6L2.4 3.4c-.1-.5-.3-.7-.7-.9C.9 2.1 0 1.6 0 1.6l.1-.4h4.7c.6 0 1.1.4 1.3 1.1l1.2 6.1L10 1.2H12z" fill="#1A1F71"/></svg>
                    VISA
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200 text-[11px] font-semibold text-gray-700">
                    <svg viewBox="0 0 24 16" className="h-3.5" fill="none"><circle cx="8.5" cy="8" r="7.5" fill="#EB001B"/><circle cx="15.5" cy="8" r="7.5" fill="#F79E1B"/><path d="M12 2.3a7.5 7.5 0 010 11.4 7.5 7.5 0 000-11.4z" fill="#FF5F00"/></svg>
                  </span>
                </div>
              </div>

              {user && (
                <p className="text-xs text-gray-400">
                  חשבון: <span className="text-gray-600">{user.full_name}</span>
                </p>
              )}

              <Button onClick={handleProceed} disabled={isCreating} className="w-full h-12 text-base font-bold bg-[#27AE60] hover:bg-[#2ECC71] shadow-lg">
                {isCreating ? (
                  <><Loader2 className="w-5 h-5 animate-spin ml-2" />מכין את דף התשלום...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5 ml-2" />המשך לתשלום מאובטח</>
                )}
              </Button>

              <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />מאובטח בתקן PCI-DSS Level 1 · Tranzila
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center">{product.name} – ₪{amount}</p>
              <TranzilaIframe iframeUrl={iframeUrl} paymentId={paymentId} onPaymentDetected={confirmPayment} confirmedRef={confirmedRef} id="tranzila-sub-iframe" />
              <div className="text-center space-y-2">
                <Button variant="ghost" onClick={() => { setPaymentStep('summary'); reset(); }} className="text-gray-500 text-sm">
                  <ArrowRight className="w-4 h-4 ml-1" />חזרה לסיכום
                </Button>
                <div>
                  <button onClick={manualCheck} className="text-[11px] text-blue-500 hover:text-blue-700 underline">שילמתי אבל המסך לא התקדם? לחץ כאן</button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Tranzila</span>
                <span>•</span><span>PCI-DSS Level 1</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
