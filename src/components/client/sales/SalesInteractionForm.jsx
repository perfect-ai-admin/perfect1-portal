import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SalesInteractionForm({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    channel: '',
    is_first_contact: false,
    service_type: '',
    price_offered: '',
    outcome: '',
    objection_type: 'none',
    sales_depth_level: 2,
    decision_requested: false,
    next_action: 'pending',
    contact_name: '',
    contact_phone: '',
    duration_minutes: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.channel || !formData.outcome) {
      toast.error('יש למלא שדות חובה');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.SalesInteraction.create({
        ...formData,
        price_offered: formData.price_offered ? parseFloat(formData.price_offered) : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        sales_depth_level: parseInt(formData.sales_depth_level)
      });

      toast.success('השיחה נשמרה בהצלחה! ✅');
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        channel: '',
        is_first_contact: false,
        service_type: '',
        price_offered: '',
        outcome: '',
        objection_type: 'none',
        sales_depth_level: 2,
        decision_requested: false,
        next_action: 'pending',
        contact_name: '',
        contact_phone: '',
        duration_minutes: '',
        notes: ''
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('שגיאה בשמירת השיחה');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const outcomeInfo = {
    closed_won: { icon: CheckCircle, color: 'text-green-600', label: '✅ עסקה סגורה' },
    closed_lost: { icon: X, color: 'text-red-600', label: '❌ עסקה נסגרה' },
    followup: { icon: AlertCircle, color: 'text-blue-600', label: '🔄 מעקב נדרש' },
    pending: { icon: AlertCircle, color: 'text-yellow-600', label: '⏳ בהמתנה' }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">📝 תעד שיחת מכירות</DialogTitle>
          <DialogDescription>
            הנתונים שתכניס כאן יעזרו להבין דפוסי מכירה ולשפר ביצועים
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">תאריך השיחה *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label className="font-semibold">ערוץ *</Label>
              <Select value={formData.channel} onValueChange={(val) => setFormData({ ...formData, channel: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר ערוץ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">☎️ טלפון</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="meeting">🤝 פגישה</SelectItem>
                  <SelectItem value="email">📧 דוא״ל</SelectItem>
                  <SelectItem value="video_call">📹 שיחת וידאו</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">שם הלקוח</Label>
              <Input
                placeholder="למשל: דור כהן"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
            </div>
            <div>
              <Label className="font-semibold">טלפון</Label>
              <Input
                placeholder="050-123-4567"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          </div>

          {/* Row 3: Service & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">סוג השירות</Label>
              <Input
                placeholder="למשל: ייעוץ עסקי"
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              />
            </div>
            <div>
              <Label className="font-semibold">מחיר שהוצע (₪)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.price_offered}
                onChange={(e) => setFormData({ ...formData, price_offered: e.target.value })}
              />
            </div>
          </div>

          {/* Row 4: Outcome & Decision */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">תוצאה *</Label>
              <Select value={formData.outcome} onValueChange={(val) => setFormData({ ...formData, outcome: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר תוצאה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="closed_won">✅ עסקה סגורה</SelectItem>
                  <SelectItem value="closed_lost">❌ עסקה נסגרה</SelectItem>
                  <SelectItem value="followup">🔄 מעקב נדרש</SelectItem>
                  <SelectItem value="pending">⏳ בהמתנה</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">האם ביקשת החלטה?</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={formData.decision_requested ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, decision_requested: true })}
                  className="flex-1"
                >
                  כן
                </Button>
                <Button
                  type="button"
                  variant={!formData.decision_requested ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, decision_requested: false })}
                  className="flex-1"
                >
                  לא
                </Button>
              </div>
            </div>
          </div>

          {/* Row 5: Objection & Depth */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">סוג התנגדות (אם הייתה)</Label>
              <Select value={formData.objection_type} onValueChange={(val) => setFormData({ ...formData, objection_type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">אין</SelectItem>
                  <SelectItem value="price">💰 מחיר</SelectItem>
                  <SelectItem value="timing">⏰ לא עכשיו</SelectItem>
                  <SelectItem value="need_to_think">🤔 צריך לחשוב</SelectItem>
                  <SelectItem value="trust">🤝 אמון / ידע</SelectItem>
                  <SelectItem value="competitor">🏆 מתחרות</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-semibold">עומק השיחה</Label>
              <Select value={String(formData.sales_depth_level)} onValueChange={(val) => setFormData({ ...formData, sales_depth_level: parseInt(val) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - קצר (< 5 דק)</SelectItem>
                  <SelectItem value="2">2 - בסיסי (5-10 דק)</SelectItem>
                  <SelectItem value="3">3 - עמוק (10-20 דק)</SelectItem>
                  <SelectItem value="4">4 - מקיף (> 20 דק)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6: Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">משך השיחה (דקות)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              />
            </div>
            <div>
              <Label className="font-semibold">פעולה הבאה</Label>
              <Select value={formData.next_action} onValueChange={(val) => setFormData({ ...formData, next_action: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">בהמתנה</SelectItem>
                  <SelectItem value="followup">מעקב</SelectItem>
                  <SelectItem value="scheduled_meeting">פגישה מתוכננת</SelectItem>
                  <SelectItem value="closed">סגור</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="font-semibold">הערות</Label>
            <Textarea
              placeholder="כתוב כל מה שרלוונטי: מה עבד? מה לא? מה התנגדה הלקוח?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-24"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? '💾 שומר...' : '✅ שמור שיחה'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}