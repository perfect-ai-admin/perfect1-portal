import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Phone, MessageCircle, Mail, Globe, Instagram, Facebook, 
  MapPin, Download, Share2, QrCode, Loader2, UserX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const STYLE_THEMES = {
  professional: {
    bg: 'from-slate-900 via-slate-800 to-slate-900',
    accent: '#3B82F6',
    text: 'text-white',
    subtitleText: 'text-blue-300',
    cardBg: 'bg-white/10 backdrop-blur-sm border-white/10',
    serviceBg: 'bg-white/5 border-white/10',
    stickyBg: 'bg-slate-900/95',
    stickyBorder: 'border-slate-700',
  },
  light: {
    bg: 'from-blue-50 via-white to-indigo-50',
    accent: '#6366F1',
    text: 'text-gray-900',
    subtitleText: 'text-indigo-600',
    cardBg: 'bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg',
    serviceBg: 'bg-indigo-50/50 border-indigo-100',
    stickyBg: 'bg-white/95',
    stickyBorder: 'border-gray-200',
  },
  warm: {
    bg: 'from-amber-50 via-orange-50 to-rose-50',
    accent: '#F59E0B',
    text: 'text-gray-900',
    subtitleText: 'text-amber-700',
    cardBg: 'bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg',
    serviceBg: 'bg-amber-50/50 border-amber-100',
    stickyBg: 'bg-amber-50/95',
    stickyBorder: 'border-amber-200',
  },
};

function getTheme(style) {
  return STYLE_THEMES[style] || STYLE_THEMES.professional;
}

function trackClick(cardId, action) {
  base44.functions.invoke('trackCardClick', { card_id: cardId, action }).catch(() => {});
}

