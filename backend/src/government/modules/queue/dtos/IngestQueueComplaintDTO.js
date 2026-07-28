export class IngestQueueComplaintDTO {
  constructor(payload = {}) {
    if (!payload.title && !payload.complaintId) {
      throw new Error('IngestQueueComplaintDTO requires a title or complaintId.');
    }

    this.complaintId = payload.complaintId || `comp_${Date.now()}`;
    this.ticketId = payload.ticketId || `CIV-${Math.floor(Math.random() * 9000 + 1000)}`;
    this.title = payload.title || 'Civic Complaint';
    this.aiSummary = payload.aiSummary || payload.title || '';
    this.category = payload.category || 'Road Infrastructure';
    this.issueType = payload.issueType || 'Pothole / Surface Damage';

    this.location = payload.location || {
      ward: payload.ward || 'Ward 72 - RS Puram',
      zone: payload.zone || 'Central Zone',
      municipality: payload.municipality || 'Coimbatore Municipal Corporation',
      district: payload.district || 'Coimbatore District',
      formattedAddress: payload.formattedAddress || 'Main Cross Road, Coimbatore',
      coordinates: payload.coordinates || [76.9508, 11.0084],
    };

    this.priority = payload.priority || {
      level: payload.priorityLevel || 'Medium',
      score: payload.priorityScore || 50,
      recommendedSLA: payload.recommendedSLA || 48,
      escalationFlag: payload.escalationFlag || false,
      reason: payload.priorityReason || '',
    };

    this.recommendedDepartment = payload.department || payload.recommendedDepartment || {
      departmentName: payload.responsibleDepartment || 'Public Works Department (PWD)',
      officeName: payload.administrativeOffice || 'Central Operations Office',
      queueName: payload.suggestedAssignmentQueue || 'Standard Maintenance Queue',
      confidenceScore: payload.routingConfidenceScore || 0.95,
    };

    this.communityConfidence = payload.communityConfidenceScore || 0.90;
    this.aiConfidence = payload.routingConfidenceScore || 0.96;
    this.submissionTimestamp = payload.timestamp || new Date().toISOString();
  }
}

export default IngestQueueComplaintDTO;
