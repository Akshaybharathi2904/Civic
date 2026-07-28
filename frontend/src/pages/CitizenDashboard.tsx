import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Complaint } from '../types';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { PlusCircle, Search, Filter, Clock, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
    const { user } = useAuth();
    const { joinUserRoom, latestComplaintUpdate, newComplaintReceived } = useSocket();

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    const currentUserId = user?._id || user?.id;

    useEffect(() => {
        if (currentUserId) {
            joinUserRoom(currentUserId);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchComplaints();
    }, [statusFilter]);

    // Real-time update inserting new complaint
    useEffect(() => {
        if (newComplaintReceived) {
            const citizenId =
                newComplaintReceived.citizenId ||
                newComplaintReceived.citizen?._id ||
                newComplaintReceived.citizen?.id;

            if (citizenId === currentUserId) {
                setComplaints((prev) => {
                    const exists = prev.some(
                        (c) => c._id === newComplaintReceived._id || c.ticketId === newComplaintReceived.ticketId
                    );
                    if (exists) {
                        return prev.map((c) =>
                            c._id === newComplaintReceived._id || c.ticketId === newComplaintReceived.ticketId
                                ? { ...c, ...newComplaintReceived }
                                : c
                        );
                    }
                    return [newComplaintReceived, ...prev];
                });
            }
        }
    }, [newComplaintReceived, currentUserId]);

    // Real-time status update
    useEffect(() => {
        if (latestComplaintUpdate) {
            setComplaints((prev) =>
                prev.map((c) =>
                    c._id === latestComplaintUpdate._id || c.ticketId === latestComplaintUpdate.ticketId
                        ? { ...c, ...latestComplaintUpdate }
                        : c
                )
            );
        }
    }, [latestComplaintUpdate]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await api.get('/complaints', {
                params: { status: statusFilter || undefined }
            });
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = complaints.filter(
        (c) =>
            c.ticketId.toLowerCase().includes(search.toLowerCase()) ||
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white font-outfit">My Reported Tickets</h1>
                    <p className="text-sm text-slate-400 mt-1">Track live status updates and AI multi-agent triage logs</p>
                </div>

                <Link
                    to="/submit-complaint"
                    className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center space-x-2 text-sm"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report New Issue</span>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search ticket ID, title, keyword..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
                    {['', 'Reported', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === st
                                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                        >
                            {st || 'All Tickets'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Complaint Tickets List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-panel h-28 rounded-2xl animate-pulse bg-slate-900/50" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
                    <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white font-outfit">No Complaints Found</h3>
                    <p className="text-xs text-slate-400 mt-1">Submit a new civic complaint to see AI processing in real-time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map((ticket) => (
                        <Link
                            key={ticket._id}
                            to={`/complaints/${ticket._id}`}
                            className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all"
                        >
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                                        {ticket.ticketId}
                                    </span>
                                    <StatusBadge status={ticket.status} />
                                    <PriorityBadge level={ticket.priorityLevel} score={ticket.priorityScore} />
                                    {ticket.isDuplicate && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            Duplicate Citation ({ticket.affectedCount} Citizens)
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-base font-bold text-white font-outfit group-hover:text-cyan-400 transition-colors">
                                    {ticket.title}
                                </h3>

                                <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                    <span className="line-clamp-1">{ticket.address}</span>
                                </p>
                            </div>

                            <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] text-slate-500 font-mono">Assigned Dept:</p>
                                    <p className="text-xs font-bold text-slate-200">
                                        {ticket.assignedDepartment?.name || 'Department Triage'}
                                    </p>
                                </div>

                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-400 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

        </div>
    );
};
