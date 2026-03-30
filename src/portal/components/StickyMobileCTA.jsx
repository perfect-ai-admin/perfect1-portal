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
    <>
      {/* Mobile - Full bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden" dir="rtl">
        <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <a
              href={`${PORTAL_CTA.whatsapp}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href={`tel:${PORTAL_CTA.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-portal-teal hover:bg-portal-teal-dark text-white rounded-xl font-bold text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              שיחה
            </a>
            <button
              onClick={scrollToForm}
              className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-portal-navy hover:bg-portal-navy-dark text-white rounded-xl font-bold text-sm transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              השאר פרטים
            </button>
          </div>
        </div>
      </div>

      {/* Desktop - Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 hidden md:block" dir="rtl">
        <div className="bg-portal-navy/95 backdrop-blur-lg border-t border-portal-navy-light">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="font-bold text-sm">צריך עזרה עם פתיחת העסק?</span>
              <span className="text-white/60 text-sm hidden lg:inline">נחזור אליך תוך דקות</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={scrollToForm}
                className="flex items-center gap-1.5 h-10 px-5 bg-portal-teal hover:bg-portal-teal-dark text-white rounded-xl font-bold text-sm transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                השאר פרטים
              </button>
              <a
                href={`tel:${PORTAL_CTA.phone}`}
                className="flex items-center gap-1.5 h-10 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                {PORTAL_CTA.phone}
              </a>
              <a
                href={`${PORTAL_CTA.whatsapp}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-10 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
