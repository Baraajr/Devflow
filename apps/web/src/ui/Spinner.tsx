import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};

export function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <Loader2
      className={`${sizeStyles[size]} animate-spin`}
      aria-hidden="true"
    />
  );
}
