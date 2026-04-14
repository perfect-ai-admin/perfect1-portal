import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, RefreshCw, FileText, Phone, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateAgreement } from '../../hooks/useCRM';
import { AGREEMENT_TEMPLATES } from '../../config/agreementTemplates';

export default function SendAgreementDialog({ lead, open, onOpenChange }) {
  const createAgreement = useCreateAgreement();
  const [templateKey, setTemplateKey] = useState('');
  const [sent, setSent] = useState(false);

  const selectedTemplate = AGREEMENT_TEMPLATES.find(t => t.key === templateKey);
  const hasPhone = !!lead?.phone;

  const handleSend = () => {
    if (!selectedTemplate) { toast.error('יש לבחור סוג הסכם'); return; }

    const message = selectedTemplate.whatsapp_message(lead?.name || '', selectedTemplate.template_link);

    createAgreement.mutate(
      {
        lead_id: lead.id,
        template_key: selectedTemplate.key,
        template_label: selectedTemplate.label,
        template_link: selectedTemplate.template_link,
        whatsapp_message: message,
        send_whatsapp: true,
      },
      {
        onSuccess: (data) => {
          if (data?.whatsapp_sent) {
            setSent(true);
          } else {
            toast.error('ההסכם נשמר אבל שליחת WhatsApp נכשלה');
          }
        },
        onError: (err) => toast.error(err.message || 'שגיאה'),
      }
    );
  };

  const handleClose = () => {
    setTemplateKey('');
    setSent(false);
    onOpenChange(false);
  };

  // Success screen
  if (sent) {
    return (
      <Dialog open={open} onOpenChange={() => handleClose()}>
        <DialogContent className="max-w-sm" dir="rtl">
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-green-700">ההסכם נשלח!</h3>
            <p className="text-sm text-slate-500">
              {selectedTemplate?.label} נשלח ב-WhatsApp ל-{lead?.phone}
            </p>
            <Button onClick={handleClose} className="w-full mt-4">סגור</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText size={18} />
            שליחת הסכם לחתימה
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">סוג הסכם</label>
            <Select value={templateKey} onValueChange={setTemplateKey}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="בחר הסכם..." />
              </SelectTrigger>
              <SelectContent>
                {AGREEMENT_TEMPLATES.map(t => (
                  <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lead info */}
          {selectedTemplate && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">לקוח</span>
                <span className="text-slate-700 font-medium">{lead?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">טלפון</span>
                <span className="text-slate-700 font-mono">{lead?.phone || '—'}</span>
              </div>
            </div>
          )}

          {/* WhatsApp target */}
          {selectedTemplate && hasPhone && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
              <Phone size={12} />
              יישלח ב-WhatsApp ל-{lead.phone}
            </div>
          )}
          {selectedTemplate && !hasPhone && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              אין מספר טלפון — לא ניתן לשלוח
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSend}
            disabled={createAgreement.isPending || !templateKey || !hasPhone}
            className="w-full text-sm bg-green-600 hover:bg-green-700"
          >
            {createAgreement.isPending ? (
              <RefreshCw size={14} className="animate-spin ml-1" />
            ) : (
              <Send size={14} className="ml-1" />
            )}
            שמור ושלח הסכם
          </Button>
          <Button variant="ghost" onClick={handleClose} className="w-full text-xs text-slate-500">
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
