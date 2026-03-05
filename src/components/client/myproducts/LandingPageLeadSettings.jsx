import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Phone, Mail, Link2, MessageCircle, Webhook, CheckCircle2, ArrowLeft, Zap, Globe, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LandingPageLeadSettings({ page, onSave, saving }) {
  const [form, setForm] = useState({
    lead_destination: 'n8n',
    destination_phone: '',
    destination_email: '',
    webhook_url: '',
    webhook_headers: {},
  });
  const [showHeaders, setShowHeaders] = useState(false);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  useEffect(() => {
    if (page) {
      setForm({
        lead_destination: page.lead_destination || 'n8n',
        destination_phone: page.destination_phone || page.phone || '',
        destination_email: page.destination_email || '',
        webhook_url: page.webhook_url || '',
        webhook_headers: page.webhook_headers || {},
      });
    }
  }, [page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const addHeader = () => {
    if (!newHeaderKey.trim()) return;
    setForm(f => ({
      ...f,
      webhook_headers: { ...f.webhook_headers, [newHeaderKey.trim()]: newHeaderValue }
    }));
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const removeHeader = (key) => {
    setForm(f => {
      const headers = { ...f.webhook_headers };
      delete headers[key];
      return { ...f, webhook_headers: headers };
    });
  };

  const destinations = [
    { 
      value: 'n8n', 
      label: 'CRM מובנה + כל הערוצים', 
      icon: Webhook, 
      desc: 'לידים נשמרים ב-CRM שלך + נשלחים לוואטסאפ ומייל', 
      badge: 'מומלץ',
      detail: 'הליד נשמר אוטומטית במערכת הלידים, ובנוסף נשלחת התראה לוואטסאפ ולמייל שהגדרת.'
    },
    { 
      value: 'webhook', 
      label: 'CRM חיצוני (Webhook)', 
      icon: Globe, 
      desc: 'חבר כל מערכת CRM חיצונית - Monday, HubSpot, Salesforce ועוד', 
      badge: 'חדש',
      badgeColor: 'bg-purple-100 text-purple-700',
      detail: 'הזן את כתובת ה-Webhook של מערכת ה-CRM שלך. הליד יישלח ישירות למערכת שלך בפורמט JSON.'
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
  const headerEntries = Object.entries(form.webhook_headers || {});

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
                <strong> נשמר אוטומטית ב-CRM</strong>, 
                <strong> מקושר לדף הנחיתה שלך</strong>, 
                ו<strong>נשלח אליך בערוץ שתבחר</strong>. 
                אפשר גם לחבר ישירות ל-CRM חיצוני שלך!
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
            ערוץ קבלת הלידים
          </CardTitle>
          <CardDescription>
            בחר/י לאן הלידים יגיעו ואיך תקבל/י אותם
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
                      <Badge className={`${dest.badgeColor || 'bg-green-100 text-green-700'} border-0 text-[10px]`}>{dest.badge}</Badge>
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
          <CardTitle className="text-lg">פרטי החיבור</CardTitle>
          <CardDescription>
            {selectedDest?.detail || 'הגדר את הפרטים לקבלת הלידים'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Webhook CRM Settings */}
          {form.lead_destination === 'webhook' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  כתובת Webhook (URL)
                </Label>
                <Input 
                  value={form.webhook_url} 
                  onChange={(e) => setForm(f => ({ ...f, webhook_url: e.target.value }))} 
                  placeholder="https://hooks.zapier.com/... או https://api.hubspot.com/..." 
                  dir="ltr" 
                />
                <p className="text-xs text-gray-400">
                  הזן את כתובת ה-Webhook מה-CRM שלך. הליד יישלח כ-POST עם JSON.
                </p>
              </div>

              {/* Guide cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { name: 'Monday.com', emoji: '📋', hint: 'הגדרות → אינטגרציות → Webhook' },
                  { name: 'HubSpot', emoji: '🟠', hint: 'Settings → Integrations → Webhooks' },
                  { name: 'Salesforce', emoji: '☁️', hint: 'Setup → Platform Events' },
                  { name: 'Zapier', emoji: '⚡', hint: 'Create Zap → Webhook trigger' },
                ].map(crm => (
                  <div key={crm.name} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs">
                    <span className="text-base">{crm.emoji}</span>
                    <div>
                      <span className="font-medium text-gray-800">{crm.name}</span>
                      <p className="text-gray-400 text-[10px]">{crm.hint}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Headers */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowHeaders(!showHeaders)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showHeaders ? 'הסתר' : 'הוסף'} Headers (API Key, Auth Token)
                </button>

                {showHeaders && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
                    <p className="text-xs text-gray-500">
                      חלק ממערכות ה-CRM דורשות API Key או Token. הוסף אותם כ-Header.
                    </p>

                    {/* Existing Headers */}
                    {headerEntries.map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Input value={key} disabled className="flex-1 text-xs bg-white" dir="ltr" />
                        <Input value={value} disabled className="flex-1 text-xs bg-white" dir="ltr" />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeHeader(key)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}

                    {/* New Header */}
                    <div className="flex items-center gap-2">
                      <Input 
                        value={newHeaderKey}
                        onChange={(e) => setNewHeaderKey(e.target.value)}
                        placeholder="Header Name (e.g. Authorization)"
                        className="flex-1 text-xs" 
                        dir="ltr" 
                      />
                      <Input 
                        value={newHeaderValue}
                        onChange={(e) => setNewHeaderValue(e.target.value)}
                        placeholder="Value (e.g. Bearer abc123)"
                        className="flex-1 text-xs" 
                        dir="ltr" 
                      />
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={addHeader}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Test Webhook */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 mb-2">
                  <strong>פורמט הליד שנשלח:</strong>
                </p>
                <pre dir="ltr" className="bg-white border border-blue-100 rounded p-2 text-[10px] text-gray-700 overflow-x-auto">
{JSON.stringify({
  name: "שם הלקוח",
  phone: "050-0000000",
  email: "email@example.com",
  message: "הודעה...",
  source: "שם דף הנחיתה",
  timestamp: "2025-01-01T12:00:00Z"
}, null, 2)}
                </pre>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({
                      name: "שם הלקוח", phone: "050-0000000", email: "email@example.com",
                      message: "הודעה...", source: "שם דף הנחיתה", timestamp: new Date().toISOString()
                    }, null, 2));
                    toast.success('הפורמט הועתק ללוח');
                  }}
                  className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <Copy className="w-3 h-3" /> העתק פורמט
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp */}
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

          {/* Email */}
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
               form.lead_destination === 'webhook' ? '🔗 CRM חיצוני שלך' :
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