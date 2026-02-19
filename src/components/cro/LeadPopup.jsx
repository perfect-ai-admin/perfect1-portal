import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Phone, User, Sparkles, Shield, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LeadPopup({ open, onClose, sourcePage = 'דף נחיתה - פתיחת עוסק פטור' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError('אנא מלא שם וטלפון');
      return;
    }
    if (!/^0\d{8,9}$/.test(phone.replace(/[-\s]/g, ''))) {
      setError('מספר טלפון לא תקין');
      return;
    }

    setSubmitting(true);
    try {
      await base44.functions.invoke('submitLead', {
        name: name.trim(),
        phone: phone.trim(),
        source_page: sourcePage,
        status: 'new'
      });
      // Navigate to thank you page
      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
      setError('שגיאה בשליחה, אנא נסה שוב');
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        key="lead-popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        dir="rtl"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top gradient bar */}
          <div className="bg-gradient-to-r from-[#27AE60] via-[#2ECC71] to-[#27AE60] h-1.5" />

          {/* Header */}
          <div className="pt-6 pb-4 px-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#27AE60] to-[#2ECC71] flex items-center justify-center shadow-lg shadow-green-200">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-[#1E3A5F] mb-1">
              בואו נתחיל! 🚀
            </h3>
            <p className="text-sm text-gray-500">
              השאירו פרטים ונחזור אליכם תוך דקות
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-4 space-y-3">
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="שם מלא"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={submitting}
                className="w-full h-12 pr-11 pl-4 rounded-xl border-2 border-gray-200 focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/20 outline-none text-base font-medium text-gray-800 placeholder:text-gray-400 transition-all disabled:opacity-60"
              />
            </div>

            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="מספר טלפון"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={submitting}
                dir="ltr"
                className="w-full h-12 pr-11 pl-4 rounded-xl border-2 border-gray-200 focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/20 outline-none text-base font-medium text-gray-800 placeholder:text-gray-400 text-right transition-all disabled:opacity-60"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#229954] hover:to-[#27AE60] text-white font-bold text-lg shadow-lg shadow-green-200/50 hover:shadow-green-300/50 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  קבלו שיחה חינם
                </>
              )}
            </button>
          </form>

          {/* Trust footer */}
          <div className="px-6 pb-5 pt-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>ללא התחייבות • הפרטים מאובטחים • שיחה קצרה בלבד</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}