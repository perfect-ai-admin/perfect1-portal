import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ArrowRight, ShieldCheck, Check, CreditCard, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * CheckoutDialog – popup checkout experience with Tranzila iFrame.
 *
 * Props:
 *  open        – boolean
 *  onClose     – () => void
 *  product     – { name, description, price, isRecurring, tierName?, billingCycle?, items? }
 */
export default function CheckoutDialog({ open, onClose, product: productProp, onPaymentSuccess }) {
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [handshakeData, setHandshakeData] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary');

  useEffect(() => {
    if (open) {
      setPaymentStep('summary');
      setHandshakeData(null);
      setIframeLoading(false);
      loadData();
    } else {
      setProduct(null);
      setLoading(true);
    }
  }, [open, productProp]);

  const paymentConfirmedRef = React.useRef(false);

  const confirmPayment = async (transactionId) => {
    if (paymentConfirmedRef.current || !handshakeData?.paymentId) return;
    paymentConfirmedRef.current = true;
    try {
      await base44.functions.invoke('tranzilaConfirmPayment', {
        payment_id: handshakeData.paymentId,
        transaction_id: transactionId || ''
      });
      toast.success('התשלום בוצע בהצלחה! 🎉');
      // Call onPaymentSuccess BEFORE onClose so the parent can handle the transition
      if (onPaymentSuccess) {
        await onPaymentSuccess(handshakeData.paymentId);
      } else {
        // Default: redirect to live domain MyProducts
        const isPreview = window.location.hostname.includes('base44') || window.location.hostname.includes('preview');
        if (isPreview) {
          window.location.href = 'https://one-pai.com/MyProducts?payment=success';
        }
      }
      onClose();
    } catch (err) {
      console.error('Confirm payment error:', err);
      paymentConfirmedRef.current = false;
      toast.error('שגיאה באישור התשלום');
    }
  };

  // Reset confirmed ref when dialog opens/closes
  useEffect(() => {
    if (!open) {
      paymentConfirmedRef.current = false;
    }
  }, [open]);

  // Listen for Tranzila iframe postMessage (success/fail)
  useEffect(() => {
    if (!open) return;

    const handleMessage = async (event) => {
      if (event.data && typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.Response === '000') {
            confirmPayment(parsed.ConfirmationCode || parsed.index || '');
          }
        } catch (e) {
          if (event.data.includes('Response=000')) {
            const params = new URLSearchParams(event.data);
            confirmPayment(params.get('ConfirmationCode') || '');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [open, handshakeData]);

  // Polling fallback 1: check iframe URL (may fail due to cross-origin)
  useEffect(() => {
    if (!open || paymentStep !== 'payment' || !handshakeData?.paymentId) return;

    const interval = setInterval(() => {
      if (paymentConfirmedRef.current) {
        clearInterval(interval);
        return;
      }
      try {
        const iframe = document.getElementById('tranzila-dialog-iframe');
        if (!iframe) return;
        const iframeUrl = iframe.contentWindow?.location?.href || '';
        if (iframeUrl.includes('Response=000')) {
          const urlParams = new URLSearchParams(iframeUrl.split('?')[1] || '');
          confirmPayment(urlParams.get('ConfirmationCode') || '');
          clearInterval(interval);
        }
      } catch (e) {
        // Cross-origin - expected, ignore
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [open, paymentStep, handshakeData]);

  // Polling fallback 2: check Payment entity status in DB (handles notify_url callback from Tranzila)
  useEffect(() => {
    if (!open || paymentStep !== 'payment' || !handshakeData?.paymentId) return;

    let attempts = 0;
    const maxAttempts = 40; // ~2 minutes

    const interval = setInterval(async () => {
      if (paymentConfirmedRef.current) {
        clearInterval(interval);
        return;
      }
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        return;
      }
      try {
        const payments = await base44.entities.Payment.filter({ id: handshakeData.paymentId });
        if (payments?.length > 0 && payments[0].status === 'completed') {
          // Payment was confirmed via notify_url webhook
          if (!paymentConfirmedRef.current) {
            paymentConfirmedRef.current = true;
            toast.success('התשלום בוצע בהצלחה! 🎉');
            if (onPaymentSuccess) {
              await onPaymentSuccess(handshakeData.paymentId);
            } else {
              const isPreview = window.location.hostname.includes('base44') || window.location.hostname.includes('preview');
              if (isPreview) {
                window.location.href = 'https://one-pai.com/MyProducts?payment=success';
              }
            }
            onClose();
          }
          clearInterval(interval);
        }
      } catch (e) {
        // Ignore errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [open, paymentStep, handshakeData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (productProp && typeof productProp === 'object') {
        setProduct(productProp);
      }
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const amount = product?.price || 0;
  const isRecurring = product?.isRecurring || false;

  const handleProceedToPayment = async () => {
    if (!product) return;
    setIframeLoading(true);
    try {
      // Use unified tranzilaCreatePayment - creates Payment record + handshake
      const response = await base44.functions.invoke('tranzilaCreatePayment', {
        product_type: product.product_type || 'one-time',
        product_name: product.name,
        amount: amount,
        product_id: product.product_id || product.id || '',
        items: product.items || undefined,
        metadata: product.metadata || undefined
      });
      const data = response.data;

      if (!data.success || !data.thtk) {
        toast.error('שגיאה בהתחלת התשלום');
        setIframeLoading(false);
        return;
      }

      console.log('Payment created:', data.paymentId, 'Handshake OK');

      setHandshakeData({ ...data, paymentId: data.paymentId });
      setPaymentStep('payment');

      // Submit form after React renders
      setTimeout(() => {
        const form = document.getElementById('tranzila-dialog-form');
        if (form) {
          console.log('Submitting form to Tranzila iFrame...');
          form.submit();
        }
        setIframeLoading(false);
      }, 300);
    } catch (error) {
      console.error('Payment init error:', error);
      toast.error('שגיאה בהתחלת תהליך התשלום');
      setIframeLoading(false);
    }
  };

  if (!open) return null;

  // Recurring: start date = next month (YYYY-MM-DD)
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const recurStartDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-lg w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0"
        dir="rtl"
      >
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

        {/* Content */}
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
            <SummaryStep
              product={product}
              amount={amount}
              isRecurring={isRecurring}
              user={user}
              iframeLoading={iframeLoading}
              onProceed={handleProceedToPayment}
            />
          ) : (
            <PaymentStep
              product={product}
              amount={amount}
              isRecurring={isRecurring}
              user={user}
              handshakeData={handshakeData}
              recurStartDate={recurStartDate}
              onBack={() => { setPaymentStep('summary'); setHandshakeData(null); }}
              onManualConfirm={async () => {
                // Manual check - user claims they paid
                try {
                  const payments = await base44.entities.Payment.filter({ id: handshakeData.paymentId });
                  if (payments?.length > 0 && payments[0].status === 'completed') {
                    paymentConfirmedRef.current = true;
                    toast.success('התשלום בוצע בהצלחה! 🎉');
                    if (onPaymentSuccess) await onPaymentSuccess(handshakeData.paymentId);
                    onClose();
                  } else {
                    // Try to confirm payment
                    await confirmPayment('manual');
                  }
                } catch (e) {
                  toast.error('לא הצלחנו לאמת את התשלום. נסה שוב בעוד רגע.');
                }
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryStep({ product, amount, isRecurring, user, iframeLoading, onProceed }) {
  return (
    <div className="space-y-4">
      {/* Product details */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <h3 className="font-bold text-base">{product.name}</h3>
        {product.description && (
          <p className="text-gray-600 text-sm">{product.description}</p>
        )}
        {isRecurring ? (
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>חיוב חודשי אוטומטי – ניתן לביטול בכל עת</span>
          </div>
        ) : product.billingCycle === 'yearly' ? (
          <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg">
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>תשלום שנתי חד-פעמי · חיסכון של 17%</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
            <Check className="w-4 h-4 shrink-0" />
            <span>תשלום חד-פעמי · ללא מנוי · ללא התחייבות</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex justify-between items-center border-t border-b py-3">
        <span className="font-bold text-base">
          סה"כ {isRecurring ? 'לחודש' : product.billingCycle === 'yearly' ? 'לשנה' : 'לתשלום'}
        </span>
        <span className="text-2xl font-black text-[#27AE60]">₪{amount}</span>
      </div>

      {/* Payment methods */}
      <div className="space-y-2">
        <span className="text-xs text-gray-400">אמצעי תשלום נתמכים:</span>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Credit Cards */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 object-contain" />
          </div>
          {/* Digital Wallets */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-4 object-contain" />
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" className="h-4 object-contain" />
          </div>
          <div className="flex items-center gap-1.5 bg-[#1DD05D]/5 px-2.5 py-1.5 rounded-lg border border-[#1DD05D]/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <rect width="24" height="24" rx="6" fill="#1DD05D"/>
              <path d="M7 12.5L10.5 16L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] font-bold text-[#1DD05D]">Bit</span>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <p className="text-xs text-gray-400">
          חשבון: <span className="text-gray-600">{user.full_name}</span>
        </p>
      )}

      {/* CTA */}
      <Button
        onClick={onProceed}
        disabled={iframeLoading}
        className="w-full h-12 text-base font-bold bg-[#27AE60] hover:bg-[#2ECC71] shadow-lg"
      >
        {iframeLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin ml-2" />
            מכין את דף התשלום...
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5 ml-2" />
            המשך לתשלום מאובטח
          </>
        )}
      </Button>

      <p className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        מאובטח בתקן PCI-DSS Level 1 · Tranzila
      </p>
    </div>
  );
}

function PaymentStep({ product, amount, isRecurring, user, handshakeData, recurStartDate, onBack, onManualConfirm }) {
  if (!handshakeData) return null;

  const isYearlySubscription = product?.billingCycle === 'yearly';

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 text-center">
        {product.name} – ₪{amount}{isRecurring ? '/חודש' : isYearlySubscription ? '/שנה' : ''}
      </p>

      {/* Payment method icons */}
      <div className="flex items-center justify-center gap-2 flex-wrap py-1">
        <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200 text-[11px] font-semibold text-[#1A1F71]">
          <svg viewBox="0 0 48 16" className="h-3.5" fill="none"><path d="M17.7 1.2l-3.5 13.5h-2.8L14.9 1.2h2.8zm14.3 8.7l1.5-4 .8 4h-2.3zm3.1 4.8h2.6L35.4 1.2h-2.4c-.5 0-1 .3-1.2.8l-4.2 12.7h2.9l.6-1.6h3.6l.4 1.6zm-7.4-4.4c0-3.5-4.8-3.7-4.8-5.2 0-.5.5-1 1.5-1.1.5-.1 1.9-.1 3.5.7l.6-2.9C27.3 1.3 25.9 1 24.2 1c-2.8 0-4.7 1.5-4.7 3.6 0 1.6 1.4 2.4 2.5 3 1.1.5 1.5.9 1.5 1.4 0 .7-.9 1.1-1.7 1.1-1.5 0-2.3-.4-3-.7l-.5 2.9c.7.3 1.9.6 3.2.6 2.9 0 4.8-1.5 4.8-3.6zM12 1.2L7.5 14.7H4.6L2.4 3.4c-.1-.5-.3-.7-.7-.9C.9 2.1 0 1.6 0 1.6l.1-.4h4.7c.6 0 1.1.4 1.3 1.1l1.2 6.1L10 1.2H12z" fill="#1A1F71"/></svg>
          VISA
        </span>
        <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200 text-[11px] font-semibold text-gray-700">
          <svg viewBox="0 0 24 16" className="h-3.5" fill="none"><circle cx="8.5" cy="8" r="7.5" fill="#EB001B"/><circle cx="15.5" cy="8" r="7.5" fill="#F79E1B"/><path d="M12 2.3a7.5 7.5 0 010 11.4 7.5 7.5 0 000-11.4z" fill="#FF5F00"/></svg>
        </span>
        <span className="inline-flex items-center gap-1 bg-[#1DD05D]/10 px-2 py-1 rounded-md border border-[#1DD05D]/30 text-[11px] font-bold text-[#1DD05D]">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none"><rect width="20" height="20" rx="5" fill="#1DD05D"/><path d="M6 10.5L9 13.5L14.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Bit
        </span>
        <span className="inline-flex items-center bg-white px-2 py-1 rounded-md border border-gray-200 text-[11px] font-semibold text-gray-700">
          <svg viewBox="0 0 50 20" className="h-3.5" fill="none"><path d="M25.3 3.5c-2.7 0-5 1.6-5 4.1 0 2.2 1.8 3.3 3.2 4 1.4.7 1.9 1.2 1.9 1.8 0 1-1.1 1.4-2.2 1.4-1.8 0-2.9-.5-3.7-.9l-.7 3c.8.4 2.4.7 4 .7 3.8 0 6.3-1.9 6.3-4.9 0-3.8-5.3-4-5.3-5.7 0-.5.5-.9 1.5-1 .5 0 1.9-.1 3.4.7l.6-2.8c-.8-.3-1.9-.6-3.2-.6z" fill="#172B85"/><text x="34" y="14" fill="#172B85" fontSize="8" fontWeight="bold">Pay</text></svg>
          Google Pay
        </span>
      </div>

      {/* 
        Hidden form that submits to Tranzila iFrame.
        CRITICAL: Parameters must match EXACTLY what the handshake was created with.
        Following Tranzila's official Base44 integration guide for recurring payments.
      */}
      <form
        id="tranzila-dialog-form"
        action={`https://direct.tranzila.com/${handshakeData.supplier}/iframenew.php`}
        target="tranzila-dialog-iframe"
        method="POST"
        style={{ display: 'none' }}
      >
        {/* Core transaction parameters */}
        <input type="hidden" name="sum" value={String(amount)} />
        <input type="hidden" name="currency" value="1" />
        <input type="hidden" name="cred_type" value="1" />
        <input type="hidden" name="tranmode" value="A" />
        <input type="hidden" name="new_process" value="1" />
        <input type="hidden" name="thtk" value={handshakeData.thtk} />
        
        {/* TZ field - let user fill their ID number */}
        <input type="hidden" name="myid" value="" />
        <input type="hidden" name="myid_lable" value="תעודת זהות" />
        
        {/* Pass payment ID via order reference field (returned in notify callback) */}
        <input type="hidden" name="o_cred_oid" value={handshakeData.paymentId || ''} />
        
        {/* Notify URL for server-to-server callback */}
        {handshakeData.notifyUrl && (
          <input type="hidden" name="notify_url_address" value={handshakeData.notifyUrl} />
        )}
        
        {/* Success/fail redirect URLs */}
        <input type="hidden" name="success_url_address" value="about:blank" />
        <input type="hidden" name="fail_url_address" value="about:blank" />

        {/* Display customization */}
        <input type="hidden" name="lang" value="il" />
        <input type="hidden" name="nologo" value="1" />
        <input type="hidden" name="trBgColor" value="FFFFFF" />
        <input type="hidden" name="trTextColor" value="1E3A5F" />
        <input type="hidden" name="trButtonColor" value="27AE60" />
        <input type="hidden" name="buttonLabel" value="לתשלום" />
        <input type="hidden" name="accessibility" value="2" />

        {/* Digital wallets */}
        <input type="hidden" name="google_pay" value="1" />
        <input type="hidden" name="ppnewwin" value="2" />
        <input type="hidden" name="bit_pay" value="1" />

        {/* Product details for invoice (one-time only) */}
        {!isRecurring && (() => {
          const purchaseItems = product.items
            ? product.items.map(item => ({
                product_name: (item.title || item.name || 'מוצר').substring(0, 118),
                product_quantity: 1,
                product_price: item.price || 0
              }))
            : [{
                product_name: (product.name || 'שירות').substring(0, 118),
                product_quantity: 1,
                product_price: amount
              }];
          const encoded = encodeURIComponent(JSON.stringify(purchaseItems));
          return (
            <>
              <input type="hidden" name="u71" value="1" />
              <input type="hidden" name="json_purchase_data" value={encoded} />
            </>
          );
        })()}

        {/* Recurring payments (monthly subscriptions) */}
        {isRecurring && (
          <>
            <input type="hidden" name="recur_sum" value={String(amount)} />
            <input type="hidden" name="recur_transaction" value="4" />
            <input type="hidden" name="recur_payments" value="12" />
            <input type="hidden" name="recur_start_date" value={recurStartDate} />
          </>
        )}

        {/* Customer info */}
        {user && (
          <>
            <input type="hidden" name="contact" value={user.full_name || ''} />
            <input type="hidden" name="email" value={user.email || ''} />
          </>
        )}
        <input type="hidden" name="pdesc" value={product.name || ''} />
      </form>

      {/* Tranzila iFrame */}
      <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ minHeight: '460px' }}>
        <iframe
          id="tranzila-dialog-iframe"
          name="tranzila-dialog-iframe"
          allowpaymentrequest="true"
          allow="payment"
          style={{ width: '100%', height: '460px', border: 'none' }}
          title="טופס תשלום מאובטח"
        />
      </div>

      {/* Back button + manual confirm */}
      <div className="text-center space-y-2">
        <Button variant="ghost" onClick={onBack} className="text-gray-500 text-sm">
          <ArrowRight className="w-4 h-4 ml-1" />
          חזרה לסיכום
        </Button>
        {onManualConfirm && (
          <div>
            <button onClick={onManualConfirm} className="text-[11px] text-blue-500 hover:text-blue-700 underline">
              שילמתי אבל המסך לא התקדם? לחץ כאן
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Tranzila</span>
        <span>•</span><span>PCI-DSS Level 1</span>
      </div>
    </div>
  );
}