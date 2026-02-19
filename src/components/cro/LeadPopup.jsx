import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Phone, User, CheckCircle, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LeadPopup({ open, onClose, sourcePage = 'דף נחיתה - פתיחת עוסק פטור' }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      setError('אנא מלאו שם וטלפון');
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
      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
      setError('שגיאה בשליחה, אנא נסו שוב');
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
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Soft top accent */}
          <div className="h-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-2 right-8 w-16 h-16 bg-blue-200 rounded-full blur-xl" />
              <div className="absolute bottom-0 left-12 w-20 h-20 bg-indigo-200 rounded-full blur-xl" />
            </div>
            <div className="relative text-center">
              <p className="text-2xl font-black text-[#1E3A5F]">פותחים עוסק פטור? 🎯</p>
              <p className="text-sm text-[#1E3A5F]/60 mt-1">נעזור לכם להתחיל נכון - בלי סיבוכים</p>
            </div>
          </div>

          {/* Benefits strip */}
          <div className="flex items-center justify-center gap-4 py-3 px-4 bg-gray-50/80 border-b border-gray-100">
            {['ליווי מלא', 'מחיר שקוף', 'תוך 24 שעות'].map((item, i) => (
              <div key={i} className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#27AE60]" />
                <span className="text-xs font-semibold text-gray-600">{item}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <p className="text-sm text-gray-500 text-center mb-1">
              השאירו פרטים ונחזור אליכם לשיחת ייעוץ קצרה
            </p>

            <div className="relative">
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300" />
              <input
                type="text"
                placeholder="השם שלכם"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={submitting}
                autoComplete="name"
                className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none text-[15px] font-medium text-gray-800 placeholder:text-gray-400 transition-all disabled:opacity-50"
              />
            </div>

            <div className="relative">
              <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-300" />
              <input
                type="tel"
                placeholder="מספר טלפון"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={submitting}
                autoComplete="tel"
                dir="ltr"
                className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 outline-none text-[15px] font-medium text-gray-800 placeholder:text-gray-400 text-right transition-all disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[52px] rounded-xl bg-[#1E3A5F] hover:bg-[#2C5282] text-white font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  שולח...
                </>
              ) : (
                'קבלו שיחת ייעוץ חינם →'
              )}
            </button>
          </form>

          {/* Trust footer */}
          <div className="px-5 pb-4 pt-0">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <Shield className="w-3 h-3" />
              <span>ללא התחייבות • הפרטים מאובטחים • שיחה של 2 דקות</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}