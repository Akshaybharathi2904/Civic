export class ComplaintUnderstandingResultDTO {
  constructor({
    issueCategory,
    issueType,
    aiSummary,
    keywords = [],
    confidenceScore = 0.95,
    severity = 'Medium',
  }) {
    this.issueCategory = issueCategory || 'Road Infrastructure';
    this.issueType = issueType || 'General Civic Issue';
    this.aiSummary = aiSummary || '';
    this.keywords = Array.isArray(keywords) ? keywords : [];
    this.confidenceScore = Number(confidenceScore) || 0.95;
    this.severity = severity || 'Medium';
  }

  toJSON() {
    return {
      issueCategory: this.issueCategory,
      issueType: this.issueType,
      aiSummary: this.aiSummary,
      keywords: this.keywords,
      confidenceScore: this.confidenceScore,
      severity: this.severity,
    };
  }
}

export default ComplaintUnderstandingResultDTO;
