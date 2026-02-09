import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  not_started: { label: 'טרם התחיל', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  power_of_attorney_sent: { label: 'נשלח ייפוי כוח', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_process: { label: 'בתהליך סגירה', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  completed: { label: 'הושלם', color: 'bg-green-50 text-green-700 border-green-200' },
};

export default function CloseOsekStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  return (
    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap", config.color)}>
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };