import { Complaint, User } from '../../../shared/types';

export interface UserActivityItem {
  id: string;
  type: 'complaint_created' | 'complaint_supported' | 'complaint_resolved' | 'badge_earned' | 'comment_added';
  title: string;
  description: string;
  timestamp: string;
  complaintId?: string;
  icon?: string;
  pointsEarned?: number;
}

export interface UserBadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  isUnlocked: boolean;
  progressPercent: number;
}

export interface UserProfileStats {
  totalReported: number;
  totalSupported: number;
  totalResolved: number;
  impactScore: number;
  resolutionRatePercent: number;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  address?: string;
  ward?: string;
  city?: string;
  profilePicture?: string;
  isAnonymousAllowed?: boolean;
}
