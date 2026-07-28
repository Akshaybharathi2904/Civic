export class DuplicateDetectionResultDTO {
  constructor({
    duplicateFound = false,
    existingComplaintId = null,
    similarityScore = 0.0,
    matchingFactors = {},
    recommendation = 'CREATE_NEW_ISSUE',
  }) {
    this.duplicateFound = Boolean(duplicateFound);
    this.existingComplaintId = existingComplaintId || null;
    this.similarityScore = Number(Number(similarityScore).toFixed(2));
    this.matchingFactors = matchingFactors || {
      geoProximity: 0,
      summarySimilarity: 0,
      categoryMatch: 0,
      keywordOverlap: 0,
      timeProximity: 0,
    };
    this.recommendation = recommendation || (this.duplicateFound ? 'MERGE_DUPLICATE' : 'CREATE_NEW_ISSUE');
  }

  toJSON() {
    return {
      duplicateFound: this.duplicateFound,
      existingComplaintId: this.existingComplaintId,
      similarityScore: this.similarityScore,
      matchingFactors: this.matchingFactors,
      recommendation: this.recommendation,
    };
  }
}

export default DuplicateDetectionResultDTO;
