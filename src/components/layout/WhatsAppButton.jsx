import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ message = "היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור" }) {
  const whatsappUrl = `https://wa.me/972559700641?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-full py-5 px-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="font-black text-lg hidden sm:inline">דברו איתנו</span>
      </a>

      {/* Static indicator dot - no animation (Google policy compliant) */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#25D366] border-2 border-white"></span>
      </span>
    </div>
  );
}