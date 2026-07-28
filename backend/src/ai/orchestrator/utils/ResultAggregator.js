import { EnrichedComplaintOutputDTO } from '../models/EnrichedComplaintOutputDTO.js';

export class ResultAggregator {
  static aggregate(context, workflowHistory = [], handoverStatus = 'HANDOVER_SUCCESS') {
    const understanding = context.understanding?.output || {};
    const location = context.location?.output || {};
    const duplicate = context.duplicate?.output || {};
    const community = context.community?.output || {};
    const priority = context.priority?.output || {};
    const department = context.routing?.output || context.department?.output || {};

    return new EnrichedComplaintOutputDTO({
      complaintId: context.complaintId,
      title: context.title,
      description: context.description,
      category: understanding.issueCategory || context.category || 'General Civic Issue',
      issueType: understanding.issueType || 'General Civic Issue',
      aiSummary: understanding.aiSummary || context.title || '',
      keywords: understanding.keywords || [],
      severity: understanding.severity || priority.priorityLevel || 'Medium',

      formattedAddress: location.formattedAddress || context.address || 'Municipal Ward Area',
      ward: location.ward || 'Ward 72 - RS Puram',
      zone: location.zone || 'Central Zone',
      municipality: location.municipality || 'Coimbatore Municipal Corporation',
      district: location.district || 'Coimbatore District',
      state: location.state || 'Tamil Nadu',
      postalCode: location.postalCode || '641002',
      nearbyLandmark: location.nearbyLandmark || 'Central Area Landmark',
      coordinates: location.coordinates || context.coordinates || [76.9508, 11.0084],

      duplicateFound: duplicate.duplicateFound || false,
      existingComplaintId: duplicate.existingComplaintId || null,
      duplicateSimilarityScore: duplicate.similarityScore || 0,

      communityConfidenceScore: community.communityConfidenceScore || 0.92,
      confirmationPercentage: community.confirmationPercentage || 80,
      communityValidationStatus: community.validationStatus || 'VERIFIED',

      priorityScore: priority.priorityScore || 65,
      priorityLevel: priority.priorityLevel || 'Medium',
      priorityReason: priority.reason || '',
      recommendedSLA: priority.recommendedSLA || 48,
      escalationFlag: priority.escalationFlag || false,

      responsibleDepartment: department.responsibleDepartment || department.departmentName || 'Public Works Department (PWD)',
      administrativeOffice: department.administrativeOffice || 'Central Operations Office',
      suggestedAssignmentQueue: department.suggestedAssignmentQueue || 'Standard Dispatch Queue',
      routingConfidenceScore: department.confidenceScore || 0.96,
      routingReason: department.recommendationReason || department.reasoning || '',

      handoverStatus,
      workflowHistory,
      totalTokenUsage: context.totalTokenUsage,
    });
  }
}

export default ResultAggregator;
