import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ConfidenceTag({ level = 'high' }) {
  const config = {
    high: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      label: 'ביטחון גבוה'
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      label: 'ביטחון בינוני'
    },
    low: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      label: 'ביטחון נמוך'
    }
  };

  const c = config[level] || config.high;

  return (
    <div className={`${c.bg} ${c.border} border rounded-full px-2.5 py-1 flex items-center gap-1 w-fit`}>
      <AlertCircle className={`w-3 h-3 ${c.text}`} />
      <span className={`text-xs font-medium ${c.text}`}>{c.label}</span>
    </div>
  );
}