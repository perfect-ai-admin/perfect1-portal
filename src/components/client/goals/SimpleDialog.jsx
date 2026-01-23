import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function SimpleDialog({ open, onClose, children, className = '' }) {
  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      
      {/* Dialog - Fixed at top with max height */}
      <div 
        className={`fixed top-[10%] left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  );
}