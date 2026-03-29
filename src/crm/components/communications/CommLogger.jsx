import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CHANNEL_OPTIONS, OUTCOME_OPTIONS } from '../../constants/pipeline';
import { useAddCommunication } from '../../hooks/useCRM';
import { toast } from 'sonner';

export default function CommLogger({ leadId, clientId, onSuccess }) {
  const [channel, setChannel] = useState('phone');
  const [direction, setDirection] = useState('outbound');
  const [content, setContent] = useState('');
  const [outcome, setOutcome] = useState('');
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [nextStep, setNextStep] = useState('');

  const addComm = useAddCommunication();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('יש להזין תוכן');
      return;
    }

    addComm.mutate(
      {
        lead_id: leadId || null,
        client_id: clientId || null,
        channel,
        direction,
        content: content.trim(),
        outcome: outcome || null,
        follow_up_needed: followUpNeeded,
        follow_up_date: followUpDate || null,
        next_step: nextStep.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success('נשמר בהצלחה');
          setContent('');
          setOutcome('');
          setFollowUpNeeded(false);
          setFollowUpDate('');
          setNextStep('');
          onSuccess?.();
        },
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500 mb-1 block">ערוץ</label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CHANNEL_OPTIONS.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500 mb-1 block">כיוון</label>
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="outbound">יוצא</SelectItem>
              <SelectItem value="inbound">נכנס</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500 mb-1 block">תוצאה</label>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger><SelectValue placeholder="בחר..." /></SelectTrigger>
            <SelectContent>
              {OUTCOME_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="תוכן השיחה / ההערה..."
          rows={3}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="followUp"
            checked={followUpNeeded}
            onCheckedChange={setFollowUpNeeded}
          />
          <label htmlFor="followUp" className="text-sm">נדרש מעקב</label>
        </div>

        {followUpNeeded && (
          <Input
            type="date"
            value={followUpDate}
            onChange={e => setFollowUpDate(e.target.value)}
            className="w-40"
          />
        )}
      </div>

      {followUpNeeded && (
        <Input
          value={nextStep}
          onChange={e => setNextStep(e.target.value)}
          placeholder="צעד הבא..."
        />
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={addComm.isPending} className="bg-[#1E3A5F] hover:bg-[#152d4a]">
          {addComm.isPending ? 'שומר...' : 'שמור'}
        </Button>
      </div>
    </form>
  );
}
