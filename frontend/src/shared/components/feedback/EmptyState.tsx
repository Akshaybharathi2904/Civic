import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox size={40} className="text-slate-500" />,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
      <div className="p-4 rounded-full bg-slate-800/60 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
