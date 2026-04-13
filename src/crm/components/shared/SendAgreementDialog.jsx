import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, RefreshCw, FileText, AlertCircle, Link2, Copy, ExternalLink, Check, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateAgreement } from '../../hooks/useCRM';
import { AGREEMENT_TEMPLATES } from '../../config/agreementTemplates';

export default function SendAgreementDialog({ lead, open, onOpenChange }) {
  const createAgreement = useCreateAgreement();
  const [templateKey, setTemplateKey] = useState('');
  const [extraAmount, setExtraAmount] = useState('');
  const [extraServiceName, setExtraServiceName] = useState('');

  // After successful creation — show link instead of form
  const [createdResult, setCreatedResult] = useState(null);

  const selectedTemplate = AGREEMENT_TEMPLATES.find(t => t.key === templateKey);
  const missingPhone = !lead?.phone;
  const hasTemplates = AGREEMENT_TEMPLATES.some(t => t.fillfaster_form_id);

  const handleCreate = (sendWhatsapp) => {
    if (!templateKey || !selectedTemplate) {
      toast.error('יש לבחור סוג הסכם');
      return;
    }
    if (!selectedTemplate.fillfaster_form_id) {
      toast.error('תבנית זו עדיין לא מוגדרת ב-FillFaster');
      return;
    }
    if (sendWhatsapp && missingPhone) {
      toast.error('ללקוח אין מספר טלפון — לא ניתן לשלוח ב-WhatsApp');
      return;
    }

    const extra_fields = {};
    if (extraAmount) extra_fields.amount = extraAmount;
    if (extraServiceName) extra_fields.service_name = extraServiceName;

    createAgreement.mutate(
      {
        lead_id: lead.id,
        template_key: templateKey,
        fillfaster_form_id: selectedTemplate.fillfaster_form_id,
        template_label: selectedTemplate.label,
        extra_fields: Object.keys(extra_fields).length > 0 ? extra_fields : undefined,
        send_via_whatsapp: sendWhatsapp,
      },
      {
        onSuccess: (data) => {
          if (sendWhatsapp) {
            toast.success('הסכם נשלח ב-WhatsApp');
          } else {
            toast.success('קישור חתימה נוצר');
          }
          // Show the created result with link
          setCreatedResult({
            submission_link: data?.submission_link,
            whatsapp_sent: data?.whatsapp_sent,
            agreement_id: data?.agreement_id,
          });
        },
        onError: (err) => toast.error(err.message || 'שגיאה ביצירת הסכם'),
      }
    );
  };

  const handleCopyLink = () => {
    if (createdResult?.submission_link) {
      navigator.clipboard.writeText(createdResult.submission_link);
      toast.success('קישור הועתק ללוח');
    }
  };

  const handleClose = () => {
    setTemplateKey('');
    setExtraAmount('');
    setExtraServiceName('');
    setCreatedResult(null);
    onOpenChange(false);
  };

  // ---- Success screen ----
  if (createdResult) {
    return (
      <Dialog open={open} onOpenChange={() => handleClose()}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-green-700">
              <Check size={18} />
              הסכם נוצר בהצלחה
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* WhatsApp status */}
            {createdResult.whatsapp_sent && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                <Send size={14} />
                נשלח ב-WhatsApp ל-{lead?.phone}
              </div>
            )}
            {createdResult.whatsapp_sent === false && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                <Link2 size={14} />
                קישור נוצר — לא נשלח WhatsApp
              </div>
            )}

            {/* Submission link */}
            {createdResult.submission_link && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 block">קישור חתימה:</label>
                <div className="flex gap-2">
                  <Input
                    value={createdResult.submission_link}
                    readOnly
                    className="text-xs font-mono flex-1"
                    onClick={(e) => e.target.select()}
                  />
                  <Button size="sm" variant="outline" onClick={handleCopyLink} className="flex-shrink-0">
                    <Copy size={14} />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => window.open(createdResult.submission_link, '_blank')}
                  >
                    <ExternalLink size={12} className="ml-1" />
                    פתח קישור
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={handleCopyLink}
                  >
                    <Copy size={12} className="ml-1" />
                    העתק קישור
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="text-xs w-full">
              סגור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ---- Main form ----
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText size={18} />
            שליחת הסכם לחתימה
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Warnings */}
          {!hasTemplates && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <AlertCircle size={14} />
              אין תבניות הסכם מוגדרות — יש להגדיר form_id ב-agreementTemplates.js
            </div>
          )}

          {/* Template selection */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">סוג הסכם</label>
            <Select value={templateKey} onValueChange={setTemplateKey} disabled={!hasTemplates}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="בחר סוג הסכם..." />
              </SelectTrigger>
              <SelectContent>
                {AGREEMENT_TEMPLATES.map(t => (
                  <SelectItem key={t.key} value={t.key} disabled={!t.fillfaster_form_id}>
                    {t.label}
                    {!t.fillfaster_form_id && ' (לא מוגדר)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate?.description && (
              <p className="text-[10px] text-slate-400 mt-1">{selectedTemplate.description}</p>
            )}
          </div>

          {/* Auto-filled data preview */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[10px] text-slate-500 font-medium mb-2">נתונים שימולאו אוטומטית:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {lead?.name && (
                <>
                  <span className="text-slate-400">שם מלא</span>
                  <span className="text-slate-700">{lead.name}</span>
                </>
              )}
              {lead?.phone && (
                <>
                  <span className="text-slate-400">טלפון</span>
                  <span className="text-slate-700 font-mono">{lead.phone}</span>
                </>
              )}
              {lead?.email && (
                <>
                  <span className="text-slate-400">אימייל</span>
                  <span className="text-slate-700 truncate">{lead.email}</span>
                </>
              )}
              {lead?.id_number && (
                <>
                  <span className="text-slate-400">ת.ז.</span>
                  <span className="text-slate-700 font-mono">{lead.id_number}</span>
                </>
              )}
              {lead?.business_name && (
                <>
                  <span className="text-slate-400">שם עסק</span>
                  <span className="text-slate-700">{lead.business_name}</span>
                </>
              )}
              {!lead?.name && !lead?.phone && !lead?.email && (
                <span className="text-slate-400 col-span-2">אין נתונים זמינים</span>
              )}
            </div>
          </div>

          {/* WhatsApp target */}
          {lead?.phone && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
              <Phone size={12} />
              WhatsApp יישלח ל: <span className="font-mono font-medium">{lead.phone}</span>
            </div>
          )}
          {missingPhone && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle size={14} />
              אין מספר טלפון — ניתן רק ליצור קישור
            </div>
          )}

          {/* Optional extra fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">סכום (אופציונלי)</label>
              <Input
                type="number"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                placeholder="₪"
                className="text-xs"
                min="0"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">שם שירות (אופציונלי)</label>
              <Input
                value={extraServiceName}
                onChange={(e) => setExtraServiceName(e.target.value)}
                placeholder="שירות"
                className="text-xs"
                maxLength={100}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          {/* Primary: Send via WhatsApp */}
          <Button
            onClick={() => handleCreate(true)}
            disabled={createAgreement.isPending || !templateKey || missingPhone || !hasTemplates}
            className="w-full text-xs bg-green-600 hover:bg-green-700"
          >
            {createAgreement.isPending ? (
              <RefreshCw size={12} className="animate-spin ml-1" />
            ) : (
              <Send size={12} className="ml-1" />
            )}
            שלח הסכם ב-WhatsApp
          </Button>

          {/* Secondary: Create link only */}
          <Button
            variant="outline"
            onClick={() => handleCreate(false)}
            disabled={createAgreement.isPending || !templateKey || !hasTemplates}
            className="w-full text-xs"
          >
            <Link2 size={12} className="ml-1" />
            צור קישור בלבד (ללא שליחה)
          </Button>

          <Button variant="ghost" onClick={handleClose} className="w-full text-xs text-slate-500">
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
