import React, { useState } from 'react';
import { Issue } from '../../../shared/types/issue.domain';
import { IssueCard } from './IssueCard';
import { ComplaintMap } from '../../maps/components/ComplaintMap';
import { Search, LayoutList, MapPin, Sparkles, Filter, SlidersHorizontal, GitMerge } from 'lucide-react';
import { CardSkeleton } from '../../../shared/components/ui/Skeleton';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';

export interface IssueFeedProps {
  issues: Issue[];
  loading?: boolean;
  onRefresh?: () => void;
  onSupportIssue?: (issueId: string) => void;
}

export const IssueFeed: React.FC<IssueFeedProps> = ({
  issues = [],
  loading = false,
  onSupportIssue,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'supported' | 'priority'>('newest');

  // Filter logic
  let filtered = issues.filter((issue) => {
    const matchesSearch =
      !search ||
      issue.title?.toLowerCase().includes(search.toLowerCase()) ||
      issue.issueNumber?.toLowerCase().includes(search.toLowerCase()) ||
      issue.address?.toLowerCase().includes(search.toLowerCase()) ||
      issue.category?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !categoryFilter || issue.category === categoryFilter;
    const matchesStatus = !statusFilter || issue.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting logic
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'supported') {
      return (b.supportCount ?? 1) - (a.supportCount ?? 1);
    }
    if (sortBy === 'priority') {
      const priorityOrder: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const duplicateClusters = filtered.filter((i) => i.isDuplicate || (i.supportCount && i.supportCount > 2));

  return (
    <div className="space-y-6">
      {/* Top Filter & View Mode Switcher Controls */}
      <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, landmark, ticket ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
            />
          </div>

          {/* View Mode Switcher Toggle */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutList size={14} />
                <span>List View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  viewMode === 'map'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin size={14} />
                <span>GIS Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns & Sort Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-slate-400 font-mono flex items-center gap-1 font-semibold">
              <Filter size={13} className="text-cyan-400" />
              <span>Filters:</span>
            </span>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Categories</option>
              <option value="Pothole / Road Hazard">Pothole / Road Hazard</option>
              <option value="Pothole">Pothole</option>
              <option value="Garbage Overflow / Waste">Garbage Overflow</option>
              <option value="Water Supply / Leakage">Water Leakage</option>
              <option value="Streetlight Outage">Streetlight Outage</option>
              <option value="Drainage Blockage">Drainage Blockage</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Verified">Verified</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <SlidersHorizontal size={13} className="text-slate-500" />
            <span className="text-slate-400 font-mono">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="newest">Newest First</option>
              <option value="supported">Most Supported</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Duplicate Detection & AI Recommendation Container Slot */}
      {duplicateClusters.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <GitMerge size={18} />
            </div>
            <div>
              <h4 className="font-bold text-white font-outfit uppercase">Duplicate Detection & AI Recommendation Slot</h4>
              <p className="text-slate-400">
                {duplicateClusters.length} issue cluster(s) with multiple citizen reports detected nearby. Prepared for multi-agent deduplication.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30 shrink-0">
            {duplicateClusters.length} Clusters
          </span>
        </div>
      )}

      {/* Feed View Content */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={40} className="text-slate-600" />}
          title="No Issues Found"
          description="No reported community issues matched your filter criteria."
        />
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 gap-4 animate-fadeIn">
          {filtered.map((issue) => (
            <IssueCard key={issue.id || issue._id} issue={issue} onSupport={onSupportIssue} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-mono px-2 text-slate-400">
            <span>Showing {filtered.length} Incident Markers on OpenStreetMap</span>
            <span>Click any marker to inspect issue details</span>
          </div>
          <ComplaintMap complaints={filtered} height="580px" />
        </div>
      )}
    </div>
  );
};

export default IssueFeed;
