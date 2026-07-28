import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import issuesService from '../services/issues.service';
import { useAuth } from '../../auth/context/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
import { Issue } from '../../../shared/types/issue.domain';
import { IssueFeed } from '../components/IssueFeed';
import { PlusCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../shared/hooks/useToast';

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { joinUserRoom, latestComplaintUpdate, newComplaintReceived } = useSocket();
  const { success } = useToast();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    if (currentUserId) {
      joinUserRoom(currentUserId);
    }
    fetchIssues();
  }, [currentUserId, joinUserRoom]);

  useEffect(() => {
    if (newComplaintReceived) {
      fetchIssues();
    }
  }, [newComplaintReceived]);

  useEffect(() => {
    if (latestComplaintUpdate) {
      fetchIssues();
    }
  }, [latestComplaintUpdate]);

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
    success(`Upvoted community issue #${issueId.substring(0, 8)}!`, 'Support Recorded');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">Citizen Dashboard & Issue Feed</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse nearby civic complaints in List and GIS Map views, upvote issues, and track resolution timelines
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

export default CitizenDashboardPage;
