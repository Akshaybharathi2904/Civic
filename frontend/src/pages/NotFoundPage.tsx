import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 text-center max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
            ERROR 404 &bull; PAGE NOT FOUND
          </span>
          <h1 className="text-3xl font-extrabold text-white font-outfit">
            Location Uncharted
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm mx-auto">
            The civic route or ticket record you requested does not exist or has been relocated by the system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 text-xs transition-all flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            to="/citizen-dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs transition-all flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
