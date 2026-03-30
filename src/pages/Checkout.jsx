import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowRight, ShieldCheck, Check, CreditCard, CheckCircle, Home } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { auth } from '@/api/supabaseClient';
import { trackBeginCheckout, trackSubscriptionPurchase, trackPurchase } from '@/components/tracking/EventTracker';
import useTranzilaPayment from '@/components/checkout/useTranzilaPayment';
import TranzilaIframe from '@/components/checkout/TranzilaIframe';

const SUBSCRIPTION_TIERS = {
  Free: { name: 'Free', title: 'התחלה חכמה', price: 0 },
  Basic: { name: 'Basic', title: 'התקדמות יציבה', price: 59 },
  Pro: { name: 'Pro', title: 'שליטה וצמיחה', price: 149 },
  Elite: { name: 'Elite', title: 'מערכת שעובדת בשבילך', price: 349 },
};

let cachedUser = null;

export default function Checkout() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);

  const productType = urlParams.get('type');
  const productId = urlParams.get('id');
  const tierName = urlParams.get('tier');
  const priceParam = urlParams.get('price');
  const existingPaymentId = urlParams.get('payment_id');
  const billingCycle = urlParams.get('cycle') || 'monthly';
  const isYearly = billingCycle === 'yearly';

  const [user, setUser] = useState(cachedUser);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState('summary');

  const { iframeUrl, paymentId, isCreating, createPayment, confirmPayment, manualCheck, reset, confirmedRef } = useTranzilaPayment({
    onSuccess: async (pid) => {
      const isRecurring = product?.isRecurring;
      const trackFn = isRecurring ? trackSubscriptionPurchase : trackPurchase;
      trackFn({
        paymentId: pid,
        product_name: product?.name || '',
        tier_name: product?.tierName || '',
        billing_cycle: product?.billingCycle || 'monthly',
        amount: product?.price || 0,
        is_recurring: isRecurring,
        payment_method: 'tranzila'
      });
      toast.success('התשלום בוצע בהצלחה! 🎉');
      setPaymentStep('success');
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }, 300);
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (cachedUser) {
          setUser(cachedUser);
        } else {
          const u = await auth.me();
          cachedUser = u;
          setUser(u);
        }

        if (tierName && SUBSCRIPTION_TIERS[tierName]) {
          const tier = SUBSCRIPTION_TIERS[tierName];
          const finalPrice = priceParam ? Number(priceParam) : (isYearly ? Math.round(tier.price * 0.83) * 12 : tier.price);
          setProduct({
            name: `מנוי ${tier.title}`,
            description: isYearly ? `מסלול ${tier.name} – חיוב שנתי` : `מסלול ${tier.name} – חיוב חודשי אוטומטי`,
            price: finalPrice,
            tierName: tier.name,
            isRecurring: !isYearly,
            billingCycle,
          });
        } else if (productType === 'cart' && existingPaymentId) {
          const productName = urlParams.get('name') || 'עגלת קניות';
          const cartPrice = priceParam ? Number(priceParam) : 0;
          setProduct({
            name: productName,
            description: '',
            price: cartPrice,
            isRecurring: false,
            billingCycle: 'one-time',
          });
        } else if (productType === 'plan' && productId) {
          // Future: load plan from DB
        }
      } catch (error) {
        toast.error('שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleProceedToPayment = async () => {
    if (!product) return;
    trackBeginCheckout(product);

    const amount = product.price;
    const isRecurring = product.isRecurring;

    // Build extra iframe params
    const iframeParams = {};
    if (isRecurring) {
      const d = new Date();
      const n = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      iframeParams.recur_payments = '998';
      iframeParams.recur_sum = String(amount);
      iframeParams.recur_transaction = '4_approved';
      iframeParams.recur_start_date = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    }

    const result = await createPayment({
      product_type: productType === 'cart' ? 'cart' : 'plan',
      product_name: product.name,
      amount,
      product_id: productId || '',
      user,
      iframeParams,
    });
    if (result) setPaymentStep('payment');
  };

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
          <Button onClick={() => navigate(-1)}><ArrowRight className="w-4 h-4 ml-2" />חזרה</Button>
        </div>
      </div>
    );
  }

  const amount = product.price;
  const isRecurring = product.isRecurring;

  return (
    <>
      <Helmet>
        <title>תשלום - Perfect Biz AI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4" dir="rtl">
        <div className="max-w-xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-gray-600 hover:text-gray-900">
            <ArrowRight className="w-4 h-4 ml-1" />חזרה
          </Button>

          {paymentStep === 'summary' && (
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#1E3A5F] to-[#2C5282]" />
              <CardContent className="p-6 space-y-5">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">סיכום הזמנה</h1>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  {product.description && <p className="text-gray-600 text-sm">{product.description}</p>}
                  {isRecurring ? (
                    <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                      <CreditCard className="w-4 h-4" /><span>חיוב חודשי אוטומטי – ניתן לביטול בכל עת</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <Check className="w-4 h-4" /><span>תשלום חד-פעמי · ללא מנוי · ללא התחייבות</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>{isRecurring ? 'חיוב חודשי' : 'סכום'}</span>
                    <span className="font-semibold text-gray-900">₪{amount}</span>
                  </div>
                  {isRecurring && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>תדירות</span><span>חודשי – עד לביטול</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">סה"כ {isRecurring ? 'לחודש' : 'לתשלום'}</span>
                    <span className="text-2xl font-black text-[#27AE60]">₪{amount}</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{isRecurring ? 'חיוב חוזר – כרטיס אשראי בלבד' : 'תשלום – כרטיס אשראי'}</span>
                  </div>
                </div>

                {user && (
                  <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                    <span>חשבון: </span>
                    <span className="font-medium text-gray-700">{user.full_name} ({user.email})</span>
                  </div>
                )}

                <Button onClick={handleProceedToPayment} disabled={isCreating} className="w-full h-14 text-lg font-bold bg-[#27AE60] hover:bg-[#2ECC71] shadow-lg">
                  {isCreating ? (
                    <><Loader2 className="w-5 h-5 animate-spin ml-2" />מכין את דף התשלום...</>
                  ) : (
                    <><ShieldCheck className="w-5 h-5 ml-2" />המשך לתשלום מאובטח</>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /><span>תשלום מאובטח</span></div>
                  <span>•</span><span>PCI-DSS</span><span>•</span><span>הצפנת SSL</span>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentStep === 'success' && (
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#27AE60] to-[#2ECC71]" />
              <CardContent className="p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#27AE60] rounded-full opacity-10 scale-125 animate-ping" />
                    <CheckCircle className="w-20 h-20 text-[#27AE60] relative" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 התשלום בוצע בהצלחה!</h1>
                  <p className="text-gray-600 text-lg">{product?.name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-right">
                  <div className="flex justify-between">
                    <span className="text-gray-500">סכום</span>
                    <span className="font-bold text-[#27AE60]">₪{amount}</span>
                  </div>
                  {isRecurring && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">סוג חיוב</span>
                      <span className="font-medium">חודשי – עד לביטול</span>
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-900">✨ המסלול שלך עודכן! כל המודולים החדשים זמינים לך כעת.</p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <Button onClick={() => navigate('/MyProducts?payment=success')} className="bg-[#27AE60] hover:bg-[#2ECC71] h-12 text-lg w-full">
                    <Home className="w-5 h-5 ml-2" />לאזור האישי
                  </Button>
                  <Button onClick={() => navigate('/APP')} variant="outline" className="h-12">חזור לדשבורד</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentStep === 'payment' && (
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#27AE60] to-[#2ECC71]" />
              <CardContent className="p-4 sm:p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">הזינו פרטי תשלום</h2>
                  <p className="text-sm text-gray-500 mt-1">{product.name} – ₪{amount}{isRecurring ? '/חודש' : ''}</p>
                </div>

                <TranzilaIframe iframeUrl={iframeUrl} paymentId={paymentId} onPaymentDetected={confirmPayment} confirmedRef={confirmedRef} id="tranzila-iframe" />

                <div className="mt-4 text-center space-y-2">
                  <Button variant="ghost" onClick={() => { setPaymentStep('summary'); reset(); }} className="text-gray-500">
                    <ArrowRight className="w-4 h-4 ml-1" />חזרה לסיכום
                  </Button>
                  <div>
                    <button onClick={manualCheck} className="text-[11px] text-blue-500 hover:text-blue-700 underline">שילמתי אבל המסך לא התקדם? לחץ כאן</button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /><span>מאובטח ע״י Tranzila</span></div>
                  <span>•</span><span>PCI-DSS Level 1</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
