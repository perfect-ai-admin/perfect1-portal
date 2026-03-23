import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] rounded-full flex items-center justify-center shadow-lg shadow-green-600/30 animate-pulse-glow transition-all hover:scale-110"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
}