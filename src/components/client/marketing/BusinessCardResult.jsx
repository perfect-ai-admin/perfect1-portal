import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CardHeader from '@/components/digital-card/CardHeader';
import ActionButtons from '@/components/digital-card/ActionButtons';
import { cn } from '@/lib/utils';

export default function BusinessCardResult({ formData, cardResult, onPurchase, onBack }) {
  const [copied, setCopied] = useState(false);

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
    preferred_style: formData.preferredStyle,
    primary_color: formData.primaryColor
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

  return (
    <div className="flex flex-col w-full h-full relative min-h-screen bg-gray-50/50">
      
      {/* Premium Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
                <h2 className="font-bold text-gray-900 text-base">הכרטיס שלך מוכן!</h2>
                <p className="text-xs text-gray-500 font-medium">כך הלקוחות שלך יראו אותו</p>
            </div>
        </div>
        <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-xs font-medium text-gray-700"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>העתק קישור</span>
        </button>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-32 overflow-y-auto">
        
        {/* Phone Frame Container */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="relative w-full max-w-[320px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-[45px] border-[8px] border-gray-900 bg-gray-900 z-10"
        >
            {/* Glossy Reflection overlay */}
            <div className="absolute inset-0 rounded-[38px] pointer-events-none ring-1 ring-white/10 z-50 shadow-inner" />
            
            {/* Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-xl z-50" />

            {/* Screen Content */}
            <div className="w-full h-[650px] bg-[#121212] rounded-[38px] overflow-hidden overflow-y-auto scrollbar-hide relative flex flex-col">
                
                {/* Content */}
                <div className="relative z-10 min-h-full pb-10">
                    <CardHeader 
                        card={card} 
                        primaryColor={theme.accentColor} 
                        themeStyles={theme}
                    />
                    
                    <div className="mt-4 relative z-20 px-2">
                        <ActionButtons card={card} actions={actions} />
                    </div>

                    {/* Save Contact Button */}
                    <div className="px-6 mt-8">
                        <div className="w-full bg-[#00E5FF] text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform active:scale-95">
                            <span className="text-sm">שמור איש קשר</span>
                        </div>
                    </div>

                    {/* QR Section */}
                    {card.qr_image_url && (
                        <div className="px-6 mt-10 flex flex-col items-center opacity-90">
                            <div className="bg-white p-3 rounded-2xl shadow-xl">
                                <img 
                                    src={card.qr_image_url} 
                                    alt="QR Code" 
                                    className="w-28 h-28 object-contain"
                                />
                            </div>
                            <p className="text-gray-400 text-[10px] mt-3 font-medium tracking-wide uppercase">Scan to connect</p>
                        </div>
                    )}
                    
                    {/* Brand Footer in Phone */}
                    <div className="text-center mt-8 pb-8 opacity-20">
                        <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-white">DigitalBcard</span>
                    </div>
                </div>
            </div>

            {/* Side Buttons (Visual only) */}
            <div className="absolute top-24 -right-2.5 w-1 h-8 bg-gray-800 rounded-r-md shadow-sm" />
            <div className="absolute top-40 -right-2.5 w-1 h-12 bg-gray-800 rounded-r-md shadow-sm" />
            <div className="absolute top-24 -left-2.5 w-1 h-6 bg-gray-800 rounded-l-md shadow-sm" />
        </motion.div>
        
        {/* Shadow/Reflections under phone */}
        <div className="w-[280px] h-4 bg-black/20 blur-xl rounded-full mt-[-20px] z-0" />
      </div>

      {/* Clean Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
             <div className="hidden sm:flex flex-col">
                 <span className="text-xs text-gray-500 font-medium">מחיר השקה מיוחד</span>
                 <div className="flex items-baseline gap-2">
                     <span className="text-xl font-black text-gray-900">₪49</span>
                     <span className="text-sm text-gray-400 line-through font-medium">₪98</span>
                 </div>
             </div>
             
             <div className="flex-1 flex gap-3 max-w-md ml-auto sm:ml-0">
                 <Button 
                    variant="outline" 
                    onClick={onBack}
                    className="flex-1 h-14 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-2xl font-medium"
                 >
                    ערוך עיצוב
                 </Button>
                 
                 <Button
                    onClick={onPurchase}
                    className="flex-[2] h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                 >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm">רכוש ופרסם עכשיו</span>
                        <span className="text-[10px] opacity-80 font-normal sm:hidden">מחיר חד פעמי ₪49</span>
                    </div>
                 </Button>
             </div>
        </div>
      </div>

    </div>
  );
}