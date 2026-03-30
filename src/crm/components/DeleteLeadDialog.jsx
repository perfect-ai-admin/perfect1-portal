import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useDeleteLead } from '../hooks/useCRM';

export default function DeleteLeadDialog({ open, onOpenChange, lead, onDeleted }) {
  const [hardDelete, setHardDelete] = useState(false);
  const deleteLead = useDeleteLead();

  const handleDelete = () => {
    deleteLead.mutate(
      { lead_id: lead?.id, hard_delete: hardDelete },
      {
        onSuccess: () => {
          toast.success(hardDelete ? 'הליד נמחק לצמיתות' : 'הליד נסגר');
          onOpenChange(false);
          onDeleted?.();
        },
        onError: (err) => {
          console.error('Delete lead failed:', err);
          toast.error(`שגיאה במחיקה: ${err.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            מחיקת ליד
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <p className="text-sm text-slate-600">
            אתה עומד להסיר את הליד <span className="font-semibold">{lead?.name || 'ללא שם'}</span>.
          </p>

          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setHardDelete(false)}>
              <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 ${!hardDelete ? 'border-[#1E3A5F] bg-[#1E3A5F]' : 'border-slate-300'}`} />
              <div>
                <p className="text-sm font-medium">סגירה (soft delete)</p>
                <p className="text-xs text-slate-400">הליד יוסתר מה-pipeline אך יישמר במערכת</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition-colors border-red-100"
              onClick={() => setHardDelete(true)}>
              <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 ${hardDelete ? 'border-red-500 bg-red-500' : 'border-slate-300'}`} />
              <div>
                <p className="text-sm font-medium text-red-600">מחיקה לצמיתות</p>
                <p className="text-xs text-slate-400">הליד יימחק לצמיתות ולא ניתן יהיה לשחזרו</p>
              </div>
            </label>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLead.isPending}
          >
            {deleteLead.isPending ? 'מוחק...' : hardDelete ? 'מחק לצמיתות' : 'סגור ליד'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
