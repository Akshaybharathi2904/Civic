export class EnrichedComplaintOutputDTO {
  constructor({
    complaintId,
    title,
    description,
    category,
    issueType,
    aiSummary,
    keywords = [],
    severity,
    formattedAddress,
    ward,
    zone,
    municipality,
    district,
    state,
    postalCode,
    nearbyLandmark,
    coordinates,
    duplicateFound = false,
    existingComplaintId = null,
    duplicateSimilarityScore = 0,
    communityConfidenceScore = 0.90,
    confirmationPercentage = 0,
    communityValidationStatus = 'PENDING_COMMUNITY_INPUT',
    priorityScore = 50,
    priorityLevel = 'Medium',
    priorityReason = '',
    recommendedSLA = 48,
    escalationFlag = false,
    responsibleDepartment = '',
    administrativeOffice = '',
    suggestedAssignmentQueue = '',
    routingConfidenceScore = 0.95,
    routingReason = '',
    handoverStatus = 'PENDING_HANDOVER',
    workflowHistory = [],
    totalTokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  }) {
    this.complaintId = complaintId;
    this.title = title;
    this.description = description;
    this.category = category;
    this.issueType = issueType;
    this.aiSummary = aiSummary;
    this.keywords = keywords;
    this.severity = severity;
    this.formattedAddress = formattedAddress;
    this.ward = ward;
    this.zone = zone;
    this.municipality = municipality;
    this.district = district;
    this.state = state;
    this.postalCode = postalCode;
    this.nearbyLandmark = nearbyLandmark;
    this.coordinates = coordinates;
    this.duplicateFound = duplicateFound;
    this.existingComplaintId = existingComplaintId;
    this.duplicateSimilarityScore = duplicateSimilarityScore;
    this.communityConfidenceScore = communityConfidenceScore;
    this.confirmationPercentage = confirmationPercentage;
    this.communityValidationStatus = communityValidationStatus;
    this.priorityScore = priorityScore;
    this.priorityLevel = priorityLevel;
    this.priorityReason = priorityReason;
    this.recommendedSLA = recommendedSLA;
    this.escalationFlag = escalationFlag;
    this.responsibleDepartment = responsibleDepartment;
    this.administrativeOffice = administrativeOffice;
    this.suggestedAssignmentQueue = suggestedAssignmentQueue;
    this.routingConfidenceScore = routingConfidenceScore;
    this.routingReason = routingReason;
    this.handoverStatus = handoverStatus;
    this.workflowHistory = workflowHistory;
    this.totalTokenUsage = totalTokenUsage;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      complaintId: this.complaintId,
      title: this.title,
      description: this.description,
      category: this.category,
      issueType: this.issueType,
      aiSummary: this.aiSummary,
      keywords: this.keywords,
      severity: this.severity,
      location: {
        formattedAddress: this.formattedAddress,
        ward: this.ward,
        zone: this.zone,
        municipality: this.municipality,
        district: this.district,
        state: this.state,
        postalCode: this.postalCode,
        nearbyLandmark: this.nearbyLandmark,
        coordinates: this.coordinates,
      },
      duplicate: {
        duplicateFound: this.duplicateFound,
        existingComplaintId: this.existingComplaintId,
        similarityScore: this.duplicateSimilarityScore,
      },
      community: {
        communityConfidenceScore: this.communityConfidenceScore,
        confirmationPercentage: this.confirmationPercentage,
        validationStatus: this.communityValidationStatus,
      },
      priority: {
        priorityScore: this.priorityScore,
        priorityLevel: this.priorityLevel,
        reason: this.priorityReason,
        recommendedSLA: this.recommendedSLA,
        escalationFlag: this.escalationFlag,
      },
      department: {
        responsibleDepartment: this.responsibleDepartment,
        administrativeOffice: this.administrativeOffice,
        suggestedAssignmentQueue: this.suggestedAssignmentQueue,
        confidenceScore: this.routingConfidenceScore,
        reason: this.routingReason,
      },
      handoverStatus: this.handoverStatus,
      workflowHistory: this.workflowHistory,
      totalTokenUsage: this.totalTokenUsage,
      timestamp: this.timestamp,
    };
  }
}

export default EnrichedComplaintOutputDTO;
