import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, X, ChevronRight, Building, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WatermarkedLogo from './WatermarkedLogo';
import { invokeFunction } from '@/api/supabaseClient';
import { toast } from 'sonner';

export default function LogoCheckout({ businessName, slogan, logoUrl, onBack, onSuccess, onClose, price = 39 }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [handshakeData, setHandshakeData] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const paymentIdRef = useRef(null);

  const [cardData, setCardData] = useState({
    fullName: '',
    email: '',
  });

  // Listen for Tranzila iframe postMessage
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data && typeof event.data === 'string' && paymentIdRef.current) {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.Response === '000') {
            await invokeFunction('tranzilaConfirmPayment', {
              payment_id: paymentIdRef.current,
              transaction_id: parsed.ConfirmationCode || ''
            });
            toast.success('התשלום בוצע בהצלחה!');
            onSuccess({ email: cardData.email, businessName });
          }
        } catch (e) {
          if (event.data.includes('Response=000')) {
            const params = new URLSearchParams(event.data);
            await invokeFunction('tranzilaConfirmPayment', {
              payment_id: paymentIdRef.current,
              transaction_id: params.get('ConfirmationCode') || ''
            });
            toast.success('התשלום בוצע בהצלחה!');
            onSuccess({ email: cardData.email, businessName });
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [cardData.email]);

  const product = {
    name: 'לוגו מקצועי',
    description: 'לוגו איכות גבוהה לשימוש מלא',
    features: [
      'זכויות יוצרים מלאות לשימוש מסחרי',
      'רזולוציה גבוהה לכל שימוש',
      'משלוח מיידי לאימייל',
      'תמונה נקייה ללא סימן מים'
    ]
  };

  const handleCardChange = (field, value) => {
    setError('');
    setCardData({ ...cardData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!cardData.fullName.trim()) {
      setError('נא להזין שם מלא');
      return;
    }
    if (!cardData.email.trim()) {
      setError('נא להזין דוא״ל לקבלת הקבצים');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      const data = await invokeFunction('tranzilaCreatePayment', {
        product_type: 'one-time',
        product_name: `לוגו מקצועי - ${businessName}`,
        amount: price,
        metadata: { businessName, slogan, logoUrl }
      });

      if (!data?.success || !data?.thtk) {
        setError('שגיאה בהתחלת התשלום');
        setIsProcessing(false);
        return;
      }

      paymentIdRef.current = data.paymentId;
      setHandshakeData(data);
      setShowIframe(true);

      setTimeout(() => {
        const form = document.getElementById('tranzila-logo-form');
        if (form) form.submit();
        setIsProcessing(false);
      }, 300);
    } catch (err) {
      console.error('Payment error:', err);
      setError('שגיאה בהתחלת התשלום');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full lg:h-auto lg:max-h-[90vh] lg:rounded-2xl flex flex-col bg-white" dir="rtl">
      {/* Modal Container */}
      <div className="w-full h-full lg:h-auto flex flex-col bg-white">
        {/* Header */}
        <div className="flex-none px-4 py-4 bg-white border-b border-gray-100 flex items-center justify-between relative shadow-sm lg:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 -mr-2 text-gray-400 hover:text-gray-700 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-none">סיום והורדה</h2>
              <p className="text-xs text-gray-500 mt-1">מאובטח בסטנדרט PCI-DSS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-blue-200 shadow-sm">
              ₪{price}
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="סגור"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 lg:max-h-[calc(90vh-200px)]">
        
        {/* Logo Preview */}
        {logoUrl && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center min-h-[180px] md:min-h-[220px]">
            <WatermarkedLogo 
              src={logoUrl} 
              alt="Logo" 
              businessName={businessName}
              slogan={slogan}
              className="max-h-[150px] md:max-h-[180px] max-w-full object-contain"
            />
          </div>
        )}

        {/* Product Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
              <p className="text-sm text-gray-500">עבור: <span className="font-semibold text-gray-900">{businessName}</span></p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            {product.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {!showIframe ? (
          <>
            {/* Personal Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">פרטים לחשבונית</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">שם מלא</label>
                  <Input
                    value={cardData.fullName}
                    onChange={(e) => handleCardChange('fullName', e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors text-right"
                    placeholder="ישראל ישראלי"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">אימייל לקבלה</label>
                  <Input
                    type="email"
                    value={cardData.email}
                    onChange={(e) => handleCardChange('email', e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors text-left"
                    dir="ltr"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </>
        ) : (
          <>
            {/* Tranzila iFrame */}
            <div className="text-center mb-2">
              <p className="text-sm text-gray-500">הזינו פרטי תשלום – ₪{price}</p>
            </div>

            {handshakeData && (
              <form
                id="tranzila-logo-form"
                action={`https://direct.tranzila.com/${handshakeData.supplier}/iframenew.php`}
                target="tranzila-logo-iframe"
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
                <input type="hidden" name="json_purchase_data" value={encodeURIComponent(JSON.stringify([{product_name: `לוגו מקצועי - ${businessName}`.substring(0, 118), product_quantity: 1, product_price: price}]))} />

                <input type="hidden" name="contact" value={cardData.fullName || ''} />
                <input type="hidden" name="email" value={cardData.email || ''} />
                <input type="hidden" name="pdesc" value={`לוגו מקצועי - ${businessName}`} />
              </form>
            )}

            <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ minHeight: '460px' }}>
              <iframe
                id="tranzila-logo-iframe"
                name="tranzila-logo-iframe"
                allowpaymentrequest="true"
                allow="payment"
                style={{ width: '100%', height: '460px', border: 'none' }}
                title="טופס תשלום מאובטח"
              />
            </div>
          </>
        )}
        </div>

        {/* Footer Actions */}
        <div className="flex-none p-4 bg-white border-t border-gray-100 space-y-3 lg:rounded-b-2xl">
          {!showIframe ? (
            <>
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full h-12 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white rounded-xl font-bold shadow-lg text-base"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    מכין את דף התשלום...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    המשך לתשלום מאובטח - ₪{price}
                  </span>
                )}
              </Button>

              <div className="text-center">
                <button onClick={onBack}
                  className="text-sm text-gray-500 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  חזור לעריכה
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <button onClick={() => { setShowIframe(false); setHandshakeData(null); }}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 mx-auto">
                <ArrowRight className="w-4 h-4" />
                חזרה לסיכום
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <Lock className="w-3 h-3" />
            <span>מאובטח ע״י Tranzila</span>
            <span>•</span>
            <span>PCI-DSS Level 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}