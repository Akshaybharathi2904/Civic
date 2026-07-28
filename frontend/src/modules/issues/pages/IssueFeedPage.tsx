import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import issuesService from '../services/issues.service';
import { IssueFeed } from '../components/IssueFeed';
import { Issue } from '../../../shared/types/issue.domain';
import { PlusCircle, Sparkles } from 'lucide-react';
import { useToast } from '../../../shared/hooks/useToast';

export const IssueFeedPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await issuesService.getIssues();
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportIssue = (issueId: string) => {
    success(`Supported ticket #${issueId.substring(0, 8)}! Added to your supported issues.`, 'Support Recorded');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Community Feed</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {issues.length} Active Issues
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white font-outfit">Nearby Civic Issues</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse live community reported complaints in List view or GIS Map view
          </p>
        </div>

        <Link
          to="/submit-complaint"
          className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center space-x-2 text-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      <IssueFeed
        issues={issues}
        loading={loading}
        onRefresh={fetchIssues}
        onSupportIssue={handleSupportIssue}
      />
    </div>
  );
};

export default IssueFeedPage;
