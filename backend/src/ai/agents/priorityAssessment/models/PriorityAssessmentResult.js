import { PriorityAssessmentResultDTO } from './PriorityAssessmentResultDTO.js';

export class PriorityAssessmentResult {
  constructor(data) {
    this.dto = new PriorityAssessmentResultDTO(data);
  }

  get priorityScore() { return this.dto.priorityScore; }
  get priorityLevel() { return this.dto.priorityLevel; }
  get reason() { return this.dto.reason; }
  get recommendedSLA() { return this.dto.recommendedSLA; }
  get escalationFlag() { return this.dto.escalationFlag; }

  toDomainPayload() {
    return this.dto.toJSON();
  }
}

export default PriorityAssessmentResult;
