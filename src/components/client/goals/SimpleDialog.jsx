import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const DebugPanel = ({ debug }) => {
  if (!debug) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white text-xs p-2 z-[60] max-h-40 overflow-y-auto font-mono text-[10px]">
      <div>vvh={debug.vvh} | panel.bottom={debug.panelBottom} | footer.bottom={debug.footerBottom} | cta.bottom={debug.ctaBottom}</div>
      <div className={debug.ctaIsVisible ? 'text-green-400' : 'text-red-400'}>
        ctaIsVisible: {String(debug.ctaIsVisible)} | gap: {debug.gap}px
      </div>
    </div>
  );
};

export default function SimpleDialog({ open, onClose, children, className = '' }) {
  const [debug, setDebug] = useState(null);
  const [vvh, setVvh] = useState('100dvh');
  const panelRef = React.useRef(null);
  const footerRef = React.useRef(null);
  const ctaRef = React.useRef(null);

  useEffect(() => {
    if (!open) return;

    const isDebugMode = new URLSearchParams(window.location.search).has('debug');
    
    const updateMeasurements = () => {
      // Set CSS variable for visualViewport
      if (window.visualViewport) {
        const newVvh = `${window.visualViewport.height}px`;
        setVvh(newVvh);
        document.documentElement.style.setProperty('--vvh', newVvh);
      }

      if (!isDebugMode) return;

      // Get measurements
      const windowHeight = window.innerHeight;
      const vvhValue = window.visualViewport?.height || windowHeight;
      const panelRect = panelRef.current?.getBoundingClientRect();
      const footerRect = footerRef.current?.getBoundingClientRect();
      const ctaRect = ctaRef.current?.querySelector('button')?.getBoundingClientRect();

      const panelBottom = panelRect?.bottom || 0;
      const footerBottom = footerRect?.bottom || 0;
      const ctaBottom = ctaRect?.bottom || 0;
      const gap = vvhValue - ctaBottom;
      const ctaIsVisible = ctaBottom <= vvhValue - 4;

      setDebug({
        vvh: Math.round(vvhValue),
        windowHeight,
        panelBottom: Math.round(panelBottom),
        footerBottom: Math.round(footerBottom),
        ctaBottom: Math.round(ctaBottom),
        gap: Math.round(gap),
        ctaIsVisible
      });
    };

    // Initial measurement
    setTimeout(updateMeasurements, 100);

    // Listen to viewport changes
    const resizeListener = () => updateMeasurements();
    const focusListener = () => setTimeout(updateMeasurements, 300);

    window.addEventListener('resize', resizeListener);
    window.addEventListener('focusin', focusListener);
    window.addEventListener('focusout', focusListener);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resizeListener);
      window.visualViewport.addEventListener('scroll', resizeListener);
    }

    return () => {
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('focusin', focusListener);
      window.removeEventListener('focusout', focusListener);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', resizeListener);
        window.visualViewport.removeEventListener('scroll', resizeListener);
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
        {/* Dialog Panel - Flex column with measured height */}
        <div 
          ref={panelRef}
          className={`w-full max-w-2xl flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}
          style={{
            maxHeight: `calc(var(--vvh, 100dvh) - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
          
          {/* Debug Panel */}
          <DebugPanel debug={debug} />
        </div>
      </div>

      {/* Refs for measurement */}
      <div ref={footerRef} style={{ display: 'none' }} />
      <div ref={ctaRef} style={{ display: 'none' }} />
    </>,
    document.body
  );
}