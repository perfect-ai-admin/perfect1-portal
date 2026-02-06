import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    waze: () => { trackClick(card.id, 'waze'); window.open(card.waze_url, '_blank'); },
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
        <meta name="theme-color" content="#121212" />
      </Helmet>

      <div className="min-h-screen bg-[#121212] text-white" dir="rtl">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="max-w-[440px] mx-auto pb-24"
        >
          
          <CardHeader card={card} primaryColor={primaryColor} />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <ActionButtons card={card} actions={actions} />
            </motion.div>

            {/* Keep other sections if needed, but styled dark, or hidden if minimal */}
            {/* For now, keeping them minimal/hidden based on "Just display the icons" preference, 
                but keeping structure in case user wants them back. 
                Applying dark styles just in case. */}
             
             {/* 
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="px-5 mt-4"
            >
               <ContactInfo card={card} primaryColor={primaryColor} theme="dark" />
            </motion.div>
            */}

            {/* Footer Branding */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center pt-8 pb-4"
            >
              <span className="text-[10px] text-gray-600 tracking-widest uppercase">DigitalBcard</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}