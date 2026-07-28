import React, { useState, useEffect } from 'react';
import api from '../../../shared/api/apiClient';
import { BarChart3, TrendingUp, Shield, MapPin, Building2, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/analytics/overview');
      setStats(res.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

  const categoryData = [
    { name: 'Pothole', count: 42 },
    { name: 'Garbage', count: 35 },
    { name: 'Streetlight', count: 28 },
    { name: 'Water Leak', count: 22 },
    { name: 'Drainage', count: 18 },
  ];

  const wardData = [
    { name: 'Ward 72', count: 38 },
    { name: 'Ward 54', count: 29 },
    { name: 'Ward 38', count: 24 },
    { name: 'Ward 22', count: 19 },
    { name: 'Ward 62', count: 15 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-outfit">
              Municipal Analytics & SLA Leaderboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-departmental performance metrics, ward heat maps, and resolution analytics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Total Tickets</span>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono">{stats?.total || 145}</p>
        </Card>
        <Card variant="default" className="p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Resolution Rate</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">86.4%</p>
        </Card>
        <Card variant="default" className="p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Avg SLA Time</span>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">18.4h</p>
        </Card>
        <Card variant="default" className="p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Merged Duplicates</span>
          <p className="text-2xl font-extrabold text-purple-400 font-mono">32</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card variant="default" className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-outfit flex items-center justify-between">
            <span>Complaints by Category</span>
            <span className="text-[10px] font-mono text-cyan-400">Recharts Category</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card variant="default" className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-white font-outfit flex items-center justify-between">
            <span>Top Incident Wards</span>
            <span className="text-[10px] font-mono text-cyan-400">Ward Heat Ranking</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
