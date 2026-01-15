import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function MentorHeader({ title, subtitle, icon: Icon = MessageCircle }) {
  return (
    <div className="border-b border-gray-100 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-600 ml-11">{subtitle}</p>
      )}
    </div>
  );
}