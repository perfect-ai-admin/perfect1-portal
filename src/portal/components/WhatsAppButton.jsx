import React from 'react';
import { MessageCircle } from 'lucide-react';
import { PORTAL_CTA } from '../config/navigation';

export default function WhatsAppButton() {
  const message = encodeURIComponent('היי, אשמח לקבל מידע על פתיחת עסק');
  const url = `${PORTAL_CTA.whatsapp}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 group"
      aria-label="שלח הודעת WhatsApp"
    >
      <div className="relative">
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />

        {/* Button */}
        <div className="relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        שלח WhatsApp
      </div>
    </a>
  );
}
