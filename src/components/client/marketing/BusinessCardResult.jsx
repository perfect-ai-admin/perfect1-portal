import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Copy, Share2, ShoppingCart, Lock, Smartphone, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CardHeader from '@/components/digital-card/CardHeader';
import ActionButtons from '@/components/digital-card/ActionButtons';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

export default function BusinessCardResult({ formData, cardResult, onPurchase, onBack }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // Celebration confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Construct card object for preview components
  const card = {
    full_name: formData.fullName,
    profession: formData.profession,
    logo_url: formData.logoDataUrl || cardResult.logo_url, 
    cover_image_url: formData.coverDataUrl || cardResult.cover_image_url,
    phone: formData.phone,
    whatsapp: formData.phone,
    email: formData.email,
    social_networks: formData.socialNetworks || [],
    website_url: formData.website_url,
    instagram_url: formData.instagram_url,
    facebook_url: formData.facebook_url,
    tiktok_url: formData.tiktok_url,
    linkedin_url: formData.linkedin_url,
    waze_url: formData.waze_url,
    qr_image_url: cardResult.qr_image_url,
    vcf_url: cardResult.vcf_url,
    services: [formData.service1, formData.service2, formData.service3].filter(Boolean),
    presentationStyle: formData.presentationStyle,
    preferred_style: formData.preferredStyle, // Pass style choice
    primary_color: formData.primaryColor // Pass specific color if chosen
  };

  // AI Styling Logic - Determine colors based on style choice
  const getThemeStyles = (style) => {
    switch(style) {
        case 'light':
            return {
                bgColor: '#F3F4F6', // Light gray bg for card header
                textColor: '#1F2937', // Dark text
                accentColor: '#3B82F6', // Blue accent
                gradient: 'linear-gradient(135deg, #F3F4F6 0%, #FFFFFF 100%)'
            };
        case 'warm':
            return {
                bgColor: '#2D1B1B', // Dark warm brown/red
                textColor: '#FFFFFF',
                accentColor: '#D4AF37', // Gold
                gradient: 'linear-gradient(135deg, #4A2C2C 0%, #2D1B1B 100%)'
            };
        case 'professional':
        default:
            return {
                bgColor: '#1A1A1A', // Dark gray/black
                textColor: '#FFFFFF',
                accentColor: '#00E5FF', // Cyan accent
                gradient: 'linear-gradient(135deg, #1E3A5F 0%, #1A1A1A 100%)'
            };
    }
  };

  const theme = getThemeStyles(formData.preferredStyle);

  const actions = {
    call: () => toast.info('הדגמה: חיוג'),
    whatsapp: () => toast.info('הדגמה: וואטסאפ'),
    email: () => toast.info('הדגמה: אימייל'),
    website: () => toast.info('הדגמה: אתר'),
    instagram: () => toast.info('הדגמה: אינסטגרם'),
    facebook: () => toast.info('הדגמה: פייסבוק'),
    tiktok: () => toast.info('הדגמה: טיקטוק'),
    linkedin: () => toast.info('הדגמה: לינקדאין'),
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
    <div className="flex flex-col w-full h-full relative pb-24">
      
      {/* Top Bar with Status */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
                <h2 className="font-bold text-gray-900 text-sm">הכרטיס מוכן!</h2>
                <p className="text-xs text-gray-500">תצוגה מקדימה ללקוחות</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleCopyLink}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                title="העתק קישור"
            >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
        </div>
      </div>

      {/* Main Preview Stage */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl -z-10" />
        
        {/* Phone Frame */}
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-[340px] aspect-[9/18] bg-[#121212] rounded-[40px] shadow-2xl border-[8px] border-gray-900 overflow-hidden ring-1 ring-white/10"
        >
            {/* Dynamic Island / Notch area */}
            <div className="absolute top-0 left-0 right-0 h-7 bg-gray-900 z-50 flex justify-center">
                <div className="w-24 h-5 bg-black rounded-b-xl" />
            </div>

            {/* Scrollable Content Area */}
            <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide bg-[#121212] text-white pb-20 relative">
                
                {/* Draft Watermark - Subtle */}
                <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none z-0 opacity-10">
                    <span className="text-6xl font-black rotate-[-15deg] uppercase tracking-widest">Draft</span>
                </div>

                <div className="relative z-10">
                    <CardHeader 
                        card={card} 
                        primaryColor={theme.accentColor} 
                        themeStyles={theme}
                    />
                    
                    <div className="mt-2 relative z-20">
                        <ActionButtons card={card} actions={actions} />
                    </div>

                    {/* Save Contact Preview */}
                    <div className="px-6 mt-8">
                        <div className="w-full bg-[#00E5FF] text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 opacity-90">
                            <span className="text-sm">שמור איש קשר</span>
                        </div>
                    </div>

                    {/* QR Preview */}
                    {card.qr_image_url && (
                        <div className="px-6 mt-8 pb-8 flex flex-col items-center">
                            <div className="bg-white p-2 rounded-xl shadow-lg">
                                <img 
                                    src={card.qr_image_url} 
                                    alt="QR Code" 
                                    className="w-24 h-24 object-contain"
                                />
                            </div>
                            <p className="text-gray-500 text-[10px] mt-2 font-medium">סרוק אותי</p>
                        </div>
                    )}
                    
                    {/* Footer Brand */}
                    <div className="text-center pb-6 pt-2 opacity-30">
                        <span className="text-[9px] tracking-widest uppercase">DigitalBcard</span>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>

      {/* Floating Bottom Bar (Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-[100] safe-area-bottom shadow-[0_-5px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-xl mx-auto flex items-center gap-3">
             <div className="hidden sm:block">
                 <div className="text-xs text-gray-500">מחיר חד פעמי</div>
                 <div className="flex items-baseline gap-1">
                     <span className="text-lg font-bold text-gray-900">₪49</span>
                     <span className="text-xs text-gray-400 line-through">₪98</span>
                 </div>
             </div>
             
             <div className="flex-1 flex gap-3">
                 <Button 
                    variant="outline" 
                    onClick={onBack}
                    className="flex-1 h-12 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-xl"
                 >
                    ערוך
                 </Button>
                 
                 <Button
                    onClick={onPurchase}
                    className="flex-[2] h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                 >
                    <ShoppingCart className="w-5 h-5" />
                    <span>רכוש ופרסם (₪49)</span>
                 </Button>
             </div>
        </div>
      </div>

    </div>
  );
}