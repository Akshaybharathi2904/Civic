import { BaseAgent } from '../BaseAgent.js';
import { CommunityValidationInputDTO } from './models/CommunityValidationInputDTO.js';
import { CommunityValidationResult } from './models/CommunityValidationResult.js';
import { MockNotificationService } from './services/MockNotificationService.js';
import { MockCommunityResponseRepository } from './services/MockCommunityResponseRepository.js';
import { ValidationCalculator } from './utils/ValidationCalculator.js';
import { CommunityValidationError } from './errors/CommunityValidationError.js';

export class CommunityValidationAgent extends BaseAgent {
  constructor(
    notificationService = new MockNotificationService(),
    responseRepository = new MockCommunityResponseRepository()
  ) {
    super('Community Validation Agent', 5);
    this.notificationService = notificationService;
    this.responseRepository = responseRepository;
  }

  /**
   * Record user response ('confirm', 'reject', 'skip')
   */
  async recordUserResponse(complaintId, userId, action) {
    return await this.responseRepository.recordResponse(complaintId, userId, action);
  }

  /**
   * Validate complaint using community responses and dispatch location-targeted alerts
   */
  async validateComplaint(inputData) {
    try {
      const inputDTO = new CommunityValidationInputDTO(inputData);

      // Dispatch nearby alerts to local citizens
      const notifResult = await this.notificationService.dispatchNearbyValidationAlert(
        inputDTO.complaintId,
        inputDTO.complaintLocation
      );

      // Query community votes
      const responses = await this.responseRepository.getResponses(inputDTO.complaintId);
      const metrics = ValidationCalculator.calculateValidationMetrics(responses);

      const domainResult = new CommunityValidationResult({
        ...metrics,
        notificationsDispatched: notifResult.recipientsNotified || 0,
      });

      return domainResult.toDomainPayload();
    } catch (err) {
      throw new CommunityValidationError(`Failed to process community validation: ${err.message}`, err, { inputData });
    }
  }

  async runInternal(context) {
    const inputData = {
      complaintId: context.complaintId || context.ticketId || 'comp_10029',
      complaintLocation: {
        latitude: context.coordinates ? context.coordinates[1] : 11.0084,
        longitude: context.coordinates ? context.coordinates[0] : 76.9508,
      },
      duplicateDetectionResult: context.duplicate?.output || null,
      existingComplaintId: context.duplicate?.output?.existingComplaintId || null,
    };

    const structuredResult = await this.validateComplaint(inputData);

    return {
      status: 'success',
      confidence: structuredResult.communityConfidenceScore,
      reasoning: `Community Validation Status: ${structuredResult.validationStatus} (${structuredResult.confirmationPercentage}% confirmed by ${structuredResult.totalConfirmations} residents).`,
      output: structuredResult,
      tokenUsage: { promptTokens: 95, completionTokens: 35, totalTokens: 130 },
    };
  }
}

export default CommunityValidationAgent;
