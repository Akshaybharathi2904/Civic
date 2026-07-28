export class DepartmentRecommendationResultDTO {
  constructor({
    responsibleDepartment = 'Public Works Department (PWD)',
    administrativeOffice = 'Central PWD Operations Office',
    suggestedAssignmentQueue = 'Standard Road Maintenance Queue',
    confidenceScore = 0.96,
    recommendationReason = '',
  }) {
    this.responsibleDepartment = responsibleDepartment;
    this.administrativeOffice = administrativeOffice;
    this.suggestedAssignmentQueue = suggestedAssignmentQueue;
    this.confidenceScore = Number(Number(confidenceScore).toFixed(2));
    this.recommendationReason = recommendationReason || '';
  }

  toJSON() {
    return {
      responsibleDepartment: this.responsibleDepartment,
      administrativeOffice: this.administrativeOffice,
      suggestedAssignmentQueue: this.suggestedAssignmentQueue,
      confidenceScore: this.confidenceScore,
      recommendationReason: this.recommendationReason,
    };
  }
}

export default DepartmentRecommendationResultDTO;
