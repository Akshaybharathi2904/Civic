import { QueueStatusEnum } from './QueueStatusEnum.js';

export class QueuedComplaint {
  constructor({
    complaintId,
    ticketId,
    title,
    aiSummary = '',
    category = 'Road Infrastructure',
    issueType = 'Pothole / Road Hazard',
    location = {},
    priority = {},
    recommendedDepartment = {},
    communityConfidence = 0.90,
    aiConfidence = 0.96,
    queueStatus = QueueStatusEnum.NEW,
    submissionTimestamp = new Date().toISOString(),
  }) {
    this.complaintId = complaintId || `comp_${Date.now()}`;
    this.ticketId = ticketId || `CIV-${Math.floor(Math.random() * 9000 + 1000)}`;
    this.title = title;
    this.aiSummary = aiSummary || title;
    this.category = category;
    this.issueType = issueType;

    this.location = {
      ward: location.ward || 'Ward 72 - RS Puram',
      zone: location.zone || 'Central Zone',
      municipality: location.municipality || 'Coimbatore Municipal Corporation',
      district: location.district || 'Coimbatore District',
      formattedAddress: location.formattedAddress || 'Main Cross Road, Coimbatore',
      coordinates: location.coordinates || [76.9508, 11.0084],
    };

    this.priority = {
      level: priority.level || priority.priorityLevel || 'Medium',
      score: priority.score || priority.priorityScore || 50,
      recommendedSLA: priority.recommendedSLA || 48,
      escalationFlag: Boolean(priority.escalationFlag),
      reason: priority.reason || '',
    };

    this.recommendedDepartment = {
      departmentName: recommendedDepartment.departmentName || recommendedDepartment.responsibleDepartment || 'Public Works Department (PWD)',
      officeName: recommendedDepartment.officeName || recommendedDepartment.administrativeOffice || 'Central Operations Office',
      queueName: recommendedDepartment.queueName || recommendedDepartment.suggestedAssignmentQueue || 'Standard Maintenance Queue',
      confidenceScore: recommendedDepartment.confidenceScore || 0.95,
    };

    this.communityConfidence = communityConfidence;
    this.aiConfidence = aiConfidence;
    this.queueStatus = queueStatus;
    this.submissionTimestamp = submissionTimestamp;
    this.updatedAt = new Date().toISOString();
  }

  updateStatus(nextStatus) {
    if (Object.values(QueueStatusEnum).includes(nextStatus)) {
      this.queueStatus = nextStatus;
      this.updatedAt = new Date().toISOString();
    }
  }
}

export default QueuedComplaint;
