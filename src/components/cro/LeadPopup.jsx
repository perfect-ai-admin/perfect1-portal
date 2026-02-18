import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, Loader2, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function LeadPopup({ isOpen, onClose, sourcePage = 'Landing Page' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('נא למלא שם'); return; }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) { 
      setError('נא למלא מספר טלפון תקין'); return; 
    }

    setIsSubmitting(true);
    try {
      await base44.functions.invoke('submitLead', {
        name: name.trim(),
        phone: phone.trim(),
        source_page: sourcePage,
        status: 'new'
      });

      // GTM dataLayer push
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'lead_submit',
        lead_name: name.trim(),
        lead_phone: phone.trim(),
        lead_source: sourcePage
      });

      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
      setError('אירעה שגיאה, אנא נסה שוב');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] p-6 pb-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">
                  נחזור אליך תוך דקות
                </h3>
                <p className="text-white/80 text-sm">
                  השאר שם וטלפון ונציג יצור קשר
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 -mt-4">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">שם מלא</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="איך קוראים לך?"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 pr-11 rounded-xl border-2 border-gray-200 text-base font-medium focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/20 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">טלפון</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="050-1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-12 pr-11 rounded-xl border-2 border-gray-200 text-base font-medium focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/20 transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm font-medium text-center">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-black rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin ml-2" /> שולח...</>
                    ) : (
                      'שלחו לי פרטים →'
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    <span>ללא התחייבות • שיחה קצרה • 100% דיסקרטי</span>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}