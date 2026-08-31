import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { SpinnerMini } from './SpinnerMini';

type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary:
    'border border-border bg-surface text-foreground hover:bg-surface-hover',
  ghost: 'text-foreground hover:bg-surface-hover',
  danger: 'bg-danger text-white hover:bg-danger/90',
  'danger-ghost': 'text-danger hover:bg-danger/10',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={[
          'inline-flex items-center justify-center gap-2',
          'rounded-md',
          'font-medium',
          'transition-colors',
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-primary/40',
          'disabled:pointer-events-none',
          'disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading && <SpinnerMini size="sm" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
