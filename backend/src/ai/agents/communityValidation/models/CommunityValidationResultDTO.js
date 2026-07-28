export class CommunityValidationResultDTO {
  constructor({
    communityConfidenceScore = 0.92,
    confirmationPercentage = 0.0,
    totalConfirmations = 0,
    totalRejections = 0,
    totalSkips = 0,
    validationStatus = 'PENDING_COMMUNITY_INPUT',
    recommendedAction = 'REQUEST_MORE_VOTES',
    notificationsDispatched = 0,
  }) {
    this.communityConfidenceScore = Number(Number(communityConfidenceScore).toFixed(2));
    this.confirmationPercentage = Number(Number(confirmationPercentage).toFixed(2));
    this.totalConfirmations = Number(totalConfirmations) || 0;
    this.totalRejections = Number(totalRejections) || 0;
    this.totalSkips = Number(totalSkips) || 0;
    this.validationStatus = validationStatus || 'PENDING_COMMUNITY_INPUT';
    this.recommendedAction = recommendedAction || 'REQUEST_MORE_VOTES';
    this.notificationsDispatched = Number(notificationsDispatched) || 0;
  }

  toJSON() {
    return {
      communityConfidenceScore: this.communityConfidenceScore,
      confirmationPercentage: this.confirmationPercentage,
      totalConfirmations: this.totalConfirmations,
      totalRejections: this.totalRejections,
      totalSkips: this.totalSkips,
      validationStatus: this.validationStatus,
      recommendedAction: this.recommendedAction,
      notificationsDispatched: this.notificationsDispatched,
    };
  }
}

export default CommunityValidationResultDTO;
