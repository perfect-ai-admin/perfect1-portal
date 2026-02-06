import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

function InfoRow({ icon: Icon, label, value, href, color }) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors cursor-pointer active:scale-[0.99]">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}10` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-800 font-medium truncate mt-0.5">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }
  return content;
}

export default function ContactInfo({ card, primaryColor }) {
  const hasInfo = card.phone || card.email;
  if (!hasInfo) return null;

  // Format phone for display
  const displayPhone = card.phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') || card.phone;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">פרטי התקשרות</h3>
      <div className="space-y-2">
        {card.phone && (
          <InfoRow 
            icon={Phone} 
            label="טלפון" 
            value={displayPhone} 
            href={`tel:${card.phone}`} 
            color={primaryColor} 
          />
        )}
        {card.email && (
          <InfoRow 
            icon={Mail} 
            label="אימייל" 
            value={card.email} 
            href={`mailto:${card.email}`} 
            color={primaryColor} 
          />
        )}
      </div>
    </div>
  );
}