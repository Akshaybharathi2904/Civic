import React from 'react';
import { DuplicateMatchItem } from '../services/issues.service';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { StatusBadge } from '../../../shared/components/ui/Badge';
import { GitMerge, MapPin, ThumbsUp, ArrowRight, Image as ImageIcon, Sparkles } from 'lucide-react';

export interface DuplicateCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: DuplicateMatchItem[];
  onSupportMatch: (match: DuplicateMatchItem) => void;
  onContinueCreatingNew: () => void;
}

export const DuplicateCheckModal: React.FC<DuplicateCheckModalProps> = ({
  isOpen,
  onClose,
  matches,
  onSupportMatch,
  onContinueCreatingNew,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/10">
            <GitMerge size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-white font-outfit">
            Possible Duplicate Issues Found
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            We found <span className="text-purple-400 font-bold font-mono">{matches.length} issue(s)</span> reported within 500 meters of your selected location. Supporting an existing issue increases its SLA resolution priority instead of creating duplicate tickets!
          </p>
        </div>

        {/* Duplicate Matches List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {matches.map((match) => {
            const issue = match.issue;
            const image = issue.images?.[0] || issue.mediaFiles?.[0]?.url;

            return (
              <div
                key={issue.id || issue._id}
                className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 hover:border-purple-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                    {image ? (
                      <img src={image} alt={issue.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-slate-600" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {match.distanceMeters}m away
                      </span>
                      <StatusBadge status={issue.status} />
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {issue.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-outfit truncate group-hover:text-purple-300 transition-colors">
                      {issue.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-500 shrink-0" />
                      <span className="truncate">{issue.address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right font-mono text-xs">
                    <span className="text-purple-400 font-bold block">{issue.supportCount || 1} Supports</span>
                    <span className="text-[10px] text-slate-500">{match.similarityPercent}% Similarity</span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSupportMatch(match)}
                    leftIcon={<ThumbsUp size={14} />}
                    className="bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20 shrink-0"
                  >
                    Support This Issue
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions: Continue Creating New */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-mono">
            None of these match your specific issue?
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={onContinueCreatingNew}
            rightIcon={<ArrowRight size={14} />}
          >
            No Match, Continue Creating New Issue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DuplicateCheckModal;
