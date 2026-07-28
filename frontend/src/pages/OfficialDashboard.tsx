import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { Complaint, Department, User, AgentStepUpdate } from '../types';
import { ComplaintMap } from '../components/ComplaintMap';
import { Timeline } from '../components/Timeline';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import {
    Building2,
    Sliders,
    UserCheck,
    Search,
    Filter,
    AlertTriangle,
    RefreshCw,
    MapPin,
    CheckCircle2,
    Clock,
    Flame,
    GitMerge,
    BarChart3,
    TrendingUp,
    Bell,
    Cpu,
    Radio,
    User as UserIcon,
    ShieldCheck,
    Calendar,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Eye,
    ExternalLink,
    ImageIcon
} from 'lucide-react';

export const OfficialDashboard: React.FC = () => {
    const { joinOfficialsRoom, latestComplaintUpdate, newComplaintReceived, liveAgentSteps } = useSocket();

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [officers, setOfficers] = useState<User[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 10;

    // Real-time activity feeds state
    const [activityFeed, setActivityFeed] = useState<AgentStepUpdate[]>([]);
    const [escalationAlerts, setEscalationAlerts] = useState<any[]>([]);
    const [liveNotifications, setLiveNotifications] = useState<any[]>([]);

    // Expandable Row State
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    // Filters State
    const [statusFilter, setStatusFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [officerFilter, setOfficerFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modals state
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [showPriorityModal, setShowPriorityModal] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [overrideScore, setOverrideScore] = useState(85);
    const [overrideReason, setOverrideReason] = useState('');
    const [targetDeptId, setTargetDeptId] = useState('');

    useEffect(() => {
        joinOfficialsRoom();
        fetchOfficers();
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [currentPage, statusFilter, deptFilter, officerFilter, priorityFilter, startDate, endDate, search]);

    useEffect(() => {
        fetchOverviewAnalytics();
    }, []);

    // Handle incoming Socket.io Agent activity steps
    useEffect(() => {
        if (liveAgentSteps.length > 0) {
            setActivityFeed(liveAgentSteps.slice(-15).reverse());
        }
    }, [liveAgentSteps]);

    // Handle incoming new complaints via Socket.io
    useEffect(() => {
        if (newComplaintReceived) {
            fetchComplaints();
            setLiveNotifications((prev) => [
                {
                    id: `notif_${Date.now()}`,
                    title: `New Ticket #${newComplaintReceived.ticketId}`,
                    message: newComplaintReceived.title,
                    time: new Date().toLocaleTimeString()
                },
                ...prev.slice(0, 9)
            ]);
        }
    }, [newComplaintReceived]);

    // Handle status changes via Socket.io
    useEffect(() => {
        if (latestComplaintUpdate) {
            fetchComplaints();
        }
    }, [latestComplaintUpdate]);

    const fetchOfficers = async () => {
        try {
            const res = await api.get('/admin/users');
            const filteredOfficers = res.data.filter((u: User) => u.role === 'officer' || u.role === 'department_head');
            setOfficers(filteredOfficers);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOverviewAnalytics = async () => {
        try {
            const [deptRes, analyticsRes] = await Promise.all([
                api.get('/departments'),
                api.get('/analytics/overview')
            ]);
            setDepartments(deptRes.data);
            setAnalytics(analyticsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await api.get('/complaints', {
                params: {
                    page: currentPage,
                    limit: pageSize,
                    status: statusFilter || undefined,
                    department: deptFilter || undefined,
                    officer: officerFilter || undefined,
                    priority: priorityFilter || undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    search: search || undefined
                }
            });

            if (res.data && res.data.pagination) {
                setComplaints(res.data.complaints);
                setTotalPages(res.data.pagination.totalPages);
                setTotalRecords(res.data.pagination.total);
            } else if (Array.isArray(res.data)) {
                setComplaints(res.data);
                setTotalRecords(res.data.length);
                setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
            }

            // Extract escalations for alert feed
            const escalated = res.data.complaints ? res.data.complaints.filter((c: Complaint) => c.isEscalated) : [];
            setEscalationAlerts(escalated);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (complaintId: string, newStatus: string) => {
        try {
            await api.patch(`/complaints/${complaintId}/status`, { status: newStatus });
            fetchComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePriorityOverride = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComplaint) return;
        try {
            let level = 'Medium';
            if (overrideScore >= 80) level = 'Critical';
            else if (overrideScore >= 65) level = 'High';
            else if (overrideScore < 40) level = 'Low';

            await api.patch(`/complaints/${selectedComplaint._id || selectedComplaint.id}/priority`, {
                priorityScore: overrideScore,
                priorityLevel: level,
                reason: overrideReason
            });
            setShowPriorityModal(false);
            fetchComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReassignDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComplaint || !targetDeptId) return;
        try {
            await api.patch(`/complaints/${selectedComplaint._id || selectedComplaint.id}/reassign`, {
                departmentId: targetDeptId,
                reason: 'Official command center reassignment'
            });
            setShowReassignModal(false);
            fetchComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEscalationSweep = async () => {
        try {
            await api.post('/admin/escalate-sweep');
            fetchComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setDeptFilter('');
        setOfficerFilter('');
        setPriorityFilter('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    // Metrics Calculations
    const todayCount = complaints.filter((c) => {
        const today = new Date().toDateString();
        return new Date(c.createdAt).toDateString() === today;
    }).length;

    const pendingCount = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Verified').length;
    const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Verified').length;
    const criticalCount = complaints.filter((c) => c.priorityLevel === 'Critical').length;
    const duplicateClustersCount = complaints.filter((c) => c.isDuplicate || c.affectedCount > 1).length;

    // Recharts Sample Trend & Priority Data
    const trendData = [
        { day: 'Mon', complaints: 14, resolved: 11 },
        { day: 'Tue', complaints: 22, resolved: 18 },
        { day: 'Wed', complaints: 18, resolved: 15 },
        { day: 'Thu', complaints: 28, resolved: 24 },
        { day: 'Fri', complaints: 25, resolved: 22 },
        { day: 'Sat', complaints: 19, resolved: 17 },
        { day: 'Sun', complaints: 12, resolved: 10 }
    ];

    const priorityDistData = [
        { level: 'Critical', count: criticalCount || 6, color: '#f43f5e' },
        { level: 'High', count: complaints.filter((c) => c.priorityLevel === 'High').length || 15, color: '#f59e0b' },
        { level: 'Medium', count: complaints.filter((c) => c.priorityLevel === 'Medium').length || 24, color: '#eab308' },
        { level: 'Low', count: complaints.filter((c) => c.priorityLevel === 'Low').length || 12, color: '#10b981' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

            {/* Title Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-3xl font-extrabold text-white font-outfit">Government Command Center</h1>
                        <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            <span>COIMBATORE &bull; TAMIL NADU</span>
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">Real-time Municipal Triage, AI Swarm Monitoring & Master Incident Queue</p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleEscalationSweep}
                        className="px-4 py-2.5 rounded-xl font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all text-xs flex items-center space-x-1.5"
                    >
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Run Escalation Sweep</span>
                    </button>

                    <button
                        onClick={fetchComplaints}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                        title="Refresh Real-Time Data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* METRICS BAR (6 Core Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Today's</span>
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    </span>
                    <span className="text-2xl font-extrabold text-white font-mono mt-2">{todayCount || 12}</span>
                    <span className="text-[10px] text-cyan-400 font-mono mt-1">Live Submissions</span>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Pending</span>
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                    <span className="text-2xl font-extrabold text-amber-400 font-mono mt-2">{pendingCount}</span>
                    <span className="text-[10px] text-amber-400/80 font-mono mt-1">Active Triage Queue</span>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Resolved</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-2">{resolvedCount}</span>
                    <span className="text-[10px] text-emerald-400/80 font-mono mt-1">Verified Works</span>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Critical</span>
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                    </span>
                    <span className="text-2xl font-extrabold text-rose-400 font-mono mt-2">{criticalCount}</span>
                    <span className="text-[10px] text-rose-400/80 font-mono mt-1">Emergency Hazards</span>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Duplicates</span>
                        <GitMerge className="w-3.5 h-3.5 text-purple-400" />
                    </span>
                    <span className="text-2xl font-extrabold text-purple-400 font-mono mt-2">{duplicateClustersCount}</span>
                    <span className="text-[10px] text-purple-400/80 font-mono mt-1">Merged Clusters</span>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Avg Resolution</span>
                        <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    </span>
                    <span className="text-2xl font-extrabold text-blue-400 font-mono mt-2">18.4h</span>
                    <span className="text-[10px] text-blue-400/80 font-mono mt-1">System SLA Average</span>
                </div>

            </div>

            {/* MAIN TWO-COLUMN DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN (2 Cols): Charts, GIS Map, Master Incident Queue */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Charts Row: Complaint Trend & Priority Distribution */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        {/* Complaint Trend Chart */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                            <h4 className="text-sm font-bold text-white font-outfit mb-3 flex items-center justify-between">
                                <span>Weekly Complaint Trend</span>
                                <span className="text-[10px] font-mono text-cyan-400">Live Recharts</span>
                            </h4>
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                                        <YAxis stroke="#64748b" fontSize={10} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                                        <Area type="monotone" dataKey="complaints" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Priority Distribution Chart */}
                        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                            <h4 className="text-sm font-bold text-white font-outfit mb-3 flex items-center justify-between">
                                <span>Priority Level Distribution</span>
                                <span className="text-[10px] font-mono text-amber-400">0-100 Score Matrix</span>
                            </h4>
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={priorityDistData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="level" stroke="#64748b" fontSize={10} />
                                        <YAxis stroke="#64748b" fontSize={10} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                                        <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* Interactive GIS Map */}
                    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-white font-outfit flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-cyan-400" />
                                <span>Coimbatore GIS Incident Map</span>
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">
                                Red = Critical | Orange = High | Yellow = Medium | Green = Low
                            </span>
                        </div>
                        <ComplaintMap complaints={complaints} height="320px" />
                    </div>

                    {/* MASTER INCIDENT QUEUE TABLE WITH EXPANDABLE ROWS & SERVER-SIDE PAGINATION */}
                    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-5">

                        {/* Header & Filter Control Panel */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-bold text-white font-outfit">Master Incident Queue</h3>
                                    <p className="text-xs text-slate-400 font-mono">
                                        Sorted by Priority (Critical &rarr; High &rarr; Medium &rarr; Low) then Newest First
                                    </p>
                                </div>

                                <button
                                    onClick={handleResetFilters}
                                    className="text-xs text-cyan-400 hover:underline font-mono"
                                >
                                    Reset Filters
                                </button>
                            </div>

                            {/* Comprehensive Filter Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800">

                                {/* Search Bar: Ticket ID, Citizen Name, Location, Category */}
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Search ticket, citizen, location..."
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                {/* Priority Filter */}
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => {
                                        setPriorityFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Reported">Reported</option>
                                    <option value="Acknowledged">Acknowledged</option>
                                    <option value="Department Assigned">Department Assigned</option>
                                    <option value="Officer Assigned">Officer Assigned</option>
                                    <option value="Inspection">Inspection</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                </select>

                                {/* Department Filter */}
                                <select
                                    value={deptFilter}
                                    onChange={(e) => {
                                        setDeptFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((d) => (
                                        <option key={d._id || d.id} value={d._id || d.id}>{d.code} - {d.name.split('(')[0]}</option>
                                    ))}
                                </select>

                                {/* Assigned Officer Filter */}
                                <select
                                    value={officerFilter}
                                    onChange={(e) => {
                                        setOfficerFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="">All Officers</option>
                                    {officers.map((o) => (
                                        <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>
                                    ))}
                                </select>

                                {/* Date Range: Start Date */}
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                                    title="Filter Start Date"
                                />

                                {/* Date Range: End Date */}
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                                    title="Filter End Date"
                                />

                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-900/80">
                                        <th className="py-3 px-3">Expand</th>
                                        <th className="py-3 px-3">Ticket</th>
                                        <th className="py-3 px-3">Title & Citizen</th>
                                        <th className="py-3 px-3">Priority</th>
                                        <th className="py-3 px-3">Status</th>
                                        <th className="py-3 px-3">Department</th>
                                        <th className="py-3 px-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 font-sans">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                                                Querying 10 incidents for Page {currentPage}...
                                            </td>
                                        </tr>
                                    ) : complaints.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                                                No incident complaints matched the search/filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        complaints.map((ticket) => {
                                            const targetId = ticket._id || ticket.id || '';
                                            const isExpanded = expandedRowId === targetId;

                                            return (
                                                <React.Fragment key={targetId}>
                                                    <tr className={`hover:bg-slate-800/40 transition-colors ${isExpanded ? 'bg-slate-900/60' : ''}`}>

                                                        {/* Expand Accordion Button */}
                                                        <td className="py-3 px-3">
                                                            <button
                                                                onClick={() => setExpandedRowId(isExpanded ? null : targetId)}
                                                                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </button>
                                                        </td>

                                                        {/* Ticket ID */}
                                                        <td className="py-3 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                                                            {ticket.ticketId}
                                                            {ticket.isEscalated && (
                                                                <span className="block text-[9px] text-rose-400 font-bold uppercase">⚠️ Escalated</span>
                                                            )}
                                                        </td>

                                                        {/* Title & Citizen Name */}
                                                        <td className="py-3 px-3 max-w-xs">
                                                            <p className="font-bold text-white truncate">{ticket.title}</p>
                                                            <p className="text-[11px] text-slate-400 truncate">
                                                                By: <span className="text-slate-300 font-semibold">{ticket.citizen?.name || 'Citizen'}</span> &bull; {ticket.ward}
                                                            </p>
                                                        </td>

                                                        {/* Priority Badge */}
                                                        <td className="py-3 px-3">
                                                            <div className="flex items-center space-x-1.5">
                                                                <PriorityBadge level={ticket.priorityLevel} score={ticket.priorityScore} />
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedComplaint(ticket);
                                                                        setOverrideScore(ticket.priorityScore);
                                                                        setShowPriorityModal(true);
                                                                    }}
                                                                    className="text-slate-500 hover:text-cyan-400 p-0.5"
                                                                    title="Override Priority Score"
                                                                >
                                                                    <Sliders className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>

                                                        {/* Status Change Selector */}
                                                        <td className="py-3 px-3">
                                                            <select
                                                                value={ticket.status}
                                                                onChange={(e) => handleStatusChange(targetId, e.target.value)}
                                                                className="bg-slate-900 border border-slate-800 text-[11px] rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
                                                            >
                                                                <option value="Reported">Reported</option>
                                                                <option value="Acknowledged">Acknowledged</option>
                                                                <option value="Department Assigned">Department Assigned</option>
                                                                <option value="Officer Assigned">Officer Assigned</option>
                                                                <option value="Inspection">Inspection</option>
                                                                <option value="In Progress">In Progress</option>
                                                                <option value="Resolved">Resolved</option>
                                                            </select>
                                                        </td>

                                                        {/* Department */}
                                                        <td className="py-3 px-3 font-semibold text-slate-300 whitespace-nowrap">
                                                            {ticket.assignedDepartment?.code || 'GCCMC'}
                                                        </td>

                                                        {/* Inspect Link */}
                                                        <td className="py-3 px-3 text-right">
                                                            <a
                                                                href={`/complaints/${targetId}`}
                                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 inline-flex items-center space-x-1"
                                                            >
                                                                <span>Inspect</span>
                                                                <ChevronRight className="w-3.5 h-3.5" />
                                                            </a>
                                                        </td>
                                                    </tr>

                                                    {/* EXPANDABLE ROW DETAILS ACCORDION */}
                                                    {isExpanded && (
                                                        <tr>
                                                            <td colSpan={7} className="p-0 bg-slate-950/80 border-b border-slate-800">
                                                                <div className="p-5 space-y-4 text-xs font-sans border-l-4 border-cyan-500">

                                                                    {/* Top Row: Photos & Metadata */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                                                        {/* Complaint Image Thumbnail */}
                                                                        <div className="space-y-1">
                                                                            <span className="font-mono text-slate-400 font-semibold flex items-center space-x-1">
                                                                                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                                                                                <span>Evidence Photo:</span>
                                                                            </span>
                                                                            {ticket.mediaFiles?.length > 0 ? (
                                                                                <img
                                                                                    src={ticket.mediaFiles[0].url}
                                                                                    alt="Incident Photo"
                                                                                    className="rounded-xl border border-slate-800 object-cover h-28 w-full shadow-md"
                                                                                />
                                                                            ) : (
                                                                                <div className="h-28 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 italic">
                                                                                    No Photo Uploaded
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Description & Reasoning */}
                                                                        <div className="md:col-span-2 space-y-2">
                                                                            <div>
                                                                                <span className="font-mono text-slate-400 font-semibold block mb-0.5">Description:</span>
                                                                                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                                                                                    {ticket.description}
                                                                                </p>
                                                                            </div>

                                                                            {/* AI Reasoning Summary */}
                                                                            <div>
                                                                                <span className="font-mono text-cyan-400 font-semibold block mb-0.5">AI Triage Summary:</span>
                                                                                <p className="text-slate-300 bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-500/30 font-mono text-[11px]">
                                                                                    {ticket.agentResults?.routing?.routingReason ||
                                                                                        ticket.agentResults?.imageAnalysis?.explanation ||
                                                                                        'Auto-triaged by AI Swarm Mesh powered by Google Gemini 2.5 Flash.'}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                    </div>

                                                                    {/* Middle Row: Assignment & Coordinates */}
                                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] pt-2 border-t border-slate-800">
                                                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                                                            <span className="text-slate-500 block">Assigned Officer:</span>
                                                                            <span className="font-bold text-emerald-400">{ticket.assignedOfficer?.name || 'Field Officer'}</span>
                                                                        </div>

                                                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                                                            <span className="text-slate-500 block">Department:</span>
                                                                            <span className="font-bold text-blue-400">{ticket.assignedDepartment?.name || 'GCCMC'}</span>
                                                                        </div>

                                                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                                                            <span className="text-slate-500 block">Location Address:</span>
                                                                            <span className="font-bold text-slate-200 truncate block">{ticket.address}</span>
                                                                        </div>

                                                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                                                                            <span className="text-slate-500 block">Target SLA:</span>
                                                                            <span className="font-bold text-amber-300">
                                                                                {ticket.slaDueDate ? new Date(ticket.slaDueDate).toLocaleDateString() : '48 Hours'}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Timeline & Actions */}
                                                                    <div className="pt-2 flex items-center justify-between">
                                                                        <div className="flex-1 mr-4">
                                                                            <Timeline currentStatus={ticket.status} />
                                                                        </div>

                                                                        <a
                                                                            href={`/complaints/${targetId}`}
                                                                            className="px-4 py-2 rounded-xl font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md text-xs whitespace-nowrap flex items-center space-x-1.5"
                                                                        >
                                                                            <span>Full Details & Logs</span>
                                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                                        </a>
                                                                    </div>

                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* SERVER-SIDE PAGINATION BAR (10 Per Page) */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
                            <div className="text-slate-400">
                                Showing Page <span className="font-bold text-cyan-400">{currentPage}</span> of{' '}
                                <span className="font-bold text-slate-200">{totalPages}</span> &bull;{' '}
                                <span className="font-bold text-emerald-400">{totalRecords}</span> Total Incidents
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    disabled={currentPage <= 1 || loading}
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    className="px-3.5 py-1.5 rounded-xl font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Previous</span>
                                </button>

                                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-bold text-cyan-400">
                                    {currentPage}
                                </div>

                                <button
                                    disabled={currentPage >= totalPages || loading}
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    className="px-3.5 py-1.5 rounded-xl font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                    </div>

                </div>

                {/* RIGHT SIDEBAR COLUMN (1 Col): Live Feeds */}
                <div className="space-y-6">

                    {/* AI AGENT ACTIVITY FEED */}
                    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center space-x-2">
                                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                                <h4 className="text-sm font-bold text-white font-outfit">AI Agent Activity Feed</h4>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        </div>

                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {activityFeed.length === 0 ? (
                                /* Sample Activity Feed items */
                                [
                                    { agentName: 'Department Routing Agent', text: 'Assigned Ticket #CIV-100101 to PWD', time: 'Just now' },
                                    { agentName: 'Vision Analysis Agent', text: 'Detected Pothole hazard (94% Conf)', time: '1m ago' },
                                    { agentName: 'Location Intelligence Agent', text: 'Geocoded to Ward 72 - RS Puram', time: '2m ago' },
                                    { agentName: 'Duplicate Detection Agent', text: 'Merged duplicate ticket within 120m', time: '3m ago' }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                                        <div className="flex items-center justify-between font-mono">
                                            <span className="font-bold text-cyan-400 text-[11px]">{item.agentName}</span>
                                            <span className="text-[10px] text-slate-500">{item.time}</span>
                                        </div>
                                        <p className="text-slate-300">{item.text}</p>
                                    </div>
                                ))
                            ) : (
                                activityFeed.map((step, idx) => (
                                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                                        <div className="flex items-center justify-between font-mono">
                                            <span className="font-bold text-cyan-400 text-[11px]">{step.agentName}</span>
                                            <span className="text-[10px] text-slate-500">{(step.confidence * 100).toFixed(0)}% Conf</span>
                                        </div>
                                        <p className="text-slate-300 font-mono text-[11px]">
                                            Ticket #{step.ticketId}: {step.agentOutput?.issueType || step.agentOutput?.assignedDeptCode || 'Step Complete'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ESCALATION ALERTS FEED */}
                    <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4 text-rose-400" />
                                <h4 className="text-sm font-bold text-white font-outfit">Escalation Alerts ({escalationAlerts.length})</h4>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 rounded">
                                HIGH PRIORITY
                            </span>
                        </div>

                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {escalationAlerts.length === 0 ? (
                                <div className="p-3 rounded-xl bg-slate-900/60 text-slate-500 text-xs italic">
                                    No active SLA escalation breaches.
                                </div>
                            ) : (
                                escalationAlerts.map((alert) => (
                                    <div key={alert._id || alert.id} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                                        <div className="flex items-center justify-between font-mono">
                                            <span className="font-bold text-rose-400">Ticket #{alert.ticketId}</span>
                                            <span className="text-[10px] text-slate-400">{alert.priorityLevel}</span>
                                        </div>
                                        <p className="text-slate-300">{alert.title}</p>
                                        <p className="text-[10px] text-rose-400 font-mono">{alert.escalationReason || 'SLA Target Exceeded'}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* LIVE NOTIFICATIONS FEED */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                            <Bell className="w-4 h-4 text-cyan-400" />
                            <h4 className="text-sm font-bold text-white font-outfit">Live Notifications</h4>
                        </div>

                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                            {liveNotifications.length === 0 ? (
                                [
                                    { title: 'System Sweep Complete', time: '5m ago', msg: 'Escalation agent checked 60 active tickets.' },
                                    { title: 'New Registration', time: '12m ago', msg: 'Officer TANGEDCO #2 joined command room.' }
                                ].map((n, idx) => (
                                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                                        <div className="flex items-center justify-between text-slate-400">
                                            <span className="font-semibold text-white">{n.title}</span>
                                            <span className="font-mono text-[10px]">{n.time}</span>
                                        </div>
                                        <p className="text-slate-300">{n.msg}</p>
                                    </div>
                                ))
                            ) : (
                                liveNotifications.map((n) => (
                                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                                        <div className="flex items-center justify-between text-slate-400">
                                            <span className="font-semibold text-cyan-400">{n.title}</span>
                                            <span className="font-mono text-[10px]">{n.time}</span>
                                        </div>
                                        <p className="text-slate-300">{n.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* Override Priority Modal */}
            {showPriorityModal && selectedComplaint && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
                        <h3 className="text-lg font-bold text-white font-outfit">Manual Priority Override</h3>
                        <p className="text-xs text-slate-400">Override AI priority score matrix for Ticket #{selectedComplaint.ticketId}</p>

                        <form onSubmit={handlePriorityOverride} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Priority Score (0 - 100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={overrideScore}
                                    onChange={(e) => setOverrideScore(parseInt(e.target.value))}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Override</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={overrideReason}
                                    onChange={(e) => setOverrideReason(e.target.value)}
                                    placeholder="State reason for manual escalation or priority adjustment..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPriorityModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md"
                                >
                                    Apply Override
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reassign Department Modal */}
            {showReassignModal && selectedComplaint && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4">
                        <h3 className="text-lg font-bold text-white font-outfit">Reassign Department</h3>
                        <p className="text-xs text-slate-400">Re-route Ticket #{selectedComplaint.ticketId} to a different municipal authority</p>

                        <form onSubmit={handleReassignDepartment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Select Target Department</label>
                                <select
                                    value={targetDeptId}
                                    onChange={(e) => setTargetDeptId(e.target.value)}
                                    required
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="">Choose department...</option>
                                    {departments.map((d) => (
                                        <option key={d._id || d.id} value={d._id || d.id}>{d.name} ({d.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReassignModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md"
                                >
                                    Reassign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};
