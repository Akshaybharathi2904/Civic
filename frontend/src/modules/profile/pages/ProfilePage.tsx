import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useProfile from '../hooks/useProfile';
import { ReputationBadgeCard } from '../components/ReputationBadgeCard';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { Avatar } from '../../../shared/components/ui/Avatar';
import { Badge, StatusBadge, PriorityBadge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';
import { Tabs } from '../../../shared/components/ui/Tabs';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Spinner } from '../../../shared/components/ui/Spinner';
import { useToast } from '../../../shared/hooks/useToast';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Save,
  CheckCircle2,
  FileText,
  ThumbsUp,
  Activity as ActivityIcon,
  Lock,
  EyeOff,
  Eye,
  ChevronRight,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    user,
    reportedIssues,
    supportedIssues,
    stats,
    badges,
    activityHistory,
    loading,
    updateProfile,
  } = useProfile();

  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'reported' | 'supported' | 'activity' | 'settings'>('reported');

  // Settings Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('');
  const [isAnonymousAllowed, setIsAnonymousAllowed] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || user.ward || '');
      setWard(user.ward || '');
      setIsAnonymousAllowed(user.isAnonymousAllowed ?? true);
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateProfile({
      name,
      phone,
      address,
      ward,
      isAnonymousAllowed,
    });
    setIsSaving(false);
    if (ok) {
      success('User profile & privacy settings updated successfully!', 'Profile Saved');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center text-cyan-400 font-mono text-xs">
        <Spinner size="lg" label="Loading User Profile & Entity Data..." />
      </div>
    );
  }

  const memberSinceDate = new Date(user.joinedAt || user.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header Identity Card */}
      <div className="bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <Avatar src={user.profilePicture || user.avatar} name={user.name} size="xl" className="border-2 border-cyan-500/40 shadow-xl" />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">{user.name}</h1>
                <Badge variant="cyan" pulse className="uppercase">
                  {user.role}
                </Badge>
                <Badge variant="emerald">
                  {user.badge || 'Civic Guardian'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                <span className="text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  ID: {user.userId || user.id || user._id}
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-slate-500" />
                  <span>{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-slate-500" />
                    <span>{user.phone}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-500" />
                  <span>Joined {memberSinceDate}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-cyan-400 shrink-0" />
                <span>{user.address || user.ward || 'Ward 72 - RS Puram, Coimbatore'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 w-full md:w-auto justify-between md:justify-end">
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Reputation Score</span>
              <span className="text-2xl font-extrabold text-cyan-400 font-mono">{user.reputationPoints || 280} PTS</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Privacy Mode</span>
              <span className={`text-xs font-bold font-mono ${user.isAnonymousAllowed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {user.isAnonymousAllowed ? 'Anonymous Allowed' : 'Identified Only'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Statistics Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Reported Issues</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </span>
          <span className="text-2xl font-extrabold text-white font-mono mt-2">{stats?.totalReported ?? reportedIssues.length}</span>
          <span className="text-[10px] text-cyan-400 font-mono mt-1">Submitted Tickets</span>
        </Card>

        <Card variant="default" className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Supported Issues</span>
            <ThumbsUp className="w-4 h-4 text-purple-400" />
          </span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono mt-2">{stats?.totalSupported ?? supportedIssues.length}</span>
          <span className="text-[10px] text-purple-400/80 font-mono mt-1">Community Upvotes</span>
        </Card>

        <Card variant="default" className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Resolved Issues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-2">{stats?.totalResolved ?? 3}</span>
          <span className="text-[10px] text-emerald-400/80 font-mono mt-1">Verified Works</span>
        </Card>

        <Card variant="default" className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Resolution Rate</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </span>
          <span className="text-2xl font-extrabold text-blue-400 font-mono mt-2">{stats?.resolutionRatePercent ?? 85}%</span>
          <span className="text-[10px] text-blue-400/80 font-mono mt-1">Citizen SLA Impact</span>
        </Card>
      </div>

      {/* Gamification Reputation & Badges Showcase Card */}
      <ReputationBadgeCard
        reputationPoints={user.reputationPoints || 280}
        badgeTitle={user.badge || 'Civic Guardian'}
        badges={badges}
      />

      {/* Main Tabbed Content Section */}
      <div className="space-y-6">
        <Tabs
          variant="pills"
          tabs={[
            { id: 'reported', label: 'Reported Issues', count: reportedIssues.length, icon: <FileText size={16} /> },
            { id: 'supported', label: 'Supported Issues', count: supportedIssues.length, icon: <ThumbsUp size={16} /> },
            { id: 'activity', label: 'Activity History', count: activityHistory.length, icon: <ActivityIcon size={16} /> },
            { id: 'settings', label: 'Account & Privacy', icon: <Lock size={16} /> },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as any)}
        />

        {/* Tab 1: Reported Issues */}
        {activeTab === 'reported' && (
          <div className="space-y-4">
            {reportedIssues.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-500 font-mono space-y-3">
                <p>No reported issues submitted yet.</p>
                <Link to="/submit-complaint">
                  <Button variant="primary" size="sm" className="mt-2">
                    Report New Incident
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reportedIssues.map((ticket) => (
                  <Link
                    key={ticket._id || ticket.id}
                    to={`/complaints/${ticket._id || ticket.id}`}
                    className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                          {ticket.ticketId}
                        </span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge level={ticket.priorityLevel} score={ticket.priorityScore} />
                      </div>
                      <h3 className="text-base font-bold text-white font-outfit group-hover:text-cyan-400 transition-colors">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="line-clamp-1">{ticket.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <ChevronRight size={18} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Supported Issues */}
        {activeTab === 'supported' && (
          <div className="space-y-4">
            {supportedIssues.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-500 font-mono">
                No supported/upvoted issues found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {supportedIssues.map((ticket) => (
                  <Link
                    key={ticket._id || ticket.id}
                    to={`/complaints/${ticket._id || ticket.id}`}
                    className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800/80 hover:border-purple-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                          {ticket.ticketId}
                        </span>
                        <StatusBadge status={ticket.status} />
                        <span className="text-[11px] font-mono text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                          👍 Upvoted ({ticket.affectedCount} Citizens)
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white font-outfit group-hover:text-purple-400 transition-colors">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="line-clamp-1">{ticket.address}</span>
                      </p>
                    </div>

                    <ChevronRight size={18} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Activity History Timeline */}
        {activeTab === 'activity' && (
          <Card variant="default" className="p-6">
            <h3 className="text-base font-bold text-white font-outfit mb-4">Complete Activity History Log</h3>
            <ActivityTimeline activities={activityHistory} />
          </Card>
        )}

        {/* Tab 4: Account & Privacy Settings */}
        {activeTab === 'settings' && (
          <Card variant="default" className="p-6 space-y-6">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-outfit border-b border-slate-800 pb-3">
                  Personal Information & Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<UserIcon size={16} />}
                  />

                  <Input
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone size={16} />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Ward & Zone"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    leftIcon={<MapPin size={16} />}
                  />

                  <Input
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    leftIcon={<MapPin size={16} />}
                  />
                </div>
              </div>

              {/* Privacy Control Switcher */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      {isAnonymousAllowed ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 font-outfit">Allow Anonymous Reporting</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        When enabled, you can submit civic complaints without publishing your name to public dashboards.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAnonymousAllowed(!isAnonymousAllowed)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isAnonymousAllowed ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isAnonymousAllowed ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save size={16} />}>
                  Save Settings & Privacy Controls
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
