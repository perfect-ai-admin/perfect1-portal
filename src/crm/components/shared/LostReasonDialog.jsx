import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LOST_REASON_CATEGORIES } from '../../constants/pipeline';

const RECOVERABLE_REASONS = ['timing', 'not_opening_business', 'just_info'];

export default function LostReasonDialog({ open, onOpenChange, onConfirm, isLoading }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const isRecoverable = RECOVERABLE_REASONS.includes(selectedReason);
  const reasonLabel = LOST_REASON_CATEGORIES.find(r => r.value === selectedReason)?.label || '';

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm({
      lost_reason_id: selectedReason,
      lost_reason_note: note || reasonLabel,
      follow_up_date: followUpDate || null,
    });
    // Reset
    setSelectedReason('');
    setNote('');
    setFollowUpDate('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedReason('');
    setNote('');
    setFollowUpDate('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>סיבת סגירה</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">למה הליד לא רלוונטי?</label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger><SelectValue placeholder="בחר סיבה" /></SelectTrigger>
              <SelectContent>
                {LOST_REASON_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">הערה (אופציונלי)</label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="פרטים נוספים..."
              rows={2}
            />
          </div>

          {isRecoverable && (
            <div>
              <label className="text-sm font-medium mb-1 block">תאריך מעקב עתידי</label>
              <Input
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                אם יש סיכוי שהליד יחזור — קבע תאריך לחזור אליו
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={handleClose}>ביטול</Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedReason || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'שומר...' : 'סגור ליד'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
