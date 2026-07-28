import { UserActivityItem } from '../types/profile.types';

const STORAGE_KEY = 'civicswarm_user_activity_history';

export const activityTracker = {
  getActivities(): UserActivityItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[activityTracker] Error reading activity history:', e);
    }
    return [];
  },

  logActivity(event: {
    type: 'complaint_created' | 'complaint_supported' | 'comment_added' | 'badge_earned' | 'complaint_resolved';
    title: string;
    description: string;
    complaintId?: string;
    pointsEarned?: number;
  }): UserActivityItem {
    const activities = this.getActivities();

    const newItem: UserActivityItem = {
      id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: event.type,
      title: event.title,
      description: event.description,
      timestamp: new Date().toISOString(),
      complaintId: event.complaintId,
      pointsEarned: event.pointsEarned ?? (
        event.type === 'complaint_created' ? 50 :
        event.type === 'complaint_supported' ? 15 :
        event.type === 'comment_added' ? 10 :
        event.type === 'badge_earned' ? 100 : 25
      ),
    };

    const updated = [newItem, ...activities];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[activityTracker] Error storing activity event:', e);
    }

    return newItem;
  },

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export default activityTracker;
