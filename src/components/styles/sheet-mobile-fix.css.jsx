/* Mobile Sheet Fix - Production Safe */
/* Prevents Tailwind Purge issues & ensures consistent layout on mobile */

.mobile-sheet-container {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.mobile-sheet-container[data-state="open"] {
  pointer-events: auto;
}

.mobile-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  animation: fadeIn 0.3s ease-in-out;
}

.mobile-sheet-content {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100vw;
  height: auto;
  max-height: 95dvh;
  background: white;
  border-radius: 1rem 1rem 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 51;
  overflow: visible;
  animation: slideUpMobile 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

/* On smaller screens (under 640px) - full height */
@media (max-width: 639px) {
  .mobile-sheet-content {
    height: calc(100dvh - 40px);
    max-height: 100dvh;
    border-radius: 1.5rem 1.5rem 0 0;
  }
}

/* Header stays fixed */
.mobile-sheet-header {
  flex-shrink: 0;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #f3f4f6, #ffffff);
  z-index: 10;
}

/* Body scrolls */
.mobile-sheet-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 1rem;
  min-width: 0;
  touch-action: pan-y;
}

/* Footer stays fixed */
.mobile-sheet-footer {
  flex-shrink: 0;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: white;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

/* Animations */
@keyframes slideUpMobile {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDownMobile {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.5;
  }
}

/* Ensure no horizontal scroll on body when sheet is open */
body[data-sheet-open] {
  overflow: hidden;
  width: 100vw;
}

/* Prevent layout shift from scrollbar */
html {
  scroll-behavior: smooth;
}

/* Touch optimization */
.mobile-sheet-content * {
  -webkit-tap-highlight-color: transparent;
}

/* Handle dvh fallback for older browsers */
@supports not (height: 100dvh) {
  .mobile-sheet-content {
    height: calc(100vh - 40px);
    max-height: 100vh;
  }

  @media (max-width: 639px) {
    .mobile-sheet-content {
      height: 100vh;
    }
  }
}