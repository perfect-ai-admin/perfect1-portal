import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function SimpleDialog({ open, onClose, children, className = '' }) {
  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      
      {/* Dialog Container - Full screen with safe area padding, flex container */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Panel - Bounded by viewport */}
        <div 
          className={`w-full max-w-2xl max-h-full flex flex-col bg-white rounded-2xl shadow-2xl ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}