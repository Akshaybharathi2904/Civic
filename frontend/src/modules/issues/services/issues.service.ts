import api from '../../../shared/api/apiClient';
import { Issue } from '../../../shared/types/issue.domain';
import { CreateIssueDTO, IssueFilterDTO, UpdateIssueDTO } from '../types/issue.dto';
import issueMapper from '../utils/issueMapper';
import activityTracker from '../../profile/services/activityTracker';

const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export interface DuplicateMatchItem {
  issue: Issue;
  distanceMeters: number;
  similarityPercent: number;
}

export const issuesService = {
  async getIssues(filter?: IssueFilterDTO): Promise<Issue[]> {
    const res = await api.get<any>('/complaints', { params: filter });
    const resData = (res as any).data || res;
    const rawList = Array.isArray(resData) ? resData : resData.complaints || resData.data || [];
    return rawList.map((item: any) => issueMapper.toDomain(item));
  },

  async getIssueById(id: string): Promise<Issue> {
    const res = await api.get<any>(`/complaints/${id}`);
    const resData = (res as any).data || res;
    const raw = resData.complaint || resData.data || resData;
    return issueMapper.toDomain(raw);
  },

  async createIssue(dto: CreateIssueDTO): Promise<Issue> {
    const formData = new FormData();
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('category', dto.category);
    formData.append('address', dto.address);
    formData.append('latitude', dto.latitude.toString());
    formData.append('longitude', dto.longitude.toString());

    if (dto.anonymous !== undefined) {
      formData.append('anonymous', dto.anonymous.toString());
    }

    if (dto.contactInformation) {
      formData.append('contactInformation', JSON.stringify(dto.contactInformation));
    }

    if (dto.mediaFiles && dto.mediaFiles.length > 0) {
      dto.mediaFiles.forEach((file) => {
        formData.append('mediaFiles', file);
      });
    }

    const res = await api.post<any>('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const resData = (res as any).data || res;
    const raw = resData.complaint || resData.data || resData;
    const createdIssue = issueMapper.toDomain(raw);

    // Track Activity: Reported Issue
    activityTracker.logActivity({
      type: 'complaint_created',
      title: `Reported Issue: ${createdIssue.title}`,
      description: `Submitted ticket #${createdIssue.issueNumber} on ${createdIssue.address}.`,
      complaintId: createdIssue.id,
      pointsEarned: 50,
    });

    return createdIssue;
  },

  async updateIssue(id: string, dto: UpdateIssueDTO): Promise<Issue> {
    const res = await api.patch<any>(`/complaints/${id}`, dto);
    const resData = (res as any).data || res;
    const raw = resData.complaint || resData.data || resData;
    return issueMapper.toDomain(raw);
  },

  async updateStatus(id: string, status: string, note?: string): Promise<Issue> {
    const res = await api.patch<any>(`/complaints/${id}/status`, { status, note });
    const resData = (res as any).data || res;
    const raw = resData.complaint || resData.data || resData;
    return issueMapper.toDomain(raw);
  },

  async findNearbyPossibleDuplicates(params: {
    latitude: number;
    longitude: number;
    title?: string;
    category?: string;
  }): Promise<DuplicateMatchItem[]> {
    try {
      const allIssues = await this.getIssues();
      const matches: DuplicateMatchItem[] = [];

      allIssues.forEach((issue) => {
        if (issue.status === 'Resolved' || issue.status === 'Closed') return;

        const distance = calculateDistanceMeters(
          params.latitude,
          params.longitude,
          issue.latitude,
          issue.longitude
        );

        if (distance <= 500) {
          let similarity = 60;
          if (params.title && issue.title) {
            const words1 = params.title.toLowerCase().split(/\s+/);
            const words2 = issue.title.toLowerCase().split(/\s+/);
            const common = words1.filter((w) => w.length > 3 && words2.includes(w));
            if (common.length > 0) similarity += 30;
          }
          if (params.category && issue.category === params.category) {
            similarity += 10;
          }

          matches.push({
            issue,
            distanceMeters: distance,
            similarityPercent: Math.min(98, similarity),
          });
        }
      });

      matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
      return matches;
    } catch (err) {
      console.warn('[issuesService] Error checking duplicate matches:', err);
      return [];
    }
  },

  async supportExistingIssue(issueId: string): Promise<Issue> {
    try {
      await api.post<any>(`/complaints/${issueId}/comments`, {
        text: '👍 Supported this issue to increase priority SLA.',
        isOfficialNote: false,
      });
    } catch (err) {
      console.warn('[issuesService] Support comment notice:', err);
    }

    const updated = await this.getIssueById(issueId);
    updated.supportCount = (updated.supportCount || updated.affectedCount || 1) + 1;
    updated.affectedCount = updated.supportCount;

    // Track Activity: Supported Issue
    activityTracker.logActivity({
      type: 'complaint_supported',
      title: `Supported Issue #${updated.issueNumber || updated.ticketId}`,
      description: `Upvoted incident "${updated.title}" on ${updated.address}.`,
      complaintId: updated.id,
      pointsEarned: 15,
    });

    return updated;
  },

  // Backward compatibility aliases
  async getComplaints(filter?: any): Promise<Issue[]> {
    return this.getIssues(filter);
  },
  async getComplaintById(id: string): Promise<Issue> {
    return this.getIssueById(id);
  },
  async createComplaint(formData: FormData): Promise<Issue> {
    const res = await api.post<any>('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const resData = (res as any).data || res;
    const raw = resData.complaint || resData.data || resData;
    const created = issueMapper.toDomain(raw);

    // Track Activity: Reported Issue
    activityTracker.logActivity({
      type: 'complaint_created',
      title: `Reported Issue: ${created.title}`,
      description: `Submitted ticket #${created.issueNumber} on ${created.address}.`,
      complaintId: created.id,
      pointsEarned: 50,
    });

    return created;
  },
};

export default issuesService;
