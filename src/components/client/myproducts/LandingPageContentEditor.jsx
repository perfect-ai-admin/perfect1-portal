import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Save, Loader2, Palette, Type, Phone, Image, 
  ChevronDown, ChevronUp, Layers, Trash2, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import SectionEditorRouter from './editors/SectionEditorRouter';
import { uploadFile } from '@/api/supabaseClient';

const SECTION_LABELS = {
  hero: '🎯 Hero - כותרת ראשית',
  features: '✨ תכונות ויתרונות',
  pain_points: '🔥 נקודות כאב',
  testimonials: '⭐ המלצות לקוחות',
  faq: '❓ שאלות נפוצות',
  contact: '📞 טופס יצירת קשר',
  stats: '📊 מספרים / סטטיסטיקות',
  how_it_works: '📋 איך זה עובד',
  process: '📋 תהליך',
  why_us: '🏆 למה אנחנו',
  human_voice: '💬 קולות אנושיים',
  suited_for: '👥 למי מתאים',
  pain_expansion: '⚡ הרחבת בעיות',
};

const ADDABLE_SECTIONS = [
  { type: 'features', label: 'תכונות ויתרונות', defaults: { title: 'מה מיוחד אצלנו', subtitle: '', items: [{ title: '', description: '' }] } },
  { type: 'testimonials', label: 'המלצות לקוחות', defaults: { title: 'מה אומרים עלינו', items: [{ name: '', text: '', role: '' }] } },
  { type: 'faq', label: 'שאלות נפוצות', defaults: { title: 'שאלות נפוצות', items: [{ question: '', answer: '' }] } },
  { type: 'stats', label: 'מספרים', defaults: { items: [{ value: '', label: '' }] } },
  { type: 'how_it_works', label: 'איך זה עובד', defaults: { title: 'איך זה עובד?', steps: [{ step: '1', title: '', description: '' }] } },
  { type: 'why_us', label: 'למה אנחנו', defaults: { title: 'למה לבחור בנו?', items: [{ title: '', description: '' }] } },
  { type: 'human_voice', label: 'קולות אנושיים', defaults: { title: 'קולות מהשטח', items: [{ type: 'testimonial', content: '', author: '', role: '' }] } },
  { type: 'suited_for', label: 'למי מתאים', defaults: { title: 'למי השירות מתאים?', suited: [''], not_suited: [''] } },
  { type: 'pain_expansion', label: 'הרחבת בעיות', defaults: { title: '', description: '', items: [{ title: '', description: '' }] } },
];

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
  const [sections, setSections] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      setSections(page.sections_json || []);
    }
  }, [page]);

  const handleSectionChange = useCallback((index, updated) => {
    setSections(prev => {
      const newSections = [...prev];
      newSections[index] = updated;
      return newSections;
    });
  }, []);

  const handleRemoveSection = (index) => {
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveSection = (index, direction) => {
    setSections(prev => {
      const newSections = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSections.length) return prev;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      return newSections;
    });
  };

  const handleAddSection = (sectionConfig) => {
    setSections(prev => [...prev, { type: sectionConfig.type, ...sectionConfig.defaults }]);
    setShowAddMenu(false);
    toast.success(`סקציית "${sectionConfig.label}" נוספה`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, sections_json: sections });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile({ file });
      setForm(f => ({ ...f, logo_url: file_url }));
      toast.success('הלוגו הועלה בהצלחה');
    } catch (err) {
      toast.error('שגיאה בהעלאת הלוגו');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {/* Business Info */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Type className="w-5 h-5 text-blue-600" />
            פרטי העסק
          </CardTitle>
          <CardDescription>מידע בסיסי שמופיע בדף הנחיתה</CardDescription>
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
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="w-5 h-5 text-green-600" />
            פרטי קשר
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
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="w-5 h-5 text-purple-600" />
            עיצוב ומיתוג
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>צבע ראשי</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primary_color} onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))} className="w-12 h-10 rounded-lg cursor-pointer border" />
              <Input value={form.primary_color} onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))} className="w-32 font-mono text-sm" dir="ltr" />
              <div className="h-10 flex-1 rounded-lg" style={{ background: form.primary_color }} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>לוגו</Label>
            <div className="flex items-center gap-4">
              {form.logo_url ? (
                <img src={form.logo_url} alt="לוגו" className="w-16 h-16 object-contain rounded-xl border bg-white p-1" />
              ) : (
                <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                  <Image className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {uploading ? 'מעלה...' : 'העלה לוגו'}
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                </label>
                <Input value={form.logo_url} onChange={(e) => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="או הדבק URL..." dir="ltr" className="text-xs" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Editor */}
      <Card className="shadow-sm border-indigo-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="w-5 h-5 text-indigo-600" />
            סקציות הדף
          </CardTitle>
          <CardDescription>ערוך, הזז או מחק את סקציות הדף. הסדר כאן = הסדר בדף.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Accordion type="multiple" className="space-y-2">
            {sections.map((section, idx) => (
              <AccordionItem key={idx} value={`section-${idx}`} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 transition-colors [&>svg]:hidden">
                  <div className="flex items-center gap-3 w-full">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-sm text-slate-800 flex-1 text-right">
                      {SECTION_LABELS[section.type] || section.type}
                    </span>
                    <div className="flex items-center gap-1 mr-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'up'); }}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'down'); }}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveSection(idx); }}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <SectionEditorRouter
                    section={section}
                    sectionIndex={idx}
                    onChange={handleSectionChange}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Add Section */}
          <div className="pt-3">
            {showAddMenu ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-slate-700 mb-3">בחר סקציה להוספה:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ADDABLE_SECTIONS.map(s => (
                    <button
                      key={s.type}
                      type="button"
                      onClick={() => handleAddSection(s)}
                      className="text-right p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-medium text-slate-700 hover:text-blue-700"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddMenu(false)} className="mt-2 text-xs">
                  ביטול
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddMenu(true)}
                className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 gap-2"
              >
                <Plus className="w-4 h-4" />
                הוסף סקציה חדשה
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="sticky bottom-4 z-30">
        <Button type="submit" disabled={saving} className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-lg rounded-xl">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          שמור את כל השינויים
        </Button>
      </div>
    </form>
  );
}