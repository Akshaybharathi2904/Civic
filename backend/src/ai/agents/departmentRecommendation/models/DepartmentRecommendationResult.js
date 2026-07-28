import { DepartmentRecommendationResultDTO } from './DepartmentRecommendationResultDTO.js';

export class DepartmentRecommendationResult {
  constructor(data) {
    this.dto = new DepartmentRecommendationResultDTO(data);
  }

  get responsibleDepartment() { return this.dto.responsibleDepartment; }
  get administrativeOffice() { return this.dto.administrativeOffice; }
  get suggestedAssignmentQueue() { return this.dto.suggestedAssignmentQueue; }
  get confidenceScore() { return this.dto.confidenceScore; }
  get recommendationReason() { return this.dto.recommendationReason; }

  toDomainPayload() {
    return this.dto.toJSON();
  }
}

export default DepartmentRecommendationResult;
