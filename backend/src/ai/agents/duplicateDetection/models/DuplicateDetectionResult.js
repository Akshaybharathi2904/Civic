import { DuplicateDetectionResultDTO } from './DuplicateDetectionResultDTO.js';

export class DuplicateDetectionResult {
  constructor(data) {
    this.dto = new DuplicateDetectionResultDTO(data);
  }

  get duplicateFound() { return this.dto.duplicateFound; }
  get existingComplaintId() { return this.dto.existingComplaintId; }
  get similarityScore() { return this.dto.similarityScore; }
  get matchingFactors() { return this.dto.matchingFactors; }
  get recommendation() { return this.dto.recommendation; }

  toDomainPayload() {
    return this.dto.toJSON();
  }
}

export default DuplicateDetectionResult;
