import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ArrowRight, ShieldCheck, X, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { auth, invokeFunction } from '@/api/supabaseClient';
import { trackBeginCheckout, trackSubscriptionPurchase } from '@/components/tracking/EventTracker';

/**
 * SubscriptionCheckoutDialog – popup checkout for plan subscriptions.
 * Props:
 *  open, onClose, product: { name, price, tierName, billingCycle, isRecurring, productId }
 *  onPaymentSuccess: (paymentId) => void
 */
export default function SubscriptionCheckoutDialog({ open, onClose, product, onPaymentSuccess }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [handshakeData, setHandshakeData] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary');
  const paymentConfirmedRef = useRef(false);

  useEffect(() => {
    if (open) {
      setPaymentStep('summary');
      setHandshakeData(null);
      setIframeLoading(false);
      paymentConfirmedRef.current = false;
      loadUser();
    }
  }, [open]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const u = await auth.me();
      setUser(u);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const amount = product?.price || 0;
  const isRecurring = product?.isRecurring;

  // Recurring config
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const recurStartDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;

  const confirmPayment = async (transactionId) => {
    if (paymentConfirmedRef.current || !handshakeData?.paymentId) return;
    paymentConfirmedRef.current = true;
    try {
      await invokeFunction('tranzilaConfirmPayment', {
        payment_id: handshakeData.paymentId,
        transaction_id: transactionId || '',
        tranzila_response: '000'
      });
      // מעקב המרה — מנוי
      trackSubscriptionPurchase({
        paymentId: handshakeData.paymentId,
        transaction_id: transactionId || '',
        product_name: product?.name || '',
        tier_name: product?.tierName || '',
        billing_cycle: product?.billingCycle || 'monthly',
        amount: amount,
        is_recurring: isRecurring,
        payment_method: 'tranzila'
      });
      toast.success('התשלום בוצע בהצלחה! 🎉');
      if (onPaymentSuccess) await onPaymentSuccess(handshakeData.paymentId);
      onClose();
    } catch (err) {
      console.error('Confirm payment error:', err);
      paymentConfirmedRef.current = false;
      toast.error('שגיאה באישור התשלום');
    }
  };

  // Payment detection: postMessage + iframe navigation + DB polling
  useEffect(() => {
    if (!open || paymentStep !== 'payment' || !handshakeData?.paymentId) return;
    const cleanups = [];

    const handleMessage = (event) => {
      if (paymentConfirmedRef.current || !event.data || typeof event.data !== 'string') return;
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.Response === '000' || parsed.Response === 0) {
          confirmPayment(parsed.ConfirmationCode || '');
        }
      } catch (_) {
        if (event.data.includes('Response=000')) {
          const params = new URLSearchParams(event.data);
          confirmPayment(params.get('ConfirmationCode') || '');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    cleanups.push(() => window.removeEventListener('message', handleMessage));

    const iframe = document.getElementById('tranzila-sub-iframe');
    if (iframe) {
      let loadCount = 0;
      const handleLoad = () => {
        loadCount++;
        if (loadCount <= 1 || paymentConfirmedRef.current) return;
        try {
          const url = iframe?.contentWindow?.location?.href || '';
          if (url.includes('Response=000')) {
            const p = new URLSearchParams(url.split('?')[1] || '');
            confirmPayment(p.get('ConfirmationCode') || '');
          }
        } catch (_) {
          confirmPayment('iframe-navigation');
        }
      };
      iframe.addEventListener('load', handleLoad);
      cleanups.push(() => iframe.removeEventListener('load', handleLoad));
    }

    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      if (paymentConfirmedRef.current) { clearInterval(pollInterval); return; }
      pollCount++;
      if (pollCount > 240) {
        clearInterval(pollInterval);
        toast.info('התשלום עדיין בעיבוד. נעדכן אותך במייל כשיאושר.');
        setPaymentStep('summary');
        setHandshakeData(null);
        return;
      }
      try {
        const pollRes = await invokeFunction('getPaymentStatus', { payment_id: handshakeData.paymentId });
        const payments = pollRes?.payments || [];
        if (payments?.length > 0 && payments[0].status === 'completed') {
          confirmPayment('polling');
          clearInterval(pollInterval);
        }
      } catch (_) {}
    }, 500);
    cleanups.push(() => clearInterval(pollInterval));

    return () => cleanups.forEach(fn => fn());
  }, [open, paymentStep, handshakeData]);

  const handleProceed = async () => {
    if (!product) return;
    setIframeLoading(true);
    trackBeginCheckout(product);
    try {
      const data = await invokeFunction('tranzilaCreatePayment', {
        product_type: 'plan',
        product_name: product.name,
        amount,
        product_id: product.productId || '',
      });
      if (!data?.success || !data?.supplier) {
        toast.error('שגיאה בהתחלת התשלום');
        setIframeLoading(false);
        return;
      }
      // Build iframe URL with all params
      const iframeParams = new URLSearchParams({
        supplier: data.supplier,
        sum: String(amount),
        currency: '1',
        cred_type: '1',
        tranmode: 'A',
        TranzilaPW: data.tranzilaPW || '',
        o_cred_oid: data.paymentId || '',
        notify_url_address: data.notifyUrl || '',
        lang: 'il',
        nologo: '1',
        trBgColor: 'FFFFFF',
        trTextColor: '1E3A5F',
        trButtonColor: '27AE60',
        buttonLabel: 'לתשלום',
      });
      if (user) {
        iframeParams.set('contact', user.full_name || '');
        iframeParams.set('email', user.email || '');
        iframeParams.set('pdesc', product.name || '');
      }
      if (isRecurring) {
        iframeParams.set('recur_payments', '998');
        iframeParams.set('recur_sum', String(amount));
        iframeParams.set('recur_transaction', '4_approved');
        iframeParams.set('recur_start_date', recurStartDate);
      }
      const iframeUrl = `https://direct.tranzila.com/${data.supplier}/newiframe.php?${iframeParams.toString()}`;
      setHandshakeData({ ...data, paymentId: data.paymentId, iframeUrl });
      setPaymentStep('payment');
      setIframeLoading(false);
    } catch (error) {
      console.error('Payment init error:', error);
      toast.error('שגיאה בהתחלת תהליך התשלום');
      setIframeLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0" dir="rtl">
        <DialogTitle className="sr-only">תשלום</DialogTitle>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {paymentStep === 'summary' ? 'סיכום הזמנה' : 'תשלום מאובטח'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-[#1E3A5F]" />
            </div>
          ) : !product ? (
            <div className="text-center py-8">
              <p className="text-gray-500">המוצר לא נמצא</p>
            </div>
          ) : paymentStep === 'summary' ? (
            <div className="space-y-4">
              {/* Product details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-bold text-base">{product.name}</h3>
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>ניתן לביטול בכל עת</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center border-t border-b py-3">
                <span className="font-bold text-base">סה"כ לתשלום</span>
                <span className="text-2xl font-black text-[#27AE60]">₪{amount}</span>
              </div>

              {/* Payment method */}
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

              <Button
                onClick={handleProceed}
                disabled={iframeLoading}
                className="w-full h-12 text-base font-bold bg-[#27AE60] hover:bg-[#2ECC71] shadow-lg"
              >
                {iframeLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin ml-2" />מכין את דף התשלום...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5 ml-2" />המשך לתשלום מאובטח</>
                )}
              </Button>

              <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                מאובטח בתקן PCI-DSS Level 1 · Tranzila
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center">
                {product.name} – ₪{amount}
              </p>

              {/* Iframe — loads Tranzila payment form directly */}
              <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ minHeight: '460px' }}>
                <iframe
                  id="tranzila-sub-iframe"
                  name="tranzila-sub-iframe"
                  src={handshakeData.iframeUrl}
                  allowpaymentrequest="true"
                  allow="payment"
                  style={{ width: '100%', height: '460px', border: 'none' }}
                  title="טופס תשלום מאובטח"
                />
              </div>

              <div className="text-center space-y-2">
                <Button variant="ghost" onClick={() => { setPaymentStep('summary'); setHandshakeData(null); }} className="text-gray-500 text-sm">
                  <ArrowRight className="w-4 h-4 ml-1" />
                  חזרה לסיכום
                </Button>
                <div>
                  <button
                    onClick={async () => {
                      try {
                        const manualRes = await invokeFunction('getPaymentStatus', { payment_id: handshakeData.paymentId });
                        const payments = manualRes?.payments || [];
                        if (payments?.length > 0 && payments[0].status === 'completed') {
                          confirmPayment('manual');
                        } else {
                          await confirmPayment('manual');
                        }
                      } catch (e) {
                        toast.error('לא הצלחנו לאמת את התשלום. נסה שוב בעוד רגע.');
                      }
                    }}
                    className="text-[11px] text-blue-500 hover:text-blue-700 underline"
                  >
                    שילמתי אבל המסך לא התקדם? לחץ כאן
                  </button>
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