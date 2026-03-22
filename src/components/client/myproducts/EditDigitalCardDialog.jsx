import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Globe, Instagram, Facebook, Linkedin, Music, Navigation, 
  Loader2, Save, Link as LinkIcon, Phone, Mail, User, Briefcase
} from 'lucide-react';

const LINK_FIELDS = [
  { key: 'website_url', label: 'אתר', icon: Globe, placeholder: 'https://www.example.com' },
  { key: 'instagram_url', label: 'אינסטגרם', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'facebook_url', label: 'פייסבוק', icon: Facebook, placeholder: 'https://facebook.com/page' },
  { key: 'linkedin_url', label: 'לינקדאין', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'tiktok_url', label: 'טיקטוק', icon: Music, placeholder: 'https://tiktok.com/@username' },
  { key: 'waze_url', label: 'Waze', icon: Navigation, placeholder: 'https://waze.com/ul/...' },
];

export default function EditDigitalCardDialog({ open, onOpenChange, cardId, onSaved }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!open || !cardId) return;
    setLoading(true);
    (async () => {
      const cards = await base44.entities.DigitalCard.filter({ id: cardId });
      if (cards?.length > 0) {
        const c = cards[0];
        setCard(c);
        setFormData({
          full_name: c.full_name || '',
          profession: c.profession || '',
          phone: c.phone || '',
          email: c.email || '',
          website_url: c.website_url || '',
          instagram_url: c.instagram_url || '',
          facebook_url: c.facebook_url || '',
          linkedin_url: c.linkedin_url || '',
          tiktok_url: c.tiktok_url || '',
          waze_url: c.waze_url || '',
        });
      }
      setLoading(false);
    })();
  }, [open, cardId]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Figure out which social networks are filled
    const socialNetworks = [];
    if (formData.instagram_url) socialNetworks.push('instagram');
    if (formData.facebook_url) socialNetworks.push('facebook');
    if (formData.linkedin_url) socialNetworks.push('linkedin');
    if (formData.tiktok_url) socialNetworks.push('tiktok');
    if (formData.website_url) socialNetworks.push('website');
    if (formData.waze_url) socialNetworks.push('waze');

    await base44.entities.DigitalCard.update(cardId, {
      ...formData,
      social_networks: socialNetworks,
    });
    toast.success('הכרטיס עודכן בהצלחה!');
    setSaving(false);
    if (onSaved) onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת כרטיס ביקור</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : !card ? (
          <p className="text-center text-gray-500 py-8">הכרטיס לא נמצא</p>
        ) : (
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                פרטים בסיסיים
              </h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">שם מלא</Label>
                  <Input value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">תחום עיסוק</Label>
                  <Input value={formData.profession} onChange={e => handleChange('profession', e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                פרטי קשר
              </h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">טלפון</Label>
                  <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="h-9 text-sm" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs">אימייל</Label>
                  <Input value={formData.email} onChange={e => handleChange('email', e.target.value)} className="h-9 text-sm" dir="ltr" />
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                קישורים ורשתות חברתיות
              </h3>
              <p className="text-xs text-gray-500">הוסף קישורים לרשתות שלך – הם יופיעו ככפתורים בכרטיס</p>
              <div className="space-y-2">
                {LINK_FIELDS.map(field => {
                  const Icon = field.icon;
                  return (
                    <div key={field.key} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <Input 
                        value={formData[field.key] || ''} 
                        onChange={e => handleChange(field.key, e.target.value)} 
                        placeholder={field.placeholder}
                        className="h-9 text-xs flex-1" 
                        dir="ltr"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full h-10 bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
              שמור שינויים
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}