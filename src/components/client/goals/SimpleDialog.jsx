import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function SimpleDialog({ open, onClose, children, className = '' }) {
  if (!open) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex justify-center p-4"
      style={{ top: '10%' }}
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