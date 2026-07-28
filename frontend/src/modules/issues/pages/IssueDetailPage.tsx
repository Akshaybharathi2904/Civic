import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../shared/api/apiClient';
import { useAuth } from '../../auth/context/AuthContext';
import { Complaint, CommentItem, StatusHistoryItem, AgentLog } from '../../../shared/types';
import { Timeline } from '../../../components/Timeline';
import { StatusBadge, PriorityBadge } from '../../../components/Badges';
import { ComplaintMap } from '../../maps/components/ComplaintMap';
import {
  MapPin,
  Clock,
  Building2,
  UserCheck,
  Send,
  Star,
  MessageSquare,
  GitMerge,
  ChevronDown,
  ChevronUp,
  Cpu,
  Calendar,
} from 'lucide-react';
import issuesService from '../services/issues.service';
import activityTracker from '../../profile/services/activityTracker';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';

const JsonViewer: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <span className="text-slate-500 italic">No payload data</span>;
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-300">
      <pre>{jsonString}</pre>
    </div>
  );
};

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [data, setData] = useState<{
    complaint: Complaint;
    comments: CommentItem[];
    statusHistory: StatusHistoryItem[];
  } | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    fetchDetail();
    fetchAgentLogs();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: any } | any>(`/complaints/${id}`);
      setData(res.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentLogs = async () => {
    try {
      const res = await api.get<{ data: AgentLog[] } | AgentLog[]>(`/admin/agent-logs`, { params: { complaintId: id } });
      const logs = Array.isArray(res) ? res : (res as any).data || [];
      setAgentLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    try {
      await api.post(`/complaints/${id}/comments`, {
        text: commentText,
        isOfficialNote: user?.role !== 'citizen',
      });

      // Track Activity: Comment Added
      activityTracker.logActivity({
        type: 'comment_added',
        title: `Comment Added on Ticket #${data?.complaint?.ticketId || data?.complaint?.issueNumber || id}`,
        description: `Added note: "${commentText.substring(0, 45)}..."`,
        complaintId: id,
        pointsEarned: 10,
      });

      setCommentText('');
      fetchDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/complaints/${id}/rate`, {
        rating,
        feedback: ratingFeedback,
      });
      setShowRatingModal(false);
      fetchDetail();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center text-cyan-400 font-mono text-xs">
        <Spinner size="lg" label="Loading complaint ticket details..." />
      </div>
    );
  }

  const { complaint, comments } = data;
  const coords: [number, number] = [
    complaint.location?.coordinates?.[1] || complaint.latitude || 12.9716,
    complaint.location?.coordinates?.[0] || complaint.longitude || 77.5946,
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-base font-extrabold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
              {complaint.ticketId}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge level={complaint.priorityLevel} score={complaint.priorityScore} />
          </div>

          {complaint.status === 'Resolved' && user?.role === 'citizen' && !complaint.ratings?.rating && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="px-4 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all text-xs flex items-center space-x-1.5"
            >
              <Star className="w-4 h-4 fill-slate-950" />
              <span>Rate Resolution Work</span>
            </button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
          {complaint.title}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Created Time</span>
            </span>
            <p className="font-semibold text-slate-200">
              {new Date(complaint.createdAt).toLocaleDateString()} {new Date(complaint.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Expected Resolution</span>
            </span>
            <p className="font-semibold text-amber-300">
              {complaint.slaDueDate
                ? new Date(complaint.slaDueDate).toLocaleDateString()
                : 'Target SLA: 48h'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Assigned Department</span>
            </span>
            <p className="font-semibold text-blue-300 truncate">
              {complaint.assignedDepartment?.name || 'Municipal Authority'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assigned Officer</span>
            </span>
            <p className="font-semibold text-emerald-300 truncate">
              {complaint.assignedOfficer?.name || 'Field Inspector'}
            </p>
          </div>
        </div>

        {complaint.isDuplicate && (
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center space-x-3">
            <GitMerge className="w-5 h-5 shrink-0 text-purple-400" />
            <div>
              <span className="font-bold">Duplicate Incident Linked:</span> Merged with primary Ticket #{(complaint.duplicateOf as any)?.ticketId || 'CIV-1002'} within {complaint.duplicateDistanceMeters}m radius. (Affected citizens: {complaint.affectedCount}).
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase mb-2">Resolution Lifecycle Workflow</h4>
          <Timeline currentStatus={complaint.status} isDuplicate={complaint.isDuplicate} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-outfit">Complaint Image & Evidence</h3>
            {complaint.mediaFiles?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {complaint.mediaFiles.map((m, idx) => (
                  <img
                    key={idx}
                    src={m.url}
                    alt="Complaint Evidence"
                    className="rounded-xl border border-slate-800 object-cover h-48 w-full shadow-lg hover:scale-[1.02] transition-transform"
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500">
                No photos attached. Issue submitted via text description.
              </div>
            )}

            <div className="pt-2">
              <h4 className="text-xs font-mono font-semibold text-slate-400 mb-1">Description</h4>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">{complaint.description}</p>
            </div>
          </div>



          <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Official Updates & Discussion ({comments.length})</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No comments yet. Type below to add an update.</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id || c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-white">{c.author?.name || 'Official'} ({c.author?.role || 'user'})</span>
                      <span className="font-mono text-[10px]">{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a message or official update..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={submittingComment}
                rightIcon={<Send className="w-3.5 h-3.5" />}
                size="sm"
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase">Incident Location Details</h4>
            <p className="text-xs text-slate-300 flex items-start space-x-1.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{complaint.address}</span>
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Ward:</span>
                <span className="text-slate-200">{complaint.ward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Zone:</span>
                <span className="text-slate-200">{complaint.zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coordinates:</span>
                <span className="text-cyan-400 font-bold">{coords[0].toFixed(4)}, {coords[1].toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase mb-3">GIS Map View</h4>
            <ComplaintMap center={coords} zoom={15} complaints={[complaint]} height="260px" />
          </div>
        </div>
      </div>

      <Modal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} title="Rate Resolution Quality">
        <div className="space-y-4">
          <p className="text-xs text-slate-400">How satisfied are you with the completed work?</p>
          <div className="flex items-center justify-center space-x-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-2 transition-transform ${star <= rating ? 'text-amber-400 scale-110' : 'text-slate-600'}`}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={ratingFeedback}
            onChange={(e) => setRatingFeedback(e.target.value)}
            placeholder="Add feedback for municipal officials..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmitRating}>
              Submit Rating
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IssueDetailPage;
