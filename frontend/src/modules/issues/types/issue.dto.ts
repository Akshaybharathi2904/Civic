import { IssueStatus, IssuePriority, VerificationStatus, IssueContactInfo, Issue } from '../../../shared/types/issue.domain';

export interface CreateIssueDTO {
  title: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  anonymous?: boolean;
  contactInformation?: IssueContactInfo;
  images?: string[];
  videos?: string[];
  mediaFiles?: File[];
}

export interface UpdateIssueDTO {
  title?: string;
  description?: string;
  category?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  department?: string;
  verificationStatus?: VerificationStatus;
  anonymous?: boolean;
  contactInformation?: IssueContactInfo;
}

export interface IssueFilterDTO {
  status?: IssueStatus;
  priority?: IssuePriority;
  category?: string;
  department?: string;
  ward?: string;
  city?: string;
  anonymous?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface IssueResponseDTO {
  success: boolean;
  message?: string;
  data: Issue;
}

export interface IssueListResponseDTO {
  success: boolean;
  data: Issue[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
