import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Phone, Shield, Clock, Users, Star, CheckCircle2, ArrowLeft } from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';

const BUSINESS_TYPES = [
  { value: 'osek_patur', label: 'פתיחת עוסק פטור' },
  { value: 'osek_murshe', label: 'פתיחת עוסק מורשה' },
  { value: 'hevra_bam', label: 'הקמת חברה בע"מ' },
  { value: 'sgirat_tikim', label: 'סגירת תיקים' },
  { value: 'consultation', label: 'ייעוץ כללי' },
];

const SOCIAL_PROOF_NAMES = ['דני מ.', 'מיכל ש.', 'אורן כ.', 'נועה ל.', 'יוסי ב.', 'רונית ג.'];

export default function PortalLeadForm({
  sourcePage = 'portal',
  ctaText = 'לייעוץ חינם עם רואה חשבון',
  title = 'ייעוץ מקצועי חינם עם רואה חשבון',
  subtitle = 'השאירו פרטים — רואה חשבון מוסמך יחזור אליכם תוך דקות',
  variant = 'default',
  className = '',
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', businessType: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentName, setRecentName] = useState('');

  // Social proof — rotate a "recent signup" name
  useEffect(() => {
    setRecentName(SOCIAL_PROOF_NAMES[Math.floor(Math.random() * SOCIAL_PROOF_NAMES.length)]);
  }, []);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      setError('נא למלא שם וטלפון');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const getUtm = (key) => new URLSearchParams(window.location.search).get(key) || localStorage.getItem(`lead_${key}`) || '';
      await invokeFunction('submitLeadToN8N', {
        name: form.name,
        phone: form.phone,
        pageSlug: sourcePage,
        businessName: `פורטל - ${sourcePage}`,
        gclid: localStorage.getItem('lead_gclid') || '',
        fbclid: localStorage.getItem('lead_fbclid') || '',
        utm_source: getUtm('utm_source'),
        utm_medium: getUtm('utm_medium'),
        utm_campaign: getUtm('utm_campaign'),
        referrer: document.referrer || localStorage.getItem('lead_referrer') || '',
      });

      navigate('/ThankYou', { state: { source: sourcePage, name: form.name, fromForm: true } });
    } catch (err) {
      setError('שגיאה בשליחה, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="שם מלא"
              required
              className="h-12 rounded-xl text-base border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <Input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="050-0000000"
              type="tel"
              required
              className="h-12 rounded-xl text-base border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
            />
          </div>
          {error && <p className="text-red-500 text-sm w-full">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-6 rounded-2xl text-base font-bold shadow-lg bg-portal-teal hover:bg-portal-teal-dark text-white"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><Phone className="ml-2 h-5 w-5" />{ctaText}</>
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
      {/* Header strip */}
      <div className="bg-gradient-to-l from-portal-navy to-portal-navy-light px-6 py-4 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
        <p className="text-white/80 text-sm mt-1">{subtitle}</p>
      </div>

      <div className="p-6">
        {/* Social proof banner */}
        <div className="flex items-center justify-center gap-2 mb-5 py-2.5 px-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex -space-x-1 space-x-reverse">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-sm text-gray-700 font-medium">
            {recentName} קיבל/ה ייעוץ חינם לפני 12 דקות
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <Label className="mb-1.5 block text-portal-navy font-medium">שם מלא *</Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="איך קוראים לך?"
              required
              className="h-12 rounded-xl text-base border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-portal-navy font-medium">טלפון *</Label>
            <Input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="050-0000000"
              type="tel"
              required
              className="h-12 rounded-xl text-base border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-portal-navy font-medium">במה נוכל לעזור?</Label>
            <Select value={form.businessType} onValueChange={(v) => set('businessType', v)}>
              <SelectTrigger className="h-12 rounded-xl text-base border-gray-200">
                <SelectValue placeholder="בחר סוג שירות" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg bg-portal-teal hover:bg-portal-teal-dark hover:scale-[1.02] active:scale-100 transition-all text-white"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ArrowLeft className="ml-2 h-5 w-5" />
                {ctaText}
              </>
            )}
          </Button>
        </form>

        {/* Value props */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-portal-teal flex-shrink-0" />
            <span>רואה חשבון מוסמך — לא נציג מכירות</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-portal-teal flex-shrink-0" />
            <span>שיחת ייעוץ ראשונה חינם, ללא התחייבות</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-portal-teal flex-shrink-0" />
            <span>חוזרים אליך תוך 30 דקות בשעות העבודה</span>
          </div>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1"><Shield className="w-3.5 h-3.5" />מידע מאובטח</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />זמינים א׳–ה׳ 9:00–18:00</span>
          <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />1,200+ בעלי עסקים נעזרו</span>
        </div>
      </div>
    </div>
  );
}
