import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, MessageCircle, Loader2, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';
import { PORTAL_CTA } from '../config/navigation';
import { invokeFunction } from '@/api/supabaseClient';

export default function InlineCTA({
  title = 'צריך עזרה? רואה חשבון מוסמך ייעץ לך — בחינם',
  buttonText = 'לייעוץ חינם',
  variant = 'default',
  sourcePage = 'inline-cta'
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        pageSlug: sourcePage || 'landing-page',
        businessName: `דף נחיתה - ${sourcePage || 'unnamed'}`,
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

  return (
    <div className="my-10 bg-gradient-to-l from-portal-navy to-portal-navy-light rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]" />

      <div className="relative">
        <h3 className="text-xl sm:text-2xl font-bold mb-1 text-center">{title}</h3>
        <p className="text-white/70 text-center text-sm mb-5">השאר שם וטלפון — נחזור אליך תוך 30 דקות</p>

        {/* Lead Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end mb-4">
          <Input
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="השם שלך"
            required
            className="h-12 rounded-xl text-base bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-portal-teal focus:ring-portal-teal flex-1"
          />
          <Input
            value={form.phone}
            onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="050-0000000"
            type="tel"
            required
            className="h-12 rounded-xl text-base bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-portal-teal focus:ring-portal-teal flex-1"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-6 rounded-xl text-base bg-portal-teal hover:bg-portal-teal-dark hover:scale-[1.02] active:scale-100 transition-all text-white font-bold shadow-lg whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><ArrowLeft className="ml-1.5 h-4 w-4" />{buttonText}</>
            )}
          </Button>
        </form>

        {error && <p className="text-red-300 text-sm text-center mb-3">{error}</p>}

        {/* Value props */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-4 text-sm text-white/80">
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-portal-teal" />ייעוץ ע"י רו"ח מוסמך</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-portal-teal" />חינם וללא התחייבות</span>
        </div>

        {/* Trust + alternatives */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>הפרטים שלך מאובטחים ולא יועברו לצד שלישי</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs">או:</span>
            <a
              href={`tel:${PORTAL_CTA.phone}`}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{PORTAL_CTA.phone}</span>
            </a>
            <a
              href={PORTAL_CTA.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
