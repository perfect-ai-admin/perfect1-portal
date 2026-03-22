import React, { useState, useEffect } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import CardLoading from '@/components/digital-card/CardLoading';
import CardNotFound from '@/components/digital-card/CardNotFound';
import CardHero from '@/components/digital-card/CardHero';
import CardActions from '@/components/digital-card/CardActions';
import CardContact from '@/components/digital-card/CardContact';
import CardQR from '@/components/digital-card/CardQR';
import CardBottomBar from '@/components/digital-card/CardBottomBar';

function trackClick(cardId, action) {
  base44.functions.invoke('trackCardClick', { card_id: cardId, action }).catch(() => {});
}

export default function DigitalCard() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) { setError('not_found'); setLoading(false); return; }
    
    base44.functions.invoke('getPublicCard', { slug })
      .then(res => {
        if (res.data?.success && res.data?.card) setCard(res.data.card);
        else setError('not_found');
      })
      .catch(() => setError('not_found'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <HelmetProvider><CardLoading /></HelmetProvider>;
  if (error || !card) return <HelmetProvider><CardNotFound /></HelmetProvider>;

  const color = card.primary_color || '#1E3A5F';
  const wa = card.whatsapp || card.phone;

  // Ensure URLs have protocol
  const ensureUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return 'https://' + url;
  };

  const act = {
    call: () => { trackClick(card.id, 'call'); window.location.href = `tel:${card.phone}`; },
    whatsapp: () => { trackClick(card.id, 'whatsapp'); window.open(`https://wa.me/${wa}`, '_blank'); },
    email: () => { trackClick(card.id, 'email'); window.location.href = `mailto:${card.email}`; },
    website: () => { if (card.website_url) { trackClick(card.id, 'website'); window.open(ensureUrl(card.website_url), '_blank'); } },
    instagram: () => { if (card.instagram_url) { trackClick(card.id, 'instagram'); window.open(ensureUrl(card.instagram_url), '_blank'); } },
    facebook: () => { if (card.facebook_url) { trackClick(card.id, 'facebook'); window.open(ensureUrl(card.facebook_url), '_blank'); } },
    linkedin: () => { if (card.linkedin_url) { trackClick(card.id, 'linkedin'); window.open(ensureUrl(card.linkedin_url), '_blank'); } },
    tiktok: () => { if (card.tiktok_url) { trackClick(card.id, 'tiktok'); window.open(ensureUrl(card.tiktok_url), '_blank'); } },
    waze: () => { if (card.waze_url) { trackClick(card.id, 'waze'); window.open(ensureUrl(card.waze_url), '_blank'); } },
    saveContact: () => { trackClick(card.id, 'save_contact'); if (card.vcf_url) window.open(card.vcf_url, '_blank'); },
    share: async () => {
      trackClick(card.id, 'share');
      const url = card.public_url || window.location.href;
      if (navigator.share) {
        try { await navigator.share({ title: card.full_name, url }); } catch {}
      } else {
        navigator.clipboard.writeText(url);
      }
    },
  };

  const pageTitle = `${card.full_name} | כרטיס ביקור דיגיטלי`;
  const pageDesc = `${card.full_name} - ${card.profession || 'כרטיס ביקור דיגיטלי'}`;
  const pageUrl = card.public_url || window.location.href;
  const pageImage = card.cover_image_url || card.logo_url || card.qr_image_url || '';

  return (
    <HelmetProvider>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="theme-color" content={color} />
        <meta name="robots" content="noindex, nofollow" />
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={pageUrl} />
        {pageImage && <meta property="og:image" content={pageImage} />}
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        {pageImage && <meta name="twitter:image" content={pageImage} />}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-x-hidden" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-[460px] mx-auto relative pb-28"
        >
          <CardHero card={card} color={color} />
          
          <div className="px-5 space-y-5 -mt-6 relative z-10">
            <CardActions card={card} actions={act} color={color} />
            <CardContact card={card} actions={act} color={color} />
            <CardQR card={card} actions={act} color={color} />
          </div>

          {/* Powered by */}
          <div className="text-center mt-10 pb-4">
            <a 
              href="https://one-pai.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors tracking-[0.2em] uppercase"
            >
              Powered by Perfect One
            </a>
          </div>
        </motion.div>

        <CardBottomBar card={card} actions={act} color={color} />
      </div>
    </HelmetProvider>
  );
}