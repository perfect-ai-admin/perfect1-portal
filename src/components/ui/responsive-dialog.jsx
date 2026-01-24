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
 * ResponsiveDialog - Centered dialog on both mobile and desktop
 * Simple wrapper around Radix Dialog with responsive styling
 */

export const ResponsiveDialog = React.forwardRef(
  ({
    open,
    onOpenChange,
    children,
    className,
    overlayClassName,
    ...props
  }, ref) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay
            className={cn(
              'fixed inset-0 z-50 bg-black/80',
              overlayClassName
            )}
          />
          <DialogContent
            ref={ref}
            className={cn(
              'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
              'w-[95vw] max-w-lg max-h-[90vh]',
              'rounded-lg p-0 border-0',
              'bg-white shadow-lg',
              'overflow-hidden',
              className
            )}
            {...props}
          >
            {children}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }
);

ResponsiveDialog.displayName = 'ResponsiveDialog';

export default ResponsiveDialog;