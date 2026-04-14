import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, RefreshCw, FileText, Phone, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateAgreement } from '../../hooks/useCRM';
import { AGREEMENT_TEMPLATES } from '../../config/agreementTemplates';

export default function SendAgreementDialog({ lead, open, onOpenChange }) {
  const createAgreement = useCreateAgreement();
  const [templateKey, setTemplateKey] = useState('');
  const [fieldValues, setFieldValues] = useState({});
  const [sent, setSent] = useState(false);

  const selectedTemplate = AGREEMENT_TEMPLATES.find(t => t.key === templateKey);
  const hasPhone = !!lead?.phone;

  // Auto-fill fields from lead data when template changes
  useEffect(() => {
    if (!selectedTemplate) return;
    const values = {};
    for (const field of selectedTemplate.fields) {
      if (field.autoFill === 'name') values[field.name] = lead?.name || '';
      else if (field.autoFill === 'id_number') values[field.name] = lead?.id_number || '';
      else values[field.name] = '';
    }
    setFieldValues(values);
  }, [templateKey, lead]);

  const handleFieldChange = (name, value) => {
    setFieldValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSend = () => {
    if (!selectedTemplate) { toast.error('יש לבחור סוג הסכם'); return; }

    // Validate required fields
    for (const field of selectedTemplate.fields) {
      if (field.required && !fieldValues[field.name]?.toString().trim()) {
        toast.error(`יש למלא: ${field.label}`);
        return;
      }
    }

    createAgreement.mutate(
      {
        lead_id: lead.id,
        template_key: selectedTemplate.key,
        template_label: selectedTemplate.label,
        template_link: selectedTemplate.template_link,
        send_whatsapp: true,
        extra_fields: fieldValues,
      },
      {
        onSuccess: (data) => {
          if (data?.whatsapp_sent) {
            setSent(true);
          } else {
            toast.success('ההסכם נשמר');
            if (data?.submission_link) {
              toast.info('WhatsApp לא נשלח — הקישור נשמר');
            }
            setSent(true);
          }
        },
        onError: (err) => toast.error(err.message || 'שגיאה'),
      }
    );
  };

  const handleClose = () => {
    setTemplateKey('');
    setFieldValues({});
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
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText size={18} />
            שליחת הסכם לחתימה
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template selection */}
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
            {selectedTemplate?.description && (
              <p className="text-[10px] text-slate-400 mt-1">{selectedTemplate.description}</p>
            )}
          </div>

          {/* Dynamic fields per template */}
          {selectedTemplate && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-medium">פרטי ההסכם:</p>
              <div className="grid grid-cols-2 gap-2">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.name} className={field.type === 'text' && field.name === 'שם מלא' ? 'col-span-2' : ''}>
                    <label className="text-[10px] text-slate-500 mb-1 block">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    <Input
                      type={field.type || 'text'}
                      value={fieldValues[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder || ''}
                      className="text-xs"
                      maxLength={field.maxLength}
                      min={field.type === 'number' ? '0' : undefined}
                    />
                  </div>
                ))}
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

          {/* Note */}
          {selectedTemplate && (
            <p className="text-[10px] text-slate-400 text-center">
              פרטי כרטיס אשראי ימולאו ע״י הלקוח בטופס החתימה
            </p>
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
