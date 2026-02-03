import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CreateScriptDialog({ open, onOpenChange, onScriptCreated }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'opening',
    scenario: '',
    audience: '',
    goal: '',
    keyPoints: ''
  });

  const handleGenerate = async () => {
    if (!formData.scenario || !formData.goal) {
      toast.error('נא למלא את שדות החובה');
      return;
    }

    setLoading(true);
    try {
      // 1. Generate Content
      const response = await base44.functions.invoke('generateSalesScript', formData);
      const generatedData = response.data;

      // 2. Save to DB
      const newScript = await base44.entities.SalesScript.create({
        title: generatedData.title,
        content: generatedData.script,
        type: formData.type,
        scenario: formData.scenario,
        tips: generatedData.tips,
        is_custom: true
      });

      toast.success('התסריט נוצר בהצלחה!');
      onScriptCreated(newScript);
      onOpenChange(false);
      setStep(1);
      setFormData({ type: 'opening', scenario: '', audience: '', goal: '', keyPoints: '' });
    } catch (error) {
      console.error(error);
      toast.error('שגיאה ביצירת התסריט');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wand2 className="w-5 h-5 text-purple-600" />
            יצירת תסריט שיחה חכם
          </DialogTitle>
          <DialogDescription>
            המערכת תייצר עבורך תסריט מותאם אישית בתוך שניות
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">סוג התסריט</label>
            <Select 
              value={formData.type} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opening">פתיחה וסינון</SelectItem>
                <SelectItem value="discovery">בירור צרכים</SelectItem>
                <SelectItem value="pitch">הצגת פתרון</SelectItem>
                <SelectItem value="objection">טיפול בהתנגדות</SelectItem>
                <SelectItem value="closing">סגירה</SelectItem>
                <SelectItem value="followup">פולואו-אפ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">תיאור הסיטואציה (חובה)</label>
            <Input 
              placeholder="למשל: לקוח שהשאיר פרטים באתר אבל לא עונה..."
              value={formData.scenario}
              onChange={(e) => setFormData(prev => ({ ...prev, scenario: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">קהל היעד</label>
              <Input 
                placeholder="למשל: בעלי עסקים קטנים..."
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">מטרת השיחה (חובה)</label>
              <Input 
                placeholder="למשל: לקבוע פגישת ייעוץ..."
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">נקודות מפתח לציון</label>
            <Textarea 
              placeholder="נקודות שחשוב לך להזכיר בשיחה..."
              value={formData.keyPoints}
              onChange={(e) => setFormData(prev => ({ ...prev, keyPoints: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !formData.scenario || !formData.goal}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'מייצר...' : 'צור תסריט'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}