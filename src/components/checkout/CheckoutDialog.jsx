import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ArrowRight, ShieldCheck, Check, CreditCard, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * CheckoutDialog – popup checkout experience.
 *
 * Props:
 *  open        – boolean
 *  onClose     – () => void
 *  product     – { name, description, price, isRecurring, tierName?, billingCycle?, items? }
 */
export default function CheckoutDialog({ open, onClose, product: productProp }) {
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [handshakeData, setHandshakeData] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary');

  // Reset state when dialog opens/closes
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

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // If productProp is a tier name string
      if (typeof productProp === 'string' && SUBSCRIPTION_TIERS[productProp]) {
        const tier = SUBSCRIPTION_TIERS[productProp];
        setProduct({
          name: `מנוי ${tier.title}`,
          description: `מסלול ${tier.name} – חיוב חודשי אוטומטי`,
          price: tier.price,
          tierName: tier.name,
          isRecurring: true,
        });
      } else if (productProp && typeof productProp === 'object') {
        setProduct(productProp);
      }
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!product) return;
    setIframeLoading(true);
    try {
      const response = await base44.functions.invoke('tranzilaCreateHandshake', { sum: product.price });
      const data = response.data;

      if (!data.thtk) {
        toast.error('שגיאה בהתחלת התשלום');
        setIframeLoading(false);
        return;
      }

      setHandshakeData(data);
      setPaymentStep('payment');

      setTimeout(() => {
        const form = document.getElementById('tranzila-dialog-form');
        if (form) form.submit();
        setIframeLoading(false);
      }, 200);
    } catch (error) {
      console.error('Payment init error:', error);
      toast.error('שגיאה בהתחלת תהליך התשלום');
      setIframeLoading(false);
    }
  };

  if (!open) return null;

  const amount = product?.price || 0;
  const isRecurring = product?.isRecurring || false;

  // Recurring config
  const recurTransaction = 4;
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const recurStartDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;

  // Build purchase data for invoice
  const buildPurchaseData = () => {
    if (isRecurring || !product) return null;
    if (product.isCart && product.items) {
      return product.items.map(item => ({
        product_name: item.title || item.name || 'מוצר',
        product_quantity: 1,
        product_price: item.price || 0,
      }));
    }
    return [{
      product_name: (product.name || 'שירות').substring(0, 118),
      product_quantity: 1,
      product_price: amount,
    }];
  };

  const purchaseData = buildPurchaseData();
  const encodedPurchaseData = purchaseData
    ? encodeURIComponent(JSON.stringify(purchaseData))
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-lg w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0"
        dir="rtl"
      >
        <DialogTitle className="sr-only">תשלום</DialogTitle>

        {/* Header bar */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {paymentStep === 'summary' ? 'סיכום הזמנה' : 'תשלום מאובטח'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
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
              recurTransaction={recurTransaction}
              recurStartDate={recurStartDate}
              encodedPurchaseData={encodedPurchaseData}
              onBack={() => { setPaymentStep('summary'); setHandshakeData(null); }}
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
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
            <Check className="w-4 h-4 shrink-0" />
            <span>תשלום חד-פעמי · ללא מנוי · ללא התחייבות</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex justify-between items-center border-t border-b py-3">
        <span className="font-bold text-base">סה"כ {isRecurring ? 'לחודש' : 'לתשלום'}</span>
        <span className="text-2xl font-black text-[#27AE60]">₪{amount}</span>
      </div>

      {/* Payment methods for one-time */}
      {!isRecurring && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">אמצעי תשלום:</span>
          {['כרטיס אשראי', 'Google Pay', 'PayPal', 'Bit'].map(m => (
            <span key={m} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{m}</span>
          ))}
        </div>
      )}

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

      {/* Trust */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />מאובטח</span>
        <span>•</span><span>PCI-DSS</span><span>•</span><span>SSL</span>
      </div>
    </div>
  );
}

function PaymentStep({ product, amount, isRecurring, user, handshakeData, recurTransaction, recurStartDate, encodedPurchaseData, onBack }) {
  if (!handshakeData) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 text-center">
        {product.name} – ₪{amount}{isRecurring ? '/חודש' : ''}
      </p>

      {/* Hidden form */}
      <form
        id="tranzila-dialog-form"
        action={`https://direct.tranzila.com/${handshakeData.supplier}/iframenew.php`}
        target="tranzila-dialog-iframe"
        method="POST"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="sum" value={amount} />
        <input type="hidden" name="currency" value="1" />
        <input type="hidden" name="cred_type" value="1" />
        <input type="hidden" name="tranmode" value="A" />
        <input type="hidden" name="new_process" value="1" />
        <input type="hidden" name="thtk" value={handshakeData.thtk} />

        <input type="hidden" name="lang" value="il" />
        <input type="hidden" name="nologo" value="1" />
        <input type="hidden" name="trBgColor" value="FFFFFF" />
        <input type="hidden" name="trTextColor" value="1E3A5F" />
        <input type="hidden" name="trButtonColor" value="27AE60" />
        <input type="hidden" name="buttonLabel" value={isRecurring ? 'הפעל מנוי' : 'שלם עכשיו'} />
        <input type="hidden" name="accessibility" value="2" />

        {/* Digital wallets – one-time only */}
        {!isRecurring && (
          <>
            <input type="hidden" name="google_pay" value="1" />
            <input type="hidden" name="ppnewwin" value="2" />
            <input type="hidden" name="bit_pay" value="1" />
          </>
        )}

        {/* Product details for invoice */}
        {!isRecurring && encodedPurchaseData && (
          <>
            <input type="hidden" name="u71" value="1" />
            <input type="hidden" name="json_purchase_data" value={encodedPurchaseData} />
          </>
        )}

        {/* Recurring */}
        {isRecurring && (
          <>
            <input type="hidden" name="recur_sum" value={amount} />
            <input type="hidden" name="recur_transaction" value={`${recurTransaction}_approved`} />
            <input type="hidden" name="recur_start_date" value={recurStartDate} />
          </>
        )}

        {/* Customer */}
        {user && (
          <>
            <input type="hidden" name="contact" value={user.full_name || ''} />
            <input type="hidden" name="email" value={user.email || ''} />
            <input type="hidden" name="pdesc" value={product.name} />
          </>
        )}
      </form>

      {/* iframe */}
      <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ minHeight: '460px' }}>
        <iframe
          id="tranzila-dialog-iframe"
          name="tranzila-dialog-iframe"
          allowpaymentrequest="true"
          style={{ width: '100%', height: '460px', border: 'none' }}
          title="טופס תשלום מאובטח"
        />
      </div>

      {/* Back */}
      <div className="text-center">
        <Button variant="ghost" onClick={onBack} className="text-gray-500 text-sm">
          <ArrowRight className="w-4 h-4 ml-1" />
          חזרה לסיכום
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Tranzila</span>
        <span>•</span><span>PCI-DSS Level 1</span>
      </div>
    </div>
  );
}