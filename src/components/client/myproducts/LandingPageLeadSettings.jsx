import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Phone, Mail, Link2, MessageCircle, Webhook, CheckCircle2, AlertCircle, ArrowLeft, Zap } from 'lucide-react';

export default function LandingPageLeadSettings({ page, onSave, saving }) {
  const [form, setForm] = useState({
    lead_destination: 'n8n',
    destination_phone: '',
    destination_email: '',
  });

  useEffect(() => {
    if (page) {
      setForm({
        lead_destination: page.lead_destination || 'n8n',
        destination_phone: page.destination_phone || page.phone || '',
        destination_email: page.destination_email || '',
      });
    }
  }, [page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const destinations = [
    { 
      value: 'n8n', 
      label: 'CRM + כל הערוצים', 
      icon: Webhook, 
      desc: 'לידים נשמרים ב-CRM שלך + נשלחים לוואטסאפ ומייל (אם הוגדרו)', 
      badge: 'מומלץ',
      detail: 'הליד נשמר אוטומטית במערכת הלידים, ובנוסף נשלחת התראה לוואטסאפ ולמייל שהגדרת.'
    },
    { 
      value: 'whatsapp', 
      label: 'WhatsApp ישיר', 
      icon: MessageCircle, 
      desc: 'לידים נשלחים ישירות ל-WhatsApp שלך + נשמרים ב-CRM',
      detail: 'הליד נשמר במערכת ונשלח כהודעת וואטסאפ עם כל הפרטים למספר שתגדיר.'
    },
    { 
      value: 'email', 
      label: 'התראת אימייל', 
      icon: Mail, 
      desc: 'לידים נשלחים למייל שלך + נשמרים ב-CRM',
      detail: 'הליד נשמר במערכת ונשלח כמייל מעוצב עם כל פרטי הליד לכתובת שתגדיר.'
    },
    { 
      value: 'phone', 
      label: 'הודעת WhatsApp (כ-SMS)', 
      icon: Phone, 
      desc: 'לידים נשלחים כהודעה קצרה לטלפון שלך + נשמרים ב-CRM',
      detail: 'הליד נשמר במערכת ונשלחת הודעת וואטסאפ קצרה עם תמצית הפרטים.'
    },
  ];

  const selectedDest = destinations.find(d => d.value === form.lead_destination);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* How it works */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
              <Zap className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="font-bold text-green-900 text-sm mb-1">חיבור אמיתי - לא רק ממשק</p>
              <p className="text-xs text-green-800 leading-relaxed">
                כל ליד שנכנס מדף הנחיתה שלך: 
                <strong> נשמר אוטומטית ב-CRM</strong> (מערכת הלידים), 
                <strong> מקושר לדף הנחיתה הספציפי שלך</strong>, 
                ו<strong>נשלח אליך בערוץ שתבחר</strong> (וואטסאפ / מייל / שניהם).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Destination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5 text-blue-600" />
            ערוץ קבלת ההתראות
          </CardTitle>
          <CardDescription>
            בחר/י איפה תקבל/י את ההתראות על לידים חדשים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {destinations.map((dest) => {
            const Icon = dest.icon;
            const isActive = form.lead_destination === dest.value;
            return (
              <button
                key={dest.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, lead_destination: dest.value }))}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-right ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {dest.label}
                    </span>
                    {dest.badge && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">{dest.badge}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{dest.desc}</p>
                </div>
                {isActive && <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-2" />}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Destination Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">פרטי היעד שלך</CardTitle>
          <CardDescription>
            {selectedDest?.detail || 'הגדר את הפרטים לקבלת הלידים'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(form.lead_destination === 'whatsapp' || form.lead_destination === 'phone' || form.lead_destination === 'n8n') && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                מספר WhatsApp לקבלת לידים
              </Label>
              <Input 
                value={form.destination_phone} 
                onChange={(e) => setForm(f => ({ ...f, destination_phone: e.target.value }))} 
                placeholder="050-0000000" 
                dir="ltr" 
              />
              <p className="text-xs text-gray-400">הודעות על לידים חדשים יישלחו למספר זה בוואטסאפ</p>
            </div>
          )}

          {(form.lead_destination === 'email' || form.lead_destination === 'n8n') && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                אימייל לקבלת לידים
              </Label>
              <Input 
                value={form.destination_email} 
                onChange={(e) => setForm(f => ({ ...f, destination_email: e.target.value }))} 
                placeholder="your@email.com" 
                type="email"
                dir="ltr" 
              />
              <p className="text-xs text-gray-400">מייל מעוצב עם פרטי הליד יישלח לכתובת זו</p>
            </div>
          )}

          {form.lead_destination === 'phone' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>שים לב:</strong> הודעות נשלחות בוואטסאפ (לא SMS רגיל). וודא שהמספר מחובר לוואטסאפ.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flow Diagram */}
      <Card className="border-slate-200 bg-slate-50/50">
        <CardContent className="pt-5 pb-4">
          <p className="font-bold text-slate-800 text-sm mb-3">תהליך הליד:</p>
          <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
            <span className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium">👤 גולש ממלא טופס</span>
            <ArrowLeft className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="bg-blue-100 border border-blue-200 rounded-lg px-3 py-1.5 font-medium text-blue-800">💾 נשמר ב-CRM</span>
            <ArrowLeft className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="bg-green-100 border border-green-200 rounded-lg px-3 py-1.5 font-medium text-green-800">
              {form.lead_destination === 'whatsapp' ? '📱 וואטסאפ אליך' : 
               form.lead_destination === 'email' ? '📧 מייל אליך' :
               form.lead_destination === 'phone' ? '📱 הודעה אליך' :
               '📱📧 וואטסאפ + מייל אליך'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          שמור הגדרות
        </Button>
      </div>
    </form>
  );
}