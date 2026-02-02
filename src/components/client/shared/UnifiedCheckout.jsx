import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, X, ChevronRight, CreditCard, Smartphone, Building, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function UnifiedCheckout({ items = [], totalPrice = 0, onBack, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  const [cardData, setCardData] = useState({
    fullName: '',
    email: '',
    cardNumber: '',
    idNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            if (currentUser) {
                setCardData(prev => ({
                    ...prev,
                    fullName: currentUser.full_name || '',
                    email: currentUser.email || ''
                }));
            }
        } catch (e) {
            console.error(e);
        }
    };
    loadUser();
  }, []);

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
    // if (!cardData.idNumber.trim() || cardData.idNumber.length < 9) {
    //   setError('נא להזין תעודת זהות תקינה');
    //   return false;
    // }
    if (!cardData.email.trim()) {
      setError('נא להזין דוא״ל לקבלת הקבצים');
      return false;
    }
    // In a real implementation with direct card processing we would validate card fields.
    // However, since we are using createCheckoutSession which likely redirects to Stripe hosted page 
    // or handles it on backend, we might not need full card details here if we just redirect.
    // BUT, the user asked for the "clean page" experience which implies filling details HERE.
    // If the backend creates a Stripe session URL, we should redirect there.
    // If we want to stay on page, we need Stripe Elements or similar.
    // Based on `pages/Checkout.js`, it redirects to `response.data.url`.
    // So this form might be redundant if we redirect to Stripe?
    // User said: "clean payment experience... inside ClientDashboard".
    // If `createCheckoutSession` returns a URL, we have to redirect.
    // Maybe the user means the "Pre-checkout" summary page looks like the questionnaire end?
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCardData()) return;

    setIsProcessing(true);
    try {
        // Construct payload for cart checkout
        const payload = {
            product_type: 'cart',
            items: items.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price || 99,
                type: item.type,
                data: item.data
            }))
        };

        // We use the existing function
        const response = await base44.functions.invoke('createCheckoutSession', payload);

        if (response.data.success && response.data.url) {
             // Optimistic update for landing pages (if any)
             for (const item of items) {
                 if (item.type === 'landing_page' && item.data?.landingPageId) {
                     try {
                         await base44.functions.invoke('publishLandingPage', {
                             landingPageId: item.data.landingPageId,
                             action: 'markPaid'
                         });
                     } catch (err) {
                         console.error('Failed to mark as paid:', err);
                     }
                 }
             }
             
             window.location.href = response.data.url;
        } else {
            setError('שגיאה ביצירת ההזמנה');
            toast.error('שגיאה ביצירת ההזמנה');
        }
    } catch (error) {
        console.error(error);
        setError('שגיאה בעיבוד הבקשה');
        toast.error('שגיאה בעיבוד הבקשה');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Right Side - Summary & Items */}
        <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-8 border-l border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 -mr-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                    <ArrowRight className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">סיכום הזמנה</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {items.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                        {(item.preview_image || item.type === 'presentation') ? (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 relative">
                                <img 
                                    src={item.preview_image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop'} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover" 
                                />
                                {/* Watermark Overlay */}
                                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
                                    <div className="text-red-500/30 font-black text-xs rotate-[-45deg] whitespace-nowrap select-none border border-red-500/20 px-1 rounded">
                                        טיוטה
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-500">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-green-600 text-sm font-bold">₪{item.price || 99}</span>
                                <Check className="w-3 h-3 text-green-600" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-gray-600">
                    <span>סכום ביניים</span>
                    <span>₪{totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>מע״מ</span>
                    <span>כולל</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-900 pt-2">
                    <span>סה״כ לתשלום</span>
                    <span className="text-blue-600">₪{totalPrice}</span>
                </div>
            </div>
        </div>

        {/* Left Side - Details & Payment */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-white relative">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">פרטים ותשלום</h2>
                <p className="text-sm text-gray-500">השלם את הרכישה בבטחה</p>
            </div>

            {/* Personal Details */}
            <div className="space-y-4 mb-8">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">שם מלא</label>
                    <Input
                        value={cardData.fullName}
                        onChange={(e) => handleCardChange('fullName', e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        placeholder="ישראל ישראלי"
                    />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">אימייל לקבלה</label>
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

            {/* Payment Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm mb-1">תשלום מאובטח</h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            התשלום מתבצע באמצעות Stripe בתקן האבטחה המחמיר ביותר (PCI-DSS).
                            בלחיצה על "המשך לתשלום" תועבר לעמוד סליקה מאובטח.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-auto space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <X className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg shadow-blue-200 text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isProcessing ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            מעביר לתשלום...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            המשך לתשלום מאובטח
                        </span>
                    )}
                </Button>
                
                <div className="flex items-center justify-center gap-4 text-gray-400 grayscale opacity-70">
                    {/* Add card icons here if needed */}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}