export type UserRole = 'citizen' | 'officer' | 'department_head' | 'admin';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department | string;
  phone?: string;
  avatar?: string;
  ward?: string;
  city?: string;
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

export type ComplaintStatus =
  | 'Reported'
  | 'Acknowledged'
  | 'Assigned'
  | 'Inspection'
  | 'In Progress'
  | 'Resolved'
  | 'Verified';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface MediaFile {
  url: string;
  type: 'image' | 'voice' | 'video' | 'document';
  name?: string;
}

export interface Complaint {
  _id: string;
  id?: string;
  ticketId: string;
  title: string;
  description: string;
  category: string;
  severity: PriorityLevel;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  status: ComplaintStatus;
  latitude?: number;
  longitude?: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address: string;
  ward: string;
  zone: string;
  city: string;
  mediaFiles: MediaFile[];
  citizen: User;
  citizenId?: string;
  assignedDepartment?: Department;
  assignedOfficer?: User;
  affectedCount: number;
  isDuplicate: boolean;
  duplicateOf?: Complaint;
  duplicateDistanceMeters?: number;
  slaDueDate?: string;
  isEscalated: boolean;
  escalationReason?: string;
  tags: string[];
  ratings?: {
    rating: number;
    feedback: string;
    createdAt: string;
  };
  agentResults?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
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
