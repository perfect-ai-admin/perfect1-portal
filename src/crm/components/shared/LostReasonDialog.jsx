import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/supabaseClient';
import { LOST_REASON_CATEGORIES } from '../../constants/pipeline';

export default function LostReasonDialog({ open, onOpenChange, onConfirm, isLoading }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedReasonId, setSelectedReasonId] = useState('');
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const { data: reasons = [] } = useQuery({
    queryKey: ['lost-reasons'],
    queryFn: () => entities.LostReason.list('sort_order'),
  });

  const filteredReasons = selectedCategory
    ? reasons.filter(r => r.category === selectedCategory)
    : reasons;

  const selectedReason = reasons.find(r => r.id === selectedReasonId);

  const handleConfirm = () => {
    if (!selectedReasonId) return;
    onConfirm({
      lost_reason_id: selectedReasonId,
      lost_reason_note: note,
      follow_up_date: followUpDate || null,
    });
    // Reset
    setSelectedCategory('');
    setSelectedReasonId('');
    setNote('');
    setFollowUpDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>סיבת סגירה</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">קטגוריה</label>
            <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedReasonId(''); }}>
              <SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
              <SelectContent>
                {LOST_REASON_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">סיבה</label>
            <Select value={selectedReasonId} onValueChange={setSelectedReasonId}>
              <SelectTrigger><SelectValue placeholder="בחר סיבה" /></SelectTrigger>
              <SelectContent>
                {filteredReasons.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.reason_text}</SelectItem>
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

          {selectedReason?.is_recoverable && (
            <div>
              <label className="text-sm font-medium mb-1 block">תאריך מעקב עתידי</label>
              <Input
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
              />
              {selectedReason.follow_up_days && !followUpDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  מומלץ: בעוד {selectedReason.follow_up_days} ימים
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedReasonId || isLoading}
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
