import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function SimpleDialog({ open, onClose, children, className = '' }) {
  if (!open) return null;

  return createPortal(
    <div 
      className="fixed left-0 right-0 top-0 z-50 flex justify-center pt-[5vh] p-4 overflow-visible min-h-screen"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 animate-in fade-in" />
      
      {/* Dialog */}
      <div 
        className={`relative z-50 w-full max-w-2xl animate-in fade-in zoom-in-95 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}