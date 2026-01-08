import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Briefcase, MessageSquare, Loader2, CheckCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackLeadSubmit } from '../tracking/EventTracker';

const PROFESSIONS = [
  "מעצב גרפי", "צלם", "אנימטור", "מאייר", "עורך וידאו", "מעצב פנים", "מעצב אופנה",
  "קופירייטר", "כותב תוכן", "מתרגם", "סופר", "בלוגר",
  "מפתח אתרים", "מעצב UX/UI", "מנהל מדיה חברתית", "מומחה SEO", "מומחה אקסל",
  "מוזיקאי", "מפיק מוזיקלי", "מורה למוזיקה", "DJ", "זמר",
  "מאמן כושר", "מטפל אלטרנטיבי", "יועץ תזונה", "מורה יוגה", "מסאז'יסט",
  "עוזר וירטואלי", "מנהל פרויקטים", "יועץ עסקי", "נהג הובלות", "איש תחזוקה",
  "שף פרטי", "קונדיטור", "ברמן", "קייטרינג", "מארגן אירועים",
  "מורה פרטי", "מדריך ילדים", "קואוצ'ר", "מורה לשפות", "אחר"
];

export default function LeadForm({ 
  title = "🚀 התחל את העסק שלך היום",
  subtitle = "מלא פרטים ונחזור אליך תוך שעות",
  defaultProfession = "",
  sourcePage = "כללי",
  compact = false,
  variant = "default" // default, card, inline
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    profession: defaultProfession,
    notes: '',
    consent: false
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

    // Create lead
    const newLead = await base44.entities.Lead.create({
      ...formData,
      source_page: sourcePage,
      status: 'new'
    });

    // Track conversion
    trackLeadSubmit(newLead);

    // Send email via backend function
    try {
      await base44.functions.sendLeadEmail({
        lead_id: newLead.id,
        lead_name: newLead.name,
        lead_phone: newLead.phone,
        lead_email: newLead.email,
        lead_profession: newLead.profession,
        lead_notes: newLead.notes,
        source_page: sourcePage
      });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
    }

    // Wait a bit then redirect
    await new Promise(resolve => setTimeout(resolve, 500));

    // Redirect to Thank You page
    window.location.href = '/ThankYou';
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center p-8 ${variant === 'card' ? 'bg-white rounded-2xl shadow-elegant' : ''}`}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
        <p className="text-gray-600">נציג יצור איתך קשר בהקדם</p>
      </motion.div>
    );
  }

  return (
    <div className={variant === 'card' ? 'bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100' : ''}>
      {title && (
        <div className="text-center mb-6">
          <h3 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-2">{title}</h3>
          {subtitle && <p className="text-base text-gray-600 font-medium">{subtitle}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/40" />
            <Input
              placeholder="שם מלא *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pr-11 h-14 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/40" />
            <Input
              type="tel"
              placeholder="טלפון *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="pr-11 h-14 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
              required
            />
          </div>
        </div>

        {!compact && (
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/40" />
            <Input
              type="email"
              placeholder="אימייל (אופציונלי)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pr-11 h-14 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium"
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-16 text-lg sm:text-xl font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin ml-2" />
              שולח...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 ml-2" />
              בדיקה ללא התחייבות
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500 mt-3">
          🔒 ליווי אנושי, לא בוט • הכוונה מותאמת אישית • בלי ספאם
        </p>
      </form>
    </div>
  );
}