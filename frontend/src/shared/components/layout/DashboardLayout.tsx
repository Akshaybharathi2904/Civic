import React from 'react';
import { Navbar } from '../../../components/Navbar';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  title,
  actions,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      {(title || actions) && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {title && <h1 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h1>}
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {sidebar && (
          <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-800/60 pr-6">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
