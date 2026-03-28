import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { PORTAL_CTA } from '../config/navigation';

export default function InlineCTA({
  title = 'רוצה שנעשה את זה בשבילך?',
  buttonText = 'שיחת ייעוץ חינם',
  variant = 'default'
}) {
  const isWhatsApp = variant === 'whatsapp';

  return (
    <div className="my-10 bg-gradient-to-l from-portal-navy to-portal-navy-light rounded-2xl p-8 text-center text-white">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={`tel:${PORTAL_CTA.phone}`}>
          <Button className="h-14 px-8 text-lg rounded-2xl bg-portal-teal hover:bg-portal-teal-dark text-white font-bold shadow-lg">
            <Phone className="ml-2 h-5 w-5" />
            {buttonText}
          </Button>
        </a>
        <a href={PORTAL_CTA.whatsapp} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="h-14 px-8 text-lg rounded-2xl border-2 border-white text-white hover:bg-white/10 font-bold">
            <MessageCircle className="ml-2 h-5 w-5" />
            WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
