import React from 'react';
import { clsx } from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={clsx(
          'animate-spin rounded-full border-solid border-cyan-400 border-t-transparent',
          sizes[size],
          className
        )}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <span className="text-xs text-slate-400 font-mono">{label}</span>}
    </div>
  );
};
