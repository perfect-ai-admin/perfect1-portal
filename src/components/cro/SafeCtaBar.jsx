import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { trackPhoneClick, trackWhatsAppClick } from '../tracking/EventTracker';

export default function SafeCtaBar({ title, subtitle, sourcePage = 'SafeCtaBar' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#D4AF37] shadow-[0_-4px_12px_rgba(0,0,0,0.15)] p-3 md:hidden safe-area-pb">
      <div className="flex gap-2">
        <a
          href="tel:0502277087"
          onClick={() => trackPhoneClick(sourcePage)}
          className="flex-1 bg-[#1E3A5F] text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold text-sm"
        >
          <Phone className="w-4 h-4" />
          התקשרו עכשיו
        </a>
        <a
          href="https://wa.me/972502277087?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick(sourcePage)}
          className="flex-1 bg-[#25D366] text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          וואטסאפ
        </a>
      </div>
    </div>
  );
}