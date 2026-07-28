export * from './issue.domain';
import { UserActivityItem } from '../../modules/profile/types/profile.types';
import { Issue } from './issue.domain';

export type UserRole = 'citizen' | 'officer' | 'department_head' | 'admin';

export interface User {
  _id: string;
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profilePicture?: string;
  avatar?: string;
  joinedAt?: string;
  createdAt?: string;
  reputationPoints?: number;
  badge?: string;
  isAnonymousAllowed?: boolean;
  department?: Department | string;
  ward?: string;
  city?: string;
  reportedIssues?: Issue[] | string[];
  supportedIssues?: Issue[] | string[];
  activityHistory?: UserActivityItem[];
}

export interface Department {
  _id: string;
  id?: string;
  name: string;
  code: string;
  description?: string;
  categories: string[];
  contactEmail: string;
  contactPhone?: string;
  SLAHours: number;
  activeTicketCount: number;
  icon?: string;
}

// Backward compatibility alias for Complaint -> Issue
export type Complaint = Issue;
export type ComplaintStatus = import('./issue.domain').IssueStatus;
export type PriorityLevel = import('./issue.domain').IssuePriority;

export interface MediaFile {
  url: string;
  type: 'image' | 'voice' | 'video' | 'document';
  name?: string;
}

export interface AgentLog {
  _id: string;
  id?: string;
  complaintId: string | { _id: string; ticketId: string; title: string };
  agentName: string;
  stepNumber: number;
  inputData?: any;
  outputData?: any;
  input?: any;
  output?: any;
  confidenceScore?: number;
  confidence?: number;
  executionTimeMs?: number;
  executionTime?: number;
  status: 'pending' | 'running' | 'success' | 'warning' | 'failed';
  reasoning?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface AgentStepUpdate {
  complaintId: string;
  ticketId: string;
  stepNumber: number;
  agentName: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  confidence: number;
  executionTimeMs: number;
  agentOutput: any;
  timestamp: string;
}

export interface NotificationItem {
  _id: string;
  id?: string;
  recipient: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'escalation' | 'status_change';
  complaintId?: string;
  read: boolean;
  createdAt: string;
}

export interface CommentItem {
  _id: string;
  id?: string;
  complaintId: string;
  author: User;
  text: string;
  attachments?: { url: string; name: string }[];
  isOfficialNote: boolean;
  createdAt: string;
}

export interface StatusHistoryItem {
  _id: string;
  id?: string;
  complaintId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: User;
  note?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}
