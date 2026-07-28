import { useState, useEffect, useCallback } from 'react';
import profileService from '../services/profile.service';
import { User, Complaint } from '../../../shared/types';
import { UserActivityItem, UserBadgeItem, UserProfileStats, UpdateProfileInput } from '../types/profile.types';

export const useProfile = (userId?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [reportedIssues, setReportedIssues] = useState<Complaint[]>([]);
  const [supportedIssues, setSupportedIssues] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<UserProfileStats | null>(null);
  const [badges, setBadges] = useState<UserBadgeItem[]>([]);
  const [activityHistory, setActivityHistory] = useState<UserActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile(userId);
      setUser(data.user);
      setReportedIssues(data.reportedIssues);
      setSupportedIssues(data.supportedIssues);
      setStats(data.stats);
      setBadges(data.badges);
      setActivityHistory(data.activityHistory);
    } catch (err: any) {
      console.error('[useProfile] Error fetching profile:', err);
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const updateProfile = async (input: UpdateProfileInput): Promise<boolean> => {
    try {
      const updatedUser = await profileService.updateProfile(input);
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
      return true;
    } catch (err: any) {
      console.error('[useProfile] Update failed:', err);
      setError(err.message || 'Failed to update profile');
      return false;
    }
  };

  return {
    user,
    reportedIssues,
    supportedIssues,
    stats,
    badges,
    activityHistory,
    loading,
    error,
    refreshProfile: fetchProfileData,
    updateProfile,
  };
};

export default useProfile;
