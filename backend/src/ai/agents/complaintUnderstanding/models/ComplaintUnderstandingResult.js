import { ComplaintUnderstandingResultDTO } from './ComplaintUnderstandingResultDTO.js';

export class ComplaintUnderstandingResult {
  constructor(data) {
    this.dto = new ComplaintUnderstandingResultDTO(data);
  }

  get issueCategory() { return this.dto.issueCategory; }
  get issueType() { return this.dto.issueType; }
  get aiSummary() { return this.dto.aiSummary; }
  get keywords() { return this.dto.keywords; }
  get confidenceScore() { return this.dto.confidenceScore; }
  get severity() { return this.dto.severity; }

  toDomainPayload() {
    return this.dto.toJSON();
  }
}

export default ComplaintUnderstandingResult;
