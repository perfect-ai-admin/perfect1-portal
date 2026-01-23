import React, { useEffect } from 'react';
import ResponsiveDialog from '@/components/ui/responsive-dialog';
import { useDialogState } from '@/components/DialogStateContext';

/**
 * SimpleDialog - Wrapper around ResponsiveDialog
 * Integrates with global dialog state context
 * 
 * Usage:
 * <SimpleDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   header={<Header />}
 *   footer={<Footer />}
 * >
 *   Body content here
 * </SimpleDialog>
 */

export default function SimpleDialog({
  open,
  onOpenChange,
  header,
  footer,
  children,
  ...props
}) {
  const { openDialog, closeDialog } = useDialogState();

  useEffect(() => {
    if (open) {
      openDialog();
    } else {
      closeDialog();
    }
  }, [open, openDialog, closeDialog]);

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      header={header}
      footer={footer}
      {...props}
    >
      {children}
    </ResponsiveDialog>
  );
}