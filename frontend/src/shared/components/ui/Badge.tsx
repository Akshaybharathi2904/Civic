import React from 'react';
import { clsx } from 'clsx';
import { PriorityLevel, ComplaintStatus } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  pulse = false,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium font-mono rounded-full border select-none';

  const variants = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      <span>{children}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority?: PriorityLevel; level?: PriorityLevel; score?: number }> = ({ priority, level, score }) => {
  const targetLevel = priority || level || 'Medium';
  const map: Record<PriorityLevel, { variant: BadgeProps['variant']; label: string }> = {
    Low: { variant: 'slate', label: 'Low Priority' },
    Medium: { variant: 'amber', label: 'Medium Priority' },
    High: { variant: 'rose', label: 'High Priority' },
    Critical: { variant: 'rose', label: 'Critical' },
  };

  const item = map[targetLevel] || { variant: 'slate', label: targetLevel };
  return (
    <Badge variant={item.variant} pulse={targetLevel === 'Critical' || targetLevel === 'High'}>
      {item.label} {score !== undefined ? `(${score}/100)` : ''}
    </Badge>
  );
};

export const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  const map: Record<ComplaintStatus, { variant: BadgeProps['variant'] }> = {
    Reported: { variant: 'slate' },
    Acknowledged: { variant: 'cyan' },
    Assigned: { variant: 'amber' },
    Inspection: { variant: 'purple' },
    'In Progress': { variant: 'amber' },
    Resolved: { variant: 'emerald' },
    Verified: { variant: 'emerald' },
    Closed: { variant: 'slate' },
  };

  const item = map[status] || { variant: 'slate' };
  return <Badge variant={item.variant}>{status}</Badge>;
};
