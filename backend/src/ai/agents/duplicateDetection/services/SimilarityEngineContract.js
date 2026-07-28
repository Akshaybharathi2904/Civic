export class SimilarityEngineContract {
  /**
   * Abstract method: Calculate similarity score between candidate complaint and new submission
   */
  async calculateSimilarity(newComplaintInput, candidateComplaint) {
    throw new Error('SimilarityEngineContract.calculateSimilarity must be implemented by concrete similarity engine.');
  }
}

export default SimilarityEngineContract;
