import React from 'react';
import { Phone, MessageCircle, Mail, Globe, Instagram, Facebook, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

function ActionBtn({ icon: Icon, label, onClick, variant = 'default', color }) {
  if (variant === 'whatsapp') {
    return (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-bold py-3.5 rounded-2xl text-sm shadow-md shadow-green-200/50 w-full"
      >
        <Icon className="w-[18px] h-[18px]" />
        <span>{label}</span>
      </motion.button>
    );
  }

  if (variant === 'primary') {
    return (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex items-center justify-center gap-2.5 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md w-full"
        style={{ background: color, boxShadow: `0 4px 14px ${color}33` }}
      >
        <Icon className="w-[18px] h-[18px]" />
        <span>{label}</span>
      </motion.button>
    );
  }

  if (variant === 'waze') {
    return (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex items-center justify-center gap-2.5 bg-[#33CCFF] text-white font-bold py-3.5 rounded-2xl text-sm shadow-md w-full"
      >
        <Icon className="w-[18px] h-[18px]" />
        <span>{label}</span>
      </motion.button>
    );
  }

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center justify-center gap-2.5 bg-white text-gray-700 font-semibold py-3.5 rounded-2xl text-sm border border-gray-100 shadow-sm hover:shadow-md w-full"
    >
      <Icon className="w-[18px] h-[18px]" style={{ color: color }} />
      <span>{label}</span>
    </motion.button>
  );
}

export default function ActionButtons({ card, actions, primaryColor }) {
  const waNumber = card.whatsapp || card.phone;
  const hasSocial = (network) => card.social_networks?.includes(network);

  // Build button list
  const buttons = [];

  if (card.phone) {
    buttons.push({ icon: Phone, label: 'התקשר', onClick: actions.call, variant: 'primary', color: primaryColor });
  }
  if (waNumber) {
    buttons.push({ icon: MessageCircle, label: 'וואטסאפ', onClick: actions.whatsapp, variant: 'whatsapp' });
  }
  if (card.email) {
    buttons.push({ icon: Mail, label: 'אימייל', onClick: actions.email, variant: 'default', color: primaryColor });
  }
  if (hasSocial('website')) {
    buttons.push({ icon: Globe, label: 'אתר', onClick: actions.website, variant: 'default', color: primaryColor });
  }
  if (hasSocial('instagram')) {
    buttons.push({ icon: Instagram, label: 'אינסטגרם', onClick: actions.instagram, variant: 'default', color: '#E1306C' });
  }
  if (hasSocial('facebook')) {
    buttons.push({ icon: Facebook, label: 'פייסבוק', onClick: actions.facebook, variant: 'default', color: '#1877F2' });
  }
  if (hasSocial('waze') || card.waze_url) {
    buttons.push({ icon: Navigation, label: 'נווט', onClick: actions.waze, variant: 'waze' });
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {buttons.map((btn, i) => (
        <ActionBtn key={i} {...btn} />
      ))}
    </div>
  );
}