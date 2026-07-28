import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '../../../shared/types/issue.domain';
import { StatusBadge, PriorityBadge } from '../../../shared/components/ui/Badge';
import { MapPin, ThumbsUp, MessageSquare, Calendar, ChevronRight, Image as ImageIcon, GitMerge } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';

export interface IssueCardProps {
  issue: Issue;
  onSupport?: (issueId: string) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onSupport }) => {
  const [supportCount, setSupportCount] = useState(issue.supportCount ?? issue.affectedCount ?? 1);
  const [hasSupported, setHasSupported] = useState(false);

  const targetId = issue.id || issue._id || issue.issueNumber || issue.ticketId || '';

  // Extract thumbnail image
  const firstImage = issue.images?.[0] || issue.mediaFiles?.[0]?.url;

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasSupported) {
      setSupportCount((prev) => prev + 1);
      setHasSupported(true);
      if (onSupport) onSupport(targetId);
    }
  };

  const formattedDate = new Date(issue.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card variant="default" hoverEffect className="p-0 overflow-hidden group border-slate-800/80 hover:border-cyan-500/50">
      <Link to={`/complaints/${targetId}`} className="flex flex-col sm:flex-row items-stretch">
        {/* 1. Image Thumbnail Section */}
        <div className="sm:w-48 h-40 sm:h-auto bg-slate-950 relative overflow-hidden shrink-0 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-800">
          {firstImage ? (
            <img
              src={firstImage}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-slate-600 space-y-1">
              <ImageIcon size={32} />
              <span className="text-[10px] font-mono text-slate-500">No Image</span>
            </div>
          )}

          {/* 3. Category Overlay Badge */}
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-cyan-500/30">
            {issue.category}
          </span>
        </div>

        {/* Card Main Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            {/* Header Badges: Issue Number, Status, Priority */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                  {issue.issueNumber || issue.ticketId}
                </span>

                {/* 5. Status Badge */}
                <StatusBadge status={issue.status} />

                <PriorityBadge level={issue.priority} score={issue.priorityScore} />

                {issue.isDuplicate && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <GitMerge size={10} />
                    <span>Merged Cluster</span>
                  </span>
                )}
              </div>

              {/* 8. Reporting Date */}
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Calendar size={12} className="text-slate-500" />
                <span>{formattedDate}</span>
              </span>
            </div>

            {/* 2. Title */}
            <h3 className="text-base font-bold text-white font-outfit group-hover:text-cyan-400 transition-colors line-clamp-1">
              {issue.title}
            </h3>

            {/* 4. Location */}
            <p className="text-xs text-slate-400 flex items-center space-x-1.5 font-sans">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="line-clamp-1">{issue.address || issue.ward || 'Coimbatore'}</span>
            </p>
          </div>

          {/* Footer Bar: Support Count, Comments Count, Inspect Button */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-4">
              {/* 6. Support Count */}
              <button
                type="button"
                onClick={handleSupportClick}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                  hasSupported
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-purple-400 hover:border-purple-500/30'
                }`}
                title="Upvote/Support this issue"
              >
                <ThumbsUp size={13} className={hasSupported ? 'fill-purple-400' : ''} />
                <span className="font-bold">{supportCount} Supports</span>
              </button>

              {/* 7. Comments Count */}
              <span className="flex items-center space-x-1.5 text-slate-400">
                <MessageSquare size={13} className="text-slate-500" />
                <span>{issue.commentCount ?? 0} Comments</span>
              </span>
            </div>

            <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-1">
              <span>Inspect</span>
              <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default IssueCard;
