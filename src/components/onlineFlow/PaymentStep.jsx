import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PaymentStep({ formData, selectedPlan, onSuccess, onBack }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [handshakeData, setHandshakeData] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const paymentIdRef = useRef(null);

  const planPrices = {
    basic: 199,
    premium: 299
  };

  // Listen for Tranzila iframe postMessage
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data && typeof event.data === 'string' && paymentIdRef.current) {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.Response === '000') {
            await base44.functions.invoke('tranzilaConfirmPayment', {
              payment_id: paymentIdRef.current,
              transaction_id: parsed.ConfirmationCode || ''
            });
            toast.success('התשלום בוצע בהצלחה!');
            onSuccess();
          }
        } catch (e) {
          if (event.data.includes('Response=000')) {
            const params = new URLSearchParams(event.data);
            await base44.functions.invoke('tranzilaConfirmPayment', {
              payment_id: paymentIdRef.current,
              transaction_id: params.get('ConfirmationCode') || ''
            });
            toast.success('התשלום בוצע בהצלחה!');
            onSuccess();
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Create lead in database
      await base44.entities.Lead.create({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        profession: formData.profession || 'לא צוין',
        category: 'osek_patur',
        source_page: `דף נחיתה - פתיחת עוסק פטור אונליין - ${selectedPlan.name}`,
        interaction_type: 'form',
        status: 'new',
        consent: true
      });

      // Create payment + handshake via Tranzila
      const response = await base44.functions.invoke('tranzilaCreatePayment', {
        product_type: 'service',
        product_name: `פתיחת עוסק פטור - ${selectedPlan.name}`,
        amount: planPrices[selectedPlan.id],
        metadata: { plan: selectedPlan.id, customer_name: formData.fullName, customer_phone: formData.phone }
      });

      const data = response.data;
      if (!data.success || !data.thtk) {
        setError('שגיאה בהתחלת התשלום');
        setIsProcessing(false);
        return;
      }

      paymentIdRef.current = data.paymentId;
      setHandshakeData(data);
      setShowIframe(true);

      // Submit form after render
      setTimeout(() => {
        const form = document.getElementById('tranzila-osek-form');
        if (form) form.submit();
        setIsProcessing(false);
      }, 300);
    } catch (err) {
      console.error('Payment error:', err);
      setError('אירעה שגיאה בעיבוד התשלום. אנא נסה שוב.');
      setIsProcessing(false);
    }
  };

  const price = planPrices[selectedPlan.id];

  return (
    <div className="space-y-3">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-black text-[#1E3A5F] mb-0.5">
          תשלום מאובטח – פתיחת עוסק פטור אונליין
        </h2>
        <p className="text-xs text-gray-600">עוד רגע מסיימים, אנחנו מטפלים בכל השאר</p>
      </motion.div>

      {!showIframe ? (
        <>
          {/* Value Proposition */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed">
            <p className="font-semibold mb-1">אנחנו מטפלים בפתיחת התיק מול הרשויות.</p>
            <p>אין צורך בטפסים, אין התעסקות מול מס הכנסה או מע״מ.</p>
          </motion.div>

          {/* Trust Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 space-y-1.5 text-xs">
            <p className="font-semibold text-gray-800 mb-1.5">אמון וביטחון:</p>
            <div className="space-y-1">
              <p className="flex items-center gap-2"><span>🔒</span><span>תשלום מאובטח</span></p>
              <p className="flex items-center gap-2"><span>💳</span><span>נתוני אשראי אינם נשמרים באתר</span></p>
              <p className="flex items-center gap-2"><span>✔️</span><span>עומד בתקן אבטחה PCI</span></p>
            </div>
          </motion.div>

          {/* What Happens Next */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-cyan-50 border border-cyan-200 rounded-lg p-2.5 space-y-1.5 text-xs">
            <p className="font-semibold text-gray-800">מה קורה לאחר התשלום?</p>
            <div className="space-y-0.5 text-gray-700">
              <p>• נשלח אישור מיידי למייל</p>
              <p>• הפרטים נבדקים</p>
              <p>• פתיחת התיק מתבצעת תוך עד 48 שעות</p>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
              {error}
            </motion.div>
          )}

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2 pt-1">
            <button onClick={handlePayment} disabled={isProcessing}
              className="w-full h-12 font-black rounded-lg bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed">
              {isProcessing ? (<><Loader2 className="w-4 h-4 animate-spin" />מכין את דף התשלום...</>) : (<>🔐 שלם ₪{price}</>)}
            </button>
            <p className="text-xs font-bold text-center text-gray-700">תשלום חד־פעמי • ללא חיובים נוספים</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <button onClick={onBack} disabled={isProcessing}
              className="w-full px-3 h-10 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-xs text-gray-600 font-medium disabled:opacity-50">
              ← חזור
            </button>
          </motion.div>
        </>
      ) : (
        <>
          {/* Tranzila iFrame Payment */}
          <div className="text-center mb-2">
            <p className="text-sm text-gray-500">הזינו פרטי תשלום – ₪{price}</p>
          </div>

          {handshakeData && (
            <form
              id="tranzila-osek-form"
              action={`https://direct.tranzila.com/${handshakeData.supplier}/iframenew.php`}
              target="tranzila-osek-iframe"
              method="POST"
              style={{ display: 'none' }}
            >
              <input type="hidden" name="sum" value={price} />
              <input type="hidden" name="currency" value="1" />
              <input type="hidden" name="cred_type" value="1" />
              <input type="hidden" name="tranmode" value="A" />
              <input type="hidden" name="new_process" value="1" />
              <input type="hidden" name="thtk" value={handshakeData.thtk} />
              <input type="hidden" name="myid" value={handshakeData.paymentId || ''} />
              {handshakeData.notifyUrl && (
                <input type="hidden" name="notify_url_address" value={handshakeData.notifyUrl} />
              )}
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

              {/* Product details for invoice */}
              <input type="hidden" name="u71" value="1" />
              <input type="hidden" name="json_purchase_data" value={encodeURIComponent(JSON.stringify([{product_name: `פתיחת עוסק פטור - ${selectedPlan.name}`.substring(0, 118), product_quantity: 1, product_price: price}]))} />

              <input type="hidden" name="contact" value={formData.fullName || ''} />
              <input type="hidden" name="email" value={formData.email || ''} />
              <input type="hidden" name="pdesc" value={`פתיחת עוסק פטור - ${selectedPlan.name}`} />
            </form>
          )}

          <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ minHeight: '460px' }}>
            <iframe
              id="tranzila-osek-iframe"
              name="tranzila-osek-iframe"
              allowpaymentrequest="true"
              allow="payment"
              style={{ width: '100%', height: '460px', border: 'none' }}
              title="טופס תשלום מאובטח"
            />
          </div>

          <div className="text-center mt-2">
            <button onClick={() => { setShowIframe(false); setHandshakeData(null); }}
              className="text-sm text-gray-500 hover:text-gray-700">
              ← חזרה
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 mt-1">
            <span>🔒 Tranzila</span><span>•</span><span>PCI-DSS Level 1</span>
          </div>
        </>
      )}
    </div>
  );
}