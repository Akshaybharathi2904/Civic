import React from 'react';
import { ComplaintStatus } from '../types';
import {
  AlertCircle,
  Brain,
  GitMerge,
  Building2,
  UserCheck,
  MapPin,
  Wrench,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface TimelineProps {
  currentStatus: string;
  isDuplicate?: boolean;
}

const STAGES = [
  { key: 'Reported', label: 'Reported', icon: AlertCircle },
  { key: 'AI Analysis', label: 'AI Analysis', icon: Brain },
  { key: 'Duplicate Detection', label: 'Duplicate Detection', icon: GitMerge },
  { key: 'Department Assigned', label: 'Department Assigned', icon: Building2 },
  { key: 'Officer Assigned', label: 'Officer Assigned', icon: UserCheck },
  { key: 'Inspection', label: 'Inspection', icon: MapPin },
  { key: 'Work Started', label: 'Work Started', icon: Wrench },
  { key: 'Completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'Citizen Verified', label: 'Citizen Verified', icon: ShieldCheck }
];

export const Timeline: React.FC<TimelineProps> = ({ currentStatus }) => {
  let activeIndex = 0;
  const statusLower = (currentStatus || '').toLowerCase();

  if (statusLower === 'reported') activeIndex = 0;
  else if (statusLower === 'acknowledged') activeIndex = 2;
  else if (statusLower === 'assigned') activeIndex = 4;
  else if (statusLower === 'inspection') activeIndex = 5;
  else if (statusLower === 'in progress') activeIndex = 6;
  else if (statusLower === 'resolved') activeIndex = 7;
  else if (statusLower === 'verified') activeIndex = 8;
  else activeIndex = 3;

  return (
    <div className="py-6 px-2 overflow-x-auto">
      <div className="relative flex items-center justify-between min-w-[700px]">
        {/* Background Line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-800 z-0" />

        {/* Active Progress Line */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 z-0 transition-all duration-700"
          style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
        />

        {/* Stage Nodes */}
        {STAGES.map((stage, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? 'bg-slate-900 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                } ${isCurrent ? 'scale-110 border-cyan-400 ring-4 ring-cyan-500/20 bg-cyan-950' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-mono font-medium mt-2.5 text-center transition-colors whitespace-nowrap ${
                  isDone ? 'text-cyan-300 font-semibold' : 'text-slate-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
