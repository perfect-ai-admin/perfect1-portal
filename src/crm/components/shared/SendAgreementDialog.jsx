import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Link2, Send, RefreshCw, FileText, AlertCircle, Check, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateAgreement } from '../../hooks/useCRM';
import { AGREEMENT_TEMPLATES } from '../../config/agreementTemplates';

export default function SendAgreementDialog({ lead, open, onOpenChange }) {
  const createAgreement = useCreateAgreement();
  const [templateKey, setTemplateKey] = useState('');
  const [agentValues, setAgentValues] = useState({});
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [savedResult, setSavedResult] = useState(null);

  const selectedTemplate = AGREEMENT_TEMPLATES.find(t => t.key === templateKey);
  const hasTemplates = AGREEMENT_TEMPLATES.some(t => t.fillfaster_form_id);

  const handleTemplateChange = (key) => {
    setTemplateKey(key);
    setAgentValues({});
    setClientName(lead?.name || '');
    setClientId(lead?.id_number || '');
  };

  const handleSave = () => {
    if (!templateKey || !selectedTemplate) {
      toast.error('יש לבחור סוג הסכם');
      return;
    }
    if (!selectedTemplate.fillfaster_form_id) {
      toast.error('תבנית לא מוגדרת');
      return;
    }

    const allFields = { ...agentValues, 'שם מלא': clientName, 'ת.ז': clientId };

    createAgreement.mutate(
      {
        lead_id: lead.id,
        template_key: templateKey,
        fillfaster_form_id: selectedTemplate.fillfaster_form_id,
        template_label: selectedTemplate.label,
        extra_fields: allFields,
      },
      {
        onSuccess: (data) => {
          toast.success('הסכם נשמר בהצלחה');
          setSavedResult({ agreement_id: data?.agreement_id });
        },
        onError: (err) => toast.error(err.message || 'שגיאה בשמירת ההסכם'),
      }
    );
  };

  const handleClose = () => {
    setTemplateKey('');
    setAgentValues({});
    setClientName('');
    setClientId('');
    setSavedResult(null);
    onOpenChange(false);
  };

  // ---- Success screen ----
  if (savedResult) {
    return (
      <Dialog open={open} onOpenChange={() => handleClose()}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-green-700">
              <Check size={18} />
              הסכם נשמר בהצלחה
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-600">
              ההסכם נשמר במערכת. כדי ליצור קישור חתימה או לשלוח ללקוח — השתמש בכפתורים בפאנל ההסכמים.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 space-y-1">
              <p><strong>שלב הבא:</strong></p>
              <p>1. לחץ "צור קישור" בפאנל ההסכמים כדי לקבל קישור חתימה</p>
              <p>2. לאחר מכן תוכל לשלוח את הקישור ב-WhatsApp או להעתיק אותו</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleClose} className="w-full text-xs">סגור</Button>
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
            יצירת הסכם חדש
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!hasTemplates && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <AlertCircle size={14} />
              אין תבניות הסכם מוגדרות
            </div>
          )}

          {/* Template selection */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">סוג הסכם</label>
            <Select value={templateKey} onValueChange={handleTemplateChange} disabled={!hasTemplates}>
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

          {/* Client details */}
          {selectedTemplate && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-medium">פרטי לקוח:</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">שם מלא</label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="שם מלא" className="text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">ת.ז</label>
                  <Input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="מספר ת.ז" className="text-xs font-mono" maxLength={9} />
                </div>
              </div>
            </div>
          )}

          {/* Agent fields */}
          {selectedTemplate?.agentFields?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-medium">שדות למילוי:</p>
              <div className="grid grid-cols-2 gap-2">
                {selectedTemplate.agentFields.map((field) => (
                  <div key={field.name}>
                    <label className="text-[10px] text-slate-500 mb-1 block">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    <Input
                      type={field.type || 'text'}
                      value={agentValues[field.name] || ''}
                      onChange={(e) => setAgentValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder || ''}
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTemplate && (
            <p className="text-[10px] text-slate-400 text-center">
              פרטי כרטיס אשראי ימולאו ע״י הלקוח בטופס החתימה
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSave}
            disabled={createAgreement.isPending || !templateKey || !hasTemplates}
            className="w-full text-xs bg-blue-600 hover:bg-blue-700"
          >
            {createAgreement.isPending ? (
              <RefreshCw size={12} className="animate-spin ml-1" />
            ) : (
              <Save size={12} className="ml-1" />
            )}
            שמור הסכם
          </Button>

          <Button variant="ghost" onClick={handleClose} className="w-full text-xs text-slate-500">
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
