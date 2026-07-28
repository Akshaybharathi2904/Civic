import { Issue, IssueStatus, IssuePriority, VerificationStatus, IssueTimelineEvent } from '../../../shared/types/issue.domain';

export const issueMapper = {
  toDomain(raw: any): Issue {
    if (!raw) {
      throw new Error('[issueMapper] Cannot map null/undefined payload to Issue domain entity.');
    }

    const cleanId = raw.id || raw._id || `issue_${Date.now()}`;
    const issueNum = raw.issueNumber || raw.ticketId || `ISSUE-${cleanId.substring(Math.max(0, cleanId.length - 6)).toUpperCase()}`;

    // Extract images and videos from media arrays
    const mediaList: any[] = raw.mediaFiles || raw.media || [];
    const images: string[] = [];
    const videos: string[] = [];

    mediaList.forEach((m) => {
      const url = typeof m === 'string' ? m : m.url;
      const type = typeof m === 'object' ? m.type : 'image';
      if (type === 'video' || (url && url.match(/\.(mp4|webm|mov)$/i))) {
        videos.push(url);
      } else if (url) {
        images.push(url);
      }
    });

    const lat = raw.latitude ?? raw.location?.coordinates?.[1] ?? 12.9716;
    const lng = raw.longitude ?? raw.location?.coordinates?.[0] ?? 77.5946;

    const status: IssueStatus = raw.status || 'Reported';
    const priority: IssuePriority = raw.priority || raw.priorityLevel || (raw.priorityScore >= 80 ? 'Critical' : raw.priorityScore >= 65 ? 'High' : 'Medium');
    const verificationStatus: VerificationStatus = raw.verificationStatus || (status === 'Verified' || status === 'Resolved' ? 'Verified' : 'Pending');

    const timeline: IssueTimelineEvent[] = raw.timeline || [
      {
        id: `tl_${cleanId}_1`,
        status: 'Reported',
        title: 'Issue Reported',
        description: `Submitted by ${raw.citizen?.name || (raw.anonymous ? 'Anonymous Citizen' : 'Citizen')}`,
        timestamp: raw.createdAt || new Date().toISOString(),
      },
    ];

    if (raw.statusHistory && Array.isArray(raw.statusHistory)) {
      raw.statusHistory.forEach((sh: any, idx: number) => {
        timeline.push({
          id: sh.id || sh._id || `tl_${cleanId}_${idx + 2}`,
          status: sh.newStatus || 'Status Update',
          title: `Status set to ${sh.newStatus}`,
          description: sh.note || `Status transition from ${sh.previousStatus} to ${sh.newStatus}`,
          timestamp: sh.createdAt || new Date().toISOString(),
          actor: sh.changedBy ? { name: sh.changedBy.name, role: sh.changedBy.role } : undefined,
        });
      });
    }

    return {
      id: cleanId,
      issueNumber: issueNum,
      title: raw.title || 'Untitled Issue',
      description: raw.description || '',
      images,
      videos,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      latitude: lat,
      longitude: lng,
      address: raw.address || raw.ward || 'Municipal Territory',
      category: raw.category || raw.issueType || 'General Civic Issue',
      status,
      createdBy: raw.createdBy || raw.citizen || raw.citizenId || 'anonymous_user',
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
      anonymous: raw.anonymous ?? (raw.isAnonymousAllowed || false),
      contactInformation: raw.contactInformation || {
        name: raw.citizen?.name,
        phone: raw.citizen?.phone,
        email: raw.citizen?.email,
      },
      supportCount: raw.supportCount ?? raw.affectedCount ?? 1,
      commentCount: raw.commentCount ?? (raw.comments ? raw.comments.length : 0),
      viewCount: raw.viewCount ?? 12,
      priority,
      department: raw.department || raw.assignedDepartment,
      duplicateOf: raw.duplicateOf || raw.duplicateOfComplaintId || null,
      verificationStatus,
      timeline,

      // Aliases
      _id: cleanId,
      ticketId: issueNum,
      priorityLevel: priority,
      priorityScore: raw.priorityScore ?? (priority === 'Critical' ? 85 : priority === 'High' ? 70 : 45),
      ward: raw.ward || 'Ward 72 - RS Puram',
      zone: raw.zone || 'East Zone',
      city: raw.city || 'Coimbatore',
      mediaFiles: mediaList,
      citizen: typeof raw.citizen === 'object' ? raw.citizen : undefined,
      citizenId: raw.citizenId || (typeof raw.createdBy === 'string' ? raw.createdBy : undefined),
      assignedDepartment: raw.assignedDepartment || (typeof raw.department === 'object' ? raw.department : undefined),
      assignedOfficer: raw.assignedOfficer,
      affectedCount: raw.supportCount ?? raw.affectedCount ?? 1,
      isDuplicate: !!raw.duplicateOf || raw.isDuplicate || false,
      duplicateDistanceMeters: raw.duplicateDistanceMeters || 0,
      slaDueDate: raw.slaDueDate,
      isEscalated: raw.isEscalated || false,
      escalationReason: raw.escalationReason,
      tags: raw.tags || [],
      ratings: raw.ratings,
      agentResults: raw.agentResults,
    };
  },

  toDTO(domain: Issue): Record<string, any> {
    return {
      title: domain.title,
      description: domain.description,
      category: domain.category,
      address: domain.address,
      latitude: domain.latitude,
      longitude: domain.longitude,
      anonymous: domain.anonymous,
      contactInformation: domain.contactInformation,
      images: domain.images,
      videos: domain.videos,
    };
  },
};

export default issueMapper;
