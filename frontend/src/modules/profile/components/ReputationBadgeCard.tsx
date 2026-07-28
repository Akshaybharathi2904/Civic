import React from 'react';
import { Award, ShieldCheck, Heart, CheckCircle, Trophy, Sparkles } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { UserBadgeItem } from '../types/profile.types';

export interface ReputationBadgeCardProps {
  reputationPoints: number;
  badgeTitle: string;
  badges: UserBadgeItem[];
}

export const ReputationBadgeCard: React.FC<ReputationBadgeCardProps> = ({
  reputationPoints,
  badgeTitle,
  badges,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
      case 'Award':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-purple-400" />;
      case 'CheckCircle':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return <Trophy className="w-5 h-5 text-cyan-400" />;
    }
  };

  const nextTierPoints = reputationPoints < 150 ? 150 : reputationPoints < 300 ? 300 : 500;
  const currentTierBase = reputationPoints < 150 ? 0 : reputationPoints < 300 ? 150 : 300;
  const progressPercent = Math.min(
    100,
    Math.round(((reputationPoints - currentTierBase) / (nextTierPoints - currentTierBase)) * 100)
  );

  return (
    <Card variant="gradient" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-extrabold text-white font-outfit">Reputation & Civic Rank</h3>
              <Badge variant="cyan" pulse className="uppercase">
                {badgeTitle}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Earn points by submitting verified tickets, upvoting hazards, and rating resolution works
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-3xl font-extrabold text-cyan-400 font-mono">{reputationPoints}</span>
          <span className="text-xs text-slate-400 block font-mono">Civic Points</span>
        </div>
      </div>

      {/* Progress Bar to Next Rank */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles size={13} className="text-cyan-400" />
            <span>Progress to Next Rank</span>
          </span>
          <span className="text-slate-300">
            {reputationPoints} / {nextTierPoints} PTS ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-md shadow-cyan-500/30"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Badges Earned Showcase Grid */}
      <div>
        <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase mb-3">Badges Earned</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${
                b.isUnlocked
                  ? 'bg-slate-900/90 border-cyan-500/30 shadow-md shadow-cyan-500/5'
                  : 'bg-slate-950/60 border-slate-800 opacity-50'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl ${
                  b.isUnlocked
                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                    : 'bg-slate-800/60 border border-slate-700'
                }`}
              >
                {getIcon(b.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-100 truncate font-outfit">{b.name}</p>
                  {b.isUnlocked ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">{b.progressPercent}%</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ReputationBadgeCard;
