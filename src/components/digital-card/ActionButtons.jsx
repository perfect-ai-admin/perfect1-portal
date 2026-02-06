import React from 'react';
import { Phone, MessageCircle, Mail, Globe, Instagram, Facebook } from 'lucide-react';

function ActionBtn({ icon: Icon, label, onClick, variant = 'default', color }) {
  if (variant === 'whatsapp') {
    return (
      <button 
        onClick={onClick}
        className="flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-[0.97] shadow-md shadow-green-200/50"
      >
        <Icon className="w-[18px] h-[18px]" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'primary') {
    return (
      <button 
        onClick={onClick}
        className="flex items-center justify-center gap-2.5 text-white font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-[0.97] shadow-md"
        style={{ background: color, boxShadow: `0 4px 14px ${color}33` }}
      >
        <Icon className="w-[18px] h-[18px]" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-2.5 bg-white text-gray-700 font-semibold py-3.5 rounded-2xl text-sm border border-gray-100 transition-all active:scale-[0.97] shadow-sm hover:shadow-md"
    >
      <Icon className="w-[18px] h-[18px]" style={{ color: color }} />
      <span>{label}</span>
    </button>
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

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {buttons.map((btn, i) => (
        <ActionBtn key={i} {...btn} />
      ))}
    </div>
  );
}