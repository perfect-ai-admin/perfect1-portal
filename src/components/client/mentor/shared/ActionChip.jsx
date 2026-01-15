import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ActionChip({ label, onClick, variant = 'primary', size = 'sm' }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <Button
      onClick={onClick}
      size={size}
      className={`${variants[variant]} gap-1 h-8 px-3`}
    >
      <span className="text-xs font-medium">{label}</span>
      <ArrowLeft className="w-3 h-3" />
    </Button>
  );
}