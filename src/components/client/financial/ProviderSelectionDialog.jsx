import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ACCOUNTING_PROVIDERS } from './accountingProviders';
import { Badge } from '@/components/ui/badge';

export default function ProviderSelectionDialog({ open, onOpenChange, onSelectProvider }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">🏢 בחר מערכת הנהלת חשבונות</DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            בחר את מערכת החשבונות שלך כדי לחבר אותה
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          {ACCOUNTING_PROVIDERS.map((provider) => {
            const isAvailable = provider.status === 'available';

            return (
              <button
                key={provider.id}
                onClick={() => isAvailable && onSelectProvider(provider)}
                disabled={!isAvailable}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-right
                  ${isAvailable 
                    ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer active:scale-[0.98]' 
                    : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center border flex-shrink-0"
                  style={{ backgroundColor: provider.logoColors.bg, borderColor: provider.logoColors.border }}
                >
                  <span className="font-black text-xs" style={{ color: provider.logoColors.text }}>
                    {provider.logoText}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{provider.name}</span>
                    {!isAvailable && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">בקרוב</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{provider.description}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {provider.features.map((f, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {isAvailable && (
                  <span className="text-blue-500 text-lg flex-shrink-0">←</span>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}