import React from 'react';
import { CheckCircle, MessageCircle } from 'lucide-react';
import LeadFormInline from './LeadFormInline';

export default function HeroSection({ onSubmit, isSubmitting }) {
  return (
    <section className="relative bg-gradient-to-br from-[#0F2847] via-[#1E3A5F] to-[#0F2847] overflow-hidden">
      {/* Subtle bg effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#27AE60] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#D4AF37] rounded-full blur-[80px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Text */}
          <div className="text-center lg:text-right">
            <div className="inline-block bg-[#27AE60]/20 text-[#27AE60] px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-[#27AE60]/30">
              ⚡ חזרה תוך 10 דקות
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
              פתיחת עוסק פטור –{' '}
              <span className="text-[#27AE60]">מתחילים בלי להסתבך</span>
            </h1>

            <p className="text-lg md:text-xl text-white/85 mb-6 leading-relaxed font-medium">
              ליווי אישי מלא לפתיחת עוסק פטור בצורה מהירה, פשוטה וללא טעויות
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                'פתיחת עוסק פטור בליווי מלא',
                'חזרה תוך 10 דקות',
                'חוסכים זמן, טעויות ובירוקרטיה',
                'תהליך מהיר וברור'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                  <span className="text-sm font-semibold">{text}</span>
                </div>
              ))}
            </div>

            {/* Mobile WhatsApp */}
            <div className="lg:hidden">
              <a
                href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                דברו איתנו בWhatsApp
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <LeadFormInline
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              sourcePage="דף נחיתה אגרסיבי - Hero"
              ctaText="התחל פתיחת עוסק פטור עכשיו"
              subText="נציג חוזר אליך תוך דקות"
            />
          </div>
        </div>
      </div>
    </section>
  );
}