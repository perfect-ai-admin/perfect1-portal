import React from 'react';
import { motion } from 'framer-motion';

export default function CardContact({ card, actions, color }) {
  if (!card.phone && !card.email) return null;

  const formatPhone = (p) => {
    if (!p) return p;
    const digits = p.replace(/\D/g, '');
    if (digits.length === 10) return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
    return p;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/[0.06] p-5 space-y-3"
    >
      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] px-1">
        פרטי התקשרות
      </h3>

      {card.phone && (
        <a
          href={`tel:${card.phone}`}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">טלפון</p>
            <p className="text-sm text-gray-200 font-medium mt-0.5 ltr" dir="ltr">{formatPhone(card.phone)}</p>
          </div>
        </a>
      )}

      {card.email && (
        <a
          href={`mailto:${card.email}`}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">אימייל</p>
            <p className="text-sm text-gray-200 font-medium mt-0.5 truncate" dir="ltr">{card.email}</p>
          </div>
        </a>
      )}
    </motion.div>
  );
}