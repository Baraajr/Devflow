import * as React from 'react';

interface ModalContextValue {
  openName: string;
  open: (name: string) => void;
  close: () => void;
}

export const ModalContext = React.createContext<ModalContextValue | null>(null);

export function useModal() {
  const context = React.useContext(ModalContext);

  if (!context) {
    throw new Error('Modal components must be used inside <Modal>.');
  }

  return context;
}