export default function DigitalCard() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const loadCard = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('slug');
      if (!slug) {
        setError('not_found');
        setLoading(false);
        return;
      }
      try {
        const res = await base44.functions.invoke('getPublicCard', { slug });
        if (res.data?.success && res.data?.card) {
          setCard(res.data.card);
        } else {
          setError('not_found');
        }
      } catch (e) {
        setError('not_found');
      } finally {
        setLoading(false);
      }
    };
    loadCard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-500">טוען כרטיס...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <UserX className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">הכרטיס לא נמצא</h1>
          <p className="text-sm text-gray-500">יכול להיות שהקישור שגוי או שהכרטיס לא פורסם עדיין.</p>
        </div>
      </div>
    );
  }

  const theme = getTheme(card.preferred_style);
  const initials = (card.full_name || 'א').split(' ').map(w => w[0]).join('').slice(0, 2);
  const waNumber = card.whatsapp || card.phone;

  const handleCall = () => { trackClick(card.id, 'call'); window.location.href = `tel:${card.phone}`; };
  const handleWhatsApp = () => { trackClick(card.id, 'whatsapp'); window.open(`https://wa.me/${waNumber}`, '_blank'); };
  const handleEmail = () => { trackClick(card.id, 'email'); window.location.href = `mailto:${card.email}`; };
  const handleWebsite = () => { trackClick(card.id, 'website'); window.open(card.website_url, '_blank'); };
  const handleInstagram = () => { trackClick(card.id, 'instagram'); window.open(card.instagram_url, '_blank'); };
  const handleFacebook = () => { trackClick(card.id, 'facebook'); window.open(card.facebook_url, '_blank'); };
  const handleSaveContact = () => { trackClick(card.id, 'save_contact'); window.open(card.vcf_url, '_blank'); };
  const handleShare = async () => {
    trackClick(card.id, 'share');
    if (navigator.share) {
      try { await navigator.share({ title: card.full_name, url: card.public_url }); } catch {}
    } else {
      navigator.clipboard.writeText(card.public_url);
      alert('הקישור הועתק!');
    }
  };

  return (
    <>
      <Helmet>
        <title>{card.full_name} | כרטיס ביקור דיגיטלי</title>
        <meta name="description" content={`${card.full_name} - ${card.profession}`} />
      </Helmet>

      <div className={cn("min-h-screen bg-gradient-to-br", theme.bg)} dir="rtl">
        <div className="max-w-md mx-auto px-4 pt-8 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Avatar + Name */}
            <div className="text-center space-y-4 pt-4">
              {card.logo_url ? (
                <img src={card.logo_url} alt={card.full_name} className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-xl" />
              ) : (
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white mx-auto shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}99)` }}
                >
                  {initials}
                </div>
              )}
              <div>
                <h1 className={cn("text-2xl font-black", theme.text)}>{card.full_name}</h1>
                <p className={cn("text-base font-medium mt-1", theme.subtitleText)}>{card.profession}</p>
              </div>
            </div>

            {/* Services */}
            {card.services?.length > 0 && (
              <div className="space-y-2">
                {card.services.map((s, i) => (
                  <div key={i} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border text-sm", theme.serviceBg, theme.text)}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: theme.accent }} />
                    <span className="opacity-90">{s}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {card.phone && (
                <button onClick={handleCall} className={cn("w-full flex items-center gap-3 px-5 py-4 rounded-2xl border font-bold text-base transition-all active:scale-[0.98]", theme.cardBg, theme.text)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${theme.accent}22` }}>
                    <Phone className="w-5 h-5" style={{ color: theme.accent }} />
                  </div>
                  <span>התקשר עכשיו</span>
                </button>
              )}
              {waNumber && (
                <button onClick={handleWhatsApp} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-500 text-white font-bold text-base transition-all active:scale-[0.98] shadow-lg shadow-green-200">
                  <div className="w-10 h-10 rounded-xl bg-green-400/30 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span>שלח הודעה בוואטסאפ</span>
                </button>
              )}
              {card.email && (
                <button onClick={handleEmail} className={cn("w-full flex items-center gap-3 px-5 py-4 rounded-2xl border font-bold text-base transition-all active:scale-[0.98]", theme.cardBg, theme.text)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${theme.accent}22` }}>
                    <Mail className="w-5 h-5" style={{ color: theme.accent }} />
                  </div>
                  <span>שלח אימייל</span>
                </button>
              )}
              {card.social_networks?.includes('instagram') && (
                <button onClick={handleInstagram} className={cn("w-full flex items-center gap-3 px-5 py-4 rounded-2xl border font-bold text-base transition-all active:scale-[0.98]", theme.cardBg, theme.text)}>
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-pink-500" />
                  </div>
                  <span>אינסטגרם</span>
                </button>
              )}
              {card.social_networks?.includes('facebook') && (
                <button onClick={handleFacebook} className={cn("w-full flex items-center gap-3 px-5 py-4 rounded-2xl border font-bold text-base transition-all active:scale-[0.98]", theme.cardBg, theme.text)}>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>פייסבוק</span>
                </button>
              )}
              {card.social_networks?.includes('website') && (
                <button onClick={handleWebsite} className={cn("w-full flex items-center gap-3 px-5 py-4 rounded-2xl border font-bold text-base transition-all active:scale-[0.98]", theme.cardBg, theme.text)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${theme.accent}22` }}>
                    <Globe className="w-5 h-5" style={{ color: theme.accent }} />
                  </div>
                  <span>אתר אינטרנט</span>
                </button>
              )}
            </div>

            {/* QR + Share + Save */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={handleSaveContact} className={cn("flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border transition-all active:scale-95", theme.cardBg, theme.text)}>
                <Download className="w-5 h-5" style={{ color: theme.accent }} />
                <span className="text-[10px] font-medium opacity-70">שמור איש קשר</span>
              </button>
              <button onClick={() => setShowQR(!showQR)} className={cn("flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border transition-all active:scale-95", theme.cardBg, theme.text)}>
                <QrCode className="w-5 h-5" style={{ color: theme.accent }} />
                <span className="text-[10px] font-medium opacity-70">QR Code</span>
              </button>
              <button onClick={handleShare} className={cn("flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border transition-all active:scale-95", theme.cardBg, theme.text)}>
                <Share2 className="w-5 h-5" style={{ color: theme.accent }} />
                <span className="text-[10px] font-medium opacity-70">שתף</span>
              </button>
            </div>

            {/* QR Code */}
            {showQR && card.qr_image_url && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-lg"
              >
                <img src={card.qr_image_url} alt="QR Code" className="w-48 h-48 rounded-xl" />
                <p className="text-xs text-gray-500">סרוק לפתיחת הכרטיס</p>
                <a href={card.qr_image_url} download className="text-xs text-blue-600 font-medium underline">הורד תמונת QR</a>
              </motion.div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 pb-2">
              <span className={cn("text-[10px] opacity-30", theme.text)}>כרטיס ביקור דיגיטלי by Perfect Biz AI</span>
            </div>
          </motion.div>
        </div>

        {/* Sticky bottom CTA */}
        <div className={cn("fixed bottom-0 left-0 right-0 border-t backdrop-blur-xl z-50 safe-area-bottom", theme.stickyBg, theme.stickyBorder)}>
          <div className="max-w-md mx-auto px-4 py-3 flex gap-3">
            {waNumber && (
              <button onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all shadow-lg shadow-green-200">
                <MessageCircle className="w-5 h-5" />
                וואטסאפ
              </button>
            )}
            {card.phone && (
              <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl text-sm active:scale-95 transition-all text-white shadow-lg" style={{ background: theme.accent }}>
                <Phone className="w-5 h-5" />
                התקשר
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}