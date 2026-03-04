import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, Palette, Type, Phone, Globe } from 'lucide-react';

export default function LandingPageContentEditor({ page, onSave, saving }) {
  const [form, setForm] = useState({
    business_name: '',
    headline: '',
    subheadline: '',
    primary_color: '#2563EB',
    phone: '',
    whatsapp: '',
    logo_url: '',
  });

  useEffect(() => {
    if (page) {
      setForm({
        business_name: page.business_name || '',
        headline: page.headline || '',
        subheadline: page.subheadline || '',
        primary_color: page.primary_color || '#2563EB',
        phone: page.phone || '',
        whatsapp: page.whatsapp || '',
        logo_url: page.logo_url || '',
      });
    }
  }, [page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Type className="w-5 h-5 text-blue-600" />
            פרטי העסק
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>שם העסק</Label>
            <Input value={form.business_name} onChange={(e) => setForm(f => ({ ...f, business_name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>כותרת ראשית</Label>
            <Input value={form.headline} onChange={(e) => setForm(f => ({ ...f, headline: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>כותרת משנה</Label>
            <Textarea value={form.subheadline} onChange={(e) => setForm(f => ({ ...f, subheadline: e.target.value }))} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="w-5 h-5 text-green-600" />
            פרטי קשר שמוצגים בדף
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>טלפון</Label>
            <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="050-0000000" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="0500000000" dir="ltr" />
          </div>
        </CardContent>
      </Card>

      {/* Design */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="w-5 h-5 text-purple-600" />
            עיצוב
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>צבע ראשי</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primary_color} onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))} className="w-12 h-10 rounded-lg cursor-pointer border" />
              <Input value={form.primary_color} onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))} className="w-32 font-mono text-sm" dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>קישור ללוגו (URL)</Label>
            <Input value={form.logo_url} onChange={(e) => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." dir="ltr" />
            {form.logo_url && (
              <img src={form.logo_url} alt="לוגו" className="w-20 h-20 object-contain rounded-lg border mt-2" />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          שמור שינויים
        </Button>
      </div>
    </form>
  );
}