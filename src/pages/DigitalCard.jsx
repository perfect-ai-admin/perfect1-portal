import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

import CardLoading from '@/components/digital-card/CardLoading';
import CardNotFound from '@/components/digital-card/CardNotFound';
import CardHeader from '@/components/digital-card/CardHeader';
import ActionButtons from '@/components/digital-card/ActionButtons';
import ContactInfo from '@/components/digital-card/ContactInfo';
import QRSection from '@/components/digital-card/QRSection';
import StickyFooter from '@/components/digital-card/StickyFooter';

function trackClick(cardId, action) {
  base44.functions.invoke('trackCardClick', { card_id: cardId, action }).catch(() => {});
}

export default function DigitalCard() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCard = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('slug');
      if (!slug) { setError('not_found'); setLoading(false); return; }
      try {
        const res = await base44.functions.invoke('getPublicCard', { slug });
        if (res.data?.success && res.data?.card) {
          setCard(res.data.card);
        } else {
          setError('not_found');
        }
      } catch {
        setError('not_found');
      } finally {
        setLoading(false);
      }
    };
    loadCard();
  }, []);

  if (loading) return <CardLoading />;
  if (error || !card) return <CardNotFound />;

  const primaryColor = card.primary_color || '#1E3A5F';
  const waNumber = card.whatsapp || card.phone;

  const actions = {
    call: () => { trackClick(card.id, 'call'); window.location.href = `tel:${card.phone}`; },
    whatsapp: () => { trackClick(card.id, 'whatsapp'); window.open(`https://wa.me/${waNumber}`, '_blank'); },
    email: () => { trackClick(card.id, 'email'); window.location.href = `mailto:${card.email}`; },
    website: () => { trackClick(card.id, 'website'); window.open(card.website_url, '_blank'); },
    instagram: () => { trackClick(card.id, 'instagram'); window.open(card.instagram_url, '_blank'); },
    facebook: () => { trackClick(card.id, 'facebook'); window.open(card.facebook_url, '_blank'); },
    saveContact: () => { trackClick(card.id, 'save_contact'); window.open(card.vcf_url, '_blank'); },
    share: async () => {
      trackClick(card.id, 'share');
      if (navigator.share) {
        try { await navigator.share({ title: card.full_name, url: card.public_url }); } catch {}
      } else {
        navigator.clipboard.writeText(card.public_url);
      }
    },
  };

  return (
    <>
      <Helmet>
        <title>{card.full_name} | כרטיס ביקור דיגיטלי</title>
        <meta name="description" content={`${card.full_name} - ${card.profession}`} />
        <meta name="theme-color" content={primaryColor} />
      </Helmet>

      <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
        <div className="max-w-[440px] mx-auto pb-28">
          
          <CardHeader card={card} primaryColor={primaryColor} />
          
          <div className="px-5 -mt-6 relative z-10 space-y-4">
            <ActionButtons card={card} actions={actions} primaryColor={primaryColor} />
            <ContactInfo card={card} primaryColor={primaryColor} />
            <QRSection card={card} actions={actions} primaryColor={primaryColor} />

            {/* Footer Branding */}
            <div className="text-center pt-4 pb-2">
              <span className="text-[10px] text-gray-300 tracking-wide">Perfect Biz AI</span>
            </div>
          </div>
        </div>

        <StickyFooter card={card} actions={actions} primaryColor={primaryColor} />
      </div>
    </>
  );
}