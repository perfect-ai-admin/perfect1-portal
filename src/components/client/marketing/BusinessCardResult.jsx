import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, Mail, Globe, Instagram, Facebook, MessageCircle, 
  Share2, Download, ShoppingCart, Lock, Sparkles, QrCode, 
  Copy, Check, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STYLE_THEMES = {
  professional: {
    bg: 'from-slate-900 via-slate-800 to-slate-900',
    accent: '#3B82F6',
    text: 'text-white',
    subtitleText: 'text-blue-300',
    cardBg: 'bg-white/10 backdrop-blur-sm border-white/10',
    serviceBg: 'bg-white/5 border-white/10',
    divider: 'border-white/10',
  },
  light: {
    bg: 'from-blue-50 via-white to-indigo-50',
    accent: '#6366F1',
    text: 'text-gray-900',
    subtitleText: 'text-indigo-600',
    cardBg: 'bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg',
    serviceBg: 'bg-indigo-50/50 border-indigo-100',
    divider: 'border-gray-200',
  },
  warm: {
    bg: 'from-amber-50 via-orange-50 to-rose-50',
    accent: '#F59E0B',
    text: 'text-gray-900',
    subtitleText: 'text-amber-700',
    cardBg: 'bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg',
    serviceBg: 'bg-amber-50/50 border-amber-100',
    divider: 'border-amber-200',
  },
};

export default function BusinessCardResult({ formData, cardResult, onPurchase, onBack }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const theme = STYLE_THEMES[formData.preferredStyle] || STYLE_THEMES.professional;
  const services = [formData.service1, formData.service2, formData.service3].filter(Boolean);
  const initials = (formData.fullName || 'א').split(' ').map(w => w[0]).join('').slice(0, 2);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardResult.public_url);
    setCopied(true);
    toast.success('הקישור הועתק!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: formData.fullName, url: cardResult.public_url });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-5 pb-6">
      {/* Success Header */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100"
        >
          <Sparkles className="w-8 h-8 text-green-600" />
        </motion.div>
        <h2 className="text-xl font-black text-gray-900">הכרטיס שלך נוצר! 🎉</h2>
        <p className="text-xs text-gray-500">כרטיס ביקור דיגיטלי מקצועי עם קישור ייחודי</p>
      </motion.div>

      {/* Card Preview (draft with watermark) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm mx-auto relative"
      >
        {/* Draft watermark */}
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden rounded-2xl">
          <div className="text-white/15 font-black text-4xl rotate-[-30deg] whitespace-nowrap select-none border-2 border-white/10 px-4 py-2 rounded-xl">
            טיוטה
          </div>
        </div>

        <div className={cn("rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br", theme.bg)}>
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${theme.accent}, transparent)` }} />
          <div className="p-5 space-y-4">
            {/* Avatar + Name */}
            <div className="flex items-center gap-3">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-lg flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}99)` }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={cn("text-lg font-black leading-tight truncate", theme.text)}>{formData.fullName}</h2>
                <p className={cn("text-sm font-medium mt-0.5", theme.subtitleText)}>{formData.profession}</p>
              </div>
            </div>

            <div className={cn("border-t", theme.divider)} />

            {/* Services mini */}
            {services.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {services.map((s, i) => (
                  <span key={i} className={cn("text-[11px] px-2.5 py-1 rounded-full border", theme.serviceBg, theme.text, "opacity-80")}>{s}</span>
                ))}
              </div>
            )}

            {/* Contact buttons mini */}
            <div className="grid grid-cols-3 gap-2">
              {formData.phone && (
                <div className={cn("flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-center", theme.cardBg, theme.text)}>
                  <Phone className="w-4 h-4" style={{ color: theme.accent }} />
                  <span className="text-[9px] opacity-70">חייג</span>
                </div>
              )}
              {formData.phone && (
                <div className={cn("flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-center", theme.cardBg, theme.text)}>
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  <span className="text-[9px] opacity-70">WhatsApp</span>
                </div>
              )}
              {formData.email && (
                <div className={cn("flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-center", theme.cardBg, theme.text)}>
                  <Mail className="w-4 h-4" style={{ color: theme.accent }} />
                  <span className="text-[9px] opacity-70">מייל</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm mx-auto grid grid-cols-3 gap-2"
      >
        <button 
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl py-3 px-2 hover:bg-gray-50 transition-all active:scale-95"
        >
          {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-blue-600" />}
          <span className="text-[10px] font-medium text-gray-600">{copied ? 'הועתק!' : 'העתק קישור'}</span>
        </button>
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl py-3 px-2 hover:bg-gray-50 transition-all active:scale-95"
        >
          <QrCode className="w-5 h-5 text-purple-600" />
          <span className="text-[10px] font-medium text-gray-600">QR Code</span>
        </button>
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl py-3 px-2 hover:bg-gray-50 transition-all active:scale-95"
        >
          <Share2 className="w-5 h-5 text-teal-600" />
          <span className="text-[10px] font-medium text-gray-600">שתף</span>
        </button>
      </motion.div>

      {/* QR Code popup */}
      {showQR && cardResult.qr_image_url && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="w-full max-w-sm mx-auto bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-3 shadow-lg"
        >
          <img src={cardResult.qr_image_url} alt="QR Code" className="w-40 h-40 rounded-xl" />
          <p className="text-xs text-gray-500">סרוק כדי לפתוח את הכרטיס</p>
          <a href={cardResult.qr_image_url} download className="text-xs text-blue-600 font-medium underline">הורד QR</a>
        </motion.div>
      )}

      {/* Save Contact */}
      {cardResult.vcf_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm mx-auto"
        >
          <a
            href={cardResult.vcf_url}
            download
            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm transition-all"
          >
            <Download className="w-4 h-4" />
            הורד כרטיס איש קשר (VCF)
          </a>
        </motion.div>
      )}

      {/* Purchase CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm mx-auto"
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-xl flex-shrink-0">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">שדרג לכרטיס מלא</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                פרסם את הכרטיס, הסר סימן מים, קבל קישור שיתוף פעיל וכפתורים שעובדים.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 line-through">₪98</span>
            <span className="text-2xl font-black text-blue-600">₪49</span>
            <span className="text-xs text-gray-500">חד פעמי</span>
          </div>

          <Button
            onClick={onPurchase}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-blue-200 gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            רכוש ופרסם – ₪49
          </Button>

          <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
            <span>✓ ללא סימן מים</span>
            <span>✓ כפתורים פעילים</span>
            <span>✓ QR + VCF</span>
          </div>
        </div>
      </motion.div>

      {/* Back */}
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
        חזרה למרכז השליטה
      </button>
    </div>
  );
}