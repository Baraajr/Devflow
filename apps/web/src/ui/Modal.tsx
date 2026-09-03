import * as React from 'react';

import { cn } from '../lib/utils';
import { ModalContext, useModal } from './ModalContext';

interface ModalProps {
  children: React.ReactNode;
}

function Modal({ children }: ModalProps) {
  const [openName, setOpenName] = React.useState('');

  const open = React.useCallback((name: string) => {
    setOpenName(name);
  }, []);

  const close = React.useCallback(() => {
    setOpenName('');
  }, []);

  return (
    <ModalContext.Provider value={{ openName, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

interface OpenProps {
  opens: string;
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler;
  }>;
}

function Open({ opens, children }: OpenProps) {
  const { open } = useModal();

  return React.cloneElement(children, {
    onClick: (event) => {
      children.props.onClick?.(event);
      open(opens);
    },
  });
}

interface WindowProps {
  name: string;
  children: React.ReactNode;
  className?: string;
}

function Window({ name, children, className }: WindowProps) {
  const { openName, close } = useModal();
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  const isOpen = openName === name;

  React.useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={handleBackdropClick}
      className={cn(
        'fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg',
        'rounded-lg border bg-background p-0 text-foreground shadow-lg',
        'backdrop:bg-black/50',
        className,
      )}
    >
      <div className="p-6">{children}</div>
    </dialog>
  );
}

interface CloseProps {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler;
  }>;
}

function Close({ children }: CloseProps) {
  const { close } = useModal();

  return React.cloneElement(children, {
    onClick: (event) => {
      children.props.onClick?.(event);
      close();
    },
  });
}

Modal.Open = Open;
Modal.Window = Window;
Modal.Close = Close;

export default Modal;
