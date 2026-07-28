import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Complaint, CommentItem, StatusHistoryItem, AgentLog } from '../types';
import { Timeline } from '../components/Timeline';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { ComplaintMap } from '../components/ComplaintMap';
import {
    MapPin,
    Clock,
    Building2,
    UserCheck,
    Send,
    Star,
    MessageSquare,
    Sparkles,
    GitMerge,
    ChevronDown,
    ChevronUp,
    Cpu,
    CheckCircle2,
    Calendar,
    Zap,
    Code
} from 'lucide-react';

// Syntax-highlighted JSON renderer component
const JsonViewer: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return <span className="text-slate-500 italic">No payload data</span>;
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    return (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-300">
            <pre>{jsonString}</pre>
        </div>
    );
};

export const ComplaintDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    const [data, setData] = useState<{
        complaint: Complaint;
        comments: CommentItem[];
        statusHistory: StatusHistoryItem[];
    } | null>(null);
    const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(5);
    const [ratingFeedback, setRatingFeedback] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);

    // Accordions state
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    useEffect(() => {
        fetchDetail();
        fetchAgentLogs();
    }, [id]);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/complaints/${id}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAgentLogs = async () => {
        try {
            const res = await api.get(`/admin/agent-logs`, { params: { complaintId: id } });
            setAgentLogs(res.data);
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
                isOfficialNote: user?.role !== 'citizen'
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
                feedback: ratingFeedback
            });
            setShowRatingModal(false);
            fetchDetail();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || !data) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400 font-mono">
                Loading complaint ticket details...
            </div>
        );
    }

    const { complaint, comments } = data;
    const coords: [number, number] = [
        complaint.location?.coordinates?.[1] || complaint.latitude || 12.9716,
        complaint.location?.coordinates?.[0] || complaint.longitude || 77.5946
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

            {/* Top Header & Metadata Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">

                {/* Ticket Header Bar */}
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

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
                    {complaint.title}
                </h1>

                {/* Detailed Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80 text-xs font-mono">

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <span className="text-slate-500 flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Created Time</span>
                        </span>
                        <p className="font-semibold text-slate-200">
                            {new Date(complaint.createdAt).toLocaleDateString()} {new Date(complaint.createdAt).toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
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

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <span className="text-slate-500 flex items-center space-x-1">
                            <Building2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>Assigned Department</span>
                        </span>
                        <p className="font-semibold text-blue-300 truncate">
                            {complaint.assignedDepartment?.name || 'Municipal Authority'}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <span className="text-slate-500 flex items-center space-x-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Assigned Officer</span>
                        </span>
                        <p className="font-semibold text-emerald-300 truncate">
                            {complaint.assignedOfficer?.name || 'Field Inspector'}
                        </p>
                    </div>

                </div>

                {/* Duplicate Citation Warning Banner */}
                {complaint.isDuplicate && (
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center space-x-3">
                        <GitMerge className="w-5 h-5 flex-shrink-0 text-purple-400" />
                        <div>
                            <span className="font-bold">Duplicate Incident Linked:</span> Merged with primary Ticket #{(complaint.duplicateOf as any)?.ticketId || 'CIV-1002'} within {complaint.duplicateDistanceMeters}m radius. (Affected citizens: {complaint.affectedCount}).
                        </div>
                    </div>
                )}

                {/* Animated 9-Stage Timeline */}
                <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase mb-2">Resolution Lifecycle Workflow</h4>
                    <Timeline currentStatus={complaint.status} isDuplicate={complaint.isDuplicate} />
                </div>
            </div>

            {/* Main Grid: Left Details & Gallery / Right Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (2 Cols) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Description & Media Files */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
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
                            <div className="p-6 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-500">
                                No photos attached. Issue submitted via text description.
                            </div>
                        )}

                        <div className="pt-2">
                            <h4 className="text-xs font-mono font-semibold text-slate-400 mb-1">Description</h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-sans">{complaint.description}</p>
                        </div>
                    </div>



                    {/* Comments Discussion Section */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                        <h3 className="text-base font-bold text-white font-outfit flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-cyan-400" />
                            <span>Official Updates & Discussion ({comments.length})</span>
                        </h3>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {comments.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">No comments yet. Type below to add an update.</p>
                            ) : (
                                comments.map((c) => (
                                    <div key={c._id || c.id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
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
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                            <button
                                type="submit"
                                disabled={submittingComment}
                                className="px-4 py-2 rounded-xl font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs transition-all flex items-center space-x-1"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send</span>
                            </button>
                        </form>
                    </div>

                </div>

                {/* Right Sidebar Column: GIS Map & Location Details */}
                <div className="space-y-6">
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                        <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase">Incident Location Details</h4>

                        <p className="text-xs text-slate-300 flex items-start space-x-1.5">
                            <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
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

                    <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                        <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase mb-3">GIS Map View</h4>
                        <ComplaintMap center={coords} zoom={15} complaints={[complaint]} height="260px" />
                    </div>
                </div>

            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
                        <h3 className="text-lg font-bold text-white font-outfit">Rate Resolution Quality</h3>
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
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />

                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitRating}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md"
                            >
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
