import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'bg-surface border-border text-foreground shadow-lg',
          title: 'text-lg font-medium text-foreground',
          description: 'text-xs text-muted-foreground',
        },
      }}
    />
  );
}
