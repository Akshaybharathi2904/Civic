import React from 'react';
import { Users as UsersIcon, Search } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Badge } from '../../../shared/components/ui/Badge';
import { Avatar } from '../../../shared/components/ui/Avatar';

export const UsersPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon className="text-cyan-400" size={24} />
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">User Directory</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Manage citizens, officers, and system administrators</p>
        </div>
      </div>

      <Card variant="default" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search users by name or email..."
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/50 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department / Ward</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 flex items-center gap-3">
                  <Avatar name="Arun Kumar" size="sm" />
                  <div>
                    <p className="font-semibold text-slate-100">Arun Kumar</p>
                    <p className="text-[11px] text-slate-400">citizen1@example.com</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="cyan">Citizen</Badge>
                </td>
                <td className="py-3 px-4 font-mono text-slate-400">Ward 72 - RS Puram</td>
                <td className="py-3 px-4">
                  <Badge variant="emerald">Active</Badge>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 flex items-center gap-3">
                  <Avatar name="Officer Rajesh" size="sm" />
                  <div>
                    <p className="font-semibold text-slate-100">Officer Rajesh</p>
                    <p className="text-[11px] text-slate-400">officer1@pwd.gov.in</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="purple">Officer</Badge>
                </td>
                <td className="py-3 px-4 font-mono text-slate-400">PWD - Public Works</td>
                <td className="py-3 px-4">
                  <Badge variant="emerald">Active</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UsersPage;
