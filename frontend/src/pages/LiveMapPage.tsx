import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ComplaintMap } from '../components/ComplaintMap';
import {
    MapPin,
    Search,
    Filter,
    RefreshCw,
    Layers,
    Database,
    Building2,
    Flame,
    CheckCircle2,
    Sliders,
    Sparkles
} from 'lucide-react';

export const LiveMapPage: React.FC = () => {
    const navigate = useNavigate();

    const [points, setPoints] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('');

    // Toggles
    const [viewMode, setViewMode] = useState<'markers' | 'clusters'>('markers');

    useEffect(() => {
        fetchMapData();
        fetchDepartments();
    }, [selectedWard, selectedDept, selectedStatus, selectedPriority]);

    const fetchMapData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/analytics/heatmap', {
                params: {
                    ward: selectedWard || undefined,
                    department: selectedDept || undefined,
                    status: selectedStatus || undefined,
                    priority: selectedPriority || undefined,
                    search: search || undefined
                }
            });
            setPoints(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredPoints = points.filter(
        (p) =>
            p.ticketId?.toLowerCase().includes(search.toLowerCase()) ||
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.address?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

            {/* Header & Badges */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1.5">
                            <Database className="w-3.5 h-3.5 text-cyan-400" />
                            <span>MySQL Spatial Queries</span>
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center space-x-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            <span>Leaflet GIS Clustering</span>
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {filteredPoints.length} Incident Locations Loaded
                        </span>
                    </div>

                    <h1 className="text-3xl font-extrabold text-white font-outfit flex items-center space-x-2">
                        <MapPin className="w-7 h-7 text-cyan-400" />
                        <span>Bengaluru City GIS Incident Map</span>
                    </h1>

                    <p className="text-xs text-slate-400 mt-1 font-sans">
                        Real-time geospatial visualization powered by MySQL spatial coordinates and interactive Leaflet GIS cluster rendering.
                    </p>
                </div>

                {/* View Mode Toggle & Refresh */}
                <div className="flex items-center space-x-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center space-x-1 text-xs">
                        <button
                            onClick={() => setViewMode('markers')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${viewMode === 'markers' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Markers Map
                        </button>

                        <button
                            onClick={() => setViewMode('clusters')}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${viewMode === 'clusters' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Cluster Heatmap
                        </button>
                    </div>

                    <button
                        onClick={fetchMapData}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                        title="Refresh GIS Data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* FILTER BAR (Search, Department, Ward, Status, Priority) */}
            <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">

                {/* Search Bar */}
                <div className="relative w-full lg:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search ticket ID, landmark..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">

                    {/* Department Filter */}
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                            <option key={d._id || d.id} value={d._id || d.id}>{d.code} - {d.name.split('(')[0]}</option>
                        ))}
                    </select>

                    {/* Ward Filter */}
                    <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">All Wards & Zones</option>
                        <option value="Ward 80 - Indiranagar">Ward 80 - Indiranagar</option>
                        <option value="Ward 150 - Koramangala">Ward 150 - Koramangala</option>
                        <option value="Ward 177 - Jayanagar">Ward 177 - Jayanagar</option>
                        <option value="Ward 93 - Vasanth Nagar">Ward 93 - Vasanth Nagar</option>
                        <option value="Ward 36 - Malleshwaram">Ward 36 - Malleshwaram</option>
                        <option value="Ward 149 - Bellandur">Ward 149 - Bellandur</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="Reported">Reported</option>
                        <option value="Acknowledged">Acknowledged</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">All Priorities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                </div>

            </div>

            {/* PRIORITY COLOR LEGEND */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
                <span className="text-slate-400 font-semibold uppercase">Priority Severity Indicators:</span>

                <div className="flex flex-wrap items-center space-x-6">
                    <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500 shadow-md shadow-rose-500/50" />
                        <span className="text-rose-300 font-bold">Critical (Score &ge; 80)</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-orange-500 shadow-md shadow-orange-500/50" />
                        <span className="text-orange-300 font-bold">High (Score 65 - 79)</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-500 shadow-md shadow-amber-500/50" />
                        <span className="text-amber-300 font-bold">Medium (Score 40 - 64)</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
                        <span className="text-emerald-300 font-bold">Low (Score &lt; 40)</span>
                    </div>
                </div>
            </div>

            {/* MAIN LEAFLET GIS MAP */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative">
                {loading && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-10 flex items-center justify-center font-mono text-xs text-cyan-400">
                        Querying MySQL spatial coordinates...
                    </div>
                )}

                <ComplaintMap
                    complaints={filteredPoints}
                    onComplaintSelect={(c) => navigate(`/complaints/${c._id || c.id}`)}
                    height="620px"
                />
            </div>

        </div>
    );
};
