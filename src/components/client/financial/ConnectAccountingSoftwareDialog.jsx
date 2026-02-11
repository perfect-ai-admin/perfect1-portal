import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export default function ConnectAccountingSoftwareDialog({ open, onOpenChange, selectedProvider, onContinue }) {
  const providerName = selectedProvider?.name || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">🔗 חיבור ל-{providerName}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p className="text-center">
            החיבור מאפשר לנו לנתח את הנתונים הפיננסיים שלך ולהציג לך תובנות מותאמות אישית.
          </p>

          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">חיבור מאובטח ומוצפן</p>
                <p className="text-xs text-gray-500">כל המידע מועבר בצורה מוצפנת ומאובטחת</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">קריאה בלבד</p>
                <p className="text-xs text-gray-500">לא מתבצעת שום פעולה ללא אישורך המפורש</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">ניתן להתנתק בכל עת</p>
                <p className="text-xs text-gray-500">תוכל לבטל את החיבור בלחיצה אחת</p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500">
            הפקת חשבוניות ומסמכים תתבצע <span className="font-medium text-gray-900">אך ורק באישור ובפעולה יזומה שלך.</span>
          </p>
        </div>

        <Button onClick={() => { if (onContinue) onContinue(); }} className="w-full gap-2 text-base py-5">
          👉 המשך בצורה מאובטחת
        </Button>
      </DialogContent>
    </Dialog>
  );
}