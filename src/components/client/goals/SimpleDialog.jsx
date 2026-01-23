import React, { useEffect, useContext, createContext } from 'react';
import { createPortal } from 'react-dom';

// Dialog Context for managing open state globally
export const DialogContext = createContext({
  isDialogOpen: false,
  setIsDialogOpen: () => {}
});

export default function SimpleDialog({ open, onClose, children, className = '' }) {
  const { setIsDialogOpen } = useContext(DialogContext);

  useEffect(() => {
    // Notify parent when dialog opens/closes
    setIsDialogOpen(open);
    
    if (open) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
      setIsDialogOpen(false);
    };
  }, [open, setIsDialogOpen]);

  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      
      {/* Dialog Container - Full viewport flex container */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3"
        style={{
          paddingTop: `max(12px, env(safe-area-inset-top))`,
          paddingBottom: `max(12px, env(safe-area-inset-bottom))`,
          paddingLeft: '12px',
          paddingRight: '12px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Panel - Flex column */}
        <div 
          className={`w-full max-w-2xl flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}
          style={{
            maxHeight: `calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}