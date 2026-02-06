import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Copy, Share2, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CardHeader from '@/components/digital-card/CardHeader';
import ActionButtons from '@/components/digital-card/ActionButtons';

export default function BusinessCardResult({ formData, cardResult, onPurchase, onBack }) {
  const [copied, setCopied] = useState(false);

  // Construct card object for preview components
  const card = {
    full_name: formData.fullName,
    profession: formData.profession,
    // Use data URLs for preview if available (from creation step), otherwise result URLs
    logo_url: formData.logoDataUrl || cardResult.logo_url, 
    cover_image_url: formData.coverDataUrl || cardResult.cover_image_url,
    phone: formData.phone,
    whatsapp: formData.phone, // Assuming phone is used for WA as per logic
    email: formData.email,
    social_networks: formData.socialNetworks || [],
    website_url: formData.website_url,
    instagram_url: formData.instagram_url,
    facebook_url: formData.facebook_url,
    waze_url: formData.waze_url,
    qr_image_url: cardResult.qr_image_url,
    vcf_url: cardResult.vcf_url
  };

  const actions = {
    call: () => toast.info('הדגמה: חיוג'),
    whatsapp: () => toast.info('הדגמה: וואטסאפ'),
    email: () => toast.info('הדגמה: אימייל'),
    website: () => toast.info('הדגמה: אתר'),
    instagram: () => toast.info('הדגמה: אינסטגרם'),
    facebook: () => toast.info('הדגמה: פייסבוק'),
    waze: () => toast.info('הדגמה: Waze'),
  };

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
    <div className="flex flex-col items-center w-full space-y-6 pb-6">
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
        <p className="text-xs text-gray-500">הנה התוצאה הסופית כפי שתראה ללקוחות</p>
      </motion.div>

      {/* Card Preview Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-[380px] mx-auto relative rounded-[32px] overflow-hidden shadow-2xl bg-[#121212] text-white"
        dir="rtl"
      >


        {/* Content */}
        <div className="pb-10 relative z-10">
            <CardHeader card={card} primaryColor="#1E3A5F" />
            
            <div className="mt-2">
                 <ActionButtons card={card} actions={actions} />
            </div>

            {/* Save Contact Button Preview */}
            <div className="px-6 mt-8">
              <button
                className="w-full bg-[#00E5FF] text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 pointer-events-none opacity-90"
              >
                <span className="text-lg">שמור אותי באנשי קשר</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </button>
            </div>

            {/* QR Code Preview */}
            {card.qr_image_url && (
              <div className="px-6 mt-10 flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl shadow-2xl">
                  <img 
                    src={card.qr_image_url} 
                    alt="QR Code" 
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-3">סרוק לשמירה</p>
              </div>
            )}
            
            <div className="text-center pt-8 pb-4">
              <span className="text-[10px] text-gray-600 tracking-widest uppercase">DigitalBcard</span>
            </div>
        </div>
      </motion.div>

      {/* Quick Actions for Share */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm mx-auto grid grid-cols-2 gap-3"
      >
        <button 
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl py-3 px-2 hover:bg-gray-50 transition-all active:scale-95"
        >
          {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-blue-600" />}
          <span className="text-[10px] font-medium text-gray-600">{copied ? 'הועתק!' : 'העתק קישור'}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-xl py-3 px-2 hover:bg-gray-50 transition-all active:scale-95"
        >
          <Share2 className="w-5 h-5 text-teal-600" />
          <span className="text-[10px] font-medium text-gray-600">שתף</span>
        </button>
      </motion.div>

      {/* Purchase CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
                הסר סימן מים, קבל דומיין אישי וכפתורים פעילים לכל הלקוחות שלך.
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
             <span>✓ קישור קבוע</span>
          </div>
        </div>
      </motion.div>

      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
        חזרה לעריכה
      </button>
    </div>
  );
}