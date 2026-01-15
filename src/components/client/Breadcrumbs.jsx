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
    <nav className="flex items-center gap-2 text-sm mb-4" aria-label="מסלול פנימי">
      <button 
        onClick={() => onNavigate('progress')}
        className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        aria-label="חזור לעמוד דאשבורד ראשי"
      >
        דאשבורד
      </button>
      <ChevronLeft className="w-4 h-4 text-gray-400" aria-hidden="true" />
      <span className="text-gray-700 font-medium" aria-current="page">
        {TAB_NAMES[activeTab] || activeTab}
      </span>
    </nav>
  );
}