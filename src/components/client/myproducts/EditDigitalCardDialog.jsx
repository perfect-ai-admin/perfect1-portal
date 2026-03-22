import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Globe, Instagram, Facebook, Linkedin, Music, Navigation, 
  Loader2, Save, Link as LinkIcon, Phone, Mail, User, Briefcase,
  MessageCircle, ExternalLink, Palette, Tag, Plus, X, Image, Upload
} from 'lucide-react';

const LINK_FIELDS = [
  { key: 'website_url', label: 'אתר', icon: Globe, placeholder: 'https://www.example.com', color: 'text-blue-500' },
  { key: 'instagram_url', label: 'אינסטגרם', icon: Instagram, placeholder: 'https://instagram.com/username', color: 'text-pink-500' },
  { key: 'facebook_url', label: 'פייסבוק', icon: Facebook, placeholder: 'https://facebook.com/page', color: 'text-blue-600' },
  { key: 'linkedin_url', label: 'לינקדאין', icon: Linkedin, placeholder: 'https://linkedin.com/in/username', color: 'text-blue-700' },
  { key: 'tiktok_url', label: 'טיקטוק', icon: Music, placeholder: 'https://tiktok.com/@username', color: 'text-gray-800' },
  { key: 'waze_url', label: 'Waze', icon: Navigation, placeholder: 'https://waze.com/ul/...', color: 'text-cyan-500' },
];

export default function EditDigitalCardDialog({ open, onOpenChange, cardId, onSaved }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [newService, setNewService] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);

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
          whatsapp: c.whatsapp || '',
          email: c.email || '',
          services: c.services || [],
          cover_image_url: c.cover_image_url || '',
          primary_color: c.primary_color || '#1E3A5F',
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

  const addService = () => {
    if (!newService.trim()) return;
    setFormData(prev => ({ ...prev, services: [...(prev.services || []), newService.trim()] }));
    setNewService('');
  };

  const removeService = (index) => {
    setFormData(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('יש להעלות קובץ תמונה בלבד');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('גודל התמונה מקסימלי 5MB');
      return;
    }
    
    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (file_url) {
        handleChange('cover_image_url', file_url);
        toast.success('תמונת קאבר הועלתה בהצלחה');
      } else {
        toast.error('שגיאה בהעלאת התמונה');
      }
    } catch (err) {
      console.error('Cover upload error:', err);
      toast.error('שגיאה בהעלאת התמונה. נסה שוב.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCardIcon className="w-4 h-4 text-blue-600" />
            </div>
            עריכת כרטיס ביקור דיגיטלי
          </DialogTitle>
          {card?.public_url && (
            <a 
              href={card.public_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              צפה בכרטיס
            </a>
          )}
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
            <Section icon={User} title="פרטים בסיסיים">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">שם מלא</Label>
                  <Input value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">תחום עיסוק</Label>
                  <Input value={formData.profession} onChange={e => handleChange('profession', e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
            </Section>

            {/* Cover Image */}
            <Section icon={Image} title="תמונת קאבר">
              {uploadingCover ? (
                <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-300 rounded-xl py-6 bg-blue-50/30">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">מעלה תמונה...</span>
                </div>
              ) : formData.cover_image_url ? (
                <div className="space-y-2">
                  <div className="relative rounded-xl overflow-hidden h-32 bg-gray-800 border border-gray-300">
                    <img 
                      src={formData.cover_image_url} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <button
                      onClick={() => handleChange('cover_image_url', '')}
                      className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <label className="flex items-center justify-center gap-2 text-xs text-blue-600 cursor-pointer hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    החלף תמונה
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                  <Image className="w-8 h-8 text-gray-300" />
                  <span className="text-xs text-gray-500">לחץ להעלאת תמונת קאבר</span>
                  <span className="text-[10px] text-gray-400">JPG, PNG עד 5MB</span>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
              )}
            </Section>

            {/* Contact */}
            <Section icon={Phone} title="פרטי קשר">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">טלפון</Label>
                  <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="h-9 text-sm" dir="ltr" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    וואטסאפ
                  </Label>
                  <Input value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="972501234567" className="h-9 text-sm" dir="ltr" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">אימייל</Label>
                <Input value={formData.email} onChange={e => handleChange('email', e.target.value)} className="h-9 text-sm" dir="ltr" />
              </div>
            </Section>

            {/* Services */}
            <Section icon={Tag} title="שירותים">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(formData.services || []).map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">
                    {s}
                    <button onClick={() => removeService(i)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={newService} 
                  onChange={e => setNewService(e.target.value)} 
                  placeholder="הוסף שירות..."
                  className="h-8 text-xs flex-1" 
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addService(); } }}
                />
                <Button size="sm" variant="outline" onClick={addService} className="h-8 px-2">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Section>

            {/* Color */}
            <Section icon={Palette} title="צבע ראשי">
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.primary_color || '#1E3A5F'} 
                  onChange={e => handleChange('primary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <Input 
                  value={formData.primary_color || '#1E3A5F'} 
                  onChange={e => handleChange('primary_color', e.target.value)} 
                  className="h-9 text-sm w-28 font-mono" 
                  dir="ltr"
                />
              </div>
            </Section>

            {/* Links */}
            <Section icon={LinkIcon} title="קישורים ורשתות חברתיות">
              <p className="text-xs text-gray-400 mb-2">הקישורים יופיעו ככפתורים בכרטיס שלך</p>
              <div className="space-y-2">
                {LINK_FIELDS.map(field => {
                  const Icon = field.icon;
                  const hasValue = !!formData[field.key];
                  return (
                    <div key={field.key} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${hasValue ? 'bg-green-50' : 'bg-gray-50'} flex items-center justify-center flex-shrink-0 border ${hasValue ? 'border-green-200' : 'border-gray-100'}`}>
                        <Icon className={`w-4 h-4 ${hasValue ? field.color : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <Input 
                          value={formData[field.key] || ''} 
                          onChange={e => handleChange(field.key, e.target.value)} 
                          placeholder={field.placeholder}
                          className="h-9 text-xs" 
                          dir="ltr"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Button onClick={handleSave} disabled={saving} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base">
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
              שמור שינויים
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreditCardIcon({ className }) {
  return <Briefcase className={className} />;
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}