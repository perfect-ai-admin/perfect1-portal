import React from 'react';
import { motion } from 'framer-motion';

// Custom SVG Icons for better brand recognition and styling
const Icons = {
  Phone: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  WhatsApp: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  Instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Facebook: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Website: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Waze: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
       <path d="M11.66 2.02a.96.96 0 0 0-.25.04c-3.14 1.04-6.31 1.77-9.42 2.16a1 1 0 0 0-.87 1.09c.28 2.64 1.44 8 7.49 13.06a12.88 12.88 0 0 0 3.86 2.18.99.99 0 0 0 .74 0c4.1-1.37 7.23-5.26 7.72-9.67.04-.37.07-.74.07-1.11 0-3.32-2.69-6.02-6-6.02a5.96 5.96 0 0 0-3.34 1.02V2.02zM12 4.02c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm-1.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm3 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </svg>
  ),
  WazeBrand: (props) => (
     <svg viewBox="0 0 512 512" fill="currentColor" {...props}>
        <path d="M485.4 207.2c-29.3-64-102.6-111-193.3-111C152 96.2 38.8 171.4 38.8 264.1c0 30.6 12.5 59.2 34.6 84 2.8 3.1 3.5 7.6 1.8 11.4l-14.8 33.4c-2.8 6.2 3.2 12.7 9.7 10.6l37.2-12c3.5-1.1 7.3-.4 10.3 1.8 38.8 28.5 89.2 45.4 144.1 45.4 17.5 0 34.6-1.7 51.3-4.8 11.5 28.7 39.5 49 72.4 49 43.1 0 78.1-35 78.1-78.1 0-31.1-18-58-44.4-70.8 7.4-23.3 35.8-21.6 47.9-19.1 5.4 1.1 10.8-2.2 12.1-7.6l10.8-48.4c1.6-6.8-4.2-12.8-11.1-11.4-19 3.8-59.5 9-86.7-16-16-14.7-22.9-35.8-17.7-55.9zm-261.3 22.1c25.4 0 46 20.6 46 46s-20.6 46-46 46-46-20.6-46-46 20.6-46 46-46zm164.7 92c-25.4 0-46-20.6-46-46s20.6-46 46-46 46 20.6 46 46-20.6 46-46 46z"/>
     </svg>
  ),
  TikTok: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
  LinkedIn: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  Email: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Navigation: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  )
};

function ActionBtn({ icon: Icon, label, onClick }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div 
        className="w-[68px] h-[68px] rounded-full border-[1.5px] border-[#333] flex items-center justify-center 
        group-hover:border-[#00E5FF] group-hover:bg-[#00E5FF]/10 transition-all duration-300 bg-[#1A1A1A] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#00E5FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon className="w-7 h-7 text-[#00E5FF] group-hover:text-[#00E5FF] transition-colors" />
      </div>
      <span className="text-[13px] font-medium text-gray-300 tracking-wide">{label}</span>
    </motion.button>
  );
}

export default function ActionButtons({ card, actions }) {
  const waNumber = card.whatsapp || card.phone;
  const hasSocial = (network) => card.social_networks?.includes(network);

  const buttons = [];

  // Define buttons with custom SVGs
  if (card.phone) {
    buttons.push({ icon: Icons.Phone, label: 'חיוג', onClick: actions.call });
  }
  if (waNumber) {
    buttons.push({ icon: Icons.WhatsApp, label: 'וואטסאפ', onClick: actions.whatsapp });
  }
  if (hasSocial('instagram')) {
    buttons.push({ icon: Icons.Instagram, label: 'אינסטגרם', onClick: actions.instagram });
  }
  if (hasSocial('facebook')) {
    buttons.push({ icon: Icons.Facebook, label: 'פייסבוק', onClick: actions.facebook });
  }
  if (hasSocial('tiktok')) {
    buttons.push({ icon: Icons.TikTok, label: 'טיקטוק', onClick: actions.tiktok });
  }
  if (hasSocial('linkedin')) {
    buttons.push({ icon: Icons.LinkedIn, label: 'לינקדאין', onClick: actions.linkedin });
  }
  if (hasSocial('website')) {
    buttons.push({ icon: Icons.Website, label: 'אתר', onClick: actions.website });
  }
  if (card.email) {
    buttons.push({ icon: Icons.Email, label: 'מייל', onClick: actions.email });
  }
  if (hasSocial('waze')) {
    buttons.push({ icon: Icons.WazeBrand, label: 'Waze', onClick: actions.waze });
  }

  // Ensure buttons are centered in the grid
  return (
    <div className="flex justify-center w-full px-4">
      <div className="grid grid-cols-3 gap-x-6 gap-y-8 max-w-[320px]">
        {buttons.map((btn, i) => (
          <ActionBtn key={i} {...btn} />
        ))}
      </div>
    </div>
  );
}