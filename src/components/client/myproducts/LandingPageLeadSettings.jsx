import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Phone, Mail, Link2, MessageCircle, Webhook, CheckCircle2, AlertCircle } from 'lucide-react';

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
    { value: 'n8n', label: 'CRM (מערכת הלידים שלנו)', icon: Webhook, desc: 'לידים נשמרים ומנוהלים במערכת Perfect One', badge: 'מומלץ' },
    { value: 'whatsapp', label: 'WhatsApp ישיר', icon: MessageCircle, desc: 'לידים נשלחים ישירות ל-WhatsApp שלך' },
    { value: 'email', label: 'התראת אימייל', icon: Mail, desc: 'לידים נשלחים למייל שלך' },
    { value: 'phone', label: 'התראת SMS', icon: Phone, desc: 'לידים נשלחים ב-SMS לטלפון שלך' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lead Destination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5 text-blue-600" />
            לאן לשלוח את הלידים?
          </CardTitle>
          <CardDescription>
            בחר/י לאן הלידים שנכנסים מדף הנחיתה יישלחו
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
                    ? 'border-blue-500 bg-blue-50' 
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
          <CardTitle className="text-lg">פרטי היעד</CardTitle>
          <CardDescription>
            הגדר את הפרטים לקבלת הלידים
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>טלפון לקבלת התראות / WhatsApp</Label>
            <Input 
              value={form.destination_phone} 
              onChange={(e) => setForm(f => ({ ...f, destination_phone: e.target.value }))} 
              placeholder="050-0000000" 
              dir="ltr" 
            />
            <p className="text-xs text-gray-400">הלידים יישלחו למספר זה ב-WhatsApp או SMS</p>
          </div>

          <div className="space-y-2">
            <Label>אימייל לקבלת לידים</Label>
            <Input 
              value={form.destination_email} 
              onChange={(e) => setForm(f => ({ ...f, destination_email: e.target.value }))} 
              placeholder="your@email.com" 
              type="email"
              dir="ltr" 
            />
            <p className="text-xs text-gray-400">לידים חדשים יישלחו גם לכתובת זו</p>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">איך זה עובד?</p>
          <p>כל ליד שנכנס דרך דף הנחיתה שלך נשמר אוטומטית במערכת. בנוסף, תקבל/י התראה ליעד שבחרת (WhatsApp, מייל, או SMS). מהדשבורד תוכל/י לראות את כל הלידים ולנהל אותם.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          שמור הגדרות
        </Button>
      </div>
    </form>
  );
}