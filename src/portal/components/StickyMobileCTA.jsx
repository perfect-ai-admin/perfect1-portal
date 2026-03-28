import React from 'react';
import { Phone, MessageCircle, ClipboardCheck } from 'lucide-react';
import { PORTAL_CTA } from '../config/navigation';

export default function StickyMobileCTA() {
  const scrollToForm = () => {
    const form = document.getElementById('portal-lead-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const waMessage = encodeURIComponent('היי, אשמח לקבל מידע על פתיחת עסק');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden" dir="rtl">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          {/* WhatsApp */}
          <a
            href={`${PORTAL_CTA.whatsapp}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>

          {/* Call */}
          <a
            href={`tel:${PORTAL_CTA.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-portal-teal hover:bg-portal-teal-dark text-white rounded-xl font-bold text-sm transition-colors"
          >
            <Phone className="w-4 h-4" />
            שיחה
          </a>

          {/* Check suitability */}
          <button
            onClick={scrollToForm}
            className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-portal-navy hover:bg-portal-navy-dark text-white rounded-xl font-bold text-sm transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            בדיקת התאמה
          </button>
        </div>
      </div>
    </div>
  );
}
