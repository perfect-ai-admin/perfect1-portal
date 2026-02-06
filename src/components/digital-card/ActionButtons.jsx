import React from 'react';
import { Phone, MessageCircle, Mail, Globe, Instagram, Facebook, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

function ActionBtn({ icon: Icon, label, onClick, color }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div 
        className="w-16 h-16 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-400/10 transition-colors"
      >
        <Icon className="w-7 h-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
      </div>
      <span className="text-sm font-medium text-gray-300">{label}</span>
    </motion.button>
  );
}

export default function ActionButtons({ card, actions }) {
  const waNumber = card.whatsapp || card.phone;
  const hasSocial = (network) => card.social_networks?.includes(network);

  const buttons = [];

  if (card.phone) {
    buttons.push({ icon: Phone, label: 'חיוג', onClick: actions.call });
  }
  if (waNumber) {
    buttons.push({ icon: MessageCircle, label: 'וואטסאפ', onClick: actions.whatsapp });
  }
  if (hasSocial('instagram')) {
    buttons.push({ icon: Instagram, label: 'אינסטגרם', onClick: actions.instagram });
  }
  if (hasSocial('facebook')) {
    buttons.push({ icon: Facebook, label: 'פייסבוק', onClick: actions.facebook });
  }
  if (hasSocial('website')) {
    buttons.push({ icon: Globe, label: 'אתר', onClick: actions.website });
  }
  if (card.email) {
    buttons.push({ icon: Mail, label: 'מייל', onClick: actions.email });
  }
  if (hasSocial('waze') || card.waze_url) {
    buttons.push({ icon: Navigation, label: 'נווט', onClick: actions.waze });
  }

  return (
    <div className="grid grid-cols-3 gap-y-8 gap-x-4 px-4 py-6">
      {buttons.map((btn, i) => (
        <ActionBtn key={i} {...btn} />
      ))}
    </div>
  );
}