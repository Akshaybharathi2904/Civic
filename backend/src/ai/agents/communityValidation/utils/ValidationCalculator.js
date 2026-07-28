import { ValidationConfig } from '../config/validation.config.js';

export class ValidationCalculator {
  static calculateValidationMetrics(responses = []) {
    let totalConfirmations = 0;
    let totalRejections = 0;
    let totalSkips = 0;

    responses.forEach((res) => {
      if (res.action === ValidationConfig.ACTIONS.CONFIRM) {
        totalConfirmations++;
      } else if (res.action === ValidationConfig.ACTIONS.REJECT) {
        totalRejections++;
      } else if (res.action === ValidationConfig.ACTIONS.SKIP) {
        totalSkips++;
      }
    });

    const activeVotes = totalConfirmations + totalRejections;
    const confirmationPercentage = activeVotes > 0 ? (totalConfirmations / activeVotes) * 100 : 0;
    const rejectionPercentage = activeVotes > 0 ? (totalRejections / activeVotes) * 100 : 0;

    let validationStatus = ValidationConfig.STATUSES.PENDING_COMMUNITY_INPUT;
    let communityConfidenceScore = 0.50;
    let recommendedAction = 'REQUEST_MORE_VOTES: Insufficient community responses. Dispatched nearby alerts.';

    if (activeVotes >= ValidationConfig.MIN_VOTES_REQUIRED) {
      if (confirmationPercentage >= ValidationConfig.CONFIRMATION_THRESHOLD_PERCENT) {
        validationStatus = ValidationConfig.STATUSES.VERIFIED;
        communityConfidenceScore = Math.min(0.99, 0.70 + (confirmationPercentage / 100) * 0.28);
        recommendedAction = `COMMUNITY_VERIFIED: Issue confirmed by ${Math.round(confirmationPercentage)}% of nearby residents (${totalConfirmations} confirmations). Accelerate dispatch priority.`;
      } else if (rejectionPercentage >= ValidationConfig.REJECTION_THRESHOLD_PERCENT) {
        validationStatus = ValidationConfig.STATUSES.FLAGGED_INVALID;
        communityConfidenceScore = 0.20;
        recommendedAction = `FLAGGED_INVALID: ${Math.round(rejectionPercentage)}% of nearby residents flagged issue as invalid or already resolved (${totalRejections} rejections). Request officer inspection.`;
      } else {
        validationStatus = ValidationConfig.STATUSES.HIGH_COMMUNITY_CONCERN;
        communityConfidenceScore = 0.75;
        recommendedAction = 'COMMUNITY_REVIEW: Mixed community feedback received. Queue for field officer manual review.';
      }
    }

    return {
      communityConfidenceScore: Number(communityConfidenceScore.toFixed(2)),
      confirmationPercentage: Number(confirmationPercentage.toFixed(2)),
      totalConfirmations,
      totalRejections,
      totalSkips,
      validationStatus,
      recommendedAction,
    };
  }
}

export default ValidationCalculator;
