import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';

export default function MidCta({ onCtaClick }) {
  return (
    <section className="py-10 md:py-14 bg-gradient-to-r from-[#27AE60] to-[#2ECC71]">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-4xl font-black text-white mb-3">
          רוצה לפתוח עוסק פטור כבר השבוע?
        </h2>
        <p className="text-lg text-white/90 mb-6">
          השאר פרטים עכשיו – אנחנו נעשה את השאר
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onCtaClick}
            className="h-14 px-10 text-lg font-black rounded-xl bg-white text-[#27AE60] hover:bg-white/90 shadow-xl"
          >
            התחל עכשיו
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
          <a
            href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="h-14 px-10 text-lg font-black rounded-xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60]">
              <MessageCircle className="w-5 h-5 ml-2" />
              WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}