import { User, Department } from './index';

export type IssueStatus =
  | 'Reported'
  | 'Acknowledged'
  | 'Assigned'
  | 'Inspection'
  | 'In Progress'
  | 'Resolved'
  | 'Verified'
  | 'Closed';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface IssueContactInfo {
  name?: string;
  phone?: string;
  email?: string;
}

export interface IssueTimelineEvent {
  id: string;
  status: IssueStatus | string;
  title: string;
  description: string;
  timestamp: string;
  actor?: {
    id?: string;
    name?: string;
    role?: string;
  };
}

export interface IssueGeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Issue {
  id: string;
  issueNumber: string;
  title: string;
  description: string;
  images: string[];
  videos: string[];
  location: IssueGeoLocation;
  latitude: number;
  longitude: number;
  address: string;
  category: string;
  status: IssueStatus;
  createdBy: User | string;
  createdAt: string;
  updatedAt: string;
  anonymous: boolean;
  contactInformation?: IssueContactInfo;
  supportCount: number;
  commentCount: number;
  viewCount: number;
  priority: IssuePriority;
  department?: Department | string;
  duplicateOf?: Issue | any;
  verificationStatus: VerificationStatus;
  timeline: IssueTimelineEvent[];

  // Compatibility aliases
  _id?: string;
  ticketId?: string;
  severity?: IssuePriority;
  priorityLevel?: IssuePriority;
  priorityScore?: number;
  ward?: string;
  zone?: string;
  city?: string;
  mediaFiles?: any[];
  citizen?: User;
  citizenId?: string;
  assignedDepartment?: Department;
  assignedOfficer?: User;
  affectedCount?: number;
  isDuplicate?: boolean;
  duplicateDistanceMeters?: number;
  slaDueDate?: string;
  isEscalated?: boolean;
  escalationReason?: string;
  tags?: string[];
  ratings?: any;
  agentResults?: Record<string, any>;
}
