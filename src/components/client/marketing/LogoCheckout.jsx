import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Download, X, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LogoCheckout({ businessName, logoUrl, onBack, onSuccess, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('נא להזין דוא״ל להורדה');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('דוא״ל לא תקין');
      return false;
    }
    return true;
  };

  const handleDownload = async () => {
    if (!validateEmail()) return;

    setError('');
    setIsProcessing(true);
    // Simulate download processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    onSuccess({
      email: email,
      businessName: businessName
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50" dir="rtl">
      {/* Header */}
      <div className="flex-none px-4 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 flex items-center justify-between relative shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -mr-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-none">סיום והורדה</h2>
            <p className="text-xs text-gray-500 mt-1">1 קרדיט הורדה</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-purple-200 shadow-sm flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            1 קרדיט
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        
        {/* Logo Preview */}
        {logoUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-center min-h-[240px]"
          >
            <img src={logoUrl} alt="Logo" className="max-h-[200px] max-w-full object-contain" />
          </motion.div>
        )}

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 text-lg">{businessName}</h3>
            <p className="text-sm text-gray-600">לוגו מקצועי להורדה</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">PNG איכות גבוהה</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">שימוש מסחרי מלא</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">הורדה מידית לאימייל</span>
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">שלח אלי את הלוגו</h3>
            <p className="text-sm text-gray-500">הלוגו יישלח לאימייל זה מיד אחרי ההורדה</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">כתובת אימייל</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setError('');
                setEmail(e.target.value);
              }}
              className="bg-gray-50 border-gray-200 focus:bg-white transition-colors text-left"
              dir="ltr"
              placeholder="email@example.com"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 text-sm font-bold">✓</div>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">קרדיט הורדה אחד יחוסר מחשבונך</p>
            <p className="text-xs opacity-85">הלוגו אינו יכול להיות בשימוש מסחרי ללא הורדה חוקית</p>
          </div>
        </div>

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
      <div className="flex-none p-4 bg-white border-t border-gray-100 space-y-3">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2 font-medium"
          >
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        
        <Button
          onClick={handleDownload}
          disabled={isProcessing}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg shadow-purple-100 text-base"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              מעבד הורדה...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              הוריד עכשיו
            </span>
          )}
        </Button>
        
        <div className="text-center">
          <button 
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← חזור לתצוגה
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
          <Check className="w-3 h-3" />
          <span>קרדיט מדויק</span>
          <span>•</span>
          <span>הורדה מיידית</span>
        </div>
      </div>
    </div>
  );
}