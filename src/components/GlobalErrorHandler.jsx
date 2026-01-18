import React, { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

const generateErrorId = () => `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function GlobalErrorHandler() {
  useEffect(() => {
    // Catch unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      const errorId = generateErrorId();
      const errorMsg = event.reason?.message || String(event.reason);
      const step = event.reason?.step || 'unknown';
      
      console.error(`[GLOBAL_ERROR] ${errorId} [STEP: ${step}]:`, event.reason);
      
      toast.error(`שגיאה: ${errorId}\nשלב: ${step}`, {
        duration: 10000,
        description: errorMsg
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return <Toaster />;
}

// Export helper to throw errors with context
export function throwWithContext(message, step) {
  const errorId = generateErrorId();
  const error = new Error(message);
  error.errorId = errorId;
  error.step = step;
  console.error(`[ERROR_CONTEXT] ${errorId} [${step}]:`, message);
  throw error;
}