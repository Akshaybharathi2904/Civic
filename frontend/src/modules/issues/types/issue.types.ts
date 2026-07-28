import { Complaint, ComplaintStatus, PriorityLevel } from '../../../shared/types';

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  mediaFiles?: File[];
}

export interface ComplaintFilterOptions {
  status?: ComplaintStatus;
  priority?: PriorityLevel;
  department?: string;
  ward?: string;
  search?: string;
  page?: number;
  limit?: number;
}
