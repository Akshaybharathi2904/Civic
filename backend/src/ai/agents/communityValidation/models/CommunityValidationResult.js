import { CommunityValidationResultDTO } from './CommunityValidationResultDTO.js';

export class CommunityValidationResult {
  constructor(data) {
    this.dto = new CommunityValidationResultDTO(data);
  }

  get communityConfidenceScore() { return this.dto.communityConfidenceScore; }
  get confirmationPercentage() { return this.dto.confirmationPercentage; }
  get totalConfirmations() { return this.dto.totalConfirmations; }
  get totalRejections() { return this.dto.totalRejections; }
  get totalSkips() { return this.dto.totalSkips; }
  get validationStatus() { return this.dto.validationStatus; }
  get recommendedAction() { return this.dto.recommendedAction; }
  get notificationsDispatched() { return this.dto.notificationsDispatched; }

  toDomainPayload() {
    return this.dto.toJSON();
  }
}

export default CommunityValidationResult;
