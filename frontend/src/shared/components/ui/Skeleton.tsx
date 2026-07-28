import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className,
  style,
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-slate-800/60 rounded';

  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'h-48 w-full rounded-xl border border-slate-800/80',
  };

  const customStyle: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    ...style,
  };

  return (
    <div
      className={clsx(baseStyles, variants[variant], className)}
      style={customStyle}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 animate-pulse">
    <div className="flex justify-between items-center">
      <Skeleton width="40%" height={20} />
      <Skeleton width="20%" height={24} variant="circular" />
    </div>
    <Skeleton width="90%" height={16} />
    <Skeleton width="70%" height={16} />
    <div className="flex gap-2 pt-2">
      <Skeleton width={80} height={28} />
      <Skeleton width={100} height={28} />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-slate-800/60 animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton height={16} />
      </td>
    ))}
  </tr>
);
