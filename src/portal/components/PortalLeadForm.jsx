import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, Phone } from 'lucide-react';
import { invokeFunction } from '@/api/supabaseClient';

const BUSINESS_TYPES = [
  { value: 'osek_patur', label: 'פתיחת עוסק פטור' },
  { value: 'osek_murshe', label: 'פתיחת עוסק מורשה' },
  { value: 'hevra_bam', label: 'הקמת חברה בע"מ' },
  { value: 'sgirat_tikim', label: 'סגירת תיקים' },
  { value: 'consultation', label: 'ייעוץ כללי' },
];

export default function PortalLeadForm({
  sourcePage = 'portal',
  ctaText = 'שלח פרטים',
  title = 'השאירו פרטים ונחזור אליכם',
  subtitle,
  variant = 'default',
  className = '',
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', businessType: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      // Get UTM params from URL
      const params = new URLSearchParams(window.location.search);

      await invokeFunction('submitLead', {
        name: form.name,
        phone: form.phone,
        profession: form.businessType,
        source: 'sales_portal',
        source_page: `פורטל עסקי - ${sourcePage}`,
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_term: params.get('utm_term') || '',
        utm_content: params.get('utm_content') || '',
        referrer: document.referrer || '',
      });

      // Redirect to ThankYou page — conversion tracking fires there
      navigate(`/ThankYou?source=${encodeURIComponent(sourcePage)}&name=${encodeURIComponent(form.name)}`);
    } catch (err) {
      setError('שגיאה בשליחה, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div className={className}>
      {title && !isCompact && <h2 className="text-xl sm:text-2xl font-bold text-portal-navy mb-2 text-center">{title}</h2>}
      {subtitle && !isCompact && <p className="text-gray-500 text-center mb-6">{subtitle}</p>}

      <form onSubmit={handleSubmit} className={`${isCompact ? 'flex flex-wrap gap-3 items-end' : 'space-y-4 max-w-md mx-auto'}`}>
        <div className={isCompact ? 'flex-1 min-w-[140px]' : ''}>
          {!isCompact && <Label className="mb-1.5 block text-portal-navy font-medium">שם מלא *</Label>}
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="שם מלא"
            required
            className="h-12 rounded-xl text-base border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
          />
        </div>

        <div className={isCompact ? 'flex-1 min-w-[140px]' : ''}>
          {!isCompact && <Label className="mb-1.5 block text-portal-navy font-medium">טלפון *</Label>}
          <Input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="050-0000000"
            type="tel"
            required
            className="h-12 rounded-xl text-base border-gray-200 focus:border-portal-teal focus:ring-portal-teal"
          />
        </div>

        {!isCompact && (
          <div>
            <Label className="mb-1.5 block text-portal-navy font-medium">סוג שירות</Label>
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
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className={`h-12 sm:h-14 rounded-2xl text-base sm:text-lg font-bold shadow-lg bg-portal-teal hover:bg-portal-teal-dark text-white ${isCompact ? 'px-6' : 'w-full'}`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Phone className="ml-2 h-5 w-5" />
              {ctaText}
            </>
          )}
        </Button>
      </form>

      {!isCompact && (
        <p className="text-xs text-gray-400 text-center mt-3">
          המידע שלך מאובטח ולא יועבר לצד שלישי
        </p>
      )}
    </div>
  );
}
