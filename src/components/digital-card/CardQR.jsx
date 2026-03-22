import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CardQR({ card, actions, color }) {
  const [open, setOpen] = useState(false);

  if (!card.qr_image_url) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/[0.06] overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/>
              <path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-300">QR Code</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col items-center gap-4 px-5 pb-6 pt-2">
              <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-black/30">
                <img src={card.qr_image_url} alt="QR Code" className="w-40 h-40 rounded-lg" />
              </div>
              <p className="text-[11px] text-gray-500">סרוק לשמירת פרטי הקשר</p>
              <div className="flex gap-3">
                <a
                  href={card.qr_image_url}
                  download
                  className="text-xs font-medium px-4 py-2 rounded-xl bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] transition-colors active:scale-95"
                >
                  הורד QR
                </a>
                <button
                  onClick={actions.share}
                  className="text-xs font-medium px-4 py-2 rounded-xl bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] transition-colors active:scale-95"
                >
                  שתף כרטיס
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}