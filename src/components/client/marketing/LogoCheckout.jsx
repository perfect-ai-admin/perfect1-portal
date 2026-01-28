import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, X, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WatermarkedLogo from './WatermarkedLogo';
import { base44 } from '@/api/base44Client';

export default function LogoCheckout({ businessName, logoUrl, onBack, onSuccess, onClose, price = 99 }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({
    fullName: '',
    email: '',
    cardNumber: '',
    idNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleCardChange = (field, value) => {
    setError('');
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return;
    }
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
    }
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 3) return;
    }
    setCardData({ ...cardData, [field]: value });
  };

  const validateCardData = () => {
    if (!cardData.fullName.trim()) {
      setError('נא להזין שם מלא');
      return false;
    }
    if (!cardData.idNumber.trim() || cardData.idNumber.length < 9) {
      setError('נא להזין תעודת זהות תקינה');
      return false;
    }
    if (!cardData.email.trim()) {
      setError('נא להזין דוא״ל לקבלת הקבצים');
      return false;
    }
    if (paymentMethod === 'card') {
      if (!cardData.cardNumber.replace(/\s/g, '')) {
        setError('נא להזין מספר כרטיס');
        return false;
      }
      if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
        setError('נא להזין תוקף תקין');
        return false;
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        setError('נא להזין 3 ספרות בגב הכרטיס');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCardData()) return;

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call analytics
      await base44.analytics.track({
        eventName: 'logo_checkout_completed',
        properties: {
          business_name: businessName,
          payment_method: paymentMethod,
          amount: price
        }
      });

      onSuccess({
        email: cardData.email,
        businessName: businessName,
        paymentMethod: paymentMethod
      });
    } catch (err) {
      setError('אירעה שגיאה בעיבוד התשלום');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50" dir="rtl">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="w-full md:w-[520px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[95vh]"
      >
        {/* Header */}
        <div className="flex-none px-6 py-5 md:py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
          <div>
            <h2 className="text-2xl md:text-xl font-bold text-gray-900">סיום הזמנה</h2>
            <p className="text-xs text-gray-500 mt-1">מאובטח בסטנדרט PCI-DSS</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold">
              ₪{price}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="סגור"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Logo Preview */}
          {logoUrl && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-8 flex items-center justify-center min-h-[200px]">
              <WatermarkedLogo
                src={logoUrl}
                alt="Logo"
                className="max-h-[160px] max-w-full object-contain"
              />
            </div>
          )}

          {/* Business Info */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90 mb-2">הלוגו שלך לעסק:</p>
            <h3 className="text-2xl font-bold">{businessName}</h3>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
            {[
              'זכויות יוצרים מלאות לשימוש מסחרי',
              'רזולוציה גבוהה לכל שימוש',
              'משלוח מיידי לאימייל',
              'תמונה נקייה ללא סימן מים'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-base">פרטים לחשבונית</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">שם מלא</label>
                <Input
                  value={cardData.fullName}
                  onChange={(e) => handleCardChange('fullName', e.target.value)}
                  className="bg-white border-gray-200 text-right text-base"
                  placeholder="ישראל ישראלי"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">תעודת זהות</label>
                <Input
                  value={cardData.idNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setCardData({ ...cardData, idNumber: val });
                  }}
                  className="bg-white border-gray-200 text-right text-base"
                  placeholder="123456789"
                  maxLength={9}
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">אימייל לקבלה</label>
                <Input
                  type="email"
                  value={cardData.email}
                  onChange={(e) => handleCardChange('email', e.target.value)}
                  className="bg-white border-gray-200 text-left text-base"
                  dir="ltr"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-base">בחר אמצעי תשלום</h3>
            <div className="space-y-2">
              {[
                { id: 'card', label: 'כרטיס אשראי', desc: 'כל הכרטיסים נתמכים', icon: CreditCard },
                { id: 'bit', label: 'Bit / PayBox', desc: 'תשלום מהיר בנייד', icon: Smartphone }
              ].map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === method.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <Icon className="w-5 h-5 text-blue-600" />
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{method.label}</div>
                      <div className="text-xs text-gray-500">{method.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Form */}
          <AnimatePresence>
            {paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">מספר כרטיס</label>
                  <div className="relative">
                    <Input
                      value={cardData.cardNumber}
                      onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                      className="bg-white border-gray-200 text-center font-mono text-base pr-10"
                      dir="ltr"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">תוקף</label>
                    <Input
                      value={cardData.expiryDate}
                      onChange={(e) => handleCardChange('expiryDate', e.target.value)}
                      className="bg-white border-gray-200 text-center font-mono text-base"
                      dir="ltr"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">CVV</label>
                    <Input
                      type="password"
                      value={cardData.cvv}
                      onChange={(e) => handleCardChange('cvv', e.target.value)}
                      className="bg-white border-gray-200 text-center font-mono text-base"
                      dir="ltr"
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-none p-6 border-t border-gray-100 bg-white space-y-3 rounded-b-3xl">
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-200"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                מעבד תשלום...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <Lock className="w-4 h-4" />
                שלם וקבל את הלוגו
              </span>
            )}
          </Button>

          <button
            onClick={onBack}
            className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            חזור לעריכה
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-2">
            <Lock className="w-3 h-3" />
            <span>SSL מאובטח</span>
            <span>•</span>
            <span>חשבונית מס מיידית</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}