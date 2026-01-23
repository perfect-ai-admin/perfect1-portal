import React, { useEffect, useContext, createContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Dialog Context for managing open state globally
export const DialogContext = createContext({
  isDialogOpen: false,
  setIsDialogOpen: () => {}
});

// Action Trace Context
export const ActionTraceContext = createContext({
  logAction: () => {},
  actionLog: []
});

const DebugPanel = ({ debug, clickTrace, actionLog, isDialogOpen, dialogCount }) => {
  if (!debug) return null;
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-black/95 text-white text-xs p-3 z-[60] max-h-[500px] overflow-y-auto font-mono border-t-2 border-blue-500"
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
        </div>

        {/* Bottom Bar */}
        <div className="text-yellow-300 text-[11px]">
          bottomBarHeight: {debug.bottomBarHeight}px {debug.bottomBarHidden ? '(hidden ✓)' : '(visible ❌)'}
        </div>

        {/* CLICK TRACE */}
        <div className="border-t border-gray-600 pt-2 mt-2">
          <div className="text-cyan-300 font-bold text-[12px]">🎯 CLICK TRACE</div>
          <div className={clickTrace.ctaClickCount > 0 ? 'text-green-400 font-bold' : 'text-gray-400'}>
            ctaClickCount: {clickTrace.ctaClickCount}
          </div>
          {clickTrace.clickCount > 0 && (
            <div className='text-green-400 font-bold text-[11px]'>
              ✅ CLICK RECEIVED: {clickTrace.clickCount}
            </div>
          )}
        </div>

        {/* ACTION TRACE */}
        {actionLog && actionLog.length > 0 && (
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="text-amber-300 font-bold text-[12px]">⚙️ ACTION TRACE</div>
            <div className="max-h-32 overflow-y-auto space-y-0.5">
              {actionLog.slice(-10).map((entry, idx) => (
                <div key={idx} className={
                  entry.type === 'ACTION_START' ? 'text-cyan-300' :
                  entry.type === 'ACTION_END' ? 'text-green-400 font-bold' :
                  entry.type === 'ERROR' ? 'text-red-400 font-bold' :
                  entry.type === 'BLOCKED_BY' ? 'text-yellow-400' :
                  'text-gray-300'
                }>
                  [{entry.type}] {entry.message}
                  {entry.details && <span className="text-[9px] opacity-75"> • {JSON.stringify(entry.details).slice(0, 40)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Definition of Done */}
        <div className="border-t border-gray-600 pt-2 mt-2 text-[10px]">
          <div className={
            debug.ctaIsVisible && !debug.isCovered && isDialogOpen && debug.bottomBarHidden && clickTrace.clickCount > 0
              ? actionLog.some(log => log.type === 'ACTION_END') ? 'text-green-400 font-bold' : 'text-yellow-400'
              : 'text-yellow-400'
          }>
            ✓ DONE: clicked={clickTrace.clickCount > 0} | actionsLogged={actionLog?.length > 0}
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
  const [clickTrace, setClickTrace] = useState({
    ctaClickCount: 0,
    clickCount: 0,
    lastPointerTarget: null,
    elementAtTap: null,
    composedPath: null
  });
  const [actionLog, setActionLog] = useState([]);
  const [lastError, setLastError] = useState(null);
  const panelRef = React.useRef(null);
  const ctaRef = React.useRef(null);

  const logAction = useCallback((type, message, details = null) => {
    const entry = {
      type,
      message,
      details,
      timestamp: new Date().toLocaleTimeString('he-IL', { hour12: false })
    };
    setActionLog(prev => [...prev, entry]);
    console.log(`[${type}]`, message, details);
  }, []);

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

    const updateDebug = () => {
      if (!isDebugMode) return;

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

  // Click Trace + Error Capture
  useEffect(() => {
    if (!open) return;

    const isDebugMode = new URLSearchParams(window.location.search).has('debug');
    
    // CTA button listeners
    const ctaBtn = panelRef.current?.querySelector('button[type="button"]');
    
    const handlePointerDown = (e) => {
      if (isDebugMode) {
        setClickTrace(prev => ({
          ...prev,
          ctaClickCount: prev.ctaClickCount + 1
        }));
        logAction('POINTER_DOWN', 'Button pointer down');
      }
    };

    const handleClick = (e) => {
      if (isDebugMode) {
        setClickTrace(prev => ({
          ...prev,
          clickCount: prev.clickCount + 1
        }));
        logAction('ACTION_START', 'Handler starting', { targetTag: e.target?.tagName });
      }
    };

    if (ctaBtn) {
      ctaBtn.addEventListener('pointerdown', handlePointerDown);
      ctaBtn.addEventListener('click', handleClick);
    }

    // Global error capture
    const handleError = (event) => {
      if (isDebugMode) {
        const msg = event.message || String(event);
        setLastError(msg);
        logAction('ERROR', msg, { source: 'error event' });
      }
    };

    const handleUnhandledRejection = (event) => {
      if (isDebugMode) {
        const msg = event.reason?.message || String(event.reason);
        setLastError(msg);
        logAction('ERROR', 'Unhandled Promise rejection: ' + msg, { reason: event.reason });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      if (ctaBtn) {
        ctaBtn.removeEventListener('pointerdown', handlePointerDown);
        ctaBtn.removeEventListener('click', handleClick);
      }
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [open, logAction]);

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
      <DebugPanel debug={debug} clickTrace={clickTrace} actionLog={actionLog} isDialogOpen={open} dialogCount={dialogCount} />
    </>,
    document.body
  );
}