import * as React from 'react';

import { cn } from '../lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'> & {
    error?: boolean;
  }
>(({ className, error, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        'flex min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm shadow-sm',
        'placeholder:text-muted-foreground',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive focus-visible:ring-destructive/30',
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
