import React, { useEffect, useContext, createContext, useState } from 'react';
import { createPortal } from 'react-dom';

// Dialog Context for managing open state globally
export const DialogContext = createContext({
  isDialogOpen: false,
  setIsDialogOpen: () => {}
});

const DebugPanel = ({ debug }) => {
  if (!debug) return null;
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-black/90 text-white text-xs p-3 z-[60] max-h-48 overflow-y-auto font-mono"
      style={{ pointerEvents: 'none', bottom: '80px' }}
    >
      <div className="space-y-1">
        <div>📏 vvh={debug.vvh}px | cta.bottom={debug.ctaBottom}px | gap={debug.gap}px</div>
        <div className={debug.ctaIsVisible ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
          ✓ ctaIsVisible: {String(debug.ctaIsVisible)}
        </div>
        <div className={debug.isCovered ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
          {debug.isCovered ? '❌ isCovered: TRUE (BLOCKED!)' : '✓ isCovered: FALSE (CLICKABLE)'}
        </div>
        <div className="text-gray-300">
          Top element covering: {debug.topElementTag || 'none'}
          {debug.topElementClass && ` .${debug.topElementClass}`}
        </div>
        <div className="text-yellow-300">bottomBarHeight: {debug.bottomBarHeight}px</div>
      </div>
    </div>
  );
};

export default function SimpleDialog({ open, onClose, children, className = '' }) {
  const { setIsDialogOpen } = useContext(DialogContext);
  const [debug, setDebug] = useState(null);
  const panelRef = React.useRef(null);

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

  useEffect(() => {
    if (!open) return;

    const isDebugMode = new URLSearchParams(window.location.search).has('debug');
    if (!isDebugMode) return;

    const updateDebug = () => {
      const vvh = window.visualViewport?.height || window.innerHeight;
      const ctaBtn = panelRef.current?.querySelector('button[type="button"]');
      
      if (!ctaBtn) return;

      const ctaRect = ctaBtn.getBoundingClientRect();
      const ctaCenter = {
        x: ctaRect.left + ctaRect.width / 2,
        y: ctaRect.top + ctaRect.height / 2
      };

      // Check what element is on top at button center
      const topEl = document.elementFromPoint(ctaCenter.x, ctaCenter.y);
      const isCovered = topEl && !ctaBtn.contains(topEl);
      
      // Find bottom bar height
      const bottomBar = document.querySelector('nav[role="navigation"]');
      const bottomBarHeight = bottomBar ? bottomBar.getBoundingClientRect().height : 0;

      setDebug({
        vvh: Math.round(vvh),
        ctaBottom: Math.round(ctaRect.bottom),
        gap: Math.round(vvh - ctaRect.bottom),
        ctaIsVisible: ctaRect.bottom <= vvh - 4,
        isCovered,
        topElementTag: topEl?.tagName || 'none',
        topElementClass: topEl?.className?.split(' ')?.[0] || '',
        bottomBarHeight
      });
    };

    const timer = setTimeout(updateDebug, 100);
    const resizeListener = () => updateDebug();
    const focusListener = () => setTimeout(updateDebug, 300);

    window.addEventListener('resize', resizeListener);
    window.addEventListener('focusin', focusListener);
    window.addEventListener('focusout', focusListener);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resizeListener);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('focusin', focusListener);
      window.removeEventListener('focusout', focusListener);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', resizeListener);
      }
    };
  }, [open]);

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
          ref={panelRef}
          className={`w-full max-w-2xl flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}
          style={{
            maxHeight: `calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>

      {/* Debug Panel */}
      <DebugPanel debug={debug} />
    </>,
    document.body
  );
}