export class PriorityAssessmentResultDTO {
  constructor({
    priorityScore = 50,
    priorityLevel = 'Medium',
    reason = '',
    recommendedSLA = 48,
    escalationFlag = false,
  }) {
    this.priorityScore = Math.max(0, Math.min(100, Math.round(Number(priorityScore))));
    this.priorityLevel = priorityLevel || 'Medium';
    this.reason = reason || '';
    this.recommendedSLA = Number(recommendedSLA) || 48;
    this.escalationFlag = Boolean(escalationFlag);
  }

  toJSON() {
    return {
      priorityScore: this.priorityScore,
      priorityLevel: this.priorityLevel,
      reason: this.reason,
      recommendedSLA: this.recommendedSLA,
      escalationFlag: this.escalationFlag,
    };
  }
}

export default PriorityAssessmentResultDTO;
