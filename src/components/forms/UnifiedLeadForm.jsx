import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Phone, Mail, Loader2, CheckCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackLeadSubmit } from '../tracking/EventTracker';

/**
 * UnifiedLeadForm - טופס לידים אחיד לכל האתר
 * משמש כבסיס לכל וריאציות של טפסים
 */
export default function UnifiedLeadForm({ 
  // תצוגה
  variant = "default", // default, card, compact, popup
  title,
  subtitle,
  ctaText = "בדיקה ללא התחייבות",
  successTitle = "קיבלנו את הפרטים!",
  successMessage = "נציג יצור איתך קשר בהקדם",
  
  // תוכן
  fields = ["name", "phone", "email"], // מאילו שדות צריך
  defaultProfession = "",
  
  // התנהגות
  sourcePage = "כללי",
  onSuccess, // callback אחרי שליחה מוצלחת
  showProfession = false,
  compact = false,
  invertColors = false, // עבור שימוש על רקע ירוק
  
  // דוגמה של profession
  professions = [
    "מעצב גרפי", "צלם", "אנימטור", "מאייר", "עורך וידאו", "מעצב פנים", "מעצב אופנה",
    "קופירייטר", "כותב תוכן", "מתרגם", "סופר", "בלוגר",
    "מפתח אתרים", "מעצב UX/UI", "מנהל מדיה חברתית", "מומחה SEO", "מומחה אקסל",
    "מוזיקאי", "מפיק מוזיקלי", "מורה למוזיקה", "DJ", "זמר",
    "מאמן כושר", "מטפל אלטרנטיבי", "יועץ תזונה", "מורה יוגה", "מסאז'יסט",
    "עוזר וירטואלי", "מנהל פרויקטים", "יועץ עסקי", "נהג הובלות", "איש תחזוקה",
    "שף פרטי", "קונדיטור", "ברמן", "קייטרינג", "מארגן אירועים",
    "מורה פרטי", "מדריך ילדים", "קואוצ'ר", "מורה לשפות", "אחר"
  ]
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    profession: defaultProfession,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone) {
      setError('נא למלא שם וטלפון');
      return;
    }

    setIsSubmitting(true);

    try {
      // יצירת לד
      const newLead = await base44.entities.Lead.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        profession: showProfession ? formData.profession : undefined,
        source_page: sourcePage,
        status: 'new'
      });

      // Tracking
      trackLeadSubmit(newLead);

      // Email notification
      try {
        await base44.integrations.Core.SendEmail({
          to: 'yosi5919@gmail.com',
          subject: `🎯 ליד חדש מ${sourcePage}`,
          body: `
            <div style="direction: rtl; font-family: Arial, sans-serif;">
              <h2 style="color: #1E3A5F;">ליד חדש התקבל! 🎉</h2>
              <p><strong>שם:</strong> ${newLead.name}</p>
              <p><strong>טלפון:</strong> ${newLead.phone}</p>
              ${newLead.email ? `<p><strong>אימייל:</strong> ${newLead.email}</p>` : ''}
              ${newLead.profession ? `<p><strong>מקצוע:</strong> ${newLead.profession}</p>` : ''}
              <p><strong>מקור:</strong> ${sourcePage}</p>
              <p><strong>תאריך:</strong> ${new Date().toLocaleString('he-IL')}</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }

      setIsSuccess(true);

      // Callback אם יש
      if (onSuccess) {
        onSuccess(newLead);
      } else {
        // Default: redirect אחרי 1.5 שניות
        await new Promise(resolve => setTimeout(resolve, 1500));
        window.location.href = '/ThankYou';
      }
    } catch (submitError) {
      console.error('Error submitting lead:', submitError);
      setError('אירעה שגיאה, אנא נסה שוב');
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center p-6 ${variant === 'card' ? 'bg-white rounded-2xl shadow-elegant' : ''}`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">{successTitle}</h3>
        <p className="text-sm text-gray-600">{successMessage}</p>
      </motion.div>
    );
  }

  // Variants rendering
  const baseClasses = {
    default: '',
    card: 'bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100',
    compact: 'bg-white rounded-xl p-4',
    popup: ''
  };

  const containerClass = baseClasses[variant];

  return (
    <div className={containerClass}>
      {(title || subtitle) && (
        <div className="text-center mb-4">
          {title && (
            <h3 className={`font-black text-[#1E3A5F] mb-1 ${
              variant === 'popup' ? 'text-base' : 'text-2xl md:text-3xl'
            }`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-gray-600 font-medium ${
              variant === 'popup' ? 'text-xs' : 'text-base'
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-${variant === 'compact' ? '2' : '3'}`}>
        {/* Important Disclosure */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
          <p className="text-xs text-gray-700 leading-relaxed">
            <strong className="text-yellow-800">הבהרה:</strong> זהו שירות פרטי לייעוץ בלבד. האתר אינו ממשלתי ואינו מהווה ייעוץ חשבונאי רשמי.
          </p>
        </div>

        {/* Name */}
        {fields.includes('name') && (
          <div className="relative">
            <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${invertColors ? 'text-white/40' : 'text-[#1E3A5F]/40'}`} />
            <Input
              placeholder="שם מלא *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`pr-11 border-2 rounded-xl font-medium ${
                invertColors 
                  ? 'border-white/30 bg-white/20 text-white placeholder-white/70 focus:border-white focus:ring-2 focus:ring-white/30'
                  : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20'
              } ${variant === 'compact' ? 'h-11 text-base' : 'h-14 text-base sm:text-lg'}`}
              required
            />
          </div>
        )}

        {/* Phone */}
        {fields.includes('phone') && (
          <div className="relative">
            <Phone className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${invertColors ? 'text-white/40' : 'text-[#1E3A5F]/40'}`} />
            <Input
              type="tel"
              placeholder="טלפון *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`pr-11 border-2 rounded-xl font-medium ${
                invertColors 
                  ? 'border-white/30 bg-white/20 text-white placeholder-white/70 focus:border-white focus:ring-2 focus:ring-white/30'
                  : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20'
              } ${variant === 'compact' ? 'h-11 text-base' : 'h-14 text-base sm:text-lg'}`}
              required
            />
          </div>
        )}

        {/* Email */}
        {fields.includes('email') && (
          <div className="relative">
            <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${invertColors ? 'text-white/40' : 'text-[#1E3A5F]/40'}`} />
            <Input
              type="email"
              placeholder="אימייל (אופציונלי)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`pr-11 border-2 rounded-xl font-medium ${
                invertColors 
                  ? 'border-white/30 bg-white/20 text-white placeholder-white/70 focus:border-white focus:ring-2 focus:ring-white/30'
                  : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20'
              } ${variant === 'compact' ? 'h-11 text-base' : 'h-14 text-base sm:text-lg'}`}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs sm:text-sm text-center bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation ${
            variant === 'compact' ? 'h-11 text-sm' : 'h-16 text-lg sm:text-xl'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              שולח...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 ml-2" />
              {ctaText}
            </>
          )}
        </Button>

        {/* Footer Trust Text */}
        <p className={`text-xs text-center font-bold ${invertColors ? 'text-white' : 'text-gray-500'}`}>
          🔒 ליווי אנושי • בלי ספאם
        </p>
      </form>
    </div>
  );
}