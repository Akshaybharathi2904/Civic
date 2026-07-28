export class WorkloadCalculator {
  static MAX_CASE_CAPACITY = 5;

  static calculateCapacityRatio(activeCases = 0) {
    return Math.min(1.0, activeCases / this.MAX_CASE_CAPACITY);
  }

  static calculateWorkloadScore(activeCases = 0) {
    const ratio = this.calculateCapacityRatio(activeCases);
    return Math.max(0, 1.0 - ratio);
  }
}

export default WorkloadCalculator;
