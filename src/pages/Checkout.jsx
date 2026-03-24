import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowRight, ShieldCheck, Check, CreditCard, CheckCircle, Home } from 'lucide-react';
import { toast } from 'sonner';
import canvas from 'canvas-confetti';

/**
 * Checkout page – dedicated to SUBSCRIPTION / RECURRING payments only.
 * For one-time products (logo, landing page, etc.), use CheckoutDialog instead.
 */
const SUBSCRIPTION_TIERS = {
  Free: { name: 'Free', title: 'התחלה חכמה', price: 0 },
  Basic: { name: 'Basic', title: 'התקדמות יציבה', price: 59 },
  Pro: { name: 'Pro', title: 'שליטה וצמיחה', price: 149 },
  Elite: { name: 'Elite', title: 'מערכת שעובדת בשבילך', price: 349 },
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(window.location.search);

  const productType = urlParams.get('type'); // 'plan'
  const productId = urlParams.get('id');
  const tierName = urlParams.get('tier');
  const priceParam = urlParams.get('price');

  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [handshakeData, setHandshakeData] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary'); // 'summary' | 'payment'

  useEffect(() => {
    loadData();
  }, []);

  const billingCycle = urlParams.get('cycle') || 'monthly';
  const isYearly = billingCycle === 'yearly';

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (tierName && SUBSCRIPTION_TIERS[tierName]) {
        const tier = SUBSCRIPTION_TIERS[tierName];
        const finalPrice = priceParam ? Number(priceParam) : (isYearly ? Math.round(tier.price * 0.83) * 12 : tier.price);
        setProduct({
          name: `מנוי ${tier.title}`,
          description: isYearly 
            ? `מסלול ${tier.name} – חיוב שנתי` 
            : `מסלול ${tier.name} – חיוב חודשי אוטומטי`,
          price: finalPrice,
          tierName: tier.name,
          isRecurring: !isYearly, // monthly = recurring, yearly = one-time annual
          billingCycle,
        });
      } else if (productType === 'plan' && productId) {
        const plans = await base44.entities.Plan.filter({ id: productId });
        if (plans.length > 0) {
          const plan = plans[0];
          setProduct({
            ...plan,
            price: priceParam ? Number(priceParam) : plan.price,
            isRecurring: !isYearly,
            billingCycle,
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    setIframeLoading(true);
    try {
      const amt = product.price;
      const response = await base44.functions.invoke('tranzilaCreatePayment', {
        product_type: 'plan',
        product_name: product.name,
        amount: amt,
        product_id: productId || '',
      });
      const data = response.data;

      if (!data.success || !data.thtk) {
        toast.error('שגיאה בהתחלת התשלום');
        setIframeLoading(false);
        return;
      }

      setHandshakeData({ ...data, paymentId: data.paymentId });
      setPaymentStep('payment');

      setTimeout(() => {
        const form = document.getElementById('tranzila-form');
        if (form) {
          form.submit();
        }
        setIframeLoading(false);
      }, 200);
    } catch (error) {
      console.error('Payment init error:', error);
      toast.error('שגיאה בהתחלת תהליך התשלום');
      setIframeLoading(false);
    }
  };

  // Listen for Tranzila iframe postMessage + redirect detection
  useEffect(() => {
    if (!handshakeData?.paymentId) return;

    const confirmAndRedirect = async (confirmCode) => {
      try {
        await base44.functions.invoke('tranzilaConfirmPayment', {
          payment_id: handshakeData.paymentId,
          transaction_id: confirmCode || ''
        });
      } catch (err) {
        console.error('Confirm payment error:', err);
      }
      navigate(`/CheckoutSuccess?payment_id=${handshakeData.paymentId}`);
    };

    const handleMessage = async (event) => {
      // Skip non-string messages
      if (!event.data || typeof event.data !== 'string') return;
      
      const raw = event.data;
      console.log('[Tranzila postMessage]', raw.substring(0, 200));

      // Try JSON format
      try {
        const parsed = JSON.parse(raw);
        if (parsed.Response === '000' || parsed.Response === 0 || parsed.response === '000') {
          await confirmAndRedirect(parsed.ConfirmationCode || parsed.confirmationcode || '');
          return;
        }
      } catch (_) { /* not JSON */ }

      // Try query string format
      if (raw.includes('Response=000') || raw.includes('response=000')) {
        const params = new URLSearchParams(raw);
        await confirmAndRedirect(params.get('ConfirmationCode') || params.get('confirmationcode') || '');
        return;
      }

      // Try URL format (Tranzila may redirect the iframe to a URL with query params)
      if (raw.includes('?') && (raw.includes('Response=000') || raw.includes('response=000'))) {
        const qs = raw.split('?')[1];
        const params = new URLSearchParams(qs);
        await confirmAndRedirect(params.get('ConfirmationCode') || params.get('confirmationcode') || '');
        return;
      }
    };

    // Also poll iframe URL for redirect-based confirmation
    let pollInterval = null;
    try {
      pollInterval = setInterval(() => {
        try {
          const iframe = document.getElementById('tranzila-iframe');
          if (!iframe) return;
          const iframeUrl = iframe.contentWindow?.location?.href;
          if (iframeUrl && iframeUrl.includes('Response=000')) {
            clearInterval(pollInterval);
            const qs = iframeUrl.split('?')[1];
            const params = new URLSearchParams(qs || '');
            confirmAndRedirect(params.get('ConfirmationCode') || '');
          }
        } catch (_) { /* cross-origin - expected */ }
      }, 1000);
    } catch (_) {}

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [handshakeData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">המוצר לא נמצא</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowRight className="w-4 h-4 ml-2" />
            חזרה
          </Button>
        </div>
      </div>
    );
  }

  const amount = product.price;
  const isRecurring = product.isRecurring;

  // Recurring config: monthly, unlimited
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const recurStartDate = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;

  // No purchase data needed for subscriptions (handled by recurring params)

  return (
    <>
      <Helmet>
        <title>תשלום - Perfect Biz AI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4" dir="rtl">
        <div className="max-w-xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            חזרה
          </Button>

          {paymentStep === 'summary' && (
            <>
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]" />
                <CardContent className="p-6 space-y-5">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">סיכום הזמנה</h1>
                  </div>

                  {/* Product details */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm">{product.description}</p>
                    )}

                    {isRecurring ? (
                      <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                        <CreditCard className="w-4 h-4" />
                        <span>חיוב חודשי אוטומטי – ניתן לביטול בכל עת</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                        <Check className="w-4 h-4" />
                        <span>תשלום חד-פעמי · ללא מנוי · ללא התחייבות</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>{isRecurring ? 'חיוב חודשי' : 'סכום'}</span>
                      <span className="font-semibold text-gray-900">₪{amount}</span>
                    </div>
                    {isRecurring && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>תדירות</span>
                        <span>חודשי – עד לביטול</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">סה"כ {isRecurring ? 'לחודש' : 'לתשלום'}</span>
                      <span className="text-2xl font-black text-[#27AE60]">₪{amount}</span>
                    </div>
                  </div>

                  {/* Payment method - credit card only for subscriptions */}
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span className="font-medium">
                        {isRecurring ? 'חיוב חוזר – כרטיס אשראי בלבד' : 'תשלום שנתי – כרטיס אשראי'}
                      </span>
                    </div>
                  </div>

                  {/* User info */}
                  {user && (
                    <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                      <span>חשבון: </span>
                      <span className="font-medium text-gray-700">{user.full_name} ({user.email})</span>
                    </div>
                  )}

                  {/* CTA */}
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={iframeLoading}
                    className="w-full h-14 text-lg font-bold bg-[#27AE60] hover:bg-[#2ECC71] shadow-lg"
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

                  {/* Trust signals */}
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>תשלום מאובטח</span>
                    </div>
                    <span>•</span>
                    <span>PCI-DSS</span>
                    <span>•</span>
                    <span>הצפנת SSL</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {paymentStep === 'payment' && handshakeData && (
            <>
              <Card className="shadow-lg border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#27AE60] to-[#2ECC71]" />
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">הזינו פרטי תשלום</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.name} – ₪{amount}{isRecurring ? '/חודש' : ''}
                    </p>
                  </div>

                  {/* Hidden form that posts to Tranzila iframe */}
                  <form
                    id="tranzila-form"
                    action={`https://direct.tranzila.com/${handshakeData.supplier}/iframenew.php`}
                    target="tranzila-iframe"
                    method="POST"
                    style={{ display: 'none' }}
                  >
                    {/* Core params */}
                    <input type="hidden" name="sum" value={amount} />
                    <input type="hidden" name="currency" value="1" />
                    <input type="hidden" name="cred_type" value="1" />
                    <input type="hidden" name="tranmode" value="A" />
                    <input type="hidden" name="new_process" value="1" />
                    <input type="hidden" name="thtk" value={handshakeData.thtk} />
                    <input type="hidden" name="myid" value="" />
                    <input type="hidden" name="myid_lable" value="תעודת זהות" />
                    <input type="hidden" name="o_cred_oid" value={handshakeData.paymentId || ''} />
                    <input type="hidden" name="notify_url_address" value={handshakeData.notifyUrl} />
                    <input type="hidden" name="success_url_address" value="https://one-pai.com/MyProducts?payment=success" />
                    <input type="hidden" name="fail_url_address" value="https://one-pai.com/PricingPerfectBizAI?payment=failed" />

                    {/* Display */}
                    <input type="hidden" name="lang" value="il" />
                    <input type="hidden" name="nologo" value="1" />
                    <input type="hidden" name="trBgColor" value="FFFFFF" />
                    <input type="hidden" name="trTextColor" value="1E3A5F" />
                    <input type="hidden" name="trButtonColor" value="27AE60" />
                    <input type="hidden" name="buttonLabel" value="לתשלום" />
                    <input type="hidden" name="accessibility" value="2" />

                    {/* No digital wallets for subscription checkout - credit card only */}

                    {/* No invoice data for subscriptions */}

                    {/* Recurring payment params (subscriptions only) */}
                    {isRecurring && (
                      <>
                        <input type="hidden" name="recur_sum" value={amount} />
                        <input type="hidden" name="recur_transaction" value="4_approved" />
                        <input type="hidden" name="recur_start_date" value={recurStartDate} />
                      </>
                    )}

                    {/* Customer info */}
                    {user && (
                      <>
                        <input type="hidden" name="contact" value={user.full_name || ''} />
                        <input type="hidden" name="email" value={user.email || ''} />
                        <input type="hidden" name="pdesc" value={product.name} />
                      </>
                    )}
                  </form>

                  {/* Tranzila iframe */}
                  <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ minHeight: '500px' }}>
                    <iframe
                      id="tranzila-iframe"
                      name="tranzila-iframe"
                      allowpaymentrequest="true"
                      allow="payment"
                      style={{ width: '100%', height: '500px', border: 'none' }}
                      title="טופס תשלום מאובטח"
                    />
                  </div>

                  {/* Back to summary */}
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setPaymentStep('summary');
                        setHandshakeData(null);
                      }}
                      className="text-gray-500"
                    >
                      <ArrowRight className="w-4 h-4 ml-1" />
                      חזרה לסיכום
                    </Button>
                  </div>

                  {/* Trust */}
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>מאובטח ע״י Tranzila</span>
                    </div>
                    <span>•</span>
                    <span>PCI-DSS Level 1</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}