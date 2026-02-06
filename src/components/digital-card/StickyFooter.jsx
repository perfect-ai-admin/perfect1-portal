import React from 'react';
import { Phone, MessageCircle, Download } from 'lucide-react';

export default function StickyFooter({ card, actions, primaryColor }) {
  const waNumber = card.whatsapp || card.phone;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-50 safe-area-bottom">
      <div className="max-w-[440px] mx-auto px-4 py-3 flex gap-2.5">
        {/* Save Contact */}
        {card.vcf_url && (
          <button 
            onClick={actions.saveContact}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-600 active:scale-95 transition-all flex-shrink-0"
            title="שמור איש קשר"
          >
            <Download className="w-5 h-5" />
          </button>
        )}

        {/* WhatsApp */}
        {waNumber && (
          <button 
            onClick={actions.whatsapp}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 rounded-xl text-sm active:scale-[0.97] transition-all shadow-md shadow-green-200/50"
          >
            <MessageCircle className="w-5 h-5" />
            וואטסאפ
          </button>
        )}

        {/* Call */}
        {card.phone && (
          <button 
            onClick={actions.call}
            className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm active:scale-[0.97] transition-all shadow-md"
            style={{ background: primaryColor, boxShadow: `0 4px 14px ${primaryColor}33` }}
          >
            <Phone className="w-5 h-5" />
            התקשר
          </button>
        )}
      </div>
    </div>
  );
}