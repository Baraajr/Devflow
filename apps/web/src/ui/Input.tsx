import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={error}
        className={[
          'h-9 w-full rounded-md border bg-surface px-3',
          'text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'outline-none transition-colors',
          error
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-border focus:border-primary focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        ].join(' ')}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
