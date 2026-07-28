import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ThumbsUp, CheckCircle2, Award, MessageSquare, ShieldCheck } from 'lucide-react';
import { UserActivityItem } from '../types/profile.types';

export interface ActivityTimelineProps {
  activities: UserActivityItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getIcon = (type: UserActivityItem['type']) => {
    switch (type) {
      case 'complaint_created':
        return <PlusCircle className="w-4 h-4 text-cyan-400" />;
      case 'complaint_supported':
        return <ThumbsUp className="w-4 h-4 text-purple-400" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'badge_earned':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'complaint_resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTypeBadge = (type: UserActivityItem['type']) => {
    switch (type) {
      case 'complaint_created':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Reported Issue
          </span>
        );
      case 'complaint_supported':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Supported Issue
          </span>
        );
      case 'comment_added':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Comment Added
          </span>
        );
      case 'badge_earned':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Badge Earned
          </span>
        );
      case 'complaint_resolved':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Issue Resolved
          </span>
        );
      default:
        return null;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-500 font-mono">
        No activity history recorded yet. Report issues, support community tickets, or post comments to build your activity timeline!
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {activities.map((item) => (
        <div key={item.id} className="relative flex items-start group">
          {/* Bullet node */}
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center shadow-md">
            {getIcon(item.type)}
          </div>

          <div className="flex-1 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 group-hover:border-cyan-500/40 transition-colors space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {getTypeBadge(item.type)}
                <h4 className="text-xs font-bold text-slate-100 font-outfit">{item.title}</h4>
              </div>

              <span className="text-[10px] font-mono text-slate-500">
                {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans">{item.description}</p>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              {item.complaintId ? (
                <Link
                  to={`/complaints/${item.complaintId}`}
                  className="text-cyan-400 font-semibold hover:underline font-mono"
                >
                  View Related Issue Ticket &rarr;
                </Link>
              ) : (
                <span />
              )}

              {item.pointsEarned && (
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  +{item.pointsEarned} PTS
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
