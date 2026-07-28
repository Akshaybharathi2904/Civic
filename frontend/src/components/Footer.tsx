import React from 'react';
import { Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-8 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-sm font-outfit">CivicSwarm AI Mesh</span>
            <p className="text-[11px] text-slate-500">Autonomous Multi-Agent GovTech Resolution Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">Swarm Gateway Active</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 font-mono">Google Gemini 2.5 Flash Integration</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 font-mono">MySQL & Prisma ORM</span>
        </div>

      </div>
    </footer>
  );
};
