import React from 'react';
import { motion } from 'framer-motion';

const SvgIcons = {
  Phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  WhatsApp: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  Instagram: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  Facebook: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  LinkedIn: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  TikTok: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
  Website: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Email: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  Waze: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M20.54 6.63A9.93 9.93 0 0 0 12.01 2C6.49 2 2 6.5 2 12.01c0 2.21.72 4.26 1.95 5.92l-.37 3.47 3.38-1.09c1.56.75 3.3 1.19 5.14 1.19 5.52 0 10-4.48 10-10.01 0-2.58-.98-5.03-2.76-6.86zM8.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
    </svg>
  ),
};

function ActionCircle({ icon: Icon, label, onClick, color }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 border border-white/[0.06] bg-white/[0.04] group-hover:bg-white/[0.08] group-active:bg-white/[0.12] backdrop-blur-sm"
        style={{ boxShadow: `0 0 0 0.5px ${color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
        {label}
      </span>
    </motion.button>
  );
}

export default function CardActions({ card, actions, color }) {
  const btns = [];

  if (card.phone) btns.push({ icon: SvgIcons.Phone, label: 'חיוג', onClick: actions.call });
  if (card.whatsapp || card.phone) btns.push({ icon: SvgIcons.WhatsApp, label: 'וואטסאפ', onClick: actions.whatsapp });
  if (card.email) btns.push({ icon: SvgIcons.Email, label: 'אימייל', onClick: actions.email });
  if (card.instagram_url) btns.push({ icon: SvgIcons.Instagram, label: 'אינסטגרם', onClick: actions.instagram });
  if (card.facebook_url) btns.push({ icon: SvgIcons.Facebook, label: 'פייסבוק', onClick: actions.facebook });
  if (card.linkedin_url) btns.push({ icon: SvgIcons.LinkedIn, label: 'לינקדאין', onClick: actions.linkedin });
  if (card.tiktok_url) btns.push({ icon: SvgIcons.TikTok, label: 'טיקטוק', onClick: actions.tiktok });
  if (card.website_url) btns.push({ icon: SvgIcons.Website, label: 'אתר', onClick: actions.website });
  if (card.waze_url) btns.push({ icon: SvgIcons.Waze, label: 'ניווט', onClick: actions.waze });

  if (!btns.length) return null;

  // Dynamic columns: 3 for ≤3 items, 4 for more
  const cols = btns.length <= 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/[0.06] p-5"
    >
      <div className={`grid ${cols} gap-y-5 justify-items-center`}>
        {btns.map((b, i) => (
          <ActionCircle key={i} {...b} color={color} />
        ))}
      </div>
    </motion.div>
  );
}