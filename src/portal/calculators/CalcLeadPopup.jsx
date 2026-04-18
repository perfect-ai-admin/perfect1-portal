import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone, User, X, Sparkles } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

/**
 * Lead capture popup that appears after 30 seconds on calculator pages.
 * Each calculator type gets a unique message.
 *
 * Usage: <CalcLeadPopup type="income-tax" />
 */

const POPUP_CONTENT = {
  'net-income': {
    title: 'רוצה לדעת בדיוק כמה נשאר לך?',
    subtitle: 'רואה חשבון מומחה לעצמאים יבדוק את המספרים שלך ויגלה אם אפשר לחסוך — בדיקה ראשונית בחינם.',
    cta: 'שרואה חשבון יחזור אליי',
    source: 'popup_net_income',
  },
  'credit-points': {
    title: 'יכול להיות שמגיעות לך נקודות זיכוי נוספות',
    subtitle: 'הרבה עצמאים לא מנצלים את כל הנקודות שמגיעות להם. בדיקה קצרה של רואה חשבון יכולה לחסוך אלפי שקלים במס.',
    cta: 'רוצה בדיקת זכאות חינם',
    source: 'popup_credit_points',
  },
  'income-tax': {
    title: 'משלם יותר מדי מס הכנסה?',
    subtitle: 'עצמאים רבים משלמים מס מיותר בגלל הוצאות שלא מדווחות או תכנון לא נכון. בדיקה של 10 דקות יכולה לחסוך לך אלפי שקלים.',
    cta: 'רוצה בדיקת חיסכון במס',
    source: 'popup_income_tax',
  },
  'national-insurance': {
    title: 'אפשר לשלם פחות ביטוח לאומי?',
    subtitle: 'לפעמים שינוי קטן במבנה העסקי או בדיווח ההוצאות יכול להוריד את התשלום. שווה לבדוק עם מומחה.',
    cta: 'רוצה לבדוק אם אפשר להוריד',
    source: 'popup_national_insurance',
  },
  'company-tax': {
    title: 'לא בטוח אם חברה בע"מ מתאימה לך?',
    subtitle: 'ההחלטה בין עוסק מורשה לחברה שווה עשרות אלפי שקלים בשנה. 10 דקות עם רואה חשבון יכולות לחסוך לך הרבה כסף.',
    cta: 'רוצה בדיקת כדאיות חינם',
    source: 'popup_company_tax',
  },
};

const STORAGE_KEY = 'calc_popup_dismissed';

export default function CalcLeadPopup({ type = 'net-income' }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const content = POPUP_CONTENT[type] || POPUP_CONTENT['net-income'];

  useEffect(() => {
    // Don't show if already dismissed in this session
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      // Don't show if user already submitted a lead form on the page
      if (document.querySelector('[data-lead-sent]')) return;
      setOpen(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('מלאו שם וטלפון');
      return;
    }
    setSending(true);
    try {
      await supabase.from('leads').insert({
        name: name.trim(),
        phone: phone.trim(),
        source: 'calculator_popup',
        source_page: content.source,
        notes: `פופאפ מחשבון: ${type}`,
      });
      setSent(true);
      toast.success('הפרטים נשלחו בהצלחה!');
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch {
      toast.error('שגיאה בשליחה, נסו שוב');
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-sm mx-auto p-0 border-0 rounded-2xl overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-l from-portal-navy to-[#2a4f7a] p-5 text-white relative">
          <button onClick={handleClose} className="absolute left-3 top-3 text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <Sparkles className="w-8 h-8 mb-3 text-amber-300" />
          <h3 className="text-lg font-bold leading-tight">{content.title}</h3>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">{content.subtitle}</p>
        </div>

        {/* Form */}
        <div className="p-5">
          {!sent ? (
            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="שם"
                  className="h-12 rounded-xl pr-10"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <div className="relative">
                <Input
                  placeholder="טלפון"
                  type="tel"
                  className="h-12 rounded-xl pr-10"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={sending}
                className="w-full h-12 rounded-xl font-bold bg-portal-teal hover:bg-portal-teal/90 text-base"
              >
                {sending ? 'שולח...' : content.cta}
              </Button>
              <p className="text-[10px] text-gray-400 text-center">ללא התחייבות · בדיקה ראשונית חינם</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-bold text-portal-navy">תודה!</p>
              <p className="text-sm text-gray-500 mt-1">ניצור אתכם קשר בהקדם</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
