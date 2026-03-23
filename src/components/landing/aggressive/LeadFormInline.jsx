import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LeadFormInline({
  onSubmit,
  isSubmitting: externalSubmitting,
  sourcePage = 'דף נחיתה אגרסיבי',
  ctaText = 'התחל פתיחת עוסק פטור עכשיו',
  subText = 'נציג חוזר אליך תוך דקות',
  dark = false
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isSubmitting = externalSubmitting || localSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (onSubmit) {
      onSubmit({ name, phone, sourcePage });
      return;
    }

    setLocalSubmitting(true);
    await base44.functions.invoke('submitLead', {
      name,
      phone,
      source_page: sourcePage,
      status: 'new'
    });

    // GTM dataLayer push
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'lead_submit', lead_source: sourcePage });

    window.location.href = '/ThankYou';
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">קיבלנו!</h3>
        <p className="text-gray-600">נחזור אליך ממש בקרוב</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-2xl p-6 border-2 ${dark ? 'bg-[#1E3A5F] border-white/20' : 'bg-white border-[#D4AF37]/30'}`}>
      <div className="text-center mb-4">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${dark ? 'bg-[#27AE60]/20 text-[#27AE60]' : 'bg-red-100 text-red-700'}`}>
          🔥 השאר פרטים – חזרה מיידית
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="שם מלא"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 rounded-xl border-2 text-base font-medium"
          required
        />
        <Input
          type="tel"
          placeholder="מספר טלפון"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-12 rounded-xl border-2 text-base font-medium"
          required
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 text-lg font-black rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white shadow-lg animate-pulse-glow"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin ml-2" /> שולח...</>
          ) : (
            <>{ctaText} <ArrowLeft className="w-5 h-5 mr-1" /></>
          )}
        </Button>

        <p className={`text-xs text-center font-medium ${dark ? 'text-white/60' : 'text-gray-400'}`}>
          {subText}
        </p>
      </form>
    </div>
  );
}