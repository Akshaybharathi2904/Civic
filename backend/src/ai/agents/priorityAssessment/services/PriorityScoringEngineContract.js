export class PriorityScoringEngineContract {
  /**
   * Abstract method: Calculate priority score, level, SLA, and escalation status
   */
  async calculatePriorityScore(inputDTO) {
    throw new Error('PriorityScoringEngineContract.calculatePriorityScore must be implemented by concrete scoring engine.');
  }
}

export default PriorityScoringEngineContract;
