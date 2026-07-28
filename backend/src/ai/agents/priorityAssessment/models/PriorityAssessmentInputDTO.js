export class PriorityAssessmentInputDTO {
  constructor({
    understandingResult = {},
    locationResult = {},
    duplicateResult = {},
    communityResult = {},
  }) {
    this.understandingResult = understandingResult || {};
    this.locationResult = locationResult || {};
    this.duplicateResult = duplicateResult || {};
    this.communityResult = communityResult || {};
  }
}

export default PriorityAssessmentInputDTO;
