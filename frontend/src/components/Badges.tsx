import React from 'react';
import { ComplaintStatus, PriorityLevel } from '../types';

export const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  if (status === 'Reported') style = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  else if (status === 'Acknowledged') style = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  else if (status === 'Assigned') style = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  else if (status === 'Inspection') style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  else if (status === 'In Progress') style = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  else if (status === 'Resolved' || status === 'Verified') style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${style}`}>
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ level: PriorityLevel; score?: number }> = ({ level, score }) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  if (level === 'Critical') style = 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/20 animate-pulse';
  else if (level === 'High') style = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
  else if (level === 'Medium') style = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40';
  else if (level === 'Low') style = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${style}`}>
      {level} {score !== undefined ? `(${score}/100)` : ''}
    </span>
  );
};
