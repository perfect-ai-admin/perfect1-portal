import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({
    fullName: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Product data (can be passed via props/query params)
  const product = {
    name: 'דף נחיתה ממותג',
    description: 'בעזרת AI ודיזיין מקצועי',
    price: 99,
    currency: 'ILS',
    features: [
      'לוגו PNG בעיצוב מקצועי',
      'לוגו SVD להדפסה',
      'יישוע צייור אישי'
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
      setError('נא להזין שם');
      return false;
    }
    if (!cardData.email.trim()) {
      setError('נא להזין דוא״ל');
      return false;
    }
    if (!cardData.cardNumber.replace(/\s/g, '')) {
      setError('נא להזין מספר כרטיס');
      return false;
    }
    if (!cardData.expiryDate) {
      setError('נא להזין תוקף כרטיס');
      return false;
    }
    if (!cardData.cvv) {
      setError('נא להזין CVV');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCardData()) return;

    setIsProcessing(true);
    // Stripe integration would go here
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    // Redirect to success page
    window.location.href = '/checkout-success';
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-200 py-4 px-4 sm:py-6 sticky top-0 bg-white z-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">סיום הרכישה</h1>
          <p className="text-sm text-gray-600 mt-1">בחר אמצעי תשלום ואשר את הרכישה</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 px-4 sm:py-8">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Product Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                🎨
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{product.name}</h2>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            </div>
            
            <ul className="space-y-1 mb-4 text-sm text-gray-700">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-gray-300">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600">סך הכל:</span>
                <span className="text-2xl font-bold text-gray-900">{product.price}₪</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">חד-פעמי, ללא חיוב נוסף</p>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="font-semibold text-gray-900 text-sm">בחר אמצעי תשלום</h3>
            
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center gap-3 p-3 border-2 border-blue-300 rounded-lg bg-blue-50 cursor-pointer">
                <RadioGroupItem value="card" id="card" className="w-5 h-5" />
                <label htmlFor="card" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">כרטיס אשראי</div>
                  <div className="text-xs text-gray-600">Visa, Mastercard, AmEx</div>
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="apple" id="apple" className="w-5 h-5" />
                <label htmlFor="apple" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Apple Pay</div>
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer opacity-50">
                <RadioGroupItem value="google" id="google" disabled className="w-5 h-5" />
                <label htmlFor="google" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Google Pay</div>
                  <div className="text-xs text-gray-600">בקרוב</div>
                </label>
              </div>
            </RadioGroup>
          </motion.div>

          {/* Card Details Form */}
          {paymentMethod === 'card' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">שם מלא</label>
                <Input
                  placeholder="דוד כהן"
                  value={cardData.fullName}
                  onChange={(e) => handleCardChange('fullName', e.target.value)}
                  className="h-10 text-right"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">דוא״ל</label>
                <Input
                  type="email"
                  placeholder="david@example.com"
                  value={cardData.email}
                  onChange={(e) => handleCardChange('email', e.target.value)}
                  className="h-10 text-right"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">מספר כרטיס</label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                  className="h-10 text-center font-mono text-sm"
                  maxLength="19"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">תוקף</label>
                  <Input
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={(e) => handleCardChange('expiryDate', e.target.value)}
                    className="h-10 text-center font-mono text-sm"
                    maxLength="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">CVV</label>
                  <Input
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => handleCardChange('cvv', e.target.value)}
                    className="h-10 text-center font-mono text-sm"
                    maxLength="3"
                    type="password"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
                >
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky bottom-0 bg-white py-4"
          >
            <Button
              onClick={handleSubmit}
              disabled={isProcessing || (paymentMethod === 'card' && !cardData.fullName)}
              className="w-full h-12 font-semibold text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                  מעבד...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  אישור ותשלום - {product.price}₪
                </span>
              )}
            </Button>
          </motion.div>

          {/* Trust Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-4"
          >
            <p className="text-xs text-gray-600 mb-2 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              התשלום מאובטח ומוצפן
            </p>
            <p className="text-xs text-gray-500">אין חיוב נוסף ללא אישור</p>
            <div className="flex gap-2 justify-center mt-3 text-gray-400">
              <a href="#" className="text-xs underline hover:text-gray-600">תנאי שימוש</a>
              <span>•</span>
              <a href="#" className="text-xs underline hover:text-gray-600">מדיניות פרטיות</a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}