import React from 'react';
import { motion } from 'framer-motion';

export default function CardBottomBar({ card, actions, color }) {
  const wa = card.whatsapp || card.phone;
  if (!card.phone && !wa && !card.vcf_url) return null;

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.7, type: 'spring', stiffness: 120, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Gradient fade */}
      <div className="h-6 bg-gradient-to-t from-gray-950 to-transparent" />
      
      <div className="bg-gray-950/95 backdrop-blur-xl border-t border-white/[0.06] pb-safe">
        <div className="max-w-[460px] mx-auto px-4 py-3 flex gap-2.5">
          {/* Save contact */}
          {card.vcf_url && (
            <button
              onClick={actions.saveContact}
              className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-gray-400 active:scale-95 transition-all flex-shrink-0 hover:bg-white/[0.1]"
              title="שמור איש קשר"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </button>
          )}

          {/* WhatsApp */}
          {wa && (
            <button
              onClick={actions.whatsapp}
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 rounded-2xl text-sm active:scale-[0.97] transition-all shadow-lg shadow-[#25D366]/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              וואטסאפ
            </button>
          )}

          {/* Call */}
          {card.phone && (
            <button
              onClick={actions.call}
              className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-3 rounded-2xl text-sm active:scale-[0.97] transition-all shadow-lg"
              style={{ background: color, boxShadow: `0 8px 24px ${color}30` }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              התקשר
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}