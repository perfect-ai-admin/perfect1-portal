import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, X, ChevronRight, CreditCard, Smartphone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import WatermarkedLogo from './WatermarkedLogo';

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
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onSuccess({
      email: cardData.email,
      businessName: businessName
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-50/50 flex flex-col z-50 lg:items-center lg:justify-center" dir="rtl">
      {/* Modal Container */}
      <div className="w-full h-full lg:h-auto lg:max-h-[90vh] lg:max-w-2xl lg:rounded-2xl lg:shadow-2xl flex flex-col bg-white lg:bg-white">
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
              <label className="text-xs font-semibold text-gray-700">תעודת זהות</label>
              <Input
                value={cardData.idNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setCardData({...cardData, idNumber: val});
                }}
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors text-right"
                placeholder="מספר ת.ז (9 ספרות)"
                maxLength={9}
                inputMode="numeric"
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

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-sm px-1">בחר אמצעי תשלום</h3>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-3">
            
            <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === 'card' 
                ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <RadioGroupItem value="card" className="sr-only" />
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                paymentMethod === 'card' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
              }`}>
                {paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">כרטיס אשראי</div>
                <div className="text-xs text-gray-500">כל הכרטיסים נתמכים</div>
              </div>
            </label>

            <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === 'bit' 
                ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <RadioGroupItem value="bit" className="sr-only" />
               <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                paymentMethod === 'bit' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
              }`}>
                {paymentMethod === 'bit' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Bit / PayBox</div>
                <div className="text-xs text-gray-500">תשלום מהיר בנייד</div>
              </div>
            </label>

          </RadioGroup>
        </div>

        {/* Card Form */}
        <AnimatePresence>
          {paymentMethod === 'card' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 overflow-hidden"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">מספר כרטיס</label>
                  <div className="relative">
                    <Input
                      value={cardData.cardNumber}
                      onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors text-center font-mono tracking-wider pl-10"
                      dir="ltr"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">תוקף</label>
                    <Input
                      value={cardData.expiryDate}
                      onChange={(e) => handleCardChange('expiryDate', e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors text-center font-mono"
                      dir="ltr"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">CVV</label>
                    <Input
                      type="password"
                      value={cardData.cvv}
                      onChange={(e) => handleCardChange('cvv', e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors text-center font-mono"
                      dir="ltr"
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex-none p-4 bg-white border-t border-gray-100 space-y-3 lg:rounded-b-2xl">
        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg shadow-blue-200 text-base"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              מעבד תשלום...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              שלם וקבל את הלוגו - ₪{price}
            </span>
          )}
        </Button>

        <div className="text-center">
          <button 
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            חזור לעריכה
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
          <Lock className="w-3 h-3" />
          <span>SSL מאובטח</span>
          <span>•</span>
          <span>חשבונית מס מיידית</span>
        </div>
      </div>
      </div>
      </div>
      );
      }