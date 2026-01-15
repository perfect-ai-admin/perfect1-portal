import React from 'react';
import { ChevronLeft } from 'lucide-react';

const TAB_NAMES = {
  progress: 'התקדמות',
  business: 'עסקי',
  financial: 'כספי',
  goals: 'מטרות',
  marketing: 'שיווק',
  mentor: 'מנטור'
};

export default function Breadcrumbs({ activeTab, onNavigate }) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4" aria-label="breadcrumb">
      <button 
        onClick={() => onNavigate('progress')}
        className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
      >
        דאשבורד
      </button>
      <ChevronLeft className="w-4 h-4 text-gray-400" />
      <span className="text-gray-700 font-medium">{TAB_NAMES[activeTab] || activeTab}</span>
    </nav>
  );
}