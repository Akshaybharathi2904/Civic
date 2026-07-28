import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'gradient';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-xl p-5 transition-all duration-200';

  const variants = {
    default: 'bg-slate-900/90 border border-slate-800 shadow-xl',
    glass: 'bg-slate-900/40 backdrop-blur-md border border-slate-800/80 shadow-2xl',
    bordered: 'bg-slate-950 border border-slate-700/60',
    gradient: 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl',
  };

  const hoverStyles = hoverEffect
    ? 'hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:-translate-y-0.5'
    : '';

  return (
    <div className={clsx(baseStyles, variants[variant], hoverStyles, className)} {...props}>
      {children}
    </div>
  );
};
