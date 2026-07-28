export class DuplicateDetectionInputDTO {
  constructor({
    complaintId = null,
    category,
    issueType = null,
    aiSummary = '',
    keywords = [],
    latitude,
    longitude,
    timestamp = null,
  }) {
    if (latitude === undefined || latitude === null || isNaN(Number(latitude))) {
      throw new Error('DuplicateDetectionInputDTO requires valid latitude.');
    }
    if (longitude === undefined || longitude === null || isNaN(Number(longitude))) {
      throw new Error('DuplicateDetectionInputDTO requires valid longitude.');
    }

    this.complaintId = complaintId;
    this.category = (category && typeof category === 'string') ? category.trim() : 'General Civic Issue';
    this.issueType = issueType || this.category;
    this.aiSummary = aiSummary || '';
    this.keywords = Array.isArray(keywords) ? keywords : [];
    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
    this.timestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
  }
}

export default DuplicateDetectionInputDTO;
