import React, { useEffect, useContext, createContext, useState } from 'react';
import { createPortal } from 'react-dom';

// Dialog Context for managing open state globally
export const DialogContext = createContext({
  isDialogOpen: false,
  setIsDialogOpen: () => {}
});

const DebugPanel = ({ debug, isDialogOpen, dialogCount }) => {
  if (!debug) return null;
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-black/95 text-white text-xs p-3 z-[60] max-h-56 overflow-y-auto font-mono border-t-2 border-blue-500"
      style={{ pointerEvents: 'none', bottom: '80px' }}
    >
      <div className="space-y-1">
        {/* Context State */}
        <div className="border-b border-gray-600 pb-2 mb-2">
          <div className={isDialogOpen ? 'text-cyan-300 font-bold' : 'text-gray-400'}>
            🔷 isDialogOpen: {String(isDialogOpen)} | dialogCount: {dialogCount}
          </div>
          <div className="text-gray-500 text-[10px]">MobileTabBar should be {isDialogOpen ? '❌ HIDDEN' : '✓ VISIBLE'}</div>
        </div>

        {/* CTA Visibility */}
        <div>📏 vvh={debug.vvh}px | cta.bottom={debug.ctaBottom}px | gap={debug.gap}px</div>
        <div className={debug.ctaIsVisible ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
          ✓ ctaIsVisible: {String(debug.ctaIsVisible)}
        </div>

        {/* Coverage Detection */}
        <div className={debug.isCovered ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
          {debug.isCovered ? '❌ isCovered: TRUE (BLOCKED!)' : '✓ isCovered: FALSE (CLICKABLE)'}
        </div>
        <div className="text-gray-300 text-[11px]">
          Covering element: {debug.topElementTag || 'none'}
          {debug.topElementClass && ` .${debug.topElementClass}`}
          {debug.isCovered && debug.topElementId && ` #${debug.topElementId}`}
        </div>

        {/* Bottom Bar */}
        <div className="text-yellow-300 text-[11px]">
          bottomBarHeight: {debug.bottomBarHeight}px {debug.bottomBarHidden ? '(hidden ✓)' : '(visible ❌)'}
        </div>

        {/* Definition of Done */}
        <div className="border-t border-gray-600 pt-2 mt-2 text-[10px]">
          <div className={debug.ctaIsVisible && !debug.isCovered && isDialogOpen && debug.bottomBarHidden ? 'text-green-400 font-bold' : 'text-yellow-400'}>
            ✓ READY: ctaVisible={debug.ctaIsVisible} | notCovered={!debug.isCovered} | barHidden={debug.bottomBarHidden}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SimpleDialog({ open, onClose, children, className = '' }) {
  const context = useContext(DialogContext);
  const { setIsDialogOpen, dialogCount = 0 } = context || {};
  const [debug, setDebug] = useState(null);
  const panelRef = React.useRef(null);

  useEffect(() => {
    // Notify parent when dialog opens/closes
    if (setIsDialogOpen) {
      setIsDialogOpen(open);
    }
    
    if (open) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
      if (setIsDialogOpen) {
        setIsDialogOpen(false);
      }
    };
  }, [open, setIsDialogOpen]);

  useEffect(() => {
    if (!open) {
      setDebug(null);
      return;
    }

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
      
      // Find bottom bar
      const bottomBar = document.querySelector('nav[role="navigation"]');
      const bottomBarHidden = !bottomBar || bottomBar.style.display === 'none' || getComputedStyle(bottomBar).display === 'none';

      setDebug({
        vvh: Math.round(vvh),
        ctaBottom: Math.round(ctaRect.bottom),
        gap: Math.round(vvh - ctaRect.bottom),
        ctaIsVisible: ctaRect.bottom <= vvh - 4,
        isCovered,
        topElementTag: topEl?.tagName || 'none',
        topElementClass: topEl?.className?.split(' ')?.[0] || '',
        topElementId: topEl?.id || '',
        bottomBarHeight: bottomBar ? Math.round(bottomBar.getBoundingClientRect().height) : 0,
        bottomBarHidden
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
      <DebugPanel debug={debug} isDialogOpen={open} dialogCount={dialogCount} />
    </>,
    document.body
  );
}