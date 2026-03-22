import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Globe, Instagram, Facebook, MessageCircle, Share2, Download, ShoppingCart, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STYLE_THEMES = {
  professional: {
    bg: 'from-slate-900 via-slate-800 to-slate-900',
    accent: '#3B82F6',
    text: 'text-white',
    subtitleText: 'text-blue-300',
    cardBg: 'bg-white/10 backdrop-blur-sm border-white/10',
    serviceBg: 'bg-white/5 border-white/10',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    divider: 'border-white/10',
  },
  light: {
    bg: 'from-blue-50 via-white to-indigo-50',
    accent: '#6366F1',
    text: 'text-gray-900',
    subtitleText: 'text-indigo-600',
    cardBg: 'bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg',
    serviceBg: 'bg-indigo-50/50 border-indigo-100',
    buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
    divider: 'border-gray-200',
  },
  warm: {
    bg: 'from-amber-50 via-orange-50 to-rose-50',
    accent: '#F59E0B',
    text: 'text-gray-900',
    subtitleText: 'text-amber-700',
    cardBg: 'bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg',
    serviceBg: 'bg-amber-50/50 border-amber-100',
    buttonBg: 'bg-amber-500 hover:bg-amber-600',
    divider: 'border-amber-200',
  },
};

function getTheme(style) {
  return STYLE_THEMES[style] || STYLE_THEMES.professional;
}

function getSubtitle(data) {
  if (data.presentationStyle === 'name_role') return data.profession;
  if (data.presentationStyle === 'name_phrase') return data.profession || 'מומחה בתחומו';
  return data.profession || 'מומחה בתחומו';
}

export default function BusinessCardPreview({ data, onPurchase, onBack }) {
  const theme = getTheme(data.preferredStyle);
  const services = [data.service1, data.service2, data.service3].filter(Boolean);
  const subtitle = getSubtitle(data);
  const initials = (data.fullName || 'א')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center w-full space-y-6 pb-6">
      {/* Hero Label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-lg">
          <Sparkles className="w-5 h-5" />
          הכרטיס שלך מוכן!
        </div>
        <p className="text-xs text-gray-500">כרטיס ביקור דיגיטלי מקצועי וממותג</p>
      </motion.div>

      {/* THE CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-sm mx-auto relative"
      >
        {/* Watermark overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden rounded-2xl">
          <div className="text-white/20 font-black text-5xl rotate-[-30deg] whitespace-nowrap select-none border-2 border-white/10 px-4 py-2 rounded-xl">
            טיוטה
          </div>
        </div>

        <div className={cn(
          "rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br",
          theme.bg
        )}>
          {/* Top accent line */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${theme.accent}, transparent)` }} />

          <div className="p-6 space-y-5">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}99)` }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={cn("text-xl font-black leading-tight truncate", theme.text)}>
                  {data.fullName || 'השם שלך'}
                </h2>
                <p className={cn("text-sm font-medium mt-0.5", theme.subtitleText)}>
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className={cn("border-t", theme.divider)} />

            {/* Services */}
            {services.length > 0 && (
              <div className="space-y-2">
                {services.map((service, i) => (
                  <div 
                    key={i}
                    className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm", theme.serviceBg, theme.text)}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: theme.accent }} />
                    <span className="opacity-90">{service}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Contact Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {data.phone && (
                <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all hover:scale-[1.02]", theme.cardBg, theme.text)}>
                  <Phone className="w-4 h-4 flex-shrink-0" style={{ color: theme.accent }} />
                  <span className="truncate text-xs opacity-80">חייג עכשיו</span>
                </div>
              )}
              {data.phone && (
                <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all hover:scale-[1.02]", theme.cardBg, theme.text)}>
                  <MessageCircle className="w-4 h-4 flex-shrink-0 text-green-400" />
                  <span className="truncate text-xs opacity-80">WhatsApp</span>
                </div>
              )}
              {data.email && (
                <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all hover:scale-[1.02]", theme.cardBg, theme.text)}>
                  <Mail className="w-4 h-4 flex-shrink-0" style={{ color: theme.accent }} />
                  <span className="truncate text-xs opacity-80">שלח מייל</span>
                </div>
              )}
              {data.socialNetworks?.includes('instagram') && (
                <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all hover:scale-[1.02]", theme.cardBg, theme.text)}>
                  <Instagram className="w-4 h-4 flex-shrink-0 text-pink-400" />
                  <span className="truncate text-xs opacity-80">אינסטגרם</span>
                </div>
              )}
              {data.socialNetworks?.includes('facebook') && (
                <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all hover:scale-[1.02]", theme.cardBg, theme.text)}>
                  <Facebook className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <span className="truncate text-xs opacity-80">פייסבוק</span>
                </div>
              )}
              {data.socialNetworks?.includes('website') && (
                <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all hover:scale-[1.02]", theme.cardBg, theme.text)}>
                  <Globe className="w-4 h-4 flex-shrink-0" style={{ color: theme.accent }} />
                  <span className="truncate text-xs opacity-80">אתר</span>
                </div>
              )}
            </div>

            {/* Footer branding */}
            <div className="flex items-center justify-center pt-1">
              <span className="text-[10px] opacity-30 font-medium" style={{ color: theme.accent }}>
                Perfect Biz AI
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm mx-auto space-y-3"
      >
        {/* Purchase CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-xl flex-shrink-0">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm">הכרטיס מוכן – רק עוד צעד אחד!</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                רכוש את הכרטיס וקבל קישור שיתוף, כפתורי יצירת קשר פעילים ועיצוב ללא סימן מים.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 line-through">₪298</span>
              <span className="text-2xl font-black text-blue-600 mr-2">₪149</span>
              <span className="text-xs text-gray-500">חד פעמי</span>
            </div>
          </div>

          <Button
            onClick={onPurchase}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-blue-200 gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            רכוש את הכרטיס – ₪149
          </Button>

          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400">
            <span>✓ עיצוב ללא סימן מים</span>
            <span>✓ קישור שיתוף אישי</span>
            <span>✓ כפתורים פעילים</span>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
        >
          חזרה למרכז השליטה
        </button>
      </motion.div>
    </div>
  );
}