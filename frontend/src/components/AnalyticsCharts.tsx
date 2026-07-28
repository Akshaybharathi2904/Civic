import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface AnalyticsChartsProps {
  categoryData?: { name: string; count: number }[];
  priorityData?: { level: string; count: number }[];
  wardData?: { ward: string; count: number }[];
  leaderboard?: any[];
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  categoryData = [
    { name: 'Potholes', count: 34 },
    { name: 'Water Leakage', count: 28 },
    { name: 'Garbage', count: 22 },
    { name: 'Streetlights', count: 16 }
  ],
  wardData = [
    { ward: 'Indiranagar', count: 24 },
    { ward: 'Koramangala', count: 19 },
    { ward: 'Jayanagar', count: 15 },
    { ward: 'Bellandur', count: 28 },
    { ward: 'Whitefield', count: 14 }
  ],
  leaderboard = [
    { name: 'PWD', score: 94, totalTickets: 42, resolvedTickets: 39 },
    { name: 'BWSSB', score: 88, totalTickets: 30, resolvedTickets: 26 },
    { name: 'BESCOM', score: 91, totalTickets: 25, resolvedTickets: 23 },
    { name: 'BBMP', score: 84, totalTickets: 50, resolvedTickets: 42 }
  ]
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Chart 1: Category Distribution */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h4 className="text-base font-bold text-white font-outfit mb-4">
          Issue Distribution by Category
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {categoryData.map((entry, index) => (
            <div key={entry.name} className="flex items-center space-x-1.5 text-xs text-slate-300">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span>{entry.name} ({entry.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Ward Statistics */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h4 className="text-base font-bold text-white font-outfit mb-4">
          Ward Issue Density Statistics
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wardData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ward" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Leaderboard Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 lg:col-span-2">
        <h4 className="text-base font-bold text-white font-outfit mb-4">
          Department Performance & Resolution Leaderboard
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Total Tickets</th>
                <th className="py-2.5 px-3">Resolved</th>
                <th className="py-2.5 px-3">Performance Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{dept.name}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{dept.totalTickets}</td>
                  <td className="py-3 px-3 text-emerald-400 font-mono">{dept.resolvedTickets}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                          style={{ width: `${dept.score}%` }}
                        />
                      </div>
                      <span className="font-mono text-cyan-400 font-bold">{dept.score}/100</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
