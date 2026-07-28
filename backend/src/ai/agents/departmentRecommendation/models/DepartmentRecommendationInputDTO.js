export class DepartmentRecommendationInputDTO {
  constructor({
    understandingResult = {},
    locationResult = {},
    duplicateResult = {},
    communityResult = {},
    priorityResult = {},
  }) {
    this.understandingResult = understandingResult || {};
    this.locationResult = locationResult || {};
    this.duplicateResult = duplicateResult || {};
    this.communityResult = communityResult || {};
    this.priorityResult = priorityResult || {};
  }
}

export default DepartmentRecommendationInputDTO;
