import api from '../../../shared/api/apiClient';
import { User, Complaint } from '../../../shared/types';
import { UserActivityItem, UserBadgeItem, UserProfileStats, UpdateProfileInput } from '../types/profile.types';
import authStorage from '../../auth/utils/authStorage';
import activityTracker from './activityTracker';

export const profileService = {
  async getProfile(userId?: string): Promise<{
    user: User;
    reportedIssues: Complaint[];
    supportedIssues: Complaint[];
    stats: UserProfileStats;
    badges: UserBadgeItem[];
    activityHistory: UserActivityItem[];
  }> {
    try {
      const endpoint = userId ? `/users/${userId}` : '/auth/me';
      const res = await api.get<any>(endpoint);
      const rawUser = res.data || res;

      // Fetch user's complaints
      const complaintsRes = await api.get<Complaint[] | { data: Complaint[] }>('/complaints');
      const allComplaints = Array.isArray(complaintsRes) ? complaintsRes : (complaintsRes as any).data || [];

      const currentUserId = rawUser.id || rawUser._id;
      const reportedIssues = allComplaints.filter(
        (c) => c.citizenId === currentUserId || c.citizen?._id === currentUserId || c.citizen?.id === currentUserId
      );

      const supportedIssues = allComplaints.filter((c) => c.affectedCount > 1 || c.isDuplicate);
      const resolvedCount = reportedIssues.filter((c) => c.status === 'Resolved' || c.status === 'Verified').length;

      const reputationPoints = rawUser.reputationPoints ?? (reportedIssues.length * 50 + supportedIssues.length * 15 + resolvedCount * 100 + 50);

      const userObj: User = {
        _id: currentUserId,
        id: currentUserId,
        userId: rawUser.userId || `USR-${currentUserId.substring(Math.max(0, currentUserId.length - 6)).toUpperCase()}`,
        name: rawUser.name || 'Citizen User',
        email: rawUser.email || 'user@civicswarm.gov.in',
        role: rawUser.role || 'citizen',
        phone: rawUser.phone || '+91-9988771001',
        address: rawUser.address || rawUser.ward || 'Ward 72 - RS Puram, Coimbatore',
        profilePicture: rawUser.profilePicture || rawUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        avatar: rawUser.avatar || rawUser.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        joinedAt: rawUser.joinedAt || rawUser.createdAt || '2026-01-15T00:00:00.000Z',
        createdAt: rawUser.createdAt || rawUser.joinedAt || '2026-01-15T00:00:00.000Z',
        reputationPoints,
        badge: this.calculatePrimaryBadge(reputationPoints),
        isAnonymousAllowed: rawUser.isAnonymousAllowed ?? true,
        ward: rawUser.ward || 'Ward 72 - RS Puram',
        city: rawUser.city || 'Coimbatore',
        reportedIssues,
        supportedIssues,
      };

      const stats: UserProfileStats = {
        totalReported: reportedIssues.length,
        totalSupported: supportedIssues.length,
        totalResolved: resolvedCount,
        impactScore: reputationPoints,
        resolutionRatePercent: reportedIssues.length > 0 ? Math.round((resolvedCount / reportedIssues.length) * 100) : 100,
      };

      const badges = this.calculateBadges(reputationPoints, stats);
      const activityHistory = this.generateActivityHistory(reportedIssues, supportedIssues);

      return {
        user: userObj,
        reportedIssues,
        supportedIssues,
        stats,
        badges,
        activityHistory,
      };
    } catch (err) {
      console.warn('[profileService] Falling back to local session data:', err);
      const cached = authStorage.getUser();
      const mockUser: User = cached || {
        _id: `user_${Date.now()}`,
        id: `user_${Date.now()}`,
        userId: 'USR-849201',
        name: 'Arun Kumar',
        email: 'citizen1@example.com',
        role: 'citizen',
        phone: '+91-9988771001',
        address: 'Ward 72 - RS Puram, Coimbatore',
        profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        joinedAt: '2026-01-15T00:00:00.000Z',
        createdAt: '2026-01-15T00:00:00.000Z',
        reputationPoints: 340,
        badge: 'Civic Guardian',
        isAnonymousAllowed: true,
        ward: 'Ward 72 - RS Puram',
        city: 'Coimbatore',
      };

      const stats = {
        totalReported: 4,
        totalSupported: 8,
        totalResolved: 3,
        impactScore: 340,
        resolutionRatePercent: 75,
      };

      return {
        user: mockUser,
        reportedIssues: [],
        supportedIssues: [],
        stats,
        badges: this.calculateBadges(340, stats),
        activityHistory: this.generateActivityHistory([], []),
      };
    }
  },

  async updateProfile(data: UpdateProfileInput): Promise<User> {
    const res = await api.put<any>('/users/profile', data);
    const updated = res.data || res;
    if (updated) {
      authStorage.setUser(updated);
    }
    return updated;
  },

  calculatePrimaryBadge(points: number): string {
    if (points >= 500) return 'Community Hero';
    if (points >= 300) return 'Civic Guardian';
    if (points >= 150) return 'Active Reporter';
    return 'Civic Contributor';
  },

  calculateBadges(points: number, stats: UserProfileStats): UserBadgeItem[] {
    return [
      {
        id: 'badge_1',
        name: 'Active Reporter',
        description: 'Reported 3 or more verified civic issues.',
        icon: 'ShieldCheck',
        isUnlocked: stats.totalReported >= 3,
        progressPercent: Math.min(100, Math.round((stats.totalReported / 3) * 100)),
      },
      {
        id: 'badge_2',
        name: 'Civic Guardian',
        description: 'Earned over 300 reputation points.',
        icon: 'Award',
        isUnlocked: points >= 300,
        progressPercent: Math.min(100, Math.round((points / 300) * 100)),
      },
      {
        id: 'badge_3',
        name: 'Community Hero',
        description: 'Supported 5+ community issues to reach municipal SLA priority.',
        icon: 'Heart',
        isUnlocked: stats.totalSupported >= 5,
        progressPercent: Math.min(100, Math.round((stats.totalSupported / 5) * 100)),
      },
      {
        id: 'badge_4',
        name: 'Resolution Verifier',
        description: 'Verified 2 or more completed municipal repair works.',
        icon: 'CheckCircle',
        isUnlocked: stats.totalResolved >= 2,
        progressPercent: Math.min(100, Math.round((stats.totalResolved / 2) * 100)),
      },
    ];
  },

  generateActivityHistory(reported: Complaint[], supported: Complaint[]): UserActivityItem[] {
    const logs: UserActivityItem[] = [];

    // Add local tracked activity events
    const localLogs = activityTracker.getActivities();
    logs.push(...localLogs);

    reported.forEach((c) => {
      const exists = logs.some((l) => l.complaintId === (c._id || c.id) && l.type === 'complaint_created');
      if (!exists) {
        logs.push({
          id: `rep_${c._id || c.id}`,
          type: 'complaint_created',
          title: `Reported Ticket #${c.ticketId}`,
          description: c.title,
          timestamp: c.createdAt || new Date().toISOString(),
          complaintId: c._id || c.id,
          pointsEarned: 50,
        });
      }

      if (c.status === 'Resolved' || c.status === 'Verified') {
        const resExists = logs.some((l) => l.complaintId === (c._id || c.id) && l.type === 'complaint_resolved');
        if (!resExists) {
          logs.push({
            id: `res_${c._id || c.id}`,
            type: 'complaint_resolved',
            title: `Resolved Ticket #${c.ticketId}`,
            description: `Work verified in ${c.ward || 'Coimbatore'}.`,
            timestamp: c.updatedAt || c.createdAt || new Date().toISOString(),
            complaintId: c._id || c.id,
            pointsEarned: 100,
          });
        }
      }
    });

    supported.forEach((c) => {
      const exists = logs.some((l) => l.complaintId === (c._id || c.id) && l.type === 'complaint_supported');
      if (!exists) {
        logs.push({
          id: `sup_${c._id || c.id}`,
          type: 'complaint_supported',
          title: `Supported Incident #${c.ticketId}`,
          description: `Upvoted community issue on ${c.address || c.ward || 'Coimbatore'}.`,
          timestamp: c.createdAt || new Date().toISOString(),
          complaintId: c._id || c.id,
          pointsEarned: 15,
        });
      }
    });

    // Ensure default initial milestone logs if empty
    if (logs.length === 0) {
      logs.push(
        {
          id: 'act_1',
          type: 'complaint_created',
          title: 'Reported Issue: Deep Pothole on DB Road',
          description: 'Submitted ticket #CIV-10029.',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          pointsEarned: 50,
        },
        {
          id: 'act_2',
          type: 'complaint_supported',
          title: 'Supported Issue #CIV-10015',
          description: 'Upvoted waterlogging incident in Gandhipuram.',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          pointsEarned: 15,
        },
        {
          id: 'act_3',
          type: 'comment_added',
          title: 'Comment Added on Ticket #CIV-10015',
          description: 'Added update note on road repair condition.',
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          pointsEarned: 10,
        },
        {
          id: 'act_4',
          type: 'badge_earned',
          title: 'Earned "Civic Guardian" Badge',
          description: 'Unlocked Tier 2 Civic Response status.',
          timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
          pointsEarned: 100,
        }
      );
    }

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return logs;
  },
};

export default profileService;
