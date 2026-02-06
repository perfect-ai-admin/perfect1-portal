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

            {/* Save Contact Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="px-6 mt-8"
            >
              <button
                onClick={actions.saveContact}
                className="w-full bg-[#00E5FF] hover:bg-[#00cce6] text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <span className="text-lg">שמור אותי באנשי קשר</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </button>
            </motion.div>

            {/* QR Code */}
            {card.qr_image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="px-6 mt-10 flex flex-col items-center"
              >
                <div className="bg-white p-3 rounded-xl shadow-2xl">
                  <img 
                    src={card.qr_image_url} 
                    alt="QR Code" 
                    className="w-40 h-40 object-contain"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-3">סרוק לשמירה</p>
              </motion.div>
            )}

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