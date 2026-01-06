import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Briefcase, MessageSquare, Loader2, CheckCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: sourcePage,
        status: 'new'
      });

      // Send to WhatsApp
      const message = `🔔 ליד חדש מהאתר!

👤 שם: ${formData.name}
📞 טלפון: ${formData.phone}
📧 אימייל: ${formData.email || 'לא צוין'}
💼 מקצוע: ${formData.profession || 'לא צוין'}
💬 הערות: ${formData.notes || 'אין'}

📍 מקור: ${sourcePage}
📅 תאריך: ${new Date().toLocaleString('he-IL')}`;

      window.open(`https://wa.me/972502277087?text=${encodeURIComponent(message)}`, '_blank');

      setIsSuccess(true);
    } catch (err) {
      setError('אירעה שגיאה, נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className={variant === 'card' ? 'bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-2xl p-8 md:p-10 border border-blue-100' : ''}>
      {title && (
        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-3 leading-tight">{title}</h3>
          {subtitle && <p className="text-lg text-gray-600 font-medium">{subtitle}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={compact ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          <div className="relative">
            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#1E3A5F]/40" />
            <Input
              placeholder="שם מלא *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pr-14 h-16 text-lg rounded-2xl border-2 border-gray-200 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium shadow-sm"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#1E3A5F]/40" />
            <Input
              type="tel"
              placeholder="טלפון *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="pr-14 h-16 text-lg rounded-2xl border-2 border-gray-200 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium shadow-sm"
              required
            />
          </div>
        </div>

        {!compact && (
          <>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#1E3A5F]/40" />
              <Input
                type="email"
                placeholder="אימייל"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pr-14 h-16 text-lg rounded-2xl border-2 border-gray-200 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 font-medium shadow-sm"
              />
            </div>

            <div className="relative">
              <Briefcase className="absolute right-4 top-4 w-6 h-6 text-[#1E3A5F]/40 z-10" />
              <Select
                value={formData.profession}
                onValueChange={(value) => setFormData({ ...formData, profession: value })}
              >
                <SelectTrigger className="pr-14 h-16 text-lg rounded-2xl border-2 border-gray-200 font-medium shadow-sm">
                  <SelectValue placeholder="בחר מקצוע" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((prof) => (
                    <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <MessageSquare className="absolute right-4 top-4 w-6 h-6 text-[#1E3A5F]/40" />
              <Textarea
                placeholder="ספר לנו קצת על העסק שלך..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="pr-14 min-h-32 text-lg rounded-2xl border-2 border-gray-200 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 resize-none font-medium shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => setFormData({ ...formData, consent: checked })}
              />
              <Label htmlFor="consent" className="text-sm text-gray-600 cursor-pointer">
                אני מסכים/ה לקבל מידע ועדכונים
              </Label>
            </div>
          </>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-20 text-xl md:text-2xl font-black rounded-3xl bg-gradient-to-r from-[#27AE60] via-[#2ECC71] to-[#27AE60] hover:from-[#2ECC71] hover:via-[#27AE60] hover:to-[#2ECC71] text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 animate-pulse-glow"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin ml-3" />
              שולח...
            </>
          ) : (
            <>
              <Send className="w-6 h-6 ml-3" />
              בואו נתחיל את העסק! 🚀
            </>
          )}
        </Button>
      </form>
    </div>
  );
}