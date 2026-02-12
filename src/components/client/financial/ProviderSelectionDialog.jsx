import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ACCOUNTING_PROVIDERS } from './accountingProviders';
import { Badge } from '@/components/ui/badge';

const PROVIDER_LOGOS = {
  finbot: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/bad1e678a_Logo-Finbot-2048x470.png',
  morning: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/c4ed41c81_image.png',
  sumit: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/ee666d319_image.png',
  icount: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695d476070d43f37f05394ca/14f110f3a_image.png',
};

export default function ProviderSelectionDialog({ open, onOpenChange, onSelectProvider, savedProviders = [] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">חיבור למערכת הנהלת חשבונות</DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            כדי לבצע פעולה זו, עליך לחבר תחילה את מערכת הנהלת החשבונות שלך
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          {ACCOUNTING_PROVIDERS.map((provider) => {
            const isAvailable = provider.status === 'available';
            const hasSaved = savedProviders.some(sp => sp.provider === provider.id);

            return (
              <button
                key={provider.id}
                onClick={() => isAvailable && onSelectProvider(provider)}
                disabled={!isAvailable}
                className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all
                  ${isAvailable 
                    ? hasSaved 
                      ? 'border-green-300 hover:border-green-400 hover:shadow-md cursor-pointer bg-green-50/30 active:scale-[0.97]'
                      : 'border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer bg-white active:scale-[0.97]' 
                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
              >
                <img
                  src={PROVIDER_LOGOS[provider.id]}
                  alt={provider.name}
                  className="h-10 w-auto object-contain max-w-[140px]"
                />
                {hasSaved && (
                  <span className="text-[10px] text-green-700 font-medium mt-2">פרטים שמורים ✓</span>
                )}
                {!isAvailable && (
                  <Badge variant="secondary" className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0">בקרוב</Badge>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-500 pt-1">
          אין לך עדיין מערכת חשבונות?{' '}
          <a href="https://www.finbot.co.il" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">
            לחץ כאן לפתיחה מהירה 🔗
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}