import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import FinancialWorkbench from '../financial/FinancialWorkbench';

export default function FinancialTab({ data }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <FinancialWorkbench data={data} />
    </Suspense>
  );
}