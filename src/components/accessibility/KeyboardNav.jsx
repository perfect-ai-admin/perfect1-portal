import { useEffect } from 'react';

// Keyboard Navigation Helpers (section 9.1)

// Hook for keyboard shortcuts
export function useKeyboardShortcut(key, callback, deps = []) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key || e.code === key) {
        callback(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, ...deps]);
}

// Hook for arrow key navigation
export function useArrowNavigation(items, onSelect) {
  useEffect(() => {
    let currentIndex = 0;

    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        onSelect(items[currentIndex], currentIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        onSelect(items[currentIndex], currentIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(items[currentIndex], currentIndex, true);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [items, onSelect]);
}

// Hook for escape key
export function useEscapeKey(callback) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback]);
}

// Tab navigation helper
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handler = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handler);
  return () => element.removeEventListener('keydown', handler);
}