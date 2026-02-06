import React from 'react';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyProducts({ onGoToStore }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Package className="w-12 h-12 text-blue-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">עדיין לא רכשת מוצרים</h3>
      <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
        כשתרכוש מוצרים כמו דפי נחיתה, לוגואים או מצגות, הם יופיעו כאן לניהול קל
      </p>
      {onGoToStore && (
        <Button onClick={onGoToStore} className="gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
          <ArrowLeft className="w-4 h-4" />
          עבור לחנות המוצרים
        </Button>
      )}
    </div>
  );
}