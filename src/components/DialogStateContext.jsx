import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Global Dialog State Context
 * Tracks how many dialogs are open
 * Used to hide bottom navigation when any dialog is open
 */

const DialogStateContext = createContext({
  dialogsCount: 0,
  openDialog: () => {},
  closeDialog: () => {},
  isAnyDialogOpen: false,
});

export function DialogStateProvider({ children }) {
  const [dialogsCount, setDialogsCount] = useState(0);

  const openDialog = useCallback(() => {
    setDialogsCount((prev) => prev + 1);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogsCount((prev) => Math.max(0, prev - 1));
  }, []);

  const value = {
    dialogsCount,
    openDialog,
    closeDialog,
    isAnyDialogOpen: dialogsCount > 0,
  };

  return (
    <DialogStateContext.Provider value={value}>
      {children}
    </DialogStateContext.Provider>
  );
}

export function useDialogState() {
  const context = useContext(DialogStateContext);
  if (!context) {
    throw new Error('useDialogState must be used within DialogStateProvider');
  }
  return context;
}