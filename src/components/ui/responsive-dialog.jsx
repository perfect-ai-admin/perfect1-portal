import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogPortal,
  DialogContent,
  DialogOverlay,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * ResponsiveDialog - Full-screen on mobile, centered on desktop
 * Slot-based API: header, children (body), footer
 * Footer is ALWAYS sticky/fixed on mobile
 * Body scrolls independently
 */

export const ResponsiveDialog = React.forwardRef(
  ({
    open,
    onOpenChange,
    children,
    header,
    footer,
    footerHeight = 88, // default 88px (56px btn + 16px padding × 2)
    className,
    overlayClassName,
    contentClassName,
    ...props
  }, ref) => {
    const [isDialogOpen, setIsDialogOpen] = React.useState(open ?? false);

    React.useEffect(() => {
      setIsDialogOpen(open ?? false);
    }, [open]);

    const handleOpenChange = (newOpen) => {
      setIsDialogOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    return (
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogPortal>
          {/* Overlay */}
          <DialogOverlay
            className={cn(
              'fixed inset-0 z-50 bg-black/80',
              overlayClassName
            )}
          />

          {/* Content - Responsive */}
          <div
            className={cn(
              // Mobile (< 768px): Full screen height, stretch width
              'fixed md:relative inset-y-0 left-0 right-0 md:inset-auto z-50',
              'md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%]',
              'w-full md:max-w-lg md:max-h-[90vh]',
              'rounded-none md:rounded-lg',
              'flex flex-col',
              'bg-white shadow-lg md:shadow-lg',
              className
            )}
            style={{
              '--footer-height': `${footerHeight}px`,
            }}
          >
            {/* Header - Fixed */}
            {header && (
              <div className="flex-shrink-0 border-b border-gray-200 bg-white">
                {typeof header === 'function' ? header() : header}
              </div>
            )}

            {/* Body - Scrollable */}
            {children && (
              <div
                className={cn(
                  'flex-1 overflow-y-auto',
                  // Ensure body doesn't go under footer
                  'md:pb-0',
                  footer && 'pb-[calc(var(--footer-height)+env(safe-area-inset-bottom))]'
                )}
              >
                {typeof children === 'function' ? children() : children}
              </div>
            )}

            {/* Footer - Fixed on mobile, sticky on desktop */}
            {footer && (
              <div
                className={cn(
                  'flex-shrink-0 border-t border-gray-200 bg-white',
                  // Mobile: fixed at bottom with safe-area
                  'md:sticky md:bottom-0',
                  'fixed md:relative bottom-0 left-0 right-0 md:left-auto md:right-auto',
                  'z-[1] md:z-auto'
                )}
                style={{
                  height: `${footerHeight}px`,
                  paddingBottom: 'env(safe-area-inset-bottom)',
                }}
              >
                {typeof footer === 'function' ? footer() : footer}
              </div>
            )}

            {/* Close Button - For accessibility */}
            <DialogClose
              asChild
              className="absolute top-4 right-4 md:top-4 md:right-4 z-10"
            >
              <button
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="סגור"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </DialogClose>
          </div>
        </DialogPortal>
      </Dialog>
    );
  }
);

ResponsiveDialog.displayName = 'ResponsiveDialog';

export default ResponsiveDialog;