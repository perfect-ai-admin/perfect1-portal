import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function SimpleDialog({ open, onClose, children, className = '' }) {
  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      
      {/* Dialog - Centered, limited height for mobile, ensures button always visible */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl flex flex-col bg-white rounded-2xl shadow-2xl ${className}`}
        style={{ maxHeight: '85dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  );
}