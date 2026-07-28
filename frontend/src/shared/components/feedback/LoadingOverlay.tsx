import React from 'react';
import { Spinner } from '../ui/Spinner';

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs rounded-xl transition-all duration-200">
          <Spinner size="lg" />
          {message && <span className="mt-3 text-xs font-mono text-cyan-400">{message}</span>}
        </div>
      )}
    </div>
  );
};
